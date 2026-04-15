export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, ctx: RouteContext) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: eventId } = await ctx.params;
  const admin = supabaseAdmin();

  const { data: orgRow } = await admin
    .from("organizers")
    .select("role")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .eq("role", "owner")
    .maybeSingle();
  if (!orgRow) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data: event } = await admin
    .from("events")
    .select("id, name, capacity")
    .eq("id", eventId)
    .maybeSingle();
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  const { data: tiers } = await admin
    .from("ticket_tiers")
    .select("id, name, price_cents, quantity_total")
    .eq("event_id", eventId)
    .order("sort_order");

  const { data: tickets } = await admin
    .from("tickets")
    .select("id, tier_id, status, sent_at")
    .eq("event_id", eventId);

  const allTickets = tickets ?? [];
  const allTiers = tiers ?? [];

  const priceByTier = new Map(allTiers.map(t => [t.id, t.price_cents]));
  const tierById = new Map(allTiers.map(t => [t.id, t]));

  const issued = allTickets.length;
  const sent = allTickets.filter(t => t.sent_at != null).length;
  const checkedIn = allTickets.filter(t => t.status === "checked_in").length;
  const revenueCents = allTickets.reduce(
    (s, t) => s + (priceByTier.get(t.tier_id) ?? 0),
    0
  );

  const tierMap = new Map<string, { id: string; name: string; price_cents: number; issued: number; checkedIn: number; revenueCents: number; capacity: number }>();
  for (const t of allTiers) {
    tierMap.set(t.id, { id: t.id, name: t.name, price_cents: t.price_cents, issued: 0, checkedIn: 0, revenueCents: 0, capacity: t.quantity_total });
  }
  for (const tk of allTickets) {
    const e = tierMap.get(tk.tier_id);
    if (!e) continue;
    e.issued++;
    if (tk.status === "checked_in") e.checkedIn++;
    e.revenueCents += priceByTier.get(tk.tier_id) ?? 0;
  }
  const byTier = Array.from(tierMap.values());

  const { data: checkIns } = await admin
    .from("check_ins")
    .select("result, scanned_at, ticket_id, attempted_token")
    .eq("event_id", eventId)
    .order("scanned_at", { ascending: true });

  const allCheckIns = checkIns ?? [];
  const invalidAttempts = allCheckIns.filter(c => c.result === "invalid").length;

  const okCheckIns = allCheckIns.filter(c => c.result === "ok");
  const bucketMap = new Map<string, number>();
  for (const c of okCheckIns) {
    const d = new Date(c.scanned_at);
    d.setSeconds(0, 0);
    d.setMinutes(Math.floor(d.getMinutes() / 5) * 5);
    const key = d.toISOString();
    bucketMap.set(key, (bucketMap.get(key) ?? 0) + 1);
  }
  const sortedBuckets = Array.from(bucketMap.entries()).sort(([a], [b]) => a.localeCompare(b));
  let cumulative = 0;
  const arrivalsTimeline = sortedBuckets.map(([ts, count]) => {
    cumulative += count;
    return { ts, count, cumulative };
  });

  const { data: recentRaw } = await admin
    .from("check_ins")
    .select("result, scanned_at, ticket_id, attempted_token")
    .eq("event_id", eventId)
    .order("scanned_at", { ascending: false })
    .limit(20);

  const ticketIds = (recentRaw ?? []).map(r => r.ticket_id).filter(Boolean) as string[];
  let buyerMap = new Map<string, { first_name: string; last_name: string; tier_id: string }>();
  if (ticketIds.length) {
    const { data: buyers } = await admin
      .from("tickets")
      .select("id, buyer_first_name, buyer_last_name, tier_id")
      .in("id", ticketIds);
    buyerMap = new Map((buyers ?? []).map(b => [b.id, { first_name: b.buyer_first_name, last_name: b.buyer_last_name, tier_id: b.tier_id }]));
  }

  const recentScans = (recentRaw ?? []).map(s => {
    const buyer = s.ticket_id ? buyerMap.get(s.ticket_id) : null;
    const tier = buyer ? tierById.get(buyer.tier_id) : null;
    return {
      result: s.result,
      scanned_at: s.scanned_at,
      firstName: buyer?.first_name ?? null,
      lastName: buyer?.last_name ?? null,
      tierName: tier?.name ?? null,
      token_hint: s.attempted_token ? `…${String(s.attempted_token).slice(-6)}` : null,
    };
  });

  return NextResponse.json({
    issued, sent, checkedIn, invalidAttempts, revenueCents,
    capacity: event.capacity,
    byTier,
    arrivalsTimeline,
    recentScans,
  });
}
