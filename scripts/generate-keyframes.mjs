#!/usr/bin/env node
/**
 * Bean-to-cup scroll-film keyframes for Koffiebar Marcus.
 * Each keyframe is a still; consecutive keyframes are reference-chained for
 * visual consistency (same cup, surface, light) so they morph/interpolate
 * into one continuous film (De Boe style).
 *
 *   source ~/.zshrc && node scripts/generate-keyframes.mjs [--force] [--only=k5_extract]
 */
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "..", "public", "film", "keyframes");
if (!process.env.GEMINI_API_KEY) { console.error("GEMINI_API_KEY missing"); process.exit(1); }

const args = process.argv.slice(2);
const FORCE = args.includes("--force");
const ONLY = args.find((a) => a.startsWith("--only="))?.split("=")[1];
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const BRAND = [
  "Photorealistic cinematic editorial photography for Koffiebar Marcus, a warm Moroccan-influenced coffee bar.",
  "Mood: intimate, moody and warm, a single soft golden light source, deep espresso-brown shadows, warm earthy palette of terracotta, saffron and deep teal-green, gentle film grain.",
  "Macro and tactile, shallow depth of field, rich true-to-life colour. Wide 16:9 cinematic composition.",
  "No text, no logos, no labels, no watermarks, no readable lettering anywhere.",
].join(" ");

// Order = film order. ref = a prior keyframe for visual continuity.
const KEYS = [
  { name: "k0_beans", prompt: "Macro close-up of glossy dark-roasted coffee beans piled together on a dark wooden surface, warm light raking across them, a few beans catching a golden highlight, deep espresso-brown tones, dark moody bokeh background. The very first frame of a bean-to-cup journey." },
  { name: "k1_fall", ref: "k0_beans", prompt: "The same dark-roasted coffee beans now cascading and tumbling downward into the polished steel hopper of a coffee grinder, gentle motion blur on the falling beans, warm side light, dark background. A direct continuation of the previous shot." },
  { name: "k2_grind", ref: "k1_fall", prompt: "Extreme close-up at the grinder spout where whole beans become fresh grounds, fine coffee particles tumbling out into warm light, shallow focus, dark moody background. Continuation." },
  { name: "k3_grounds", ref: "k2_grind", prompt: "A neat mound of fresh ground coffee powder filling a stainless steel portafilter basket, fine fluffy texture catching warm light, dark wooden counter, intimate macro. Continuation." },
  { name: "k4_tamp", ref: "k3_grounds", prompt: "The ground coffee now pressed into a smooth level puck inside the portafilter on the same dark wooden counter, a brass tamper resting beside it, warm light, shallow focus." },
  { name: "k5_extract", ref: "k4_tamp", prompt: "Espresso extraction: a thick dark stream of espresso with golden crema flowing from the portafilter spout down into a clear glass cup, warm backlight catching the falling stream, faint steam, dark moody background." },
  { name: "k6_crema", ref: "k5_extract", prompt: "Close-up of the same clear glass cup now holding rich dark espresso topped with a layer of hazelnut-coloured crema, warm light, fine droplets on the glass, dark background." },
  { name: "k7_milk", ref: "k6_crema", prompt: "Steamed milk being poured from a steel jug into the espresso in the same cup, a white swirl blooming into delicate latte art, warm intimate light, dark background." },
  { name: "k8_cup", ref: "k7_milk", prompt: "The finished signature latte with delicate rosetta latte art, resting on a worn wooden Moroccan table, green zellige tile and warm brass softly blurred behind, warm golden light, generous clean negative space on the right for a title. The final cup of the journey." },
];

const filtered = ONLY ? KEYS.filter((k) => k.name === ONLY) : KEYS;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const withTimeout = (p, ms, label) =>
  Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error(`${label} timeout ${ms}ms`)), ms))]);

async function gen({ name, prompt, ref }) {
  const outPath = path.join(OUT, `${name}.png`);
  if (fs.existsSync(outPath) && !FORCE) { console.log(`skip: ${name}`); return; }
  const parts = [];
  if (ref && fs.existsSync(path.join(OUT, `${ref}.png`))) {
    parts.push({ inlineData: { mimeType: "image/png", data: fs.readFileSync(path.join(OUT, `${ref}.png`)).toString("base64") } });
    parts.push({ text: `${BRAND}\n\nUse the exact same palette, lighting, surface and (where mentioned) the same cup as the reference image, so this frame flows seamlessly from it. ${prompt}` });
  } else {
    parts.push({ text: `${BRAND}\n\n${prompt}` });
  }
  console.log(`generating: ${name}${ref ? ` (ref ${ref})` : ""}`);
  const t0 = Date.now();
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await withTimeout(ai.models.generateContent({ model: "gemini-3-pro-image-preview", contents: parts }), 80000, "gemini");
      const part = res.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
      if (!part) throw new Error("no image data");
      fs.writeFileSync(outPath, Buffer.from(part.inlineData.data, "base64"));
      console.log(`saved: ${name}.png (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
      return;
    } catch (e) {
      console.warn(`  attempt ${attempt} failed: ${String(e.message).slice(0, 80)}`);
      if (attempt < 2) await sleep(1500);
    }
  }
  console.error(`FAILED: ${name}`);
}

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });
console.log(`\nKeyframes -> public/film/keyframes/\n`);
for (const k of filtered) await gen(k); // sequential so refs exist
console.log("\nDone.\n");
