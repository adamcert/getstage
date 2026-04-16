import "server-only";
import puppeteer from "puppeteer";
import { generateQrPng } from "./qr";
import { readFileSync } from "fs";
import { join } from "path";

interface TicketPdfData {
  eventName: string;
  eventDate: string;
  eventTime: string;
  venueName: string;
  venueAddress: string;
  venueCity: string;
  tierName: string;
  buyerFirstName: string;
  buyerLastName: string;
  shortCode: string;
  token: string;
}

// PartyPopper SVG (Lucide icon — same as frontend)
const PARTY_POPPER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5.8 11.3 2 22l10.7-3.79"/><path d="M4 3h.01"/><path d="M22 8h.01"/><path d="M15 2h.01"/><path d="M22 20h.01"/><path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10"/><path d="m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11c-.11.7-.72 1.22-1.43 1.22H17"/><path d="m11 2 .33.82c.34.86-.2 1.82-1.11 1.98C9.52 4.9 9 5.52 9 6.23V7"/><path d="M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z"/></svg>`;

export async function generateTicketPdf(data: TicketPdfData): Promise<Buffer> {
  const {
    eventName, eventDate, eventTime, venueName, venueAddress, venueCity,
    buyerFirstName, buyerLastName, shortCode, token,
  } = data;

  // QR as data URL
  const qrPngBuffer = await generateQrPng(token, 800);
  const qrDataUrl = `data:image/png;base64,${qrPngBuffer.toString("base64")}`;

  // PartyPopper as data URL
  const ppB64 = `data:image/svg+xml;base64,${Buffer.from(PARTY_POPPER_SVG).toString("base64")}`;

  // Background image
  let bgBase64 = "";
  try {
    let buf: Buffer, mime: string;
    try {
      buf = readFileSync(join(process.cwd(), "public", "ticket-bg-gradur.jpg"));
      mime = "jpeg";
    } catch {
      buf = readFileSync(join(process.cwd(), "public", "ticket-bg-gradur.png"));
      mime = "png";
    }
    bgBase64 = `data:image/${mime};base64,${buf.toString("base64")}`;
  } catch {
    // No background — solid dark
  }

  const venue = `${venueName}${venueAddress ? ` · ${venueAddress}` : ""}`;
  const buyerName = `${buyerFirstName} ${buyerLastName}`.trim();

  const ticketHtml = `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@700&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
