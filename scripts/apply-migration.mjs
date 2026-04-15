import { readFileSync } from "fs";
import pg from "pg";

const sql = readFileSync("supabase/migrations/20260415000001_getstage_live.sql", "utf8");
const url = process.env.POSTGRES_URL_NON_POOLING.replace(/[?&]sslmode=[^&]+/g, "");
const client = new pg.Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
});
await client.connect();
console.log("Connected, applying migration…");
try {
  await client.query(sql);
  console.log("✓ Migration applied successfully");
} catch (e) {
  console.error("✗ Migration failed:", e.message);
  process.exit(1);
} finally {
  await client.end();
}
