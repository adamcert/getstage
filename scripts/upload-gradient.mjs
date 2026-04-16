/**
 * Generate a 600x4 gradient accent bar PNG (left-to-right #FF4D6A → #8B5CF6)
 * and upload it to Supabase public storage so emails can reference it via URL.
 *
 * Usage: node --env-file=.env.local scripts/upload-gradient.mjs
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
const LOCAL_PATH = path.resolve(__dirname, "..", "public", "email-gradient-bar.png");

// ── 1. Generate PNG via Puppeteer ─────────────────────────────────────

const html = `<!DOCTYPE html>
<html>
<head>
<style>
  * { margin: 0; padding: 0; }
  body {
    width: 600px;
    height: 4px;
    background: linear-gradient(90deg, #FF4D6A, #8B5CF6);
  }
</style>
</head>
<body></body>
</html>`;

console.log("Launching Puppeteer...");
const browser = await puppeteer.launch({
  headless: true,
  protocolTimeout: 60_000,
});
const page = await browser.newPage();
// Use a taller viewport (Chromium struggles with extremely short viewports)
await page.setViewport({ width: 600, height: 100, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: "networkidle0" });

const pngBuffer = await page.screenshot({
  type: "png",
  clip: { x: 0, y: 0, width: 600, height: 4 },
  omitBackground: false,
});
await browser.close();

console.log(`PNG generated: ${pngBuffer.length} bytes (600x4 pixels)`);

// ── 2. Save locally ───────────────────────────────────────────────────

await writeFile(LOCAL_PATH, pngBuffer);
console.log(`Saved locally: ${LOCAL_PATH}`);

// ── 3. Upload to Supabase Storage ─────────────────────────────────────

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const { data: buckets } = await supabase.storage.listBuckets();
const publicBucket = buckets?.find((b) => b.name === "public");

if (!publicBucket) {
  console.log('Creating "public" storage bucket...');
  const { error } = await supabase.storage.createBucket("public", {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
  });
  if (error) {
    console.error("Failed to create bucket:", error.message);
    process.exit(1);
  }
} else if (!publicBucket.public) {
  console.log('Updating "public" bucket to be publicly readable...');
  await supabase.storage.updateBucket("public", { public: true });
}

console.log("Uploading to Supabase Storage...");
const { error: uploadError } = await supabase.storage
  .from("public")
  .upload("email/gradient-bar.png", pngBuffer, {
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
  .getPublicUrl("email/gradient-bar.png");

console.log("\nPublic URL (use in emails):");
console.log(urlData.publicUrl);
