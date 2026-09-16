// scripts/seed-african-curators.ts
// Seeds African music curators (Afrobeats, Amapiano, Highlife, Street Hop, Nigerian, Ghanaian, South African)
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { join } from "path";

const db = new PrismaClient();

interface AfricanCurator {
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
}

const GENRE_MAP: Record<string, string> = {
  "AFROBEATS": "Afrobeats",
  "AMAPIANO": "Amapiano",
  "HIGHLIFE": "Highlife",
  "HIPLIFE": "Hiplife",
  "AFRO POP": "Afro Pop",
  "AFRO R&B": "R&B",
  "AFRO FUSION": "Afrobeat",
  "AFRO HOUSE": "Afro House",
  "AFRO ZOUK": "Afrobeats",
  "GQOM": "Gqom",
  "NIGERIAN DRILL": "Hip-Hop",
  "NIGERIAN POP": "Afrobeats",
  "ALTE": "Alternative",
  "ASAKAA": "Hip-Hop",
  "AZONTO": "Afrobeats",
  "GHANAIAN HIP HOP": "Hip-Hop",
  "GHANAIAN POP": "Afrobeats",
  "FUJI": "World",
  "JUJU": "World",
  "AFRO ADURA": "Afrobeats",
  "AFRO BASHMENT": "Dancehall",
  "AFRO SWING": "Afrobeats",
  "STREET HOP": "Afrobeats",
  "DANCEHALL": "Reggae",
  "3 STEP": "Amapiano",
  "HIP HOP": "Hip-Hop",
  "RAP": "Rap",
  "R&B": "R&B",
  "POP": "Pop",
  "ROCK": "Rock",
  "ALTERNATIVE": "Alternative",
  "ELECTRONIC": "Electronic",
  "HOUSE": "House",
  "TECHNO": "Techno",
  "LOFI": "Lo-Fi",
  "INDIE": "Indie",
  "FOLK": "Folk",
  "JAZZ": "Jazz",
  "REGGAE": "Reggae",
  "SOUL": "Soul",
  "DANCE": "Dance",
  "TRAP": "Trap",
  "ORGANIC HOUSE": "Organic House",
};

function mapGenre(genre: string): string {
  const upper = genre.toUpperCase().trim();
  return GENRE_MAP[upper] || genre.charAt(0).toUpperCase() + genre.slice(1).toLowerCase();
}

function extractSpotifyId(url: string): string | null {
  const match = url.match(/playlist\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

async function main() {
  const dataPath = join(__dirname, "..", "curators_seed_african.json");
  const raw = readFileSync(dataPath, "utf-8");
  const curators: AfricanCurator[] = JSON.parse(raw);

  console.log(`Seeding ${curators.length} African music curators...\n`);

  let created = 0;
  let errors = 0;

  for (const c of curators) {
    try {
      const email = c.email || `curator-${c.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}@mixmverse.com`;

      const user = await db.user.upsert({
        where: { email },
        update: {},
        create: {
          email,
          isCurator: true,
          creditBalance: 0,
        },
      });

      const existingProfile = await db.curatorProfile.findUnique({ where: { userId: user.id } });
      if (!existingProfile) {
        await db.curatorProfile.create({
          data: {
            userId: user.id,
            displayName: c.name,
            bio: c.description || `${c.name} - African music playlist curator`,
            priceCents: c.price_cents,
            verified: c.verified,
            totalReviews: 0,
            onTimeReviews: 0,
            missedDeadlines: 0,
            retentionPoints: 0,
          },
        });
      }

      // Create playlist if Spotify URL available
      const spotifyId = extractSpotifyId(c.spotify_url);
      if (spotifyId) {
        const existingPlaylist = await db.playlist.findFirst({ where: { spotifyPlaylistId: spotifyId } });
        if (!existingPlaylist) {
          await db.playlist.create({
            data: {
              curatorUserId: user.id,
              name: c.name,
              spotifyPlaylistId: spotifyId,
              followerCount: c.followers,
              isVerified: c.verified,
              status: "ACTIVE",
              thumbnailUrl: null,
            },
          });
        }
      }

      // Genre preferences
      for (const genre of c.genres) {
        const mapped = mapGenre(genre);
        const dbGenre = await db.genre.findFirst({ where: { name: mapped } });
        if (dbGenre) {
          // Check if already exists
          const existing = await db.curatorGenrePref.findFirst({
            where: { curatorUserId: user.id, genreId: dbGenre.id },
          });
          if (!existing) {
            await db.curatorGenrePref.create({
              data: { curatorUserId: user.id, genreId: dbGenre.id },
            });
          }
        }
      }

      created++;
      console.log(`  ✓ ${c.name} (${c.followers} followers, ${c.genres.slice(0, 3).join(", ")})`);
    } catch (err) {
      errors++;
      console.error(`  ✗ ${c.name}: ${(err as Error).message?.slice(0, 100)}`);
    }
  }

  console.log(`\nDone! Created: ${created}, Errors: ${errors}`);

  // Stats
  const [userCount, profileCount, playlistCount, genreCount] = await Promise.all([
    db.user.count({ where: { isCurator: true } }),
    db.curatorProfile.count(),
    db.playlist.count(),
    db.genre.count(),
  ]);

  console.log(`\nDatabase totals:`);
  console.log(`  Users (curators): ${userCount}`);
  console.log(`  Curator profiles: ${profileCount}`);
  console.log(`  Playlists: ${playlistCount}`);
  console.log(`  Genres: ${genreCount}`);
}

main()
  .catch((e) => {
    console.error("Fatal error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
