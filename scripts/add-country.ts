// scripts/add-country.ts
import { Client } from "pg";

async function main() {
  const client = new Client({
    host: "aws-1-eu-west-1.pooler.supabase.com",
    port: 6543,
    user: "postgres.ufiimcmyqismrhchicey",
    password: "Livingagoodlife1m$",
    database: "postgres",
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  await client.query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "country" TEXT;`);
  console.log("✅ Added 'country' column to User table");

  await client.end();
}

main().catch((e) => {
  console.error("Migration failed:", e);
  process.exit(1);
});
