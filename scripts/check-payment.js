const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.ufiimcmyqismrhchicey:Livingagoodlife1m%24@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true' });
(async () => {
  await client.connect();
  const users = await client.query(`SELECT id, email, "creditBalance" FROM "User" WHERE email LIKE '%@%' ORDER BY "creditBalance" DESC`);
  console.log('Users:');
  users.rows.forEach(r => console.log('  ' + r.email + ': ' + r.creditBalance + ' credits'));
  
  const ledger = await client.query(`SELECT id, reason, delta, "balanceAfter" FROM "CreditLedger" ORDER BY "createdAt" DESC LIMIT 10`);
  console.log('Recent ledger:');
  ledger.rows.forEach(r => console.log('  ' + r.reason + ' delta=' + r.delta + ' bal=' + r.balanceAfter));

  const subs = await client.query(`SELECT * FROM "Submission" ORDER BY "createdAt" DESC LIMIT 5`);
  console.log('Recent submissions:', subs.rows.length);

  await client.end();
})().catch(e => { console.error(e.message); process.exit(1); });
