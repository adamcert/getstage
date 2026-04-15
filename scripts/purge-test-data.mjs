import { createClient } from "@supabase/supabase-js";

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const TEST_EMAILS = ["orga@example.com", "scan1@example.com", "scan2@example.com"];
const TEST_EVENT_SLUG = "release-party-2026-04-22";

console.log("→ Purging test data");

// 1. Delete event (cascades to tiers, tickets, check_ins via FK on delete cascade)
const { data: ev } = await sb.from("events").select("id").eq("slug", TEST_EVENT_SLUG).maybeSingle();
if (ev) {
  await sb.from("check_ins").delete().eq("event_id", ev.id);
  await sb.from("tickets").delete().eq("event_id", ev.id);
  await sb.from("ticket_tiers").delete().eq("event_id", ev.id);
  await sb.from("event_email_settings").delete().eq("event_id", ev.id);
  await sb.from("organizers").delete().eq("event_id", ev.id);
  await sb.from("events").delete().eq("id", ev.id);
  console.log("✓ Event + tiers + tickets + organizers deleted:", ev.id);
} else {
  console.log("· no test event found");
}

// 2. Delete auth users
const { data: list } = await sb.auth.admin.listUsers();
for (const email of TEST_EMAILS) {
  const user = list.users.find(u => u.email === email);
  if (!user) { console.log("· no user:", email); continue; }
  const { error } = await sb.auth.admin.deleteUser(user.id);
  if (error) console.log("✗", email, error.message);
  else console.log("✓ deleted:", email);
}

console.log("\n✅ Purge done — platform is clean.");
