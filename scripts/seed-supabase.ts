// scripts/seed-supabase.ts — Raw pg seed for Supabase (Prisma CLI hangs on pooler)
const { Pool } = require('pg');
const crypto = require('crypto');

const DB_URL = 'postgresql://postgres.ufiimcmyqismrhchicey:Livingagoodlife1m%24@aws-1-eu-west-1.pooler.supabase.com:6543/postgres';
const curators = require('../curators_seed_ready.json');

function cuid() {
  return 'c' + crypto.randomBytes(12).toString('base64url').slice(0, 24);
}

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function main() {
  const pool = new Pool({ connectionString: DB_URL });
  const client = await pool.connect();

  try {
    // 1. Get all unique genres
    const genreSet = new Set();
    for (const c of curators) {
      for (const g of (c.genres || [])) genreSet.add(g.toUpperCase());
    }
    const genres = [...genreSet].sort();
    console.log(`Genres to seed: ${genres.length}`);

    // 2. Insert genres (skip existing, handle slug collisions)
    const genreMap = {};
    const usedSlugs = new Set();
    const existingGenres = await client.query('SELECT id, slug FROM "Genre"');
    for (const r of existingGenres.rows) {
      usedSlugs.add(r.slug);
      // Also map by name
    }
    for (const g of genres) {
      const existing = await client.query('SELECT id FROM "Genre" WHERE name = $1', [g]);
      if (existing.rows.length > 0) {
        genreMap[g] = existing.rows[0].id;
      } else {
        const id = cuid();
        let slug = slugify(g);
        if (usedSlugs.has(slug)) slug = slug + '-' + id.slice(1, 5);
        usedSlugs.add(slug);
        await client.query('INSERT INTO "Genre" (id, slug, name) VALUES ($1, $2, $3)', [id, slug, g]);
        genreMap[g] = id;
      }
    }
    console.log(`Genres ready: ${Object.keys(genreMap).length}`);

    // 3. Get existing curator emails to skip
    const existingEmails = new Set();
    const existingRes = await client.query('SELECT email FROM "User" WHERE "isCurator" = true');
    for (const r of existingRes.rows) existingEmails.add(r.email);
    console.log(`Existing curators: ${existingEmails.size}`);

    // 4. Seed curators
    let created = 0;
    let skipped = 0;

    for (const c of curators) {
      // Generate email from name if missing
      const email = c.email && c.email.trim() !== ''
        ? c.email.trim().toLowerCase()
        : `curator-${slugify(c.name)}@mixmverse.com`;
      if (existingEmails.has(email)) { skipped++; continue; }

      const userId = cuid();

      try {
        // User
        await client.query(
          'INSERT INTO "User" (id, email, "isCurator", "creditBalance", "createdAt", "updatedAt") VALUES ($1, $2, true, 0, NOW(), NOW())',
          [userId, email]
        );

        // CuratorProfile (userId IS the PK — no separate id column)
        await client.query(
          'INSERT INTO "CuratorProfile" (id, "userId", "displayName", bio, "priceCents", verified, "totalReviews", "onTimeReviews", "missedDeadlines", "retentionPoints", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, 0, 0, 0, 0, NOW(), NOW())',
          [cuid(), userId, c.name, c.description || '', c.price_cents || 0, c.verified ?? true]
        );

        // Playlist
        if (c.spotify_url) {
          const playlistIdMatch = c.spotify_url.match(/playlist\/([a-zA-Z0-9]+)/);
          const spotifyId = playlistIdMatch ? playlistIdMatch[1] : c.spotify_url;
          await client.query(
            'INSERT INTO "Playlist" (id, "curatorUserId", "spotifyPlaylistId", name, "followerCount", "isVerified", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())',
            [cuid(), userId, spotifyId, c.name, c.followers || 0, c.verified ?? true]
          );
        }

        // CuratorGenrePref (no id column — composite PK)
        for (const g of (c.genres || [])) {
          const genreId = genreMap[g.toUpperCase()];
          if (genreId) {
            await client.query(
              'INSERT INTO "CuratorGenrePref" ("curatorUserId", "genreId") VALUES ($1, $2) ON CONFLICT DO NOTHING',
              [userId, genreId]
            );
          }
        }

        created++;
        if (created % 50 === 0) console.log(`  ...${created} created`);
      } catch (e) {
        console.error(`  Skip ${email}: ${e.message.slice(0, 100)}`);
        skipped++;
      }
    }

    console.log(`\nDone! Created: ${created}, Skipped: ${skipped}`);

    // Summary
    const counts = await client.query(`
      SELECT
        (SELECT COUNT(*) FROM "User" WHERE "isCurator" = true) as curators,
        (SELECT COUNT(*) FROM "CuratorProfile") as profiles,
        (SELECT COUNT(*) FROM "Playlist") as playlists,
        (SELECT COUNT(*) FROM "Genre") as genres,
        (SELECT COUNT(*) FROM "CuratorGenrePref") as prefs
    `);
    console.log('DB totals:', counts.rows[0]);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
