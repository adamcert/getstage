/**
 * Generate a 72x72 GetStage logo PNG (retina 3x) and upload it
 * to Supabase public storage so emails can reference it via URL.
 *
 * Usage: node --env-file=.env.local scripts/upload-logo.mjs
 */

import puppeteer from "puppeteer";
import { createClient } from "@supabase/supabase-js";
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCAL_PATH = path.resolve(__dirname, "..", "public", "getstage-logo.png");

// ── 1. Generate PNG via Puppeteer ─────────────────────────────────────

const html = `<!DOCTYPE html>
<html>
<head>
<style>
  * { margin: 0; padding: 0; }
  body {
    width: 72px;
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #FF4D6A 0%, #8B5CF6 100%);
    border-radius: 16px;
    overflow: hidden;
  }
  svg {
    width: 40px;
    height: 40px;
  }
</style>
</head>
<body>
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
       fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M5.8 11.3 2 22l10.7-3.79"/>
    <path d="M4 3h.01"/>
    <path d="M22 8h.01"/>
    <path d="M15 2h.01"/>
    <path d="M22 20h.01"/>
    <path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10"/>
    <path d="m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11c-.11.7-.72 1.22-1.43 1.22H17"/>
    <path d="m11 2 .33.82c.34.86-.2 1.82-1.11 1.98C9.52 4.9 9 5.52 9 6.23V7"/>
    <path d="M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z"/>
  </svg>
</body>
</html>`;

console.log("Launching Puppeteer...");
const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 72, height: 72, deviceScaleFactor: 3 });
await page.setContent(html, { waitUntil: "networkidle0" });

const pngBuffer = await page.screenshot({
  type: "png",
  clip: { x: 0, y: 0, width: 72, height: 72 },
  omitBackground: true,
});
await browser.close();

console.log(`PNG generated: ${pngBuffer.length} bytes (${72 * 3}x${72 * 3} actual pixels)`);

// ── 2. Save locally ───────────────────────────────────────────────────

await writeFile(LOCAL_PATH, pngBuffer);
console.log(`Saved locally: ${LOCAL_PATH}`);

// ── 3. Upload to Supabase Storage ─────────────────────────────────────

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// Ensure the "public" bucket exists and is public
const { data: buckets } = await supabase.storage.listBuckets();
const publicBucket = buckets?.find((b) => b.name === "public");

if (!publicBucket) {
  console.log('Creating "public" storage bucket...');
  const { error } = await supabase.storage.createBucket("public", {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024, // 5 MB
  });
  if (error) {
    console.error("Failed to create bucket:", error.message);
    process.exit(1);
  }
} else if (!publicBucket.public) {
  console.log('Updating "public" bucket to be publicly readable...');
  await supabase.storage.updateBucket("public", { public: true });
}

// Upload (upsert to overwrite if exists)
console.log("Uploading to Supabase Storage...");
const { error: uploadError } = await supabase.storage
  .from("public")
  .upload("email/getstage-logo.png", pngBuffer, {
    contentType: "image/png",
    cacheControl: "public, max-age=31536000, immutable",
    upsert: true,
  });

if (uploadError) {
  console.error("Upload failed:", uploadError.message);
  process.exit(1);
}

// ── 4. Print public URL ───────────────────────────────────────────────

const { data: urlData } = supabase.storage
  .from("public")
  .getPublicUrl("email/getstage-logo.png");

console.log("\nPublic URL (use in emails):");
console.log(urlData.publicUrl);
