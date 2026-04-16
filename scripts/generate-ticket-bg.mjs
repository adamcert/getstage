/**
 * Generate premium Gradur ticket background using gemini-2.5-flash-image
 * (same model + approach as snapss-asset-generator)
 */
import { GoogleGenAI } from "@google/genai";
import { writeFileSync } from "fs";
import { join } from "path";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) { console.error("Set GEMINI_API_KEY env var"); process.exit(1); }
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const prompt = `Generate a stunning concert/event background image for a premium music event ticket.

The image should capture:
- A dramatic live concert atmosphere from the perspective of looking at the stage
- Silhouettes of an excited crowd with raised hands in the foreground
- Powerful stage lighting cutting through thick smoke/haze — mix of deep RED (#EF4444) and VIOLET (#8B5CF6) lights
- Professional concert photography quality with beautiful bokeh, lens flares, and volumetric lighting
- The top 40% of the image should show the stage lights and smoke
- The bottom 60% should gradually fade to near-black (#09090B) for text overlay
- Moody, dark, premium VIP nightclub aesthetic
- Portrait orientation (9:16 aspect ratio)

CRITICAL CONSTRAINTS:
- Pure photography only — NO text, NO letters, NO words, NO logos, NO watermarks
- NO illustrations or drawings — photorealistic only
- The dark bottom area must be very dark (#09090B range) for white text readability
- High resolution, professional quality`;

console.log("⏳ Generating via gemini-2.5-flash-image...");

const MAX_RETRIES = 2;

for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    });

    // Extract image from response parts
    const parts = response.candidates?.[0]?.content?.parts ?? [];
    for (const part of parts) {
      if (part.inlineData && part.inlineData.mimeType?.startsWith("image/")) {
        const buffer = Buffer.from(part.inlineData.data, "base64");
        const ext = part.inlineData.mimeType.includes("png") ? "png" : "jpg";
        const outPath = join("public", `ticket-bg-gradur.${ext}`);
        writeFileSync(outPath, buffer);
        console.log(`✅ Background saved: ${outPath} (${(buffer.length / 1024).toFixed(0)} KB)`);
        process.exit(0);
      }
    }
    console.error("❌ No image in response parts");
    if (attempt < MAX_RETRIES) {
      const delay = 2000 * (attempt + 1);
      console.log(`   Retrying in ${delay}ms...`);
      await new Promise(r => setTimeout(r, delay));
    }
  } catch (err) {
    console.error(`❌ Attempt ${attempt + 1} failed:`, err.message);
    if (attempt < MAX_RETRIES) {
      const delay = 2000 * (attempt + 1);
      console.log(`   Retrying in ${delay}ms...`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

// Fallback to imagen if flash-image fails
console.log("⏳ Fallback: trying imagen-4.0-generate-001...");
try {
  const response = await ai.models.generateImages({
    model: "imagen-4.0-generate-001",
    prompt: prompt.replace("Generate a stunning", "A stunning"),
    config: { numberOfImages: 1, aspectRatio: "9:16" },
  });
  if (response.generatedImages?.[0]) {
    const buffer = Buffer.from(response.generatedImages[0].image.imageBytes, "base64");
    writeFileSync(join("public", "ticket-bg-gradur.png"), buffer);
    console.log(`✅ Fallback saved (${(buffer.length / 1024).toFixed(0)} KB)`);
  }
} catch (err) {
  console.error("❌ Fallback also failed:", err.message);
}
