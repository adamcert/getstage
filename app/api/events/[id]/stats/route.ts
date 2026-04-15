export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, ctx: RouteContext) {
  // 1. Auth
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: eventId } = await ctx.params;
  const admin = supabaseAdmin();

  // 2. Owner check
  const { data: orgRow, error: orgError } = await admin
    .from("organizers")
    .select("role")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .in("role", ["owner", "admin"])
    .maybeSingle();

  if (orgError) {
    return NextResponse.json({ error: orgError.message }, { status: 500 });
  }
  if (!orgRow) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 3. Fetch event + ticket_types for capacity
  const { data: event, error: eventError } = await admin
    .from("events")
    .select("id, title, ticket_types")
    .eq("id", eventId)
    .maybeSingle();

  if (eventError || !event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  // 4. Aggregate tickets
  const { data: tickets, error: ticketsError } = await admin
    .from("tickets")
    .select("id, status, tier, price_cents, sent_at")
    .eq("event_id", eventId);

  if (ticketsError) {
    return NextResponse.json({ error: ticketsError.message }, { status: 500 });
  }

  const allTickets = tickets ?? [];

  const issued = allTickets.length;
  const sent = allTickets.filter((t) => t.sent_at != null).length;
  const checkedIn = allTickets.filter((t) => t.status === "checked_in").length;
  const revenueCents = allTickets.reduce(
    (sum, t) => sum + (t.price_cents ?? 0),
    0
  );

  // Capacity from ticket_types
  const ticketTypes: Array<{ name: string; quantity_total: number; price?: number }> =
    (event.ticket_types as Array<{ name: string; quantity_total: number; price?: number }>) ?? [];
  const capacity = ticketTypes.reduce((sum, tt) => sum + (tt.quantity_total ?? 0), 0);

  // 5. byTier breakdown
  const tierMap = new Map<
    string,
    { issued: number; checkedIn: number; revenueCents: number; capacity: number }
  >();

  for (const tt of ticketTypes) {
    tierMap.set(tt.name, {
      issued: 0,
      checkedIn: 0,
      revenueCents: 0,
      capacity: tt.quantity_total ?? 0,
    });
  }

  for (const t of allTickets) {
    const tierName = t.tier ?? "default";
    if (!tierMap.has(tierName)) {
      tierMap.set(tierName, { issued: 0, checkedIn: 0, revenueCents: 0, capacity: 0 });
    }
    const entry = tierMap.get(tierName)!;
    entry.issued += 1;
    if (t.status === "checked_in") entry.checkedIn += 1;
    entry.revenueCents += t.price_cents ?? 0;
  }

  const byTier = Array.from(tierMap.entries()).map(([name, v]) => ({
    name,
    ...v,
  }));

  // 6. Check-ins for timeline + invalid attempts
  const { data: checkIns, error: checkInsError } = await admin
    .from("check_ins")
    .select("result, scanned_at")
    .eq("event_id", eventId)
    .order("scanned_at", { ascending: true });

  if (checkInsError) {
    return NextResponse.json({ error: checkInsError.message }, { status: 500 });
  }

  const allCheckIns = checkIns ?? [];
  const invalidAttempts = allCheckIns.filter(
    (c) => c.result === "invalid" || c.result === "duplicate" || c.result === "void"
  ).length;

  // arrivalsTimeline: 5-min buckets of result='ok'
  const okCheckIns = allCheckIns.filter((c) => c.result === "ok");
  const bucketMap = new Map<string, number>();
  for (const c of okCheckIns) {
    const d = new Date(c.scanned_at);
    d.setSeconds(0, 0);
    d.setMinutes(Math.floor(d.getMinutes() / 5) * 5);
    const key = d.toISOString();
    bucketMap.set(key, (bucketMap.get(key) ?? 0) + 1);
  }

  // Build cumulative timeline
  const sortedBuckets = Array.from(bucketMap.entries()).sort(([a], [b]) =>
    a.localeCompare(b)
  );
  let cumulative = 0;
  const arrivalsTimeline = sortedBuckets.map(([ts, count]) => {
    cumulative += count;
    return { ts, count, cumulative };
  });

  // 7. recentScans (top 20)
  const { data: recentScansRaw, error: recentScansError } = await admin
    .from("check_ins")
    .select("result, scanned_at, attempted_token, ticket_id")
    .eq("event_id", eventId)
    .order("scanned_at", { ascending: false })
    .limit(20);

  if (recentScansError) {
    return NextResponse.json({ error: recentScansError.message }, { status: 500 });
  }

  const recentScans = (recentScansRaw ?? []).map((s) => ({
    result: s.result,
    scanned_at: s.scanned_at,
    token_hint: s.attempted_token
      ? `…${String(s.attempted_token).slice(-6)}`
      : null,
    ticket_id: s.ticket_id,
  }));

  return NextResponse.json({
    issued,
    sent,
    checkedIn,
    invalidAttempts,
    revenueCents,
    capacity,
    byTier,
    arrivalsTimeline,
    recentScans,
  });
}
