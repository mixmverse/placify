// prisma/seed.ts
// Main seed script: genres, demo users, + verified playlist/curator data.
// Run `npx tsx prisma/seed.ts` or `npm run db:seed`.
// Playlist data comes from scripts/data/playlist-seed.json
// (generate via `npm run spotify:json` first, or it falls back to demo data).

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

const ROOT = path.resolve(__dirname, "..");
const JSON_PATH = path.join(ROOT, "scripts", "data", "playlist-seed.json");

const MIN_FOLLOWERS = 50;

// Fallback demo data if JSON file doesn't exist yet
const DEMO_GENRES = [
  { slug: "indie-pop", name: "Indie Pop" },
  { slug: "lo-fi", name: "Lo-Fi" },
  { slug: "indie-hip-hop", name: "Indie Hip Hop" },
  { slug: "alternative", name: "Alternative" },
  { slug: "electronic", name: "Electronic" },
  { slug: "dream-pop", name: "Dream Pop" },
  { slug: "shoegaze", name: "Shoegaze" },
  { slug: "indie-rock", name: "Indie Rock" },
  { slug: "bedroom-pop", name: "Bedroom Pop" },
  { slug: "hyperpop", name: "Hyperpop" },
  { slug: "indie-rb", name: "Indie R&B" },
  { slug: "folk", name: "Folk" },
  { slug: "indie-folk", name: "Indie Folk" },
  { slug: "synth-pop", name: "Synth Pop" },
  { slug: "indie-electronic", name: "Indie Electronic" },
  { slug: "ambient", name: "Ambient" },
  { slug: "post-punk", name: "Post-Punk" },
  { slug: "indie-soul", name: "Indie Soul" },
  { slug: "chillwave", name: "Chillwave" },
  { slug: "glitch-pop", name: "Glitch Pop" },
];

const DEMO_CURATORS = [
  {
    spotifyUserId: "curator_indiepop",
    displayName: "Indie Pop Central",
    bio: "Dedicated to the best indie pop tracks. Verified curator.",
    avatarUrl: "",
    genrePrefs: ["indie-pop", "dream-pop", "bedroom-pop"],
  },
  {
    spotifyUserId: "curator_lofi",
    displayName: "Lo-Fi Vibes",
    bio: "Curating the best lo-fi hip-hop beats since 2018. Verified.",
    avatarUrl: "",
    genrePrefs: ["lo-fi", "indie-hip-hop", "chillwave"],
  },
  {
    spotifyUserId: "curator_alt",
    displayName: "Alt Nation",
    bio: "Alternative music curator. Verified. 15+ years in the scene.",
    avatarUrl: "",
    genrePrefs: ["alternative", "post-punk", "indie-rock"],
  },
  {
    spotifyUserId: "curator_elec",
    displayName: "Electro Discovery",
    bio: "Discovering the best electronic music. Verified curator.",
    avatarUrl: "",
    genrePrefs: ["electronic", "indie-electronic", "synth-pop"],
  },
];

const DEMO_PLAYLISTS = [
  {
    spotifyPlaylistId: "37i9dQZF1DX26DKvjp0s9M",
    name: "Indie Pop Hits",
    description: "The biggest indie pop tracks right now. Updated weekly.",
    thumbnailUrl: "",
    followerCount: 124500,
    curatorUserId: "curator_indiepop",
    genres: ["indie-pop", "dream-pop", "bedroom-pop"],
  },
  {
    spotifyPlaylistId: "37i9dQZF1DX4WYpdgoIcn6",
    name: "Lo-Fi Beats",
    description: "Chill lo-fi beats for studying and relaxing. Verified.",
    thumbnailUrl: "",
    followerCount: 89200,
    curatorUserId: "curator_lofi",
    genres: ["lo-fi", "indie-hip-hop", "chillwave"],
  },
  {
    spotifyPlaylistId: "37i9dQZF1DXcBWIGoYBM5M",
    name: "Alternative Essentials",
    description: "The essential alternative tracks you need in your life.",
    thumbnailUrl: "",
    followerCount: 156800,
    curatorUserId: "curator_alt",
    genres: ["alternative", "post-punk", "indie-rock"],
  },
  {
    spotifyPlaylistId: "37i9dQZF1DX4o1oenSJRJd",
    name: "Electronic Discovery",
    description: "Fresh electronic tracks from independent artists worldwide.",
    thumbnailUrl: "",
    followerCount: 67300,
    curatorUserId: "curator_elec",
    genres: ["electronic", "indie-electronic", "synth-pop"],
  },
];

