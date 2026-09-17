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

// GET /api/curators/search-spotify?genres=afrobeat,hip-hop&trackId=4cOdK2wG&artistId=xxx
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const genresParam = searchParams.get("genres");
    const trackIdParam = searchParams.get("trackId"); // optional: Spotify track ID to check for duplicates
    const artistIdParam = searchParams.get("artistId"); // optional: artist user ID to check for duplicates

    if (!genresParam) {
      return NextResponse.json({ error: "genres parameter required" }, { status: 400 });
    }

    const genres = genresParam.split(",").map((g) => g.trim()).filter(Boolean);

    // 1. Get registered curators from our DB with matching genres
    const dbCurators = await getDbCurators(genres);

    // 2. Search Spotify live for playlists (or use demo if no creds or API fails)
    let spotifyPlaylists: SpotifyPlaylist[] = [];
    if (process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET) {
      spotifyPlaylists = await searchSpotifyLive(genres);
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

    // 5. Check for already-submitted curators (prevent duplicate submissions)
    if (trackIdParam && artistIdParam) {
      const submittedCuratorIds = await getAlreadySubmittedCurators(trackIdParam, artistIdParam);
      for (const pl of deduplicated) {
        if (pl.curatorUserId && submittedCuratorIds.has(pl.curatorUserId)) {
          pl.alreadySubmitted = true;
        }
      }
    }

    // Sort: already-submitted last, then free first, then by follower count
    deduplicated.sort((a, b) => {
      if (a.alreadySubmitted && !b.alreadySubmitted) return 1;
      if (!a.alreadySubmitted && b.alreadySubmitted) return -1;
      if (a.priceCents === 0 && b.priceCents > 0) return -1;
      if (a.priceCents > 0 && b.priceCents === 0) return 1;
      return b.followerCount - a.followerCount;
    });

    return NextResponse.json({
      playlists: deduplicated,
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

// Check which curators already have a submission for this track + artist
async function getAlreadySubmittedCurators(trackId: string, artistId: string): Promise<Set<string>> {
  try {
    // Find the track by spotifyTrackId for this artist
    const track = await db.track.findFirst({
      where: { spotifyTrackId: trackId, userId: artistId },
      select: { id: true },
    });
    if (!track) return new Set();

    // Find all submissions for this track
    const submissions = await db.submission.findMany({
      where: { trackId: track.id, artistUserId: artistId },
      select: { curatorUserId: true },
    });

    return new Set(submissions.map((s) => s.curatorUserId));
  } catch {
    return new Set();
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

async function searchSpotifyLive(genres: string[]): Promise<SpotifyPlaylist[]> {
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
        limit: 30,
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
      { name: "Afro Beat Vibes", followers: 80000, owner: "DJ Moyo", price: 0 },
      { name: "Naija Grooves", followers: 45000, owner: "AfroBeats4Life", price: 0 },
      { name: "Afro Summer Mix", followers: 25000, owner: "MusicLover", price: 0 },
      { name: "Afro Fusion Picks", followers: 12000, owner: "AfroCurator", price: 0 },
      { name: "Afrobeats Fresh", followers: 8500, owner: "AfroVibesDaily", price: 0 },
      { name: "Afro Gold", followers: 5200, owner: "AfroGrooves", price: 0 },
    ],
    "afrobeats": [
      { name: "Afro Nation", followers: 1500000, owner: "Spotify", price: 200 },
      { name: "African Heat", followers: 800000, owner: "Spotify", price: 200 },
      { name: "Afrobeats Hits", followers: 350000, owner: "MusicCurator", price: 100 },
      { name: "Afrobeats Now", followers: 95000, owner: "AfroNewWave", price: 50 },
      { name: "Naija Heat", followers: 62000, owner: "NaijaCurator", price: 0 },
    ],
    "amapiano": [
      { name: "Amapiano Grooves", followers: 250000, owner: "AfroBeatsDaily", price: 100 },
      { name: "Piano People", followers: 80000, owner: "AmaFan", price: 0 },
      { name: "Ama Vibes Only", followers: 35000, owner: "PianoLover", price: 0 },
      { name: "Amapiano House", followers: 18000, owner: "AmaHouse", price: 0 },
      { name: "Piano Sessions", followers: 9500, owner: "PianoSessions", price: 0 },
    ],
    "hip-hop": [
      { name: "RapCaviar", followers: 4500000, owner: "Spotify", price: 200 },
      { name: "New Music Friday Hip-Hop", followers: 1200000, owner: "Spotify", price: 200 },
      { name: "Hip-Hop Classics", followers: 500000, owner: "HipHopVault", price: 100 },
      { name: "Indie Rap Finder", followers: 120000, owner: "RapCurator", price: 50 },
      { name: "Underground Bars", followers: 60000, owner: "TrapKing", price: 0 },
      { name: "Fresh Rap Weekly", followers: 35000, owner: "NewRapDaily", price: 0 },
      { name: "Lyrical Minds", followers: 22000, owner: "LyricCurator", price: 0 },
      { name: "Boom Bap Revival", followers: 15000, owner: "BoomBapFan", price: 0 },
    ],
    "hip hop": [
      { name: "RapCaviar", followers: 4500000, owner: "Spotify", price: 200 },
      { name: "Hip-Hop Classics", followers: 500000, owner: "HipHopVault", price: 100 },
    ],
    "pop": [
      { name: "Today's Top Hits", followers: 7000000, owner: "Spotify", price: 200 },
      { name: "Pop Rising", followers: 2000000, owner: "Spotify", price: 200 },
      { name: "New Pop Music", followers: 800000, owner: "PopCentral", price: 100 },
      { name: "Indie Pop Central", followers: 90000, owner: "PopFan", price: 0 },
      { name: "Pop Chill Mix", followers: 40000, owner: "ChillPop", price: 0 },
      { name: "Pop Fresh Finds", followers: 18000, owner: "PopFinder", price: 0 },
      { name: "Feel Good Pop", followers: 12000, owner: "PopVibes", price: 0 },
      { name: "Pop Radar", followers: 7500, owner: "PopRadar", price: 0 },
    ],
    "electronic": [
      { name: "mint", followers: 3000000, owner: "Spotify", price: 200 },
      { name: "EDM Rise", followers: 900000, owner: "EDMWorld", price: 100 },
      { name: "Electronic Discovery", followers: 110000, owner: "EDMFan", price: 50 },
      { name: "Bass Drop Weekly", followers: 55000, owner: "BassHead", price: 0 },
      { name: "Synth Dreams", followers: 32000, owner: "SynthCurator", price: 0 },
      { name: "Electronic Pulse", followers: 18000, owner: "PulseMusic", price: 0 },
    ],
    "house": [
      { name: "House Nation", followers: 800000, owner: "Spotify", price: 200 },
      { name: "Dance Rising", followers: 500000, owner: "Spotify", price: 200 },
      { name: "Deep House Central", followers: 200000, owner: "DeepHouse", price: 100 },
      { name: "House Vibes Daily", followers: 80000, owner: "HouseHead", price: 0 },
      { name: "Club House Picks", followers: 45000, owner: "ClubHouse", price: 0 },
      { name: "House Grooves", followers: 22000, owner: "GrooveCurator", price: 0 },
    ],
    "r&b": [
      { name: "Are & Be", followers: 2500000, owner: "Spotify", price: 200 },
      { name: "R&B Favourites", followers: 700000, owner: "SoulfulSounds", price: 100 },
      { name: "R&B Late Night", followers: 90000, owner: "SoulCurator", price: 0 },
      { name: "Neo Soul Garden", followers: 42000, owner: "SoulGarden", price: 0 },
      { name: "R&B Fresh Picks", followers: 18000, owner: "RBFresh", price: 0 },
    ],
    "rnb": [
      { name: "Are & Be", followers: 2500000, owner: "Spotify", price: 200 },
      { name: "R&B Favourites", followers: 700000, owner: "SoulfulSounds", price: 100 },
    ],
    "jazz": [
      { name: "State of Jazz", followers: 800000, owner: "Spotify", price: 200 },
      { name: "Jazz Vibes", followers: 300000, owner: "JazzCafe", price: 100 },
      { name: "Smooth Jazz Daily", followers: 60000, owner: "JazzFan", price: 0 },
      { name: "Jazz Lounge", followers: 28000, owner: "JazzLounge", price: 0 },
      { name: "Modern Jazz Picks", followers: 15000, owner: "JazzModern", price: 0 },
    ],
    "reggae": [
      { name: "Reggae Rotation", followers: 500000, owner: "Spotify", price: 100 },
      { name: "Island Vibes", followers: 200000, owner: "CaribMusic", price: 50 },
      { name: "Roots & Culture", followers: 70000, owner: "ReggaeHead", price: 0 },
      { name: "Reggae Gold", followers: 35000, owner: "ReggaeGold", price: 0 },
      { name: "Island Rhythms", followers: 18000, owner: "IslandRhythms", price: 0 },
    ],
    "k-pop": [
      { name: "K-Pop Daebak", followers: 1000000, owner: "Spotify", price: 200 },
      { name: "K-Pop Rising", followers: 600000, owner: "KpopWorld", price: 100 },
      { name: "K-Pop Newbies", followers: 80000, owner: "KpopFan", price: 0 },
      { name: "K-Pop Fresh", followers: 45000, owner: "KpopFresh", price: 0 },
      { name: "K-Pop Radar", followers: 22000, owner: "KpopRadar", price: 0 },
    ],
    "latin": [
      { name: "Viva Latino", followers: 3000000, owner: "Spotify", price: 200 },
      { name: "Latin Hits", followers: 500000, owner: "LatinWorld", price: 100 },
      { name: "Latin Fresh", followers: 80000, owner: "LatinoFan", price: 0 },
      { name: "Latin Grooves", followers: 42000, owner: "LatinGrooves", price: 0 },
      { name: "Latin Wave", followers: 18000, owner: "LatinWave", price: 0 },
    ],
    "reggaeton": [
      { name: "Viva Latino", followers: 3000000, owner: "Spotify", price: 200 },
      { name: "Reggaeton Party", followers: 400000, owner: "ReggaetonVibes", price: 100 },
      { name: "Reggaeton Fresh", followers: 55000, owner: "ReggaetonFresh", price: 0 },
    ],
    "trap": [
      { name: "Most Necessary", followers: 2000000, owner: "Spotify", price: 200 },
      { name: "Trap Metal", followers: 300000, owner: "TrapNation", price: 100 },
      { name: "Trap Nation", followers: 150000, owner: "TrapNation", price: 0 },
      { name: "Trap Radar", followers: 45000, owner: "TrapRadar", price: 0 },
    ],
    "rock": [
      { name: "Rock Classics", followers: 3000000, owner: "Spotify", price: 200 },
      { name: "Rock This", followers: 1500000, owner: "Spotify", price: 200 },
      { name: "New Rock", followers: 80000, owner: "RockFan", price: 0 },
      { name: "Rock Revolution", followers: 42000, owner: "RockRev", price: 0 },
      { name: "Alternative Nation", followers: 25000, owner: "AltNation", price: 0 },
      { name: "Indie Rock Radar", followers: 15000, owner: "IndieRock", price: 0 },
    ],
    "indie": [
      { name: "Indie Hits", followers: 500000, owner: "Spotify", price: 200 },
      { name: "Indie Shuffle", followers: 200000, owner: "IndieMusic", price: 100 },
      { name: "Indie Picks", followers: 80000, owner: "IndieVibes", price: 0 },
      { name: "Indie Fresh Finds", followers: 35000, owner: "IndieFresh", price: 0 },
      { name: "Bedroom Pop & Indie", followers: 22000, owner: "BedroomPop", price: 0 },
      { name: "Indie Gold", followers: 12000, owner: "IndieGold", price: 0 },
    ],
    "folk": [
      { name: "Fresh Folk", followers: 300000, owner: "Spotify", price: 100 },
      { name: "Indie Folk", followers: 150000, owner: "FolkMusic", price: 50 },
      { name: "Folk Roots", followers: 45000, owner: "FolkRoots", price: 0 },
      { name: "Acoustic Sessions", followers: 22000, owner: "AcousticFan", price: 0 },
    ],
    "soul": [
      { name: "Southern Soul", followers: 500000, owner: "Spotify", price: 100 },
      { name: "Soul Kitchen", followers: 80000, owner: "SoulFan", price: 0 },
      { name: "Soul Classics", followers: 35000, owner: "SoulClassics", price: 0 },
      { name: "Neo Soul Garden", followers: 18000, owner: "NeoSoul", price: 0 },
    ],
    "dancehall": [
      { name: "Dancehall Official", followers: 500000, owner: "Spotify", price: 100 },
      { name: "Island Mix", followers: 80000, owner: "DancehallVibes", price: 0 },
      { name: "Dancehall Fresh", followers: 35000, owner: "DancehallFresh", price: 0 },
    ],
    "edm": [
      { name: "mint", followers: 3000000, owner: "Spotify", price: 200 },
      { name: "EDM Rise", followers: 900000, owner: "EDMWorld", price: 100 },
      { name: "EDM Party", followers: 60000, owner: "EDMFan", price: 0 },
      { name: "EDM Fresh Picks", followers: 28000, owner: "EDMFresh", price: 0 },
    ],
    "lofi": [
      { name: "lofi beats", followers: 5000000, owner: "Spotify", price: 200 },
      { name: "Lofi Chill", followers: 800000, owner: "LofiMusic", price: 100 },
      { name: "Study Beats", followers: 100000, owner: "StudyLofi", price: 0 },
      { name: "Lofi Hip Hop", followers: 55000, owner: "LofiHipHop", price: 0 },
      { name: "Chillhop Corner", followers: 32000, owner: "ChillhopCorner", price: 0 },
      { name: "Lofi Dreams", followers: 18000, owner: "LofiDreams", price: 0 },
    ],
    "punk": [
      { name: "Punk Uncovered", followers: 200000, owner: "Spotify", price: 100 },
      { name: "Punk Classics", followers: 80000, owner: "PunkFan", price: 0 },
      { name: "Punk Fresh", followers: 25000, owner: "PunkFresh", price: 0 },
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
  alreadySubmitted?: boolean;
};
