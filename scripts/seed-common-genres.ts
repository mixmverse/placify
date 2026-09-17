// scripts/seed-common-genres.ts
// Ensures all common music genres exist in the Genre table
// so curator genre-preferences and playlist-genres can link to them.
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

// All genres that should exist in the DB
// slug = URL-safe, name = display name
const COMMON_GENRES: { slug: string; name: string }[] = [
  // Core genres the pitch page uses
  { slug: "afrobeat", name: "Afrobeat" },
  { slug: "afrobeats", name: "Afrobeats" },
  { slug: "amapiano", name: "Amapiano" },
  { slug: "dancehall", name: "Dancehall" },
  { slug: "hip-hop", name: "Hip-Hop" },
  { slug: "house", name: "House" },
  { slug: "indie", name: "Indie" },
  { slug: "k-pop", name: "K-Pop" },
  { slug: "latin", name: "Latin" },
  { slug: "lofi", name: "Lo-Fi" },
  { slug: "pop", name: "Pop" },
  { slug: "r&b", name: "R&B" },
  { slug: "reggaeton", name: "Reggaeton" },
  { slug: "trap", name: "Trap" },
  { slug: "electronic", name: "Electronic" },
  { slug: "jazz", name: "Jazz" },
  { slug: "soul", name: "Soul" },
  { slug: "rock", name: "Rock" },
  { slug: "folk", name: "Folk" },
  { slug: "edm", name: "EDM" },
  { slug: "punk", name: "Punk" },
  // Additional common genres
  { slug: "alternative", name: "Alternative" },
  { slug: "ambient", name: "Ambient" },
  { slug: "bedroom-pop", name: "Bedroom Pop" },
  { slug: "blues", name: "Blues" },
  { slug: "chill", name: "Chill" },
  { slug: "chillhop", name: "Chillhop" },
  { slug: "chillwave", name: "Chillwave" },
  { slug: "classical", name: "Classical" },
  { slug: "country", name: "Country" },
  { slug: "dance", name: "Dance" },
  { slug: "dark-pop", name: "Dark Pop" },
  { slug: "deep-house", name: "Deep House" },
  { slug: "dnb", name: "DnB" },
  { slug: "downtempo", name: "Downtempo" },
  { slug: "dream-pop", name: "Dream Pop" },
  { slug: "dubstep", name: "Dubstep" },
  { slug: "experimental", name: "Experimental" },
  { slug: "funk", name: "Funk" },
  { slug: "future-house", name: "Future House" },
  { slug: "glitch-pop", name: "Glitch Pop" },
  { slug: "hardcore", name: "Hardcore" },
  { slug: "hard-rock", name: "Hard Rock" },
  { slug: "hyperpop", name: "Hyperpop" },
  { slug: "indie-electronic", name: "Indie Electronic" },
  { slug: "indie-folk", name: "Indie Folk" },
  { slug: "indie-hip-hop", name: "Indie Hip Hop" },
  { slug: "indie-pop", name: "Indie Pop" },
  { slug: "indie-r&b", name: "Indie R&B" },
  { slug: "indie-rock", name: "Indie Rock" },
  { slug: "lo-fi", name: "Lo-Fi" },
  { slug: "lofi-beats", name: "Lofi Beats" },
  { slug: "lounge", name: "Lounge" },
  { slug: "melodic-house", name: "Melodic House" },
  { slug: "melodic-techno", name: "Melodic Techno" },
  { slug: "metal", name: "Metal" },
  { slug: "minimal", name: "Minimal" },
  { slug: "neo-soul", name: "Neo Soul" },
  { slug: "pop-rock", name: "Pop Rock" },
  { slug: "post-punk", name: "Post-Punk" },
  { slug: "progressive-house", name: "Progressive House" },
  { slug: "rap", name: "Rap" },
  { slug: "reggae", name: "Reggae" },
  { slug: "rnb", name: "R&B" },
  { slug: "shoegaze", name: "Shoegaze" },
  { slug: "singer-songwriter", name: "Singer-Songwriter" },
  { slug: "synth-pop", name: "Synth Pop" },
  { slug: "tech-house", name: "Tech House" },
  { slug: "techno", name: "Techno" },
  { slug: "tropical-house", name: "Tropical House" },
  { slug: "world", name: "World" },
];

async function main() {
  console.log(`Ensuring ${COMMON_GENRES.length} common genres exist in DB...\n`);

  let created = 0;
  let existing = 0;

  for (const g of COMMON_GENRES) {
    const existingGenre = await db.genre.findFirst({
      where: { slug: g.slug },
    });

    if (existingGenre) {
      existing++;
      continue;
    }

    // Also check by name in case slug is different but name matches
    const byName = await db.genre.findFirst({
      where: { name: g.name },
    });

    if (byName) {
      existing++;
      continue;
    }

    await db.genre.create({
      data: {
        slug: g.slug,
        name: g.name,
      },
    });
    created++;
    console.log(`  Created: ${g.name} (${g.slug})`);
  }

  console.log(`\nDone! Created: ${created}, Already existed: ${existing}`);

  const totalGenres = await db.genre.count();
  console.log(`Total genres in DB: ${totalGenres}`);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
