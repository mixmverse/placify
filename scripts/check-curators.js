const { Client } = require("pg");
const c = new Client({ connectionString: "postgresql://postgres.ufiimcmyqismrhchicey:Livingagoodlife1m%24@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true" });
(async () => {
  await c.connect();

  // How many curators have no playlists?
  const noPlaylists = await c.query(`
    SELECT u.id, u.email, cp."displayName", cp."priceCents"
    FROM "User" u
    JOIN "CuratorProfile" cp ON cp."userId" = u.id
    LEFT JOIN "Playlist" p ON p."curatorUserId" = u.id
    WHERE u."isCurator" = true AND p.id IS NULL
    ORDER BY cp."displayName"
  `);
  console.log(`Curators with NO playlists: ${noPlaylists.rows.length}`);
  for (const r of noPlaylists.rows.slice(0, 10)) {
    console.log(`  ${r.displayName} | ${r.email} | $${r.priceCents / 100}`);
  }
  if (noPlaylists.rows.length > 10) console.log(`  ... and ${noPlaylists.rows.length - 10} more`);

  // How many curators have playlists?
  const withPlaylists = await c.query(`
    SELECT COUNT(DISTINCT u.id) as cnt
    FROM "User" u
    JOIN "Playlist" p ON p."curatorUserId" = u.id
    WHERE u."isCurator" = true
  `);
  console.log(`\nCurators WITH playlists: ${withPlaylists.rows[0].cnt}`);

  // Total playlists
  const totalPl = await c.query('SELECT COUNT(*) as cnt FROM "Playlist"');
  console.log(`Total playlists: ${totalPl.rows[0].cnt}`);

  await c.end();
})().catch(e => console.error(e.message));
