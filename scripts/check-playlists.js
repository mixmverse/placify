const { Client } = require("pg");
const c = new Client({ connectionString: "postgresql://postgres.ufiimcmyqismrhchicey:Livingagoodlife1m%24@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true" });
(async () => {
  await c.connect();
  // How many playlists would be filtered by MIN_FOLLOWERS=100?
  const r = await c.query('SELECT COUNT(*) as total, SUM(CASE WHEN "followerCount" < 100 THEN 1 ELSE 0 END) as below_100, SUM(CASE WHEN "followerCount" >= 100 AND "followerCount" < 500 THEN 1 ELSE 0 END) as "100_500", SUM(CASE WHEN "followerCount" >= 500 THEN 1 ELSE 0 END) as above_500 FROM "Playlist" WHERE status = $1', ["ACTIVE"]);
  console.log(JSON.stringify(r.rows[0]));

  // Show some examples of small playlists
  const small = await c.query('SELECT p.name, p."followerCount", cp."displayName" FROM "Playlist" p JOIN "User" u ON p."curatorUserId" = u.id JOIN "CuratorProfile" cp ON cp."userId" = u.id WHERE p."followerCount" < 100 AND p.status = $1 ORDER BY p."followerCount" DESC LIMIT 10', ["ACTIVE"]);
  console.log("\nActive playlists under 100 followers:");
  for (const s of small.rows) {
    console.log(`  ${s.name} (${s.displayName}): ${s.followerCount} followers`);
  }
  await c.end();
})().catch(e => console.error(e.message));
