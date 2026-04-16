export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { generateToken, generateShortCode } from "@/lib/ticket-codes";

interface IssueRow {
  email: string;
  firstName: string;
  lastName: string;
  tier: string;
  qty: number;
}

interface IssueBody {
  event_id: string;
  rows: IssueRow[];
}

export async function POST(req: NextRequest) {
  // 1. Auth — get current user via SSR client
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse body
  let body: IssueBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { event_id, rows } = body;
  if (!event_id || !Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json(
      { error: "Missing event_id or rows" },
      { status: 400 }
    );
  }
  if (rows.length > 500) {
    return NextResponse.json(
      { error: "Too many rows (max 500)" },
      { status: 400 }
    );
  }

  const admin = supabaseAdmin();

  // 3. Verify organizer ownership
  const { data: orgData, error: orgError } = await admin
    .from("organizers")
    .select("id")
    .eq("event_id", event_id)
    .eq("user_id", user.id)
    .eq("role", "owner")
    .maybeSingle();

  if (orgError) {
    console.error("organizer lookup failed", orgError);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
  if (!orgData) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 4. Load tiers, map by lowercase name
  const { data: tiersData, error: tiersError } = await admin
    .from("ticket_tiers")
    .select("id, name, price_cents")
    .eq("event_id", event_id);

  if (tiersError) {
    console.error("tiers lookup failed", tiersError);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  const tierMap = new Map<string, { id: string; price_cents: number }>();
  for (const t of tiersData ?? []) {
    tierMap.set(t.name.toLowerCase(), { id: t.id, price_cents: t.price_cents });
  }

  // 5. Capacity check
  const { data: eventData } = await admin
    .from("events")
    .select("capacity")
    .eq("id", event_id)
    .single();
  const capacity = eventData?.capacity ?? 0;

  const { count: existingCount } = await admin
    .from("tickets")
    .select("id", { count: "exact", head: true })
    .eq("event_id", event_id);

  // 6. Check for existing tickets + intra-CSV dedup
  const csvEmails = [...new Set(rows.map((r) => r.email.toLowerCase().trim()))];
  const { data: existingTickets } = await admin
    .from("tickets")
    .select("buyer_email")
    .eq("event_id", event_id)
    .in("buyer_email", csvEmails);

  const existingEmailSet = new Set(
    (existingTickets ?? []).map((t: { buyer_email: string }) => t.buyer_email.toLowerCase())
  );

  // 7. Build inserts (with intra-CSV dedup)
  const inserts: Record<string, unknown>[] = [];
  const errors: string[] = [];
  const skippedDuplicates: string[] = [];
  const seenInBatch = new Set<string>();

  for (const row of rows) {
    const email = row.email.toLowerCase().trim();
    if (existingEmailSet.has(email) || seenInBatch.has(email)) {
      skippedDuplicates.push(row.email);
      continue;
    }
    seenInBatch.add(email);
    const tierKey = (row.tier ?? "").toLowerCase().trim();
    const tier = tierMap.get(tierKey);
    if (!tier) {
      // Fallback to first tier if none specified
      const fallback = tiersData?.[0];
      if (!fallback) {
        errors.push(`No tier available for ${row.email}`);
        continue;
      }
      const qty = Math.min(Math.max(1, Number(row.qty) || 1), 100);
      for (let i = 0; i < qty; i++) {
        inserts.push({
          event_id,
          tier_id: fallback.id,
          buyer_email: row.email,
          buyer_first_name: row.firstName,
          buyer_last_name: row.lastName,
          token: generateToken(),
          short_code: generateShortCode(),
          status: "issued",
        });
      }
      continue;
    }
    const qty = Math.min(Math.max(1, Number(row.qty) || 1), 100);
    for (let i = 0; i < qty; i++) {
      inserts.push({
        event_id,
        tier_id: tier.id,
        buyer_email: row.email,
        buyer_first_name: row.firstName,
        buyer_last_name: row.lastName,
        token: generateToken(),
        short_code: generateShortCode(),
        status: "issued",
      });
    }
  }

  if (inserts.length === 0) {
    return NextResponse.json({ issued: 0, skippedDuplicates, errors });
  }

  // 8. Capacity guard
  if (capacity > 0 && (existingCount ?? 0) + inserts.length > capacity) {
    const remaining = Math.max(0, capacity - (existingCount ?? 0));
    return NextResponse.json({
      error: `Capacité dépassée. ${existingCount ?? 0} billets existants + ${inserts.length} nouveaux > ${capacity} places. Il reste ${remaining} place(s).`,
      issued: 0,
      skippedDuplicates,
      errors,
    }, { status: 400 });
  }

  if (inserts.length > 5000) {
    return NextResponse.json({ error: "Too many tickets to issue at once (max 5000)" }, { status: 400 });
  }

  const { error: insertError } = await admin.from("tickets").insert(inserts);
  if (insertError) {
    console.error("ticket insert failed", insertError);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  return NextResponse.json({ issued: inserts.length, skippedDuplicates, errors });
}
