/**
 * Seed script — Task 3.1
 * Inserts the fixture event, tiers, organizer, and scanner users.
 * Uses the service_role key (bypasses RLS).
 *
 * Run:
 *   npx tsx --env-file=.env.local scripts/seed-event.ts
 */

import { createClient } from "@supabase/supabase-js";
import fixture from "./seed-fixture.json";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const sb = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ---------------------------------------------------------------------------
// Helper: ensure a user exists (create if missing), return its UUID
// ---------------------------------------------------------------------------
async function ensureUser(email: string, password: string): Promise<string> {
  const { data: listData, error: listError } = await sb.auth.admin.listUsers();
  if (listError) throw new Error(`listUsers failed: ${listError.message}`);

  const existing = listData.users.find((u) => u.email === email);
  if (existing) return existing.id;

  const { data: created, error: createError } = await sb.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (createError) throw new Error(`createUser(${email}) failed: ${createError.message}`);
  return created.user.id;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log(`\n→ Seeding event: ${fixture.event.name}`);

  // 1. Upsert event by slug
  const { data: eventData, error: eventError } = await sb
    .from("events")
    .upsert(fixture.event, { onConflict: "slug" })
    .select("id")
    .single();

  if (eventError) throw new Error(`events upsert failed: ${eventError.message}`);
  const eventId: string = eventData.id;
  console.log(`✓ Event: ${eventId}`);

  // 2. Replace tiers — delete existing ones then insert fresh
  const { error: deleteTiersError } = await sb
    .from("ticket_tiers")
    .delete()
    .eq("event_id", eventId);
  if (deleteTiersError) throw new Error(`delete tiers failed: ${deleteTiersError.message}`);

  const tiersToInsert = fixture.tiers.map((t) => ({ ...t, event_id: eventId }));
  const { error: tiersError } = await sb.from("ticket_tiers").insert(tiersToInsert);
  if (tiersError) throw new Error(`insert tiers failed: ${tiersError.message}`);
  console.log(`✓ ${fixture.tiers.length} tiers`);

  // 3. Organizer user
  const orgaUserId = await ensureUser(fixture.organizer.email, fixture.organizer.password);
  const { error: orgaOrgError } = await sb.from("organizers").upsert(
    {
      user_id: orgaUserId,
      event_id: eventId,
      role: "owner",
      display_name: fixture.organizer.display_name,
    },
    { onConflict: "user_id,event_id" }
  );
  if (orgaOrgError) throw new Error(`organizers upsert (owner) failed: ${orgaOrgError.message}`);
  console.log(`✓ Organizer: ${fixture.organizer.email}`);

  // 4. Scanner users
  for (const scanner of fixture.scanners) {
    const scanUserId = await ensureUser(scanner.email, scanner.password);
    const { error: scanOrgError } = await sb.from("organizers").upsert(
      {
        user_id: scanUserId,
        event_id: eventId,
        role: "scanner",
        display_name: scanner.display_name,
      },
      { onConflict: "user_id,event_id" }
    );
    if (scanOrgError)
      throw new Error(`organizers upsert (scanner ${scanner.email}) failed: ${scanOrgError.message}`);
    console.log(`✓ Scanner: ${scanner.email}`);
  }

  console.log(`\n✅ Done. Event URL: http://localhost:3000/dashboard/events/${eventId}`);
}

main().catch((err) => {
  console.error("\n❌ Seed failed:", err.message);
  process.exit(1);
});
