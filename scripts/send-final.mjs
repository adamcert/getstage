import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { customAlphabet } from "nanoid";
import { randomBytes } from "crypto";
import QRCode from "qrcode";
import puppeteer from "puppeteer";
import { readFileSync } from "fs";
import { join } from "path";

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
const resend = new Resend(process.env.RESEND_API_KEY);
const nano = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-", 24);
const shortCode = () => { const b = randomBytes(4).toString("hex").toUpperCase(); return `TKT-${b.slice(0,4)}-${b.slice(4,8)}`; };

// 1. Event + tier
const { data: ev } = await sb.from("events").select("id, name, starts_at, venue_name, venue_address, venue_city").eq("slug", "release-party-2026-04-22").single();
const { data: tiers } = await sb.from("ticket_tiers").select("id, name, price_cents").eq("event_id", ev.id);
const vipTier = tiers.find(t => t.name === "VIP");

// 2. Create ticket
const token = nano();
const code = shortCode();
await sb.from("tickets").insert({
  event_id: ev.id, tier_id: vipTier.id,
  buyer_email: "adam@certhis.io", buyer_first_name: "Adam", buyer_last_name: "Certhis",
  token, short_code: code, status: "issued",
});
console.log(`✓ Ticket ${code}`);

// 3. Dates
const d = new Date(ev.starts_at);
const eventDate = d.toLocaleDateString("fr-FR", { weekday:"long", day:"numeric", month:"long", year:"numeric", timeZone:"Europe/Paris" });
const eventTime = d.toLocaleTimeString("fr-FR", { hour:"2-digit", minute:"2-digit", timeZone:"Europe/Paris" });

// 4. QR as data URL
const qrDataUrl = await QRCode.toDataURL(token, { width: 800, margin: 1, errorCorrectionLevel: "H", color: { dark: "#000", light: "#fff" } });

// 5. Background image as base64
let bgBase64 = "";
try {
  // Try JPEG first (official poster), then PNG (AI-generated)
  let buf, mime;
  try {
    buf = readFileSync(join("public", "ticket-bg-gradur.jpg"));
    mime = "jpeg";
  } catch {
    buf = readFileSync(join("public", "ticket-bg-gradur.png"));
    mime = "png";
  }
  bgBase64 = `data:image/${mime};base64,${buf.toString("base64")}`;
} catch { console.log("⚠ No background image"); }

const price = `${(vipTier.price_cents / 100).toFixed(2)} €`;
const venue = `${ev.venue_name}${ev.venue_address ? ` · ${ev.venue_address}` : ""}`;
const city = ev.venue_city ?? "";