body{width:794px;height:1123px;font-family:'Inter',sans-serif;background:#09090B;color:#fff;overflow:hidden;position:relative;}
.bg{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(9,9,11,0.45) 0%,rgba(9,9,11,0.5) 35%,rgba(9,9,11,0.85) 48%,#09090B 55%,#09090B 100%),url('${bgBase64}') center top/100% 55% no-repeat,#09090B;}
.content{position:relative;z-index:10;height:100%;display:flex;flex-direction:column;padding:36px 56px;}
.logo{display:flex;align-items:center;gap:12px;}
.logo-icon{width:42px;height:42px;border-radius:12px;background:linear-gradient(to bottom right,#FF4D6A,#8B5CF6);display:flex;align-items:center;justify-content:center;}
.logo-icon img{width:24px;height:24px;}
.logo-text{font-family:'Space Grotesk',sans-serif;font-size:22px;font-weight:700;color:#FAFAFA;letter-spacing:-0.5px;}
.logo-sub{font-size:9px;color:#52525B;letter-spacing:3px;text-transform:uppercase;font-weight:600;}
.event-section{flex:1;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;text-align:center;padding:0 20px 10px 20px;}
.venue-presents{font-size:13px;font-weight:600;color:rgba(255,255,255,0.5);letter-spacing:5px;text-transform:uppercase;margin-bottom:16px;}
.event-name{font-family:'Space Grotesk',sans-serif;font-size:54px;font-weight:700;line-height:1.05;text-transform:uppercase;letter-spacing:-1px;color:#fff;text-shadow:0 2px 20px rgba(0,0,0,0.6);max-width:680px;}
.event-meta{margin-top:24px;display:flex;flex-direction:column;gap:6px;align-items:center;}
.event-date{font-size:18px;font-weight:700;color:rgba(255,255,255,0.9);}
.event-venue{font-size:15px;font-weight:500;color:rgba(255,255,255,0.65);}
.divider{width:100%;height:1px;margin:28px 0;background:#1C1C20;}
.details{display:flex;justify-content:space-between;align-items:flex-end;padding:0 4px;}
.detail-group{display:flex;flex-direction:column;gap:3px;}
.detail-label{font-size:10px;font-weight:600;color:#52525B;text-transform:uppercase;letter-spacing:2.5px;}
.detail-value{font-size:20px;font-weight:700;color:#E4E4E7;}
.order-ref{font-size:12px;color:#A1A1AA;font-family:'SF Mono','Fira Code',monospace;letter-spacing:1px;}
.qr-section{display:flex;flex-direction:column;align-items:center;margin-top:32px;gap:12px;}
.qr-container{background:#fff;border-radius:20px;padding:16px;}
.qr-container img{display:block;width:280px;height:280px;}
.qr-code-text{font-size:14px;color:#A1A1AA;font-family:'SF Mono','Fira Code',monospace;letter-spacing:3px;}
.footer{margin-top:auto;text-align:center;padding-top:24px;}
.footer-legal{font-size:10px;color:#71717A;line-height:1.8;}
.footer-brand{margin-top:14px;display:flex;align-items:center;justify-content:center;gap:8px;}
.footer-brand-icon{width:18px;height:18px;border-radius:5px;background:linear-gradient(to bottom right,#FF4D6A,#8B5CF6);display:flex;align-items:center;justify-content:center;}
.footer-brand-icon img{width:11px;height:11px;}
.footer-brand-text{font-size:10px;color:#71717A;}
</style></head><body>
<div class="bg"></div>
<div class="content">
  <div class="logo"><div class="logo-icon"><img src="${ppB64}" alt="" /></div><div><div class="logo-text">GetStage</div><div class="logo-sub">by SNAPSS</div></div></div>
  <div class="event-section">
    <div class="venue-presents">${venueName || "GetStage"} presents</div>
    <div class="event-name">${eventName}</div>
    <div class="event-meta">
      <div class="event-date">${eventDate} · ${eventTime}</div>
      <div class="event-venue">${venue}${venueCity ? ", " + venueCity : ""}</div>
    </div>
  </div>
  <div class="divider"></div>
  <div class="details">
    <div class="detail-group"><span class="detail-label">Porteur</span><span class="detail-value">${buyerName}</span></div>
    <div class="detail-group" style="align-items:flex-end;"><span class="detail-label">Réf.</span><span class="order-ref">${shortCode}</span></div>
  </div>
  <div class="qr-section">
    <div class="qr-container"><img src="${qrDataUrl}" alt="QR Code" /></div>
    <div class="qr-code-text">${shortCode}</div>
  </div>
  <div class="footer">
    <div class="footer-legal">Billet nominatif — pièce d'identité demandée à l'entrée.<br/>Chaque billet ne peut être scanné qu'une seule fois.</div>
    <div class="footer-brand"><div class="footer-brand-icon"><img src="${ppB64}" alt="" /></div><span class="footer-brand-text">powered by GetStage</span></div>
  </div>
</div>
</body></html>`;

  // Render ticket as screenshot (flat image) then wrap in PDF
  // This avoids all CSS rendering issues in iOS/Android PDF viewers
  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });

  const page = await browser.newPage();
  await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });
  await page.setContent(ticketHtml, { waitUntil: "domcontentloaded", timeout: 15000 });
  // Wait for Google Fonts to load
  await page.evaluateHandle("document.fonts.ready");
  const ticketImage = await page.screenshot({ type: "jpeg", quality: 92, fullPage: true });

  const ticketImgB64 = `data:image/jpeg;base64,${Buffer.from(ticketImage).toString("base64")}`;

  // Wrap flat image in a minimal PDF
  await page.setContent(
    `<!DOCTYPE html><html><head><style>*{margin:0;padding:0;}body{width:794px;height:1123px;overflow:hidden;}</style></head><body><img src="${ticketImgB64}" style="width:794px;height:1123px;display:block;" /></body></html>`,
    { waitUntil: "domcontentloaded", timeout: 15000 }
  );
  const pdfBuffer = await page.pdf({
    width: "794px",
    height: "1123px",
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });

  await browser.close();

  return Buffer.from(pdfBuffer);
}
