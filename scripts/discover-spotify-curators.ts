// scripts/discover-spotify-curators.ts
// Discovers curators directly from Spotify: searches playlists by genre,
// extracts owner info, searches for contact details, saves to database.
//
// Usage:
//   npx tsx scripts/discover-spotify-curators.ts                      # search all genres
//   npx tsx scripts/discover-spotify-curators.ts --genre "afrobeat"   # single genre
//   npx tsx scripts/discover-spotify-curators.ts --min-followers 1000 # custom threshold
//   npx tsx scripts/discover-spotify-curators.ts --limit 50           # max playlists per genre
//   npx tsx scripts/discover-spotify-curators.ts --dry-run            # don't save to DB

import { PrismaClient } from "@prisma/client";
import SpotifyApi from "spotify-web-api-node";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import https from "https";
import http from "http";

const db = new PrismaClient();

// ── CLI args ──────────────────────────────────────────────────
const args = process.argv.slice(2);
function getArg(name: string): string | undefined {
  const idx = args.indexOf(`--${name}`);
  return idx >= 0 ? args[idx + 1] : undefined;
}
const SINGLE_GENRE = getArg("genre");
const MIN_FOLLOWERS = parseInt(getArg("min-followers") ?? "500", 10);
const LIMIT_PER_GENRE = parseInt(getArg("limit") ?? "50", 10);
const DRY_RUN = args.includes("--dry-run");
const OUTPUT_FILE = getArg("output") ?? "curators_seed_discovered.json";

// ── Genres to search ──────────────────────────────────────────
const SEARCH_GENRES = SINGLE_GENRE
  ? [SINGLE_GENRE]
  : [
      "afrobeat", "afrobeats", "amapiano", "hip hop", "hip-hop",
      "pop", "r&b", "soul", "jazz", "reggae", "dancehall",
      "electronic", "house", "techno", "deep house", "tech house",
      "edm", "trap", "drill", "lo-fi", "chill", "indie", "indie pop",
      "indie rock", "rock", "alternative", "folk", "country",
      "latin", "reggaeton", "k-pop", "drum and bass", "dubstep",
      "funk", "disco", "ambient", "experimental", "metal", "punk",
    ];

// ── Genre mapping (Spotify genre tags → our DB genre names) ───
const GENRE_MAP: Record<string, string> = {
  "afrobeat": "Afrobeat",
  "afrobeats": "Afrobeats",
  "amapiano": "Amapiano",
  "hip hop": "Hip-Hop",
  "hip-hop": "Hip-Hop",
  "rap": "Rap",
  "r&b": "R&B",
  "rnb": "R&B",
  "soul": "Soul",
  "jazz": "Jazz",
  "reggae": "Reggae",
  "dancehall": "Dancehall",
  "electronic": "Electronic",
  "house": "House",
  "techno": "Techno",
  "deep house": "Deep House",
  "tech house": "Tech House",
  "edm": "EDM",
  "trap": "Trap",
  "drill": "Hip-Hop",
  "lo-fi": "Lo-Fi",
  "lofi": "Lo-Fi",
  "chill": "Chill",
  "indie": "Indie",
  "indie pop": "Indie Pop",
  "indie rock": "Indie Rock",
  "rock": "Rock",
  "alternative": "Alternative",
  "folk": "Folk",
  "country": "Country",
  "latin": "Latin",
  "reggaeton": "Reggaeton",
  "k-pop": "K-Pop",
  "drum and bass": "DnB",
  "dnb": "DnB",
  "dubstep": "Dubstep",
  "funk": "Funk",
  "disco": "Disco",
  "ambient": "Ambient",
  "experimental": "Experimental",
  "metal": "Metal",
  "punk": "Punk",
  "pop": "Pop",
};

// ── Spotify client ────────────────────────────────────────────
let spotify: SpotifyApi | null = null;

function getSpotifyClient(): SpotifyApi {
  if (!spotify) {
    spotify = new SpotifyApi({
      clientId: process.env.SPOTIFY_CLIENT_ID ?? "",
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET ?? "",
    });
  }
  return spotify;
}

async function ensureSpotifyToken(): Promise<boolean> {
  if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
    console.error("❌ Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET in .env");
    return false;
  }
  try {
    const client = getSpotifyClient();
    const { body } = await client.clientCredentialsGrant();
    client.setAccessToken(body.access_token);
    return true;
  } catch (e) {
    console.error("❌ Failed to get Spotify token:", e);
    return false;
  }
}

