import pg from "pg";
const url = process.env.POSTGRES_URL_NON_POOLING.replace(/[?&]sslmode=[^&]+/g, "");
const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
await client.connect();
const { rows } = await client.query(`
  SELECT tablename FROM pg_tables WHERE schemaname='public'
    AND tablename IN ('events','ticket_tiers','tickets','check_ins','organizers','event_email_settings')
  ORDER BY tablename;
`);
console.log("Tables found:", rows.map(r => r.tablename).join(", "));
console.log("Expected 6, got:", rows.length);
await client.end();
