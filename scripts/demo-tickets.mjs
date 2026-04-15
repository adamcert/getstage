import { createClient } from "@supabase/supabase-js";
import { customAlphabet } from "nanoid";
import { randomBytes } from "crypto";

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const nano = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-", 24);
const shortCode = () => {
  const b = randomBytes(4).toString("hex").toUpperCase();
  return `TKT-${b.slice(0,4)}-${b.slice(4,8)}`;
};

const { data: ev } = await sb.from("events").select("id").eq("slug", "release-party-2026-04-22").single();
const { data: tiers } = await sb.from("ticket_tiers").select("id, name").eq("event_id", ev.id);
const tierByName = new Map(tiers.map(t => [t.name, t.id]));

const rows = [
  { email: "alice@example.com", first: "Alice",  last: "Martin",  tier: "Early Bird", status: "checked_in", sent: true,  checked: true  },
  { email: "bob@example.com",   first: "Bob",    last: "Dupont",  tier: "Standard",   status: "sent",       sent: true,  checked: false },
  { email: "clara@example.com", first: "Clara",  last: "Leroy",   tier: "VIP",        status: "sent",       sent: true,  checked: false },
  { email: "david@example.com", first: "David",  last: "Bernard", tier: "Early Bird", status: "issued",     sent: false, checked: false },
  { email: "emma@example.com",  first: "Emma",   last: "Petit",   tier: "VIP",        status: "checked_in", sent: true,  checked: true  },
];

const now = new Date();
const insert = rows.map(r => ({
  event_id: ev.id,
  tier_id: tierByName.get(r.tier),
  buyer_email: r.email,
  buyer_first_name: r.first,
  buyer_last_name: r.last,
  token: nano(),
  short_code: shortCode(),
  status: r.status,
  sent_at: r.sent ? new Date(now.getTime() - 3*3600*1000).toISOString() : null,
  checked_in_at: r.checked ? new Date(now.getTime() - 30*60*1000).toISOString() : null,
}));

const { error } = await sb.from("tickets").insert(insert);
if (error) { console.error(error); process.exit(1); }
console.log(`✓ ${insert.length} tickets inserted`);
