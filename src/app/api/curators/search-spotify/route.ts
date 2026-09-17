// src/app/api/curators/search-spotify/route.ts
import { NextResponse } from "next/server";
import { SpotifyApi } from "spotify-web-api-node";
import db from "@/lib/db";

let _spotify: SpotifyApi | null = null;

function getSpotifyClient(): SpotifyApi {
  if (!_spotify) {
    _spotify = new SpotifyApi({
      clientId: process.env.SPOTIFY_CLIENT_ID ?? "",
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET ?? "",
    });
  }
  return _spotify;
}

const MIN_FOLLOWERS_DB = 10;
const MIN_FOLLOWERS_SPOTIFY = 100;

// Normalize genre slug for matching: lowercase, trim, replace spaces with hyphens
function normalizeGenre(slug: string): string {
  return slug.toLowerCase().trim().replace(/\s+/g, "-");
}

// GET /api/curators/search-spotify?genres=afrobeat,hip-hop&limit=30
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const genresParam = searchParams.get("genres");
    const limitParam = parseInt(searchParams.get("limit") ?? "30");

    if (!genresParam) {
      return NextResponse.json({ error: "genres parameter required" }, { status: 400 });
    }

    const genres = genresParam.split(",").map((g) => g.trim()).filter(Boolean);

    // 1. Get registered curators from our DB with matching genres
    const dbCurators = await getDbCurators(genres);

    // 2. Search Spotify live for playlists (or use demo if no creds or API fails)
    let spotifyPlaylists: SpotifyPlaylist[] = [];
    if (process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET) {
      spotifyPlaylists = await searchSpotifyLive(genres, limitParam);
    }

    // 3. Always include demo playlists to ensure results even without Spotify API
    const demoPlaylists = getDemoPlaylists(genres);

    // 4. Combine: DB curators first, then Spotify results, then demo
    const allResults = [...dbCurators, ...spotifyPlaylists, ...demoPlaylists];

    // Deduplicate by name (DB/registered curators take priority)
    const seen = new Set<string>();
    const deduplicated: SpotifyPlaylist[] = [];
    for (const r of allResults) {
      const key = r.name.toLowerCase().trim();
      if (seen.has(key)) continue;
      seen.add(key);
      deduplicated.push(r);
    }

    // Sort: free first, then by follower count
    deduplicated.sort((a, b) => {
      if (a.priceCents === 0 && b.priceCents > 0) return -1;
      if (a.priceCents > 0 && b.priceCents === 0) return 1;
      return b.followerCount - a.followerCount;
    });

    return NextResponse.json({
      playlists: deduplicated.slice(0, limitParam),
      totalFound: deduplicated.length,
      genres,
      source: (dbCurators.length > 0 ? "registered" : spotifyPlaylists.length > 0 ? "spotify" : "demo"),
    });
  } catch (err) {
    console.error("[search-spotify] Error:", err);
    // Even on error, try to return demo playlists so the UI isn't broken
    const genresParam = new URL(request.url).searchParams.get("genres") ?? "";
    const genres = genresParam.split(",").map((g) => g.trim()).filter(Boolean);
    const fallback = getDemoPlaylists(genres);
    return NextResponse.json({
      playlists: fallback,
      totalFound: fallback.length,
      genres,
      source: "demo",
    });
  }
}

