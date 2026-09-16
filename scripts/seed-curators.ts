// scripts/seed-curators.ts
// Scrape Spotify for popular playlists across all major genres,
// then create curator users + playlists + genre preferences in the database.
//
// Usage: npx tsx scripts/seed-curators.ts
// Requires: SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env

import { PrismaClient } from "@prisma/client";
import { SpotifyApi } from "spotify-web-api-node";

const db = new PrismaClient();

const spotify = new SpotifyApi({
  clientId: process.env.SPOTIFY_CLIENT_ID ?? "",
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET ?? "",
});

// All major genres to search for
const GENRES = [
  "pop", "rock", "hip-hop", "rap", "r&b", "soul", "jazz", "blues",
  "electronic", "dance", "house", "techno", "edm", "trance", "dubstep",
  "indie", "alternative", "folk", "country", "reggae", "latin",
  "classical", "ambient", "lofi", "chill", "metal", "punk",
  "acoustic", "singer-songwriter", "funk", "disco",
  "k-pop", "j-pop", "brazilian",
];

const MIN_FOLLOWERS = 50;

async function getToken(): Promise<void> {
  const { body } = await spotify.clientCredentialsGrant();
  spotify.setAccessToken(body.access_token);
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function seedCurators() {
  console.log("🎵 Starting curator seeding...\n");

  // Step 1: Ensure all genres exist in the database
  console.log("📋 Ensuring genres exist...");
  for (const genreSlug of GENRES) {
    await db.genre.upsert({
      where: { slug: genreSlug },
      update: {},
      create: { slug: genreSlug, name: genreSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) },
    });
  }
  console.log(`   ✅ ${GENRES.length} genres ready\n`);

  // Step 2: Get Spotify token
  await getToken();
  console.log("🔑 Spotify token acquired\n");

  // Step 3: For each genre, search for popular playlists
  const processedOwners = new Map<string, string>(); // ownerId → userId
  let totalCurators = 0;
  let totalPlaylists = 0;

  for (const genre of GENRES) {
    console.log(`🔍 Searching: ${genre}`);

    try {
      const { body } = await spotify.searchPlaylists(genre, { limit: 10, market: "US" });
      const playlists = body.playlists?.items ?? [];

      for (const pl of playlists) {
        const ownerId = pl.owner?.id;
        if (!ownerId) continue;

        // Skip if we already processed this owner
        if (processedOwners.has(ownerId)) continue;

        // Get follower count
        const followers = (pl.followers as { total?: number })?.total ?? 0;
        if (followers < MIN_FOLLOWERS) {
          console.log(`   ⏭️  ${pl.name} — ${followers} followers (below ${MIN_FOLLOWERS})`);
          continue;
        }

        // Get full playlist details
        try {
          const { body: fullPlaylist } = await spotify.getPlaylist(pl.id);
          const owner = fullPlaylist.owner;

          // Check if this owner already has a user account
          let user = await db.user.findFirst({
            where: { curatorProfile: { displayName: owner.display_name ?? ownerId } },
          });

          if (!user) {
            // Create a new curator user
            const email = `${ownerId}@curator.mixmverse.com`;
            user = await db.user.create({
              data: {
                email,
                isCurator: true,
                creditBalance: 0,
                curatorProfile: {
                  create: {
                    displayName: owner.display_name ?? ownerId,
                    bio: `Curator of "${pl.name}" and other playlists`,
                    verified: followers >= MIN_FOLLOWERS,
                    totalReviews: 0,
                    onTimeReviews: 0,
                  },
                },
              },
            });
            totalCurators++;
          }

          // Create the playlist
          const existingPlaylist = await db.playlist.findUnique({
            where: { spotifyPlaylistId: pl.id },
          });

          if (!existingPlaylist) {
            await db.playlist.create({
              data: {
                curatorUserId: user.id,
                spotifyPlaylistId: pl.id,
                name: pl.name,
                description: pl.description ?? "",
                thumbnailUrl: pl.images?.[0]?.url ?? null,
                followerCount: followers,
                isVerified: followers >= MIN_FOLLOWERS,
                status: "ACTIVE",
              },
            });
            totalPlaylists++;
          }

          // Link genre to playlist
          const genreRecord = await db.genre.findUnique({ where: { slug: genre } });
          if (genreRecord) {
            await db.playlistGenre.create({
              data: { playlistId: (existingPlaylist ?? await db.playlist.findUnique({ where: { spotifyPlaylistId: pl.id } }))!.id, genreId: genreRecord.id },
            }).catch(() => {}); // Ignore duplicate
          }

          // Add genre preference to curator
          if (genreRecord) {
            await db.curatorGenrePref.create({
              data: { curatorUserId: user.id, genreId: genreRecord.id },
            }).catch(() => {}); // Ignore duplicate
          }

          processedOwners.set(ownerId, user.id);
          console.log(`   ✅ ${pl.name} — ${followers} followers — curator: ${owner.display_name}`);
        } catch (e) {
          console.log(`   ❌ Error processing ${pl.name}: ${e instanceof Error ? e.message : "unknown"}`);
        }

        // Rate limit: wait 100ms between API calls
        await sleep(100);
      }
    } catch (e) {
      console.log(`   ❌ Error searching ${genre}: ${e instanceof Error ? e.message : "unknown"}`);
    }

    // Rate limit between genres
    await sleep(200);
  }

  console.log(`\n🎉 Done!`);
  console.log(`   Curators created: ${totalCurators}`);
  console.log(`   Playlists created: ${totalPlaylists}`);
  console.log(`   Genres covered: ${GENRES.length}`);
}

seedCurators()
  .catch(console.error)
  .finally(() => db.$disconnect());
