const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.ufiimcmyqismrhchicey:Livingagoodlife1m%24@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true' });
(async () => {
  await client.connect();
  
  // Find user by ID from Flutterwave meta
  const userId = 'cmu3mnw3g00016yq7kyy1nj1x';
  const user = await client.query(`SELECT id, email, "creditBalance" FROM "User" WHERE id = $1`, [userId]);
  console.log('User:', user.rows[0]);
  
  if (user.rows.length > 0) {
    // Grant 25 credits for STARTER plan
    const newBalance = user.rows[0].creditBalance + 25;
    await client.query(`UPDATE "User" SET "creditBalance" = $1 WHERE id = $2`, [newBalance, userId]);
    
    // Create ledger entry
    await client.query(`INSERT INTO "CreditLedger" (id, "userId", delta, reason, "balanceAfter", "createdAt", "stripeRef") VALUES (gen_random_uuid()::text, $1, 25, 'PACK_PURCHASE', $2, NOW(), $3)`, [userId, newBalance, 'PLACIFY_STARTER_cmu3mnw3_1789541148969']);
    
    console.log('Granted 25 credits! New balance:', newBalance);
  } else {
    console.log('User not found!');
  }
  
  // Verify
  const updated = await client.query(`SELECT id, email, "creditBalance" FROM "User" WHERE id = $1`, [userId]);
  console.log('After update:', updated.rows[0]);
  
  await client.end();
})().catch(e => { console.error(e.message); process.exit(1); });
