// scripts/seed-pdf-curators.ts
// Seeds curators extracted from the Indie Spotify Bible PDF
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { join } from "path";

const db = new PrismaClient();

interface PdfCurator {
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

// Map PDF genre names to our DB genre names
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
  "SINGER/SONGWRITER": "Singer-Songwriter",
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
  "AFRO BEATS": "Afrobeat",
  "INDIETRONICA": "Indietronica",
  "CHILLWAVE": "Chillwave",
  "SYNTH POP": "Synth-Pop",
  "SYNTHWAVE": "Synthwave",
  "DREAMPOP": "Dream Pop",
  "DREAM POP": "Dream Pop",
  "SHOEGAZE": "Shoegaze",
  "GRUNGE": "Grunge",
  "PSYCHEDELIC": "Psychedelic",
  "PREVERB": "Indie",
  "FOLK POP": "Folk-Pop",
  "FOLK-POP": "Folk-Pop",
  "POP ROCK": "Pop Rock",
  "HARD ROCK": "Hard Rock",
  "POST-GRUNGE": "Post-Grunge",
  "LO-FI HIP HOP": "Lo-Fi Hip-Hop",
  "DOWNTEMPO": "Downtempo",
  "CHILLHOP": "Chillhop",
  "DEEPHOUSE": "Deep House",
  "DANCE PUNK": "Dance Punk",
  "TRIPHOP": "Trip-Hop",
  "MICROHOUSE": "Microhouse",
  "NEO-PSYCHEDELIC": "Neo-Psychedelic",
  "INDIE FOLK": "Indie Folk",
  "ROOTS": "Roots",
  "POST-PUNK": "Post-Punk",
  "POST-HARDCORE": "Post-Hardcore",
  "POWER POP": "Power Pop",
  "CHILLSTEP": "Chillstep",
  "GOTH": "Goth",
  "NEW AGE": "New Age",
  "AMBEAT": "Electronic",
  "DARK FOLK": "Dark Folk",
  "A CAPPELLA": "A Cappella",
  "MOTOWN": "Soul",
  "SKA": "Ska",
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
  const dataPath = join(__dirname, "..", "curators_seed_ready.json");
  const raw = readFileSync(dataPath, "utf-8");
  const curators: PdfCurator[] = JSON.parse(raw);

  console.log(`Seeding ${curators.length} PDF curators...\n`);

  let created = 0;
  const skipped = 0;
  let errors = 0;

  for (const c of curators) {
    try {
      const email = c.email || `curator-${c.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}@mixmverse.com`;

      // User model: NO name, NO role. Use isCurator boolean.
      const user = await db.user.upsert({
        where: { email },
        update: {},
        create: {
          email,
          isCurator: true,
          creditBalance: 0,
        },
      });

      // Curator profile
      await db.curatorProfile.upsert({
        where: { userId: user.id },
        update: {},
        create: {
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

      // Playlist — field is spotifyPlaylistId, not spotifyId
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

          // Playlist genre associations
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

          // Curator genre preferences — compound key is [curatorUserId, genreId]
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
        }
      }

      created++;
      if (created % 50 === 0) {
        console.log(`  Progress: ${created}/${curators.length}`);
      }
    } catch (e) {
      errors++;
      console.error(`  Error seeding ${c.name}: ${e}`);
    }
  }

  console.log(`\nDone! Created: ${created}, Skipped: ${skipped}, Errors: ${errors}`);

  // Summary — use isCurator: true, not role: "CURATOR"
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