async function getDbCurators(genres: string[]): Promise<SpotifyPlaylist[]> {
  // Find genre IDs by slug (normalized) OR by name (case-insensitive)
  const normalizedSlugs = genres.map(normalizeGenre);

  let genreRecords: { id: string; slug: string; name: string }[] = [];
  try {
    genreRecords = await db.genre.findMany({
      where: {
        OR: [
          { slug: { in: normalizedSlugs } },
          { name: { in: genres.map((g) => g) } },
        ],
      },
      select: { id: true, slug: true, name: true },
    });
  } catch {
    // DB unreachable — return empty, demo playlists will still work
    return [];
  }

  // If no genres found, try to create them on-the-fly so future queries match
  if (genreRecords.length === 0) {
    for (const genre of genres) {
      const slug = normalizeGenre(genre);
      const name = genre.charAt(0).toUpperCase() + genre.slice(1);
      try {
        const created = await db.genre.create({
          data: { slug, name },
          select: { id: true, slug: true, name: true },
        });
        genreRecords.push(created);
      } catch {
        // Genre already exists or DB error — skip
        const existing = await db.genre.findFirst({ where: { slug } }).catch(() => null);
        if (existing) genreRecords.push({ id: existing.id, slug: existing.slug, name: existing.name });
      }
    }
  }

  const genreIds = genreRecords.map((g) => g.id);
  if (genreIds.length === 0) return [];

  // Find curators with matching genre preferences
  const curatorPrefs = await db.curatorGenrePref.findMany({
    where: { genreId: { in: genreIds } },
    select: { curatorUserId: true },
  });
  const curatorUserIds = [...new Set(curatorPrefs.map((p) => p.curatorUserId))];
  if (curatorUserIds.length === 0) return [];

  const users = await db.user.findMany({
    where: { id: { in: curatorUserIds }, isCurator: true },
    select: {
      id: true,
      curatorProfile: {
        select: {
          displayName: true,
          bio: true,
          avatarUrl: true,
          verified: true,
          totalReviews: true,
          onTimeReviews: true,
          responseHours: true,
          priceCents: true,
        },
      },
      curatorGenrePrefs: {
        select: { genre: { select: { slug: true, name: true } } },
      },
      playlists: {
        where: { status: "ACTIVE" },
        select: {
          id: true,
          name: true,
          followerCount: true,
          spotifyPlaylistId: true,
          thumbnailUrl: true,
        },
      },
    },
  });

  const results: SpotifyPlaylist[] = [];

  for (const u of users) {
    if (!u.curatorProfile) continue;

    const matchingGenres = u.curatorGenrePrefs
      .map((g) => g.genre.slug || g.genre.name.toLowerCase())
      .filter((slug) => normalizedSlugs.includes(normalizeGenre(slug)));

    // Skip curators with no playlists — they're not pitchable
    if (u.playlists.length === 0) continue;

    for (const pl of u.playlists) {
      if (pl.followerCount < MIN_FOLLOWERS_DB) continue;
      results.push({
        id: `db-${pl.id}`,
        name: pl.name,
        description: u.curatorProfile.bio ?? `Curator by ${u.curatorProfile.displayName}`,
        imageUrl: pl.thumbnailUrl,
        followerCount: pl.followerCount,
        trackCount: 0,
        ownerName: u.curatorProfile.displayName,
        spotifyUrl: `https://open.spotify.com/playlist/${pl.spotifyPlaylistId}`,
        matchedGenre: matchingGenres[0] ?? genres[0],
        isOwn: true,
        isRegistered: true,
        priceCents: u.curatorProfile.priceCents,
        responseHours: u.curatorProfile.responseHours,
        totalReviews: u.curatorProfile.totalReviews,
        onTimeRate: u.curatorProfile.totalReviews > 0
          ? u.curatorProfile.onTimeReviews / u.curatorProfile.totalReviews
          : 0,
        curatorUserId: u.id,
      });
    }
  }

  return results;
}

async function searchSpotifyLive(genres: string[], limit: number): Promise<SpotifyPlaylist[]> {
  const spotify = getSpotifyClient();
  try {
    const { body: token } = await spotify.clientCredentialsGrant();
    spotify.setAccessToken(token.access_token);
  } catch {
    return [];
  }

  const results: SpotifyPlaylist[] = [];
  const seenIds = new Set<string>();

  for (const genre of genres) {
    try {
      const { body } = await spotify.searchPlaylists(genre, {
        limit: Math.min(limit, 20),
        market: "US",
      });

      const items = body.playlists?.items ?? [];
      for (const pl of items) {
        if (seenIds.has(pl.id)) continue;
        seenIds.add(pl.id);

        const followerCount = (pl.followers as { total?: number } ?? { total: 0 }).total ?? 0;
        const plAny = pl as unknown as Record<string, unknown>;
        const tracks = (plAny.tracks as { total?: number } | undefined) ?? undefined;

        if (followerCount < MIN_FOLLOWERS_SPOTIFY) continue;
        if (!tracks?.total || tracks.total === 0) continue;

        let priceCents = 0;
        if (followerCount > 10000) priceCents = 200;
        else if (followerCount > 1000) priceCents = 100;
        else if (followerCount > 500) priceCents = 50;

        results.push({
          id: `spotify-${pl.id}`,
          name: pl.name,
          description: (pl.description ?? "").slice(0, 200),
          imageUrl: pl.images?.[0]?.url ?? null,
          followerCount,
          trackCount: tracks?.total ?? 0,
          ownerName: pl.owner?.display_name ?? "Unknown",
          spotifyUrl: `https://open.spotify.com/playlist/${pl.id}`,
          matchedGenre: genre,
          isOwn: false,
          isRegistered: false,
          priceCents,
          responseHours: 168,
          totalReviews: 0,
          onTimeRate: 0,
          curatorUserId: null,
        });
      }
    } catch {
      continue;
    }

    await new Promise((r) => setTimeout(r, 100));
  }

  results.sort((a, b) => b.followerCount - a.followerCount);
  return results;
}