// PartyPopper SVG (exact same as lucide-react icon used in the frontend)
const partyPopperSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5.8 11.3 2 22l10.7-3.79"/><path d="M4 3h.01"/><path d="M22 8h.01"/><path d="M15 2h.01"/><path d="M22 20h.01"/><path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10"/><path d="m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11c-.11.7-.72 1.22-1.43 1.22H17"/><path d="m11 2 .33.82c.34.86-.2 1.82-1.11 1.98C9.52 4.9 9 5.52 9 6.23V7"/><path d="M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z"/></svg>`;
const partyPopperB64 = `data:image/svg+xml;base64,${Buffer.from(partyPopperSvg).toString("base64")}`;

// 6. Pre-compose background (image + gradient as one flat PNG — no CSS compositing in final PDF)
console.log("⏳ Compositing background...");
const bgBrowser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
const bgPage = await bgBrowser.newPage();
await bgPage.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1 });
await bgPage.setContent(`<!DOCTYPE html><html><head><style>
*{margin:0;padding:0;}
body{width:794px;height:1123px;background:#09090B;position:relative;overflow:hidden;}
.img{position:absolute;top:0;left:0;width:100%;height:55%;background:url('${bgBase64}') center center/cover no-repeat;}
.overlay{position:absolute;top:0;left:0;width:100%;height:55%;background:rgba(9,9,11,0.5);}
.fade{position:absolute;top:18%;left:0;width:100%;height:42%;background:linear-gradient(to bottom,rgba(9,9,11,0) 0%,rgba(9,9,11,0.75) 60%,#09090B 100%);}
.solid{position:absolute;top:55%;left:0;width:100%;height:45%;background:#09090B;}
</style></head><body>
<div class="img"></div><div class="overlay"></div><div class="fade"></div><div class="solid"></div>
</body></html>`, { waitUntil: "domcontentloaded" });
const bgScreenshot = await bgPage.screenshot({ type: "jpeg", quality: 90, fullPage: true });
await bgBrowser.close();
const composedBg = `data:image/jpeg;base64,${Buffer.from(bgScreenshot).toString("base64")}`;
console.log("✓ Background composed");

// 7. HTML ticket — flat background, zero CSS gradients
const ticketHtml = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@700&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    width: 794px; height: 1123px;
    font-family: 'Inter', system-ui, sans-serif;
    background: #09090B;
    color: #fff;
    overflow: hidden;
    position: relative;
  }

  /* Pre-composed background — single flat image, no CSS gradients */
  .bg {
    position: absolute; inset: 0;
    background: url('${composedBg}') center top / cover no-repeat;
  }

  .content {
    position: relative; z-index: 10;
    height: 100%; display: flex; flex-direction: column;
    padding: 36px 56px;
  }

  /* Logo */
  .logo {
    display: flex; align-items: center; gap: 12px;
  }
  .logo-icon {
    width: 42px; height: 42px; border-radius: 12px;
    background: linear-gradient(to bottom right, #FF4D6A, #8B5CF6);
    display: flex; align-items: center; justify-content: center;
    box-shadow: none;
  }
  .logo-icon img { width: 24px; height: 24px; }
  .logo-text {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 22px; font-weight: 700; color: #FAFAFA;
    letter-spacing: -0.5px;
  }
  .logo-sub {
    font-size: 9px; color: #52525B; letter-spacing: 3px;
    text-transform: uppercase; font-weight: 600;
  }

  /* Event hero */
  .event-section {
    flex: 1; display: flex; flex-direction: column;
    justify-content: flex-end; align-items: center;
    text-align: center; padding: 0 20px 10px 20px;
  }
  .venue-presents {
    font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.5);
    letter-spacing: 5px; text-transform: uppercase; margin-bottom: 16px;
  }
  .event-name {
    font-family: 'Space Grotesk', 'Inter', sans-serif;
    font-size: 54px; font-weight: 700; line-height: 1.05;
    text-transform: uppercase; letter-spacing: -1px;
    color: #fff;
    text-shadow: 0 2px 20px rgba(0,0,0,0.6);
    max-width: 680px;
  }
  .event-meta {
    margin-top: 24px; display: flex; flex-direction: column; gap: 6px;
    align-items: center;
  }
  .event-date {
    font-size: 18px; font-weight: 700; color: rgba(255,255,255,0.9);
    letter-spacing: 0.5px;
  }
  .event-venue {
    font-size: 15px; font-weight: 500; color: rgba(255,255,255,0.65);
    letter-spacing: 0.3px;
  }

  /* Divider */
  .divider {
    width: 100%; height: 1px; margin: 28px 0;
    background: #1C1C20;
  }

  /* Details — porteur + ref only */
  .details {
    display: flex; justify-content: space-between; align-items: flex-end;
    padding: 0 4px;
  }
  .detail-group { display: flex; flex-direction: column; gap: 3px; }
  .detail-label {
    font-size: 10px; font-weight: 600; color: #52525B;
    text-transform: uppercase; letter-spacing: 2.5px;
  }
  .detail-value {
    font-size: 20px; font-weight: 700; color: #E4E4E7;
  }
  .order-ref {
    font-size: 12px; color: #A1A1AA;
    font-family: 'SF Mono', 'Fira Code', monospace;
    letter-spacing: 1px;
  }

  /* QR section */
  .qr-section {
    display: flex; flex-direction: column; align-items: center;
    margin-top: 32px; gap: 12px;
  }
  .qr-container {
    background: #fff; border-radius: 20px; padding: 16px;
  }
  .qr-container img { display: block; width: 280px; height: 280px; }
  .qr-code-text {
    font-size: 14px; color: #A1A1AA;
    font-family: 'SF Mono', 'Fira Code', monospace;
    letter-spacing: 3px;
  }

  /* Footer */
  .footer {
    margin-top: auto; text-align: center; padding-top: 24px;
  }
  .footer-legal {
    font-size: 10px; color: #71717A; line-height: 1.8;
  }
  .footer-brand {
    margin-top: 14px; display: flex; align-items: center;
    justify-content: center; gap: 8px;
  }
  .footer-brand-icon {
    width: 18px; height: 18px; border-radius: 5px;
    background: linear-gradient(to bottom right, #FF4D6A, #8B5CF6);
    display: flex; align-items: center; justify-content: center;
  }
  .footer-brand-icon img { width: 11px; height: 11px; }
  .footer-brand-text {
    font-size: 10px; color: #71717A; letter-spacing: 0.5px;
  }
</style>
</head>
<body>
  <div class="bg"></div>

  <div class="content">
    <!-- Logo -->
    <div class="logo">
      <div class="logo-icon"><img src="${partyPopperB64}" alt="" /></div>
      <div>
        <div class="logo-text">GetStage</div>
        <div class="logo-sub">by SNAPSS</div>
      </div>
    </div>

    <!-- Event hero -->
    <div class="event-section">
      <div class="venue-presents">${ev.venue_name || "GetStage"} presents</div>
      <div class="event-name">${ev.name}</div>
      <div class="event-meta">
        <div class="event-date">${eventDate} · ${eventTime}</div>
        <div class="event-venue">${venue}${city ? ", " + city : ""}</div>
      </div>
    </div>

    <!-- Divider -->
    <div class="divider"></div>

    <!-- Details — porteur + ref seulement -->
    <div class="details">
      <div class="detail-group">
        <span class="detail-label">Porteur</span>
        <span class="detail-value">Adam Certhis</span>
      </div>
      <div class="detail-group" style="align-items:flex-end;">
        <span class="detail-label">Réf.</span>
        <span class="order-ref">${code}</span>
      </div>
    </div>

    <!-- QR -->
    <div class="qr-section">
      <div class="qr-container">
        <img src="${qrDataUrl}" alt="QR Code" />
      </div>
      <div class="qr-code-text">${code}</div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-legal">
        Billet nominatif — pièce d'identité demandée à l'entrée.<br/>
        Chaque billet ne peut être scanné qu'une seule fois.
      </div>
      <div class="footer-brand">
        <div class="footer-brand-icon"><img src="${partyPopperB64}" alt="" /></div>
        <span class="footer-brand-text">powered by GetStage</span>
      </div>
    </div>
  </div>
</body></html>`;

// 7. Render ticket as screenshot → embed flat image into PDF (avoids all iOS rendering issues)
console.log("⏳ Rendering ticket...");
const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
const page = await browser.newPage();
await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });
await page.setContent(ticketHtml, { waitUntil: "domcontentloaded" });
await page.evaluateHandle("document.fonts.ready");
const ticketImage = await page.screenshot({ type: "jpeg", quality: 92, fullPage: true });
await browser.close();
const ticketImgB64 = `data:image/jpeg;base64,${Buffer.from(ticketImage).toString("base64")}`;
console.log(`✓ Ticket rendered (${(ticketImage.length / 1024).toFixed(0)} KB image)`);

// Wrap flat image in a minimal PDF via Puppeteer
console.log("⏳ Wrapping in PDF...");
const pdfBrowser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
const pdfPage = await pdfBrowser.newPage();
await pdfPage.setContent(`<!DOCTYPE html><html><head><style>*{margin:0;padding:0;}body{width:794px;height:1123px;overflow:hidden;}</style></head><body><img src="${ticketImgB64}" style="width:794px;height:1123px;display:block;" /></body></html>`, { waitUntil: "domcontentloaded" });
const pdfBuffer = await pdfPage.pdf({
  width: "794px", height: "1123px",
  printBackground: true,
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
});
await pdfBrowser.close();
console.log(`✓ PDF ready (${(pdfBuffer.length / 1024).toFixed(0)} KB)`);

// 8. Email — premium redesign (hosted images, table layout, Gmail/Outlook safe)
const logoUrl = "https://nskjorcfeuqaigyipkjk.supabase.co/storage/v1/object/public/public/email/getstage-logo.png";
const gradientBarUrl = "https://nskjorcfeuqaigyipkjk.supabase.co/storage/v1/object/public/public/email/gradient-bar.png";
const mapsQ = encodeURIComponent(`${ev.venue_name} ${ev.venue_address??""} ${ev.venue_city??""}`.trim());
const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQ}`;

const emailHtml = `<!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><meta name="color-scheme" content="dark"/><meta name="supported-color-schemes" content="dark"/><!--[if mso]><style>table,td,p,a{font-family:Arial,Helvetica,sans-serif!important;}</style><![endif]--><title>Ton billet GetStage</title></head>
<body style="margin:0;padding:0;background-color:#09090B;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">

<!--[if mso]><table role="presentation" width="600" align="center" cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr><td><![endif]-->
<table role="presentation" align="center" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;margin:0 auto;background-color:#09090B;">

<!-- ====== GRADIENT ACCENT BAR ====== -->
<tr><td style="font-size:0;line-height:0;"><img src="${gradientBarUrl}" width="600" height="4" alt="" style="display:block;width:100%;height:4px;border:0;" /></td></tr>

<!-- ====== HEADER ====== -->
<tr><td style="padding:36px 40px 0 40px;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
    <td style="vertical-align:middle;width:40px;"><img src="${logoUrl}" width="40" height="40" alt="G" style="display:block;border:0;border-radius:10px;color:#C4B5FD;font-size:20px;font-weight:bold;font-family:Arial,sans-serif;" /></td>
    <td style="vertical-align:middle;padding-left:14px;">
      <p style="margin:0;font-size:20px;font-weight:700;color:#FAFAFA;line-height:22px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:-0.3px;">GetStage</p>
      <p style="margin:2px 0 0 0;font-size:9px;color:#71717A;letter-spacing:2.5px;text-transform:uppercase;font-weight:600;font-family:Arial,sans-serif;">by SNAPSS</p>
    </td>
  </tr></table>
</td></tr>

<!-- ====== GREETING ====== -->
<tr><td style="padding:36px 40px 0 40px;">
  <p style="margin:0;font-size:15px;color:#A1A1AA;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.5;">Bonjour Adam,</p>
  <p style="margin:10px 0 0 0;font-size:28px;font-weight:800;color:#FAFAFA;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.2;letter-spacing:-0.5px;">Ton billet est confirm&eacute; &#127881;</p>
  <p style="margin:8px 0 0 0;font-size:16px;color:#A1A1AA;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.5;">Tu es inscrit pour <strong style="color:#E4E4E7;">${ev.name}</strong></p>
</td></tr>

<!-- ====== PDF CALLOUT ====== -->
<tr><td style="padding:28px 40px 0 40px;">
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

<!-- ====== EVENT CARD ====== -->
<tr><td style="padding:20px 40px 0 40px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#18181B;border-radius:16px;border:1px solid #27272A;">
    <!-- Gradient bar (image) -->
    <tr><td style="font-size:0;line-height:0;"><img src="${gradientBarUrl}" width="520" height="4" alt="" style="display:block;width:100%;height:4px;border:0;border-radius:16px 16px 0 0;" /></td></tr>
    <!-- Event details -->
    <tr><td style="padding:28px 32px 24px 32px;">
      <p style="margin:0;font-size:24px;font-weight:800;color:#FAFAFA;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.15;letter-spacing:-0.4px;">${ev.name}</p>

      <!-- Date -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:20px;"><tr>
        <td style="vertical-align:top;width:24px;font-size:16px;line-height:22px;">&#128197;</td>
        <td style="vertical-align:top;padding-left:10px;">
          <p style="margin:0;font-size:15px;color:#D4D4D8;font-weight:600;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.4;">${eventDate}</p>
          <p style="margin:2px 0 0 0;font-size:14px;color:#71717A;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.4;">${eventTime}</p>
        </td>
      </tr></table>

      <!-- Venue -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:12px;"><tr>
        <td style="vertical-align:top;width:24px;font-size:16px;line-height:22px;">&#128205;</td>
        <td style="vertical-align:top;padding-left:10px;">
          <p style="margin:0;font-size:15px;color:#D4D4D8;font-weight:600;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.4;">${ev.venue_name || ""}</p>
          <p style="margin:2px 0 0 0;font-size:14px;color:#71717A;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.4;">${ev.venue_address || ""}${city ? ", " + city : ""}</p>
        </td>
      </tr></table>
    </td></tr>

    <!-- Separator -->
    <tr><td style="padding:0 32px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="height:1px;background-color:#27272A;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>

    <!-- Ticket meta -->
    <tr><td style="padding:20px 32px 24px 32px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="vertical-align:top;width:33%;">
          <p style="margin:0;font-size:10px;color:#71717A;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;font-family:Arial,sans-serif;">Cat&eacute;gorie</p>
          <p style="margin:6px 0 0 0;font-size:16px;color:#E4E4E7;font-weight:700;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">VIP</p>
        </td>
        <td style="vertical-align:top;width:34%;text-align:center;">
          <p style="margin:0;font-size:10px;color:#71717A;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;font-family:Arial,sans-serif;">Porteur</p>
          <p style="margin:6px 0 0 0;font-size:16px;color:#E4E4E7;font-weight:700;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Adam C.</p>
        </td>
        <td style="vertical-align:top;width:33%;text-align:right;">
          <p style="margin:0;font-size:10px;color:#71717A;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;font-family:Arial,sans-serif;">R&eacute;f.</p>
          <p style="margin:6px 0 0 0;font-size:14px;color:#52525B;font-family:'Courier New',Courier,monospace;letter-spacing:0.5px;">${code}</p>
        </td>
      </tr></table>
    </td></tr>
  </table>
</td></tr>

<!-- ====== MAP BUTTON ====== -->
<tr><td style="padding:20px 40px 0 40px;" align="center">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
    <td style="background-color:#18181B;border:1px solid #27272A;border-radius:12px;">
      <a href="${mapsUrl}" target="_blank" style="display:inline-block;padding:14px 32px;color:#D4D4D8;font-size:14px;font-weight:600;text-decoration:none;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:0.2px;">&#128205;&nbsp;&nbsp;Voir le lieu sur la carte</a>
    </td>
  </tr></table>
</td></tr>

<!-- ====== INSTRUCTIONS ====== -->
<tr><td style="padding:20px 40px 0 40px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#18181B;border-radius:14px;border:1px solid #27272A;">
    <tr><td style="padding:24px 28px;">
      <p style="margin:0 0 16px 0;font-size:15px;font-weight:700;color:#FAFAFA;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Le jour J</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="vertical-align:top;width:32px;padding-bottom:12px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="width:24px;height:24px;background-color:#27272A;border-radius:12px;text-align:center;vertical-align:middle;font-size:12px;font-weight:700;color:#A1A1AA;font-family:Arial,sans-serif;line-height:24px;">1</td></tr></table></td>
          <td style="vertical-align:top;padding:2px 0 12px 0;font-size:14px;color:#D4D4D8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.5;">Ouvre le PDF en pi&egrave;ce jointe sur ton t&eacute;l&eacute;phone</td>
        </tr>
        <tr>
          <td style="vertical-align:top;width:32px;padding-bottom:12px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="width:24px;height:24px;background-color:#27272A;border-radius:12px;text-align:center;vertical-align:middle;font-size:12px;font-weight:700;color:#A1A1AA;font-family:Arial,sans-serif;line-height:24px;">2</td></tr></table></td>
          <td style="vertical-align:top;padding:2px 0 12px 0;font-size:14px;color:#D4D4D8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.5;">Pr&eacute;sente le QR code &agrave; l'entr&eacute;e</td>
        </tr>
        <tr>
          <td style="vertical-align:top;width:32px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="width:24px;height:24px;background-color:#27272A;border-radius:12px;text-align:center;vertical-align:middle;font-size:12px;font-weight:700;color:#A1A1AA;font-family:Arial,sans-serif;line-height:24px;">3</td></tr></table></td>
          <td style="vertical-align:top;padding:2px 0 0 0;font-size:14px;color:#D4D4D8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.5;">Un seul scan par billet &mdash; non transf&eacute;rable</td>
        </tr>
      </table>
    </td></tr>
  </table>
</td></tr>

<!-- ====== FOOTER SEPARATOR ====== -->
<tr><td style="padding:36px 40px 0 40px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="height:1px;background-color:#1C1C20;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>

<!-- ====== FOOTER ====== -->
<tr><td style="padding:24px 40px 0 40px;text-align:center;">
  <p style="margin:0;font-size:12px;color:#52525B;line-height:1.8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Billet nominatif &mdash; pi&egrave;ce d'identit&eacute; demand&eacute;e &agrave; l'entr&eacute;e.<br/>Ne transf&egrave;re pas cet email. Chaque billet est unique et personnel.</p>
</td></tr>

<!-- Footer branding -->
<tr><td style="padding:24px 40px 40px 40px;" align="center">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
    <td style="vertical-align:middle;"><img src="${logoUrl}" width="18" height="18" alt="" style="display:block;border:0;border-radius:4px;" /></td>
    <td style="vertical-align:middle;padding-left:8px;"><p style="margin:0;font-size:11px;color:#3F3F46;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">powered by GetStage</p></td>
  </tr></table>
</td></tr>

</table>
<!--[if mso]></td></tr></table><![endif]-->

</body></html>`;

// 9. Send
console.log("⏳ Sending...");
const { data: res, error } = await resend.emails.send({
  from: "GetStage <tickets@getstage.io>",
  to: "adam@certhis.io",
  subject: `🎫 Ton billet pour ${ev.name}`,
  html: emailHtml,
  text: `Bonjour Adam,\nTon billet pour ${ev.name} est confirmé.\nTon billet est en pièce jointe.\n\nVIP | ${code} | ${price}\n${eventDate} · ${eventTime}\n${venue}\n\n— powered by GetStage`,
  attachments: [
    { filename: `billet-${code}.pdf`, content: Buffer.from(pdfBuffer).toString("base64"), content_type: "application/pdf" },
  ],
});
if (error) { console.error("❌", error); process.exit(1); }
console.log(`✅ Envoyé ! ID: ${res.id}`);
await sb.from("tickets").update({ status: "sent", sent_at: new Date().toISOString() }).eq("token", token);
console.log("✓ Done");
