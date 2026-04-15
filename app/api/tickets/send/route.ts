export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getTransportForEvent } from "@/lib/email";
import { generateQrPng } from "@/lib/qr";
import { TicketEmail } from "@/emails/TicketEmail";
import { render } from "@react-email/render";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import * as React from "react";

interface SendBody {
  event_id: string;
}

export async function POST(req: NextRequest) {
  // 1. Auth
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse body
  let body: SendBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { event_id } = body;
  if (!event_id) {
    return NextResponse.json({ error: "Missing event_id" }, { status: 400 });
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

  // 4. Load event + issued tickets
  const { data: eventData, error: eventError } = await admin
    .from("events")
    .select("id, title, start_date, venues(name, address), organizer_name")
    .eq("id", event_id)
    .single();

  if (eventError || !eventData) {
    return NextResponse.json(
      { error: eventError?.message ?? "Event not found" },
      { status: 404 }
    );
  }

  const { data: tickets, error: ticketsError } = await admin
    .from("tickets")
    .select("id, email, first_name, last_name, token, short_code, ticket_tiers(name)")
    .eq("event_id", event_id)
    .eq("status", "issued");

  if (ticketsError) {
    return NextResponse.json({ error: ticketsError.message }, { status: 500 });
  }

  if (!tickets || tickets.length === 0) {
    return NextResponse.json({ sent: 0, failed: 0, errors: [] });
  }

  // 5. Get email transport
  let transport;
  try {
    transport = await getTransportForEvent(event_id);
  } catch (err) {
    return NextResponse.json(
      { error: `Transport error: ${String(err)}` },
      { status: 500 }
    );
  }

  // 6. Format event date in French
  const eventDate = eventData.start_date
    ? format(new Date(eventData.start_date), "EEEE d MMMM yyyy · HH:mm", {
        locale: fr,
      })
    : "";

  const venue = Array.isArray(eventData.venues)
    ? eventData.venues[0]
    : eventData.venues;
  const venueName = venue?.name ?? "";
  const venueAddress = venue?.address ?? "";
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://getstage.app";

  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  // 7. Send per ticket
  for (const ticket of tickets) {
    try {
      const ticketUrl = `${baseUrl}/t/${ticket.token}`;
      const qrCid = "qr@getstage";

      // Generate QR buffer
      const qrBuffer = await generateQrPng(ticketUrl, 400);

      // Render React Email to HTML
      const tierRow = Array.isArray(ticket.ticket_tiers)
        ? ticket.ticket_tiers[0]
        : ticket.ticket_tiers;
      const tierName = tierRow?.name ?? "";

      const html = await render(
        React.createElement(TicketEmail, {
          firstName: ticket.first_name ?? "",
          eventName: eventData.title,
          eventDate,
          venueName,
          venueAddress,
          tierName,
          shortCode: ticket.short_code,
          ticketUrl,
          qrCid,
          organizerName: eventData.organizer_name ?? undefined,
        })
      );

      await transport.send({
        to: ticket.email,
        from: "GetStage <onboarding@resend.dev>",
        subject: `Ton billet pour ${eventData.title}`,
        html,
        attachments: [
          {
            filename: "qr.png",
            content: qrBuffer,
            cid: qrCid,
            contentType: "image/png",
          },
        ],
      });

      // Update ticket status
      await admin
        .from("tickets")
        .update({ status: "sent", sent_at: new Date().toISOString() })
        .eq("id", ticket.id);

      sent++;
    } catch (err) {
      failed++;
      errors.push(`${ticket.email}: ${String(err)}`);
    }
  }

  return NextResponse.json({ sent, failed, errors });
}