/** Load playlist data from the generated JSON file, or fall back to demo data. */
function loadSeedData() {
  if (fs.existsSync(JSON_PATH)) {
    const raw = fs.readFileSync(JSON_PATH, "utf-8");
    const data = JSON.parse(raw);
    if (data.playlists && data.playlists.length > 0) {
      return { genres: data.genres, playlists: data.playlists, curators: data.curators };
    }
  }
  console.log("⚠ No playlist-seed.json found — using demo data. Run `npm run spotify:json` to generate real data.");
  return { genres: DEMO_GENRES, playlists: DEMO_PLAYLISTS, curators: DEMO_CURATORS };
}

async function main() {
  // ── 1. Seed genres ──────────────────────────────────────────
  const { genres } = loadSeedData();
  for (const g of genres) {
    await prisma.genre.upsert({
      where: { slug: g.slug },
      update: {},
      create: { slug: g.slug, name: g.name },
    });
  }
  console.log(`✓ Seeded ${genres.length} genres`);

  // ── 2. Seed demo artist ─────────────────────────────────────
  const artist = await prisma.user.upsert({
    where: { email: "artist@example.com" },
    update: {},
    create: {
      email: "artist@example.com",
      isArtist: true,
      creditBalance: 100,
      artistProfile: { create: { artistName: "Demo Artist" } },
    },
  });
  console.log(`✓ Demo artist: ${artist.email}`);

  // ── 3. Seed demo curator ────────────────────────────────────
  const curator = await prisma.user.upsert({
    where: { email: "curator@example.com" },
    update: {},
    create: {
      email: "curator@example.com",
      isCurator: true,
      curatorProfile: { create: { displayName: "Demo Curator", responseHours: 72 } },
    },
  });
  console.log(`✓ Demo curator: ${curator.email}`);

  // ── 4. Seed verified playlist curators + playlists ──────────
  const { playlists } = loadSeedData();
  let seededPlaylists = 0;

  for (const pl of playlists) {
    if (pl.followerCount < MIN_FOLLOWERS) {
      console.log(`⚠ Skipping "${pl.name}" — ${pl.followerCount} followers < ${MIN_FOLLOWERS} minimum`);
      continue;
    }

    // Find or create the curator user
    const curatorUserId = pl.curatorUserId ?? pl.curator?.spotifyUserId;
    if (!curatorUserId) continue;

    const curatorUser = await prisma.user.upsert({
      where: { spotifyUserId: curatorUserId },
      update: { isCurator: true },
      create: {
        email: `${curatorUserId}@mixmverse.demo`,
        spotifyUserId: curatorUserId,
        isCurator: true,
        curatorProfile: {
          create: {
            displayName: pl.curator?.displayName ?? curatorUserId,
            bio: pl.curator?.bio ?? "",
            verified: true,
            totalReviews: 0,
            onTimeReviews: 0,
            missedDeadlines: 0,
            retentionPoints: 0,
          },
        },
      },
    });

    // Upsert the playlist
    const playlist = await prisma.playlist.upsert({
      where: { spotifyPlaylistId: pl.spotifyPlaylistId },
      update: {
        name: pl.name,
        description: pl.description,
        thumbnailUrl: pl.thumbnailUrl,
        followerCount: pl.followerCount,
        isVerified: true,
        verifiedAt: new Date(),
        status: "ACTIVE",
        lastCheckedAt: new Date(),
      },
      create: {
        curatorUserId: curatorUser.id,
        spotifyPlaylistId: pl.spotifyPlaylistId,
        name: pl.name,
        description: pl.description,
        thumbnailUrl: pl.thumbnailUrl,
        followerCount: pl.followerCount,
        isVerified: true,
        verifiedAt: new Date(),
        status: "ACTIVE",
      },
    });

    // Link playlist to genres
    for (const genreSlug of pl.genres) {
      const genre = await prisma.genre.findUnique({ where: { slug: genreSlug } });
      if (genre) {
        await prisma.playlistGenre.upsert({
          where: { playlistId_genreId: { playlistId: playlist.id, genreId: genre.id } },
          update: {},
          create: { playlistId: playlist.id, genreId: genre.id },
        });
      }
    }
    seededPlaylists++;
  }

  console.log(`✓ Seeded ${seededPlaylists} verified playlists`);
  console.log("\n✅ Seed complete!\n");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
