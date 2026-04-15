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
    return NextResponse.json({ error: orgError.message }, { status: 500 });
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
    return NextResponse.json({ error: tiersError.message }, { status: 500 });
  }

  const tierMap = new Map<string, { id: string; price_cents: number }>();
  for (const t of tiersData ?? []) {
    tierMap.set(t.name.toLowerCase(), { id: t.id, price_cents: t.price_cents });
  }

  // 5. Build inserts
  const inserts: Record<string, unknown>[] = [];
  const errors: string[] = [];

  for (const row of rows) {
    const tierKey = (row.tier ?? "").toLowerCase().trim();
    const tier = tierMap.get(tierKey);
    if (!tier) {
      errors.push(`Unknown tier "${row.tier}" for ${row.email}`);
      continue;
    }
    const qty = Math.max(1, Number(row.qty) || 1);
    for (let i = 0; i < qty; i++) {
      inserts.push({
        event_id,
        tier_id: tier.id,
        email: row.email,
        first_name: row.firstName,
        last_name: row.lastName,
        token: generateToken(),
        short_code: generateShortCode(),
        status: "issued",
        price_cents: tier.price_cents,
      });
    }
  }

  if (inserts.length === 0) {
    return NextResponse.json({ issued: 0, errors }, { status: 422 });
  }

  // 6. Bulk insert
  const { error: insertError } = await admin.from("tickets").insert(inserts);
  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ issued: inserts.length, errors });
}