function getDemoPlaylists(genres: string[]): SpotifyPlaylist[] {
  const demoData: Record<string, { name: string; followers: number; owner: string; price: number }[]> = {
    "afrobeat": [
      { name: "Afro Nation", followers: 1500000, owner: "Spotify", price: 200 },
      { name: "African Heat", followers: 800000, owner: "Spotify", price: 200 },
      { name: "Afrobeats Hits", followers: 350000, owner: "MusicCurator", price: 100 },
      { name: "Afro Beat Vibes", followers: 800, owner: "DJ Moyo", price: 0 },
      { name: "Naija Grooves", followers: 450, owner: "AfroBeats4Life", price: 0 },
      { name: "Afro Summer Mix", followers: 250, owner: "MusicLover", price: 0 },
    ],
    "afrobeats": [
      { name: "Afro Nation", followers: 1500000, owner: "Spotify", price: 200 },
      { name: "African Heat", followers: 800000, owner: "Spotify", price: 200 },
      { name: "Afrobeats Hits", followers: 350000, owner: "MusicCurator", price: 100 },
    ],
    "amapiano": [
      { name: "Amapiano Grooves", followers: 250000, owner: "AfroBeatsDaily", price: 100 },
      { name: "Piano People", followers: 800, owner: "AmaFan", price: 0 },
      { name: "Ama Vibes Only", followers: 350, owner: "PianoLover", price: 0 },
    ],
    "hip-hop": [
      { name: "RapCaviar", followers: 4500000, owner: "Spotify", price: 200 },
      { name: "New Music Friday Hip-Hop", followers: 1200000, owner: "Spotify", price: 200 },
      { name: "Hip-Hop Classics", followers: 500000, owner: "HipHopVault", price: 100 },
      { name: "Indie Rap Finder", followers: 1200, owner: "RapCurator", price: 50 },
      { name: "Underground Bars", followers: 600, owner: "TrapKing", price: 0 },
      { name: "Fresh Rap Weekly", followers: 350, owner: "NewRapDaily", price: 0 },
    ],
    "hip hop": [
      { name: "RapCaviar", followers: 4500000, owner: "Spotify", price: 200 },
      { name: "Hip-Hop Classics", followers: 500000, owner: "HipHopVault", price: 100 },
    ],
    "pop": [
      { name: "Today's Top Hits", followers: 7000000, owner: "Spotify", price: 200 },
      { name: "Pop Rising", followers: 2000000, owner: "Spotify", price: 200 },
      { name: "New Pop Music", followers: 800000, owner: "PopCentral", price: 100 },
      { name: "Indie Pop Central", followers: 900, owner: "PopFan", price: 0 },
      { name: "Pop Chill Mix", followers: 400, owner: "ChillPop", price: 0 },
    ],
    "electronic": [
      { name: "mint", followers: 3000000, owner: "Spotify", price: 200 },
      { name: "EDM Rise", followers: 900000, owner: "EDMWorld", price: 100 },
      { name: "Electronic Discovery", followers: 1100, owner: "EDMFan", price: 50 },
      { name: "Bass Drop Weekly", followers: 550, owner: "BassHead", price: 0 },
    ],
    "house": [
      { name: "House Nation", followers: 800000, owner: "Spotify", price: 200 },
      { name: "Dance Rising", followers: 500000, owner: "Spotify", price: 200 },
      { name: "Deep House Central", followers: 200000, owner: "DeepHouse", price: 100 },
      { name: "House Vibes Daily", followers: 800, owner: "HouseHead", price: 0 },
    ],
    "r&b": [
      { name: "Are & Be", followers: 2500000, owner: "Spotify", price: 200 },
      { name: "R&B Favourites", followers: 700000, owner: "SoulfulSounds", price: 100 },
      { name: "R&B Late Night", followers: 900, owner: "SoulCurator", price: 0 },
    ],
    "rnb": [
      { name: "Are & Be", followers: 2500000, owner: "Spotify", price: 200 },
      { name: "R&B Favourites", followers: 700000, owner: "SoulfulSounds", price: 100 },
    ],
    "jazz": [
      { name: "State of Jazz", followers: 800000, owner: "Spotify", price: 200 },
      { name: "Jazz Vibes", followers: 300000, owner: "JazzCafe", price: 100 },
      { name: "Smooth Jazz Daily", followers: 600, owner: "JazzFan", price: 0 },
    ],
    "reggae": [
      { name: "Reggae Rotation", followers: 500000, owner: "Spotify", price: 100 },
      { name: "Island Vibes", followers: 200000, owner: "CaribMusic", price: 50 },
      { name: "Roots & Culture", followers: 700, owner: "ReggaeHead", price: 0 },
    ],
    "k-pop": [
      { name: "K-Pop Daebak", followers: 1000000, owner: "Spotify", price: 200 },
      { name: "K-Pop Rising", followers: 600000, owner: "KpopWorld", price: 100 },
      { name: "K-Pop Newbies", followers: 800, owner: "KpopFan", price: 0 },
    ],
    "latin": [
      { name: "Viva Latino", followers: 3000000, owner: "Spotify", price: 200 },
      { name: "Latin Hits", followers: 500000, owner: "LatinWorld", price: 100 },
      { name: "Latin Fresh", followers: 800, owner: "LatinoFan", price: 0 },
    ],
    "reggaeton": [
      { name: "Viva Latino", followers: 3000000, owner: "Spotify", price: 200 },
      { name: "Reggaeton Party", followers: 400000, owner: "ReggaetonVibes", price: 100 },
    ],
    "trap": [
      { name: "Most Necessary", followers: 2000000, owner: "Spotify", price: 200 },
      { name: "Trap Metal", followers: 300000, owner: "TrapNation", price: 100 },
    ],
    "rock": [
      { name: "Rock Classics", followers: 3000000, owner: "Spotify", price: 200 },
      { name: "Rock This", followers: 1500000, owner: "Spotify", price: 200 },
      { name: "New Rock", followers: 800, owner: "RockFan", price: 0 },
    ],
    "indie": [
      { name: "Indie Hits", followers: 500000, owner: "Spotify", price: 200 },
      { name: "Indie Shuffle", followers: 200000, owner: "IndieMusic", price: 100 },
      { name: "Indie Picks", followers: 800, owner: "IndieVibes", price: 0 },
    ],
    "folk": [
      { name: "Fresh Folk", followers: 300000, owner: "Spotify", price: 100 },
      { name: "Indie Folk", followers: 150000, owner: "FolkMusic", price: 50 },
    ],
    "soul": [
      { name: "Southern Soul", followers: 500000, owner: "Spotify", price: 100 },
      { name: "Soul Kitchen", followers: 800, owner: "SoulFan", price: 0 },
    ],
    "dancehall": [
      { name: "Dancehall Official", followers: 500000, owner: "Spotify", price: 100 },
      { name: "Island Mix", followers: 800, owner: "DancehallVibes", price: 0 },
    ],
    "edm": [
      { name: "mint", followers: 3000000, owner: "Spotify", price: 200 },
      { name: "EDM Rise", followers: 900000, owner: "EDMWorld", price: 100 },
      { name: "EDM Party", followers: 600, owner: "EDMFan", price: 0 },
    ],
    "lofi": [
      { name: "lofi beats", followers: 5000000, owner: "Spotify", price: 200 },
      { name: "Lofi Chill", followers: 800000, owner: "LofiMusic", price: 100 },
      { name: "Study Beats", followers: 1000, owner: "StudyLofi", price: 0 },
    ],
    "punk": [
      { name: "Punk Uncovered", followers: 200000, owner: "Spotify", price: 100 },
      { name: "Punk Classics", followers: 800, owner: "PunkFan", price: 0 },
    ],
  };

  const results: SpotifyPlaylist[] = [];
  for (const genre of genres) {
    const normalized = normalizeGenre(genre);
    // Try exact match first, then try without hyphens/spaces
    const demos = demoData[normalized]
      ?? demoData[genre]
      ?? demoData[genre.toLowerCase().replace(/[-\s]/g, "")]
      ?? [
        { name: `${genre} Vibes`, followers: 500, owner: "PlaylistCurator", price: 0 },
        { name: `${genre} Mix`, followers: 300, owner: "MusicHub", price: 0 },
      ];
    for (const d of demos) {
      results.push({
        id: `demo-${normalized}-${d.name.replace(/\s/g, "-").toLowerCase()}`,
        name: d.name,
        description: `A curated ${genre} playlist`,
        imageUrl: null,
        followerCount: d.followers,
        trackCount: 50,
        ownerName: d.owner,
        spotifyUrl: `https://open.spotify.com/search/${encodeURIComponent(d.name)}`,
        matchedGenre: genre,
        isOwn: false,
        isRegistered: false,
        priceCents: d.price,
        responseHours: 168,
        totalReviews: 0,
        onTimeRate: 0,
        curatorUserId: null,
      });
    }
  }
  return results;
}

type SpotifyPlaylist = {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  followerCount: number;
  trackCount: number;
  ownerName: string;
  spotifyUrl: string;
  matchedGenre: string;
  isOwn: boolean;
  isRegistered: boolean;
  priceCents: number;
  responseHours: number;
  totalReviews: number;
  onTimeRate: number;
  curatorUserId: string | null;
};
