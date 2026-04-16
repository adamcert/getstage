export const runtime = "nodejs";
export const maxDuration = 60;

// Rate limit: max 5 send batches per minute per user
const sendRateMap = new Map<string, { count: number; resetAt: number }>();
function checkSendRate(userId: string): boolean {
  const now = Date.now();
  const entry = sendRateMap.get(userId);
  if (!entry || now > entry.resetAt) {
    sendRateMap.set(userId, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  entry.count++;
  return entry.count <= 5;
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getTransportForEvent } from "@/lib/email";
import { generateTicketPdf } from "@/lib/ticket-pdf";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const LOGO_URL = "https://nskjorcfeuqaigyipkjk.supabase.co/storage/v1/object/public/public/email/getstage-logo.png";
const GRADIENT_BAR_URL = "https://nskjorcfeuqaigyipkjk.supabase.co/storage/v1/object/public/public/email/gradient-bar.png";

interface SendBody {
  event_id: string;
}

function buildEmailHtml(p: {
  firstName: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  venueName: string;
  venueAddress: string;
  venueCity: string;
  shortCode: string;
  mapsUrl: string;
  buyerName: string;
}): string {
  return `<!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><meta name="color-scheme" content="dark"/><meta name="supported-color-schemes" content="dark"/><!--[if mso]><style>table,td,p,a{font-family:Arial,Helvetica,sans-serif!important;}</style><![endif]--><title>Ton billet GetStage</title></head>
<body style="margin:0;padding:0;background-color:#09090B;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
<!--[if mso]><table role="presentation" width="600" align="center" cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr><td><![endif]-->
<table role="presentation" align="center" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;margin:0 auto;background-color:#09090B;">

<tr><td style="font-size:0;line-height:0;"><img src="${GRADIENT_BAR_URL}" width="600" height="4" alt="" style="display:block;width:100%;height:4px;border:0;" /></td></tr>
<tr><td style="height:36px;font-size:0;line-height:0;">&nbsp;</td></tr>

<!-- Logo -->
<tr><td style="padding:0 40px;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
    <td style="vertical-align:middle;width:40px;"><img src="${LOGO_URL}" width="40" height="40" alt="G" style="display:block;border:0;border-radius:10px;color:#C4B5FD;font-size:20px;font-weight:bold;font-family:Arial,sans-serif;" /></td>
    <td style="vertical-align:middle;padding-left:14px;">
      <p style="margin:0;font-size:20px;font-weight:700;color:#FAFAFA;line-height:22px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:-0.3px;">GetStage</p>
      <p style="margin:2px 0 0 0;font-size:9px;color:#71717A;letter-spacing:2.5px;text-transform:uppercase;font-weight:600;font-family:Arial,sans-serif;">by SNAPSS</p>
    </td>
  </tr></table>
</td></tr>

<tr><td style="height:36px;font-size:0;line-height:0;">&nbsp;</td></tr>

<!-- Greeting -->
<tr><td style="padding:0 40px;">
  <p style="margin:0;font-size:15px;color:#A1A1AA;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.5;">Bonjour ${p.firstName},</p>
  <p style="margin:10px 0 0 0;font-size:28px;font-weight:800;color:#FAFAFA;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.2;letter-spacing:-0.5px;">Ton billet est confirm&eacute; &#127881;</p>
  <p style="margin:8px 0 0 0;font-size:16px;color:#A1A1AA;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.5;">Tu es inscrit pour <strong style="color:#E4E4E7;">${p.eventName}</strong></p>
</td></tr>

<tr><td style="height:28px;font-size:0;line-height:0;">&nbsp;</td></tr>

<!-- PDF callout -->
<tr><td style="padding:0 40px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td style="background-color:#1A1625;border-radius:14px;border:1px solid #2E2545;padding:20px 24px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="vertical-align:middle;width:44px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="width:40px;height:40px;background-color:#2E2545;border-radius:10px;text-align:center;vertical-align:middle;font-size:20px;line-height:40px;">&#128206;</td></tr></table>
        </td>
        <td style="vertical-align:middle;padding-left:16px;">
          <p style="margin:0;font-size:15px;font-weight:700;color:#C4B5FD;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.3;">Ton billet PDF est en pi&egrave;ce jointe</p>
          <p style="margin:4px 0 0 0;font-size:13px;color:#7C7891;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.4;">Sauvegarde-le sur ton t&eacute;l&eacute;phone pour le jour J</p>
        </td>
      </tr></table>
    </td></tr>
  </table>
</td></tr>

<tr><td style="height:20px;font-size:0;line-height:0;">&nbsp;</td></tr>

<!-- Event card -->
<tr><td style="padding:0 40px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#18181B;border-radius:16px;border:1px solid #27272A;">
    <tr><td style="font-size:0;line-height:0;"><img src="${GRADIENT_BAR_URL}" width="520" height="4" alt="" style="display:block;width:100%;height:4px;border:0;border-radius:16px 16px 0 0;" /></td></tr>
    <tr><td style="padding:28px 32px 24px 32px;">
      <p style="margin:0;font-size:24px;font-weight:800;color:#FAFAFA;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.15;letter-spacing:-0.4px;">${p.eventName}</p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:20px;"><tr>
        <td style="vertical-align:top;width:24px;font-size:16px;line-height:22px;">&#128197;</td>
        <td style="vertical-align:top;padding-left:10px;">
          <p style="margin:0;font-size:15px;color:#D4D4D8;font-weight:600;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.4;">${p.eventDate}</p>
          <p style="margin:2px 0 0 0;font-size:14px;color:#71717A;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.4;">${p.eventTime}</p>
        </td>
      </tr></table>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:12px;"><tr>
        <td style="vertical-align:top;width:24px;font-size:16px;line-height:22px;">&#128205;</td>
        <td style="vertical-align:top;padding-left:10px;">
          <p style="margin:0;font-size:15px;color:#D4D4D8;font-weight:600;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.4;">${p.venueName}</p>
          <p style="margin:2px 0 0 0;font-size:14px;color:#71717A;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.4;">${p.venueAddress}${p.venueCity ? ", " + p.venueCity : ""}</p>
        </td>
      </tr></table>
    </td></tr>
    <tr><td style="padding:0 32px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="height:1px;background-color:#27272A;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>
    <tr><td style="padding:20px 32px 24px 32px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="vertical-align:top;width:50%;">
          <p style="margin:0;font-size:10px;color:#71717A;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;font-family:Arial,sans-serif;">Porteur</p>
          <p style="margin:6px 0 0 0;font-size:16px;color:#E4E4E7;font-weight:700;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${p.buyerName}</p>
        </td>
        <td style="vertical-align:top;width:50%;text-align:right;">
          <p style="margin:0;font-size:10px;color:#71717A;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;font-family:Arial,sans-serif;">R&eacute;f.</p>
          <p style="margin:6px 0 0 0;font-size:14px;color:#52525B;font-family:'Courier New',Courier,monospace;letter-spacing:0.5px;">${p.shortCode}</p>
        </td>
      </tr></table>
    </td></tr>
  </table>
</td></tr>

<tr><td style="height:16px;font-size:0;line-height:0;">&nbsp;</td></tr>

<!-- Map button -->
<tr><td style="padding:0 40px;" align="center">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
    <td style="background-color:#18181B;border:1px solid #27272A;border-radius:12px;">
      <a href="${p.mapsUrl}" target="_blank" style="display:inline-block;padding:14px 32px;color:#D4D4D8;font-size:14px;font-weight:600;text-decoration:none;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">&#128205;&nbsp;&nbsp;Voir le lieu sur la carte</a>
    </td>
  </tr></table>
</td></tr>

<tr><td style="height:20px;font-size:0;line-height:0;">&nbsp;</td></tr>

<!-- Instructions -->
<tr><td style="padding:0 40px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#18181B;border-radius:14px;border:1px solid #27272A;">
    <tr><td style="padding:24px 28px;">
      <p style="margin:0 0 16px 0;font-size:15px;font-weight:700;color:#FAFAFA;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Le jour J</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td style="vertical-align:top;width:32px;padding-bottom:12px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="width:24px;height:24px;background-color:#27272A;border-radius:12px;text-align:center;vertical-align:middle;font-size:12px;font-weight:700;color:#A1A1AA;font-family:Arial,sans-serif;line-height:24px;">1</td></tr></table></td><td style="vertical-align:top;padding:2px 0 12px 0;font-size:14px;color:#D4D4D8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.5;">Ouvre le PDF en pi&egrave;ce jointe sur ton t&eacute;l&eacute;phone</td></tr>
        <tr><td style="vertical-align:top;width:32px;padding-bottom:12px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="width:24px;height:24px;background-color:#27272A;border-radius:12px;text-align:center;vertical-align:middle;font-size:12px;font-weight:700;color:#A1A1AA;font-family:Arial,sans-serif;line-height:24px;">2</td></tr></table></td><td style="vertical-align:top;padding:2px 0 12px 0;font-size:14px;color:#D4D4D8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.5;">Pr&eacute;sente le QR code &agrave; l'entr&eacute;e</td></tr>
        <tr><td style="vertical-align:top;width:32px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="width:24px;height:24px;background-color:#27272A;border-radius:12px;text-align:center;vertical-align:middle;font-size:12px;font-weight:700;color:#A1A1AA;font-family:Arial,sans-serif;line-height:24px;">3</td></tr></table></td><td style="vertical-align:top;padding:2px 0 0 0;font-size:14px;color:#D4D4D8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.5;">Un seul scan par billet &mdash; non transf&eacute;rable</td></tr>
      </table>
    </td></tr>
  </table>
</td></tr>

<tr><td style="height:36px;font-size:0;line-height:0;">&nbsp;</td></tr>
<tr><td style="padding:0 40px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="height:1px;background-color:#1C1C20;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>
<tr><td style="height:24px;font-size:0;line-height:0;">&nbsp;</td></tr>

<!-- Footer -->
<tr><td style="padding:0 40px;text-align:center;">
  <p style="margin:0;font-size:12px;color:#52525B;line-height:1.7;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Billet nominatif &mdash; pi&egrave;ce d'identit&eacute; demand&eacute;e &agrave; l'entr&eacute;e.<br/>Ne transf&egrave;re pas cet email. Chaque billet est unique et personnel.</p>
</td></tr>
<tr><td style="height:24px;font-size:0;line-height:0;">&nbsp;</td></tr>
<tr><td align="center" style="padding:0 40px;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
    <td style="vertical-align:middle;"><img src="${LOGO_URL}" width="18" height="18" alt="" style="display:block;border:0;border-radius:4px;" /></td>
    <td style="vertical-align:middle;padding-left:8px;"><p style="margin:0;font-size:11px;color:#3F3F46;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">powered by GetStage</p></td>
  </tr></table>
</td></tr>
<tr><td style="height:32px;font-size:0;line-height:0;">&nbsp;</td></tr>

</table>
<!--[if mso]></td></tr></table><![endif]-->
</body></html>`;
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

  if (!checkSendRate(user.id)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const admin = supabaseAdmin();

  // 3. Verify organizer ownership
  const { data: orgData } = await admin
    .from("organizers")
    .select("id")
    .eq("event_id", event_id)
    .eq("user_id", user.id)
    .eq("role", "owner")
    .maybeSingle();

  if (!orgData) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 4. Load event + issued tickets
  const { data: eventData } = await admin
    .from("events")
    .select("id, name, starts_at, venue_name, venue_address, venue_city")
    .eq("id", event_id)
    .single();

  if (!eventData) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const { data: tickets } = await admin
    .from("tickets")
    .select("id, buyer_email, buyer_first_name, buyer_last_name, token, short_code, ticket_tiers(name)")
    .eq("event_id", event_id)
    .eq("status", "issued");

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

  // 6. Format event date in French (Europe/Paris timezone)
  const eventDateObj = eventData.starts_at ? new Date(eventData.starts_at) : null;
  const eventDate = eventDateObj
    ? format(eventDateObj, "EEEE d MMMM yyyy", { locale: fr })
    : "";
  const eventTime = eventDateObj
    ? eventDateObj.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" })
    : "";

  const venueName = eventData.venue_name ?? "";
  const venueAddress = eventData.venue_address ?? "";
  const venueCity = eventData.venue_city ?? "";

  const mapsQuery = encodeURIComponent(`${venueName} ${venueAddress} ${venueCity}`.trim());
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  // 7. Send per ticket
  for (const ticket of tickets) {
    try {
      const tierRow = Array.isArray(ticket.ticket_tiers)
        ? ticket.ticket_tiers[0]
        : ticket.ticket_tiers;
      const tierName = tierRow?.name ?? "";
      const firstName = ticket.buyer_first_name ?? "";
      const lastName = ticket.buyer_last_name ?? "";
      const buyerName = `${firstName} ${lastName}`.trim();

      // Generate ticket PDF (Puppeteer screenshot → flat image → PDF)
      const pdfBuffer = await generateTicketPdf({
        eventName: eventData.name,
        eventDate,
        eventTime,
        venueName,
        venueAddress,
        venueCity,
        tierName,
        buyerFirstName: firstName,
        buyerLastName: lastName,
        shortCode: ticket.short_code,
        token: ticket.token,
      });

      // Build email HTML
      const html = buildEmailHtml({
        firstName,
        eventName: eventData.name,
        eventDate,
        eventTime,
        venueName,
        venueAddress,
        venueCity,
        shortCode: ticket.short_code,
        mapsUrl,
        buyerName,
      });

      await transport.send({
        to: ticket.buyer_email,
        from: "",
        subject: `🎫 Ton billet pour ${eventData.name}`,
        html,
        attachments: [
          {
            filename: `billet-${ticket.short_code}.pdf`,
            content: pdfBuffer,
            contentType: "application/pdf",
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
      errors.push(`${ticket.buyer_email}: ${String(err)}`);
    }
  }

  return NextResponse.json({ sent, failed, errors });
}
