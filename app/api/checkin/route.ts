export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

interface CheckInBody {
  token: string;
  device_id?: string;
  scanned_at?: string; // ISO-8601 — may be from the queue (past time)
}

export async function POST(req: NextRequest) {
  // 1. Auth
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse body
  let body: CheckInBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { token, device_id, scanned_at } = body;
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const admin = supabaseAdmin();

  // 3. Verify caller is a scanner/owner for at least one event
  const { data: orgRows, error: orgError } = await admin
    .from("organizers")
    .select("event_id")
    .eq("user_id", user.id)
    .in("role", ["owner", "scanner"]);

  if (orgError) {
    return NextResponse.json({ error: orgError.message }, { status: 500 });
  }
  if (!orgRows || orgRows.length === 0) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const allowedEventIds = orgRows.map((r) => r.event_id);

  // 4. Look up ticket by token
  const { data: ticket, error: ticketError } = await admin
    .from("tickets")
    .select("id, status, event_id")
    .eq("token", token)
    .maybeSingle();

  if (ticketError) {
    return NextResponse.json({ error: ticketError.message }, { status: 500 });
  }

  const scanTimestamp = scanned_at ?? new Date().toISOString();

  // 5. Handle invalid token
  if (!ticket) {
    // Still record the attempted scan for audit
    if (allowedEventIds.length > 0) {
      await admin.from("check_ins").insert({
        event_id: allowedEventIds[0],
        scanned_by: user.id,
        device_id: device_id ?? null,
        scanned_at: scanTimestamp,
        result: "invalid",
        attempted_token: token,
      });
    }
    return NextResponse.json({ result: "invalid" }, { status: 200 });
  }

  // 6. Ensure the scanner has access to this ticket's event
  if (!allowedEventIds.includes(ticket.event_id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 7. Check if ticket is void
  if (ticket.status === "void") {
    await admin.from("check_ins").insert({
      ticket_id: ticket.id,
      event_id: ticket.event_id,
      scanned_by: user.id,
      device_id: device_id ?? null,
      scanned_at: scanTimestamp,
      result: "void",
      attempted_token: token,
    });
    return NextResponse.json({ result: "void" }, { status: 200 });
  }

  // 8. Check for duplicate (already checked in)
  if (ticket.status === "checked_in") {
    await admin.from("check_ins").insert({
      ticket_id: ticket.id,
      event_id: ticket.event_id,
      scanned_by: user.id,
      device_id: device_id ?? null,
      scanned_at: scanTimestamp,
      result: "duplicate",
      attempted_token: token,
    });
    return NextResponse.json({ result: "duplicate" }, { status: 200 });
  }

  // 9. Valid scan — insert check_in and update ticket status
  const { error: insertError } = await admin.from("check_ins").insert({
    ticket_id: ticket.id,
    event_id: ticket.event_id,
    scanned_by: user.id,
    device_id: device_id ?? null,
    scanned_at: scanTimestamp,
    result: "ok",
    attempted_token: token,
  });

  // The unique index on (ticket_id) WHERE result='ok' prevents double check-in
  // If two scanners race, the second insert will fail with a unique violation
  if (insertError) {
    // Unique constraint violation = race condition duplicate
    if (insertError.code === "23505") {
      return NextResponse.json({ result: "duplicate" }, { status: 200 });
    }
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // 10. Update ticket status
  await admin
    .from("tickets")
    .update({ status: "checked_in", checked_in_at: scanTimestamp })
    .eq("id", ticket.id);

  return NextResponse.json({ result: "ok" }, { status: 200 });
}