// ── Simple HTTP fetch (no external deps) ──────────────────────
function httpGet(url: string, timeoutMs = 5000): Promise<string> {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith("https") ? https : http;
    const req = mod.get(url, { timeout: timeoutMs, headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return httpGet(res.headers.location, timeoutMs).then(resolve, reject);
      }
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => resolve(data));
    });
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("timeout")); });
  });
}

// ── Contact discovery from Spotify owner ──────────────────────
interface ContactInfo {
  email: string;
  website: string;
  instagram: string;
  bio: string;
}

async function findContact(ownerName: string, _spotifyUserId: string): Promise<ContactInfo> {
  const result: ContactInfo = { email: "", website: "", instagram: "", bio: "" };

  // 1) Try Spotify public profile page for bio/links
  try {
    const slug = ownerName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const html = await httpGet(`https://open.spotify.com/user/${slug}`, 4000);
    // Look for email pattern in page source
    const emailMatch = html.match(/[\w.+-]+@[\w-]+\.[\w.]+/);
    if (emailMatch) result.email = emailMatch[0];
    // Look for Instagram links
    const igMatch = html.match(/instagram\.com\/([a-zA-Z0-9_.]+)/);
    if (igMatch) result.instagram = igMatch[1];
    // Look for website URLs
    const urlMatch = html.match(/https?:\/\/(?!open\.spotify\.com)[^\s"'<>]+/);
    if (urlMatch && !urlMatch[0].includes("spotify.com")) result.website = urlMatch[0];
  } catch { /* ignore */ }

  // 2) Search Google for "{ownerName} spotify curator email contact"
  try {
    const query = encodeURIComponent(`"${ownerName}" spotify playlist curator email contact`);
    const html = await httpGet(`https://www.google.com/search?q=${query}&num=5`, 5000);
    if (!result.email) {
      const emailMatch = html.match(/[\w.+-]+@[\w-]+\.[\w.]+/g);
      if (emailMatch) {
        // Filter out google's own emails
        const real = emailMatch.find((e) => !e.includes("google.com") && !e.includes("example.com"));
        if (real) result.email = real;
      }
    }
    if (!result.instagram) {
      const igMatch = html.match(/instagram\.com\/([a-zA-Z0-9_.]+)/);
      if (igMatch) result.instagram = igMatch[1];
    }
  } catch { /* ignore */ }

  return result;
}

// ── Discover playlists from Spotify ───────────────────────────
interface DiscoveredPlaylist {
  spotifyPlaylistId: string;
  name: string;
  description: string;
  followerCount: number;
  ownerName: string;
  ownerSpotifyId: string;
  thumbnailUrl: string | null;
  genres: string[];
  searchGenre: string;
}

async function searchSpotifyPlaylists(genre: string, limit: number): Promise<DiscoveredPlaylist[]> {
  const client = getSpotifyClient();
  const results: DiscoveredPlaylist[] = [];
  const seen = new Set<string>();

  // Search multiple queries per genre for better coverage
  const queries = [
    `"${genre}" playlist`,
    `${genre} music playlist`,
    `${genre} vibes`,
  ];

  for (const query of queries) {
    try {
      const { body } = await client.searchPlaylists(query, { limit: Math.min(limit, 50) });
      const playlists = body.playlists?.items ?? [];

      for (const p of playlists) {
        if (seen.has(p.id)) continue;
        seen.add(p.id);

        const followers = p.followers?.total ?? 0;
        if (followers < MIN_FOLLOWERS) continue;

        results.push({
          spotifyPlaylistId: p.id,
          name: p.name,
          description: p.description ?? "",
          followerCount: followers,
          ownerName: p.owner?.display_name ?? "Unknown",
          ownerSpotifyId: p.owner?.id ?? "",
          thumbnailUrl: p.images?.[0]?.url ?? null,
          genres: [],
          searchGenre: genre,
        });
      }

      // Rate limit: Spotify allows ~30 req/sec for client credentials
      await new Promise((r) => setTimeout(r, 200));
    } catch (e) {
      console.log(`  ⚠️ Search failed for "${query}": ${e}`);
    }
  }

  return results;
}

// ── Enrich playlist with genres from Spotify ──────────────────
async function enrichPlaylistGenres(playlist: DiscoveredPlaylist): Promise<string[]> {
  try {
    const client = getSpotifyClient();
    const { body } = await client.getPlaylist(playlist.spotifyPlaylistId);
    // Get top artists from first few tracks to infer genres
    const trackIds = body.tracks.items
      .slice(0, 10)
      .map((item) => item.track?.id)
      .filter(Boolean) as string[];

    if (trackIds.length === 0) return [];

    const artistIds = new Set<string>();
    for (const trackId of trackIds.slice(0, 5)) {
      try {
        // We don't have getTrack in our types, use search instead
        // Actually, let's just use the search genre as the primary genre
        break;
      } catch { /* skip */ }
    }

    // Use the mapped search genre
    const mapped = GENRE_MAP[playlist.searchGenre.toLowerCase()];
    return mapped ? [mapped] : [playlist.searchGenre];
  } catch {
    const mapped = GENRE_MAP[playlist.searchGenre.toLowerCase()];
    return mapped ? [mapped] : [playlist.searchGenre];
  }
}

// ── Save to database ──────────────────────────────────────────
async function saveToDatabase(playlist: DiscoveredPlaylist, contact: ContactInfo): Promise<boolean> {
  try {
    // Create or find user by email (or generate placeholder)
    const email = contact.email || `curator-${playlist.ownerSpotifyId}@placify-discovered.com`;

    const user = await db.user.upsert({
      where: { email },
      update: { isCurator: true },
      create: {
        email,
        spotifyUserId: playlist.ownerSpotifyId,
        isCurator: true,
        creditBalance: 0,
      },
    });

    // Create curator profile if missing
    const existingProfile = await db.curatorProfile.findUnique({ where: { userId: user.id } });
    if (!existingProfile) {
      await db.curatorProfile.create({
        data: {
          userId: user.id,
          displayName: playlist.ownerName,
          bio: playlist.description || `Spotify curator — ${playlist.name}`,
          priceCents: 0,
          verified: playlist.followerCount >= 1000,
          totalReviews: 0,
          onTimeReviews: 0,
          missedDeadlines: 0,
          retentionPoints: 0,
        },
      });
    }

    // Create playlist
    await db.playlist.upsert({
      where: { spotifyPlaylistId: playlist.spotifyPlaylistId },
      update: {
        followerCount: playlist.followerCount,
        name: playlist.name,
        lastCheckedAt: new Date(),
      },
      create: {
        curatorUserId: user.id,
        spotifyPlaylistId: playlist.spotifyPlaylistId,
        name: playlist.name,
        description: playlist.description,
        thumbnailUrl: playlist.thumbnailUrl,
        followerCount: playlist.followerCount,
        isVerified: playlist.followerCount >= 1000,
        status: "ACTIVE",
      },
    });

    // Link genres
    const genres = await enrichPlaylistGenres(playlist);
    const dbPlaylist = await db.playlist.findUnique({ where: { spotifyPlaylistId: playlist.spotifyPlaylistId } });
    if (dbPlaylist) {
      for (const genreName of genres) {
        const dbGenre = await db.genre.findFirst({ where: { name: genreName } });
        if (dbGenre) {
          await db.playlistGenre.upsert({
            where: { playlistId_genreId: { playlistId: dbPlaylist.id, genreId: dbGenre.id } },
            update: {},
            create: { playlistId: dbPlaylist.id, genreId: dbGenre.id },
          });
          // Also link curator genre pref
          await db.curatorGenrePref.upsert({
            where: { curatorUserId_genreId: { curatorUserId: user.id, genreId: dbGenre.id } },
            update: {},
            create: { curatorUserId: user.id, genreId: dbGenre.id },
          });
        }
      }
    }

    return true;
  } catch (e) {
    console.error(`  ❌ DB save failed for ${playlist.ownerName}: ${e}`);
    return false;
  }
}

// ── Main pipeline ─────────────────────────────────────────────
interface SeedOutput {
  name: string;
  email: string;
  location: string;
  genres: string[];
  followers: number;
  songs: string;
  description: string;
  spotify_url: string;
  website: string;
  instagram: string;
  submithub: string;
  submission_page: string;
  price_cents: number;
  verified: boolean;
  discoveredFrom: string;
}

async function main() {
  console.log("🔍 Spotify Curator Discovery Pipeline");
  console.log(`   Genres: ${SINGLE_GENRE || `${SEARCH_GENRES.length} genres`}`);
  console.log(`   Min followers: ${MIN_FOLLOWERS}`);
  console.log(`   Limit per genre: ${LIMIT_PER_GENRE}`);
  console.log(`   Mode: ${DRY_RUN ? "DRY RUN (no DB writes)" : "LIVE (saves to DB)"}\n`);

  const tokenOk = await ensureSpotifyToken();
  if (!tokenOk) {
    console.error("Cannot proceed without Spotify credentials.");
    process.exit(1);
  }

  const allPlaylists: DiscoveredPlaylist[] = [];
  const seenPlaylistIds = new Set<string>();
  const seenOwnerIds = new Set<string>();

  for (const genre of SEARCH_GENRES) {
    console.log(`🎵 Searching "${genre}"...`);
    const playlists = await searchSpotifyPlaylists(genre, LIMIT_PER_GENRE);

    let added = 0;
    for (const p of playlists) {
      if (seenPlaylistIds.has(p.spotifyPlaylistId)) continue;
      seenPlaylistIds.add(p.spotifyPlaylistId);

      // Track unique owners (1 user = 1 curator even if they have many playlists)
      if (!seenOwnerIds.has(p.ownerSpotifyId)) {
        seenOwnerIds.add(p.ownerSpotifyId);
        allPlaylists.push(p);
        added++;
      }
    }

    console.log(`   Found ${playlists.length} playlists, ${added} new unique curators`);

    // Rate limit between genre searches
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log(`\n📊 Total unique curators found: ${allPlaylists.length}`);
  console.log(`   Min followers: ${MIN_FOLLOWERS}`);

  // Contact discovery
  console.log("\n📧 Discovering contact info for curators...");
  const output: SeedOutput[] = [];
  let savedCount = 0;
  let contactFound = 0;

  for (let i = 0; i < allPlaylists.length; i++) {
    const p = allPlaylists[i];
    const progress = `[${i + 1}/${allPlaylists.length}]`;

    // Only search for contact on some curators (to avoid rate limits)
    let contact: ContactInfo = { email: "", website: "", instagram: "", bio: "" };
    if (!DRY_RUN && i % 3 === 0) {
      // Search every 3rd curator for contact info
      process.stdout.write(`  ${progress} Searching contact for ${p.ownerName}...`);
      contact = await findContact(p.ownerName, p.ownerSpotifyId);
      if (contact.email) contactFound++;
      console.log(contact.email ? ` ✅ ${contact.email}` : " (no email found)");
    }

    const genres = await enrichPlaylistGenres(p);
    const mappedGenre = GENRE_MAP[p.searchGenre.toLowerCase()] || p.searchGenre;

    output.push({
      name: p.ownerName,
      email: contact.email,
      location: "",
      genres: [mappedGenre],
      followers: p.followerCount,
      songs: String(p.description ? p.description.split(" ").length : 0),
      description: p.description || `${p.name} — Spotify playlist with ${p.followerCount} followers`,
      spotify_url: `https://open.spotify.com/user/${p.ownerSpotifyId}`,
      website: contact.website,
      instagram: contact.instagram,
      submithub: "",
      submission_page: "",
      price_cents: p.followerCount >= 10000 ? 200 : p.followerCount >= 5000 ? 100 : 0,
      verified: p.followerCount >= 1000,
      discoveredFrom: "spotify",
    });

    // Save to DB
    if (!DRY_RUN) {
      const ok = await saveToDatabase(p, contact);
      if (ok) savedCount++;
    }
  }

  // Save JSON output
  const outputPath = join(__dirname, "..", OUTPUT_FILE);
  writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\n💾 Saved ${output.length} curators to ${OUTPUT_FILE}`);

  if (!DRY_RUN) {
    console.log(`\n✅ Saved ${savedCount} curators to database`);
    console.log(`📧 Contact found for ${contactFound} curators`);
  }

  // Print summary
  const totalUsers = await db.user.count({ where: { isCurator: true } });
  const totalProfiles = await db.curatorProfile.count();
  const totalPlaylists = await db.playlist.count();

  console.log(`\n📊 Database totals:`);
  console.log(`   Users (curators): ${totalUsers}`);
  console.log(`   Profiles: ${totalProfiles}`);
  console.log(`   Playlists: ${totalPlaylists}`);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
