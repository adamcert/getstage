export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { ScannerEvent, ScannerTicket } from "@/types/scanner";

export async function GET() {
  // 1. Authenticate the scanner user
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = supabaseAdmin();

  // 2. Look up the event this scanner is assigned to
  const { data: orgRow, error: orgError } = await admin
    .from("organizers")
    .select("event_id, role")
    .eq("user_id", user.id)
    .in("role", ["owner", "scanner"])
    .limit(1)
    .maybeSingle();

  if (orgError) {
    console.error("scanner org lookup failed", orgError);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
  if (!orgRow) {
    return NextResponse.json({ error: "No event assigned to this scanner" }, { status: 403 });
  }

  const eventId = orgRow.event_id;

  // 3. Fetch event metadata
  const { data: eventRow, error: eventError } = await admin
    .from("events")
    .select("id, name, capacity, starts_at")
    .eq("id", eventId)
    .single();

  if (eventError || !eventRow) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  // 4. Count already checked-in tickets
  const { count: checkedInCount, error: countError } = await admin
    .from("tickets")
    .select("id", { count: "exact", head: true })
    .eq("event_id", eventId)
    .eq("status", "checked_in");

  if (countError) {
    console.error("checked-in count failed", countError);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  // 5. Fetch all tickets for this event (explicit limit > Supabase default 1000)
  const { data: ticketRows, error: ticketError } = await admin
    .from("tickets")
    .select(
      "token, status, buyer_first_name, buyer_last_name, event_id, ticket_tiers(name)"
    )
    .eq("event_id", eventId)
    .limit(10000);

  if (ticketError) {
    console.error("ticket fetch failed", ticketError);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  // 6. Shape the response
  const event: ScannerEvent = {
    id: eventRow.id,
    title: eventRow.name,
    capacity: eventRow.capacity,
    checkedIn: checkedInCount ?? 0,
    startsAt: eventRow.starts_at,
  };

  const tickets: ScannerTicket[] = (ticketRows ?? []).map((t) => ({
    token: t.token,
    status: t.status,
    firstName: t.buyer_first_name,
    lastName: t.buyer_last_name,
    // ticket_tiers is a joined relation — Supabase may return array or object
    tierName: (() => {
      const tiers = t.ticket_tiers as unknown;
      if (!tiers) return "";
      if (Array.isArray(tiers)) return (tiers[0] as { name: string } | undefined)?.name ?? "";
      return (tiers as { name: string }).name ?? "";
    })(),
    eventId: t.event_id,
  }));

  return NextResponse.json({ event, tickets, userEmail: user.email ?? "" });
}
