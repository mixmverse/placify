// scripts/seed-online-curators.ts
// Seeds curators discovered from online research (Heard, SubmitHub, SubmitLink, Delaynote, etc.)
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { join } from "path";

const db = new PrismaClient();

interface OnlineCurator {
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
  "POP": "Pop",
  "ROCK": "Rock",
  "ALTERNATIVE": "Alternative",
  "HIP HOP": "Hip-Hop",
  "RAP": "Rap",
  "R&B": "R&B",
  "SOUL": "Soul",
  "FOLK": "Folk",
  "COUNTRY": "Country",
  "ELECTRONIC": "Electronic",
  "DANCE": "Dance",
  "JAZZ": "Jazz",
  "BLUES": "Blues",
  "REGGAE": "Reggae",
  "METAL": "Metal",
  "PUNK": "Punk",
  "INDIE ROCK": "Indie Rock",
  "INDIE POP": "Indie Pop",
  "INDIE": "Indie",
  "SINGER SONGWRITER": "Singer-Songwriter",
  "CLASSICAL": "Classical",
  "LO-FI": "Lo-Fi",
  "CHILL": "Chill",
  "EXPERIMENTAL": "Experimental",
  "FUNK": "Funk",
  "DISCO": "Disco",
  "AMBIENT": "Ambient",
  "INSTRUMENTAL": "Instrumental",
  "LATIN": "Latin",
  "WORLD": "World",
  "EDM": "EDM",
  "HOUSE": "House",
  "TECHNO": "Techno",
  "TRAP": "Trap",
  "REGGAETON": "Reggaeton",
  "AFROBEAT": "Afrobeat",
  "AFRO HOUSE": "Afrobeat",
  "DEEP HOUSE": "Deep House",
  "TECH HOUSE": "Tech House",
  "TROPICAL HOUSE": "Tropical House",
  "SLAP HOUSE": "Slap House",
  "BASS HOUSE": "Bass House",
  "MELODIC TECHNO": "Melodic Techno",
  "MELODIC HOUSE": "Melodic House",
  "MELODIC BASS": "Melodic Bass",
  "PROGRESSIVE HOUSE": "Progressive House",
  "PROGRESSIVE": "Progressive",
  "ORGANIC HOUSE": "Organic House",
  "CHILLSTEP": "Chillstep",
  "FUTURE HOUSE": "Future House",
  "FUTURE BASS": "Future Bass",
  "DUBSTEP": "Dubstep",
  "BASS": "Bass",
  "DARK POP": "Dark Pop",
  "INDIE POP": "Indie Pop",
  "BEDROOM POP": "Bedroom Pop",
  "POP ROCK": "Pop Rock",
  "HARD ROCK": "Hard Rock",
  "POST PUNK": "Post-Punk",
  "DARK WAVE": "Dark Wave",
  "CORE": "Metal",
  "BOOMBAP": "Hip-Hop",
  "LYRICAL RAP": "Hip-Hop",
  "UNDERGROUND": "Hip-Hop",
  "DRILL": "Hip-Hop",
  "ART ROCK": "Art Rock",
  "PIANO": "Classical",
  "CHILLHOP": "Chillhop",
  "Neo SOUL": "Soul",
  "DOWNTempo": "Downtempo",
  "AMERICANA": "Folk",
  "LOUNGE": "Lounge",
  "JAZZY HOUSE": "Jazz",
  "MINIMAL": "Techno",
  "POP COUNTRY": "Country",
  "STUDY": "Lo-Fi",
  "ANTI POP": "Indie",
  "SHOEGAZE": "Shoegaze",
  "ACOUSTIC": "Folk",
  "ALL": "Pop",
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
  const dataPath = join(__dirname, "..", "curators_seed_online.json");
  const raw = readFileSync(dataPath, "utf-8");
  const curators: OnlineCurator[] = JSON.parse(raw);

  console.log(`Seeding ${curators.length} online curators...\n`);

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
            bio: c.description || `${c.name} - Spotify playlist curator`,
            priceCents: c.price_cents,
            verified: c.verified,
            totalReviews: 0,
            onTimeReviews: 0,
            missedDeadlines: 0,
            retentionPoints: 0,
          },
        });
      }

      if (c.spotify_url) {
        const spotifyId = extractSpotifyId(c.spotify_url);
        if (spotifyId) {
          await db.playlist.upsert({
            where: { spotifyPlaylistId: spotifyId },
            update: {},
            create: {
              curatorUserId: user.id,
              spotifyPlaylistId: spotifyId,
              name: c.name,
              followerCount: c.followers,
              isVerified: c.verified,
              status: "ACTIVE",
            },
          });

          const playlist = await db.playlist.findUnique({ where: { spotifyPlaylistId: spotifyId } });
          if (playlist) {
            for (const genre of c.genres) {
              const mapped = mapGenre(genre);
              const dbGenre = await db.genre.findFirst({ where: { name: mapped } });
              if (dbGenre) {
                await db.playlistGenre.upsert({
                  where: {
                    playlistId_genreId: {
                      playlistId: playlist.id,
                      genreId: dbGenre.id,
                    },
                  },
                  update: {},
                  create: {
                    playlistId: playlist.id,
                    genreId: dbGenre.id,
                  },
                });
              }
            }
          }
        }
      }

      // Curator genre preferences
      for (const genre of c.genres) {
        const mapped = mapGenre(genre);
        const dbGenre = await db.genre.findFirst({ where: { name: mapped } });
        if (dbGenre) {
          await db.curatorGenrePref.upsert({
            where: {
              curatorUserId_genreId: {
                curatorUserId: user.id,
                genreId: dbGenre.id,
              },
            },
            update: {},
            create: {
              curatorUserId: user.id,
              genreId: dbGenre.id,
            },
          });
        }
      }

      created++;
      if (created % 20 === 0) {
        console.log(`  Progress: ${created}/${curators.length}`);
      }
    } catch (e) {
      errors++;
      console.error(`  Error seeding ${c.name}: ${e}`);
    }
  }

  console.log(`\nDone! Created: ${created}, Errors: ${errors}`);

  const totalUsers = await db.user.count({ where: { isCurator: true } });
  const totalProfiles = await db.curatorProfile.count();
  const totalPlaylists = await db.playlist.count();
  const totalGenres = await db.genre.count();

  console.log(`\nDatabase totals:`);
  console.log(`  Users (curators): ${totalUsers}`);
  console.log(`  Curator profiles: ${totalProfiles}`);
  console.log(`  Playlists: ${totalPlaylists}`);
  console.log(`  Genres: ${totalGenres}`);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
