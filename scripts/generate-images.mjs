#!/usr/bin/env node
/**
 * Koffiebar Marcus — cinematic brand imagery via Nano Banana Pro (Gemini 3 Pro
 * Image), with an Imagen 4 fallback (Nano Banana was throwing 503s on 2026-06-10).
 *
 * Saves raw PNGs to public/img/_ai_raw/. Run scripts/to-webp.py afterwards to
 * convert + downsize into public/img/<name>.webp (overwriting placeholders).
 *
 *   node scripts/generate-images.mjs                 # all missing
 *   node scripts/generate-images.mjs -- --force      # regenerate all
 *   node scripts/generate-images.mjs -- --only=scene-1 --force
 */

import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, "..");
const OUTPUT_DIR = path.join(PROJECT_ROOT, "_work", "ai-raw");

if (!process.env.GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is not set. Add it to ~/.zshrc.");
  process.exit(1);
}

const args = process.argv.slice(2);
const FORCE = args.includes("--force");
const ONLY = args.find((a) => a.startsWith("--only="))?.split("=")[1];

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const BRAND = [
  "Photorealistic editorial photography for Koffiebar Marcus, a warm Moroccan-influenced coffee and tea bar in a historic Dutch harbour town (Vlissingen).",
  "Visual language: cozy and atmospheric, exposed brick and tadelakt plaster walls, zellige tilework, brass and warm wood, hanging plants, candle-warm low light with a single soft golden light source.",
  "Mood: intimate, handcrafted, abundant, slightly cinematic. Warm earthy palette of terracotta, saffron, deep teal-green and cream, deep espresso shadows.",
  "Subtle film grain, shot on medium-format camera, shallow depth of field. Rich, true-to-life colour, no oversaturation.",
  "No text, no logos, no watermarks, no captions, no signage, no brand names anywhere in the image.",
].join(" ");

const ratioFor = (a) => (a === "port" ? "3:4" : a === "square" ? "1:1" : "16:9");
const cueFor = (a) =>
  a === "port"
    ? "Vertical 3:4 portrait composition."
    : a === "square"
      ? "Square 1:1 composition."
      : "Wide 16:9 cinematic landscape composition.";

const IMAGES = [
  { name: "scene-1", aspect: "land", prompt: "Dusk, blue hour. The warm glowing facade and interior of the coffee bar seen through large street-front windows, exposed brick, warm pendant lights, plants and wooden tables inside, golden light spilling onto the cobbles outside. Inviting and atmospheric, nobody in focus." },
  { name: "scene-2", aspect: "land", prompt: "Close-up of a barista's hands pulling a shot of espresso on a chrome machine and pouring delicate latte art into a glass, steam rising, dark moody background with brass and tile, warm side light. Focus on craft and hands." },
  { name: "scene-3", aspect: "land", prompt: "A tall layered iced coffee in a clear glass on a worn wooden table, cream and espresso separating in soft stripes, heavy condensation, a small glass of fresh mint tea beside it, a warm sunbeam, a zellige tile wall softly blurred behind." },
  { name: "scene-4", aspect: "land", prompt: "A generous Moroccan mezze and brunch spread on a rustic wooden table seen from a low three-quarter angle: warm folded flatbread (msemen), grilled spiced meat, small bowls of dips, fresh salad, a three-tier stand with pastries, glasses of mint tea. Abundant and homemade, golden light." },
  { name: "scene-5", aspect: "land", prompt: "Interior in late afternoon, a full warm coffee bar with soft-focus guests at wooden tables, exposed brick, hanging plants, warm pendant glow, a couple of empty seats at the window inviting the viewer in, dreamy bokeh." },
  { name: "interior-wide", aspect: "land", prompt: "Calm morning interior of the coffee and tea bar before opening: exposed brick walls, tadelakt plaster, a zellige tiled counter, brass fixtures, wooden tables, hanging plants, warm low light, empty and serene." },
  { name: "drink-hero", aspect: "port", prompt: "A signature iced date-caramel latte in a tall glass, layered cream and coffee, a touch of sea salt on top, on a wooden bar, dark moody background, warm rim light, condensation. Hero product shot." },
  { name: "cake", aspect: "square", prompt: "Overhead. A slice of homemade baklava-cheesecake drizzled with honey and crushed pistachio beside a few homemade cookies on a ceramic plate, rustic wooden table, warm light, a few crumbs. Editorial food photography." },
  { name: "owner-craft", aspect: "port", prompt: "Close-up of hands dusting cocoa over a freshly poured cappuccino at a warm wooden counter, brass and tile background, no face visible, a sense of care and craft, warm soft side light." },
  { name: "interior-arch", aspect: "port", prompt: "A cozy corner of the coffee bar framed by a Moroccan horseshoe arch, a small wooden table with a glass of mint tea, plants, patterned cushions, zellige tiles, warm daylight through a nearby window." },
  { name: "hightea", aspect: "land", prompt: "An elegant three-tier high tea stand on a wooden table: macarons, baklava-cheesecake, mini msemen sandwiches and tarts, with a glass teapot of fresh mint tea, warm soft light, Moroccan tile and brass background." },
  { name: "tea-mint", aspect: "port", prompt: "Moroccan mint tea poured from a silver teapot in a high thin arc into a decorated glass packed with fresh mint, steam and droplets, warm light, dark background, dramatic and editorial." },
  { name: "feed-1", aspect: "square", prompt: "Top-down, a cappuccino with a delicate rosetta latte art on a saucer on a wooden table, warm light, minimal and clean." },
  { name: "feed-2", aspect: "square", prompt: "A glass of fresh mint tea with rising steam on a zellige tiled surface, warm light, a sprig of mint." },
  { name: "feed-3", aspect: "square", prompt: "An assortment of homemade Moroccan cookies and small baklava in a ceramic bowl, warm golden light, cozy and inviting." },
  { name: "feed-4", aspect: "square", prompt: "Warm atmospheric detail of the coffee bar interior, brass, brick and a hanging plant, soft bokeh, candle-warm light." },
];

const filtered = ONLY ? IMAGES.filter((i) => i.name === ONLY) : IMAGES;
if (ONLY && !filtered.length) {
  console.error(`No image named "${ONLY}".`);
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const withTimeout = (p, ms, label) =>
  Promise.race([
    p,
    new Promise((_, rej) => setTimeout(() => rej(new Error(`${label} timeout after ${ms}ms`)), ms)),
  ]);

async function tryGemini(fullPrompt) {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await withTimeout(
        ai.models.generateContent({ model: "gemini-3-pro-image-preview", contents: fullPrompt }),
        75000,
        "gemini"
      );
      const part = res.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
      if (part) return Buffer.from(part.inlineData.data, "base64");
      throw new Error("no image data");
    } catch (err) {
      console.warn(`  gemini attempt ${attempt} failed: ${String(err.message || err).slice(0, 90)}`);
      if (attempt < 2) await sleep(1500);
    }
  }
  return null;
}

async function tryImagen(fullPrompt, aspect) {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await withTimeout(
        ai.models.generateImages({
          model: "imagen-4.0-generate-001",
          prompt: fullPrompt,
          config: { numberOfImages: 1, aspectRatio: ratioFor(aspect) },
        }),
        75000,
        "imagen"
      );
      const b64 = res.generatedImages?.[0]?.image?.imageBytes;
      if (b64) return Buffer.from(b64, "base64");
      throw new Error("no image data");
    } catch (err) {
      console.warn(`  imagen attempt ${attempt} failed: ${String(err.message).slice(0, 90)}`);
      if (attempt < 2) await sleep(1500);
    }
  }
  return null;
}

async function generateOne({ name, prompt, aspect }) {
  const outPath = path.join(OUTPUT_DIR, `${name}.png`);
  if (fs.existsSync(outPath) && !FORCE) {
    console.log(`skip (exists): ${name}`);
    return "skip";
  }
  const fullPrompt = `${BRAND}\n\n${cueFor(aspect)} ${prompt}`;
  console.log(`generating: ${name} (${aspect})`);
  const t0 = Date.now();

  let buf = await tryGemini(fullPrompt);
  let via = "gemini-3-pro-image";
  if (!buf) {
    console.warn(`  falling back to Imagen 4 for ${name}`);
    buf = await tryImagen(fullPrompt, aspect);
    via = "imagen-4";
  }
  if (!buf) {
    console.error(`FAILED: ${name}`);
    return "error";
  }
  fs.writeFileSync(outPath, buf);
  console.log(`saved: ${name}.png (${(buf.length / 1024).toFixed(0)} KB, ${((Date.now() - t0) / 1000).toFixed(1)}s, via ${via})`);
  return "ok";
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`\nGenerating ${filtered.length} image(s) into public/img/_ai_raw/\n`);
  const results = [];
  for (const img of filtered) {
    results.push(await generateOne(img));
    await sleep(800);
  }
  const ok = results.filter((r) => r === "ok").length;
  const skip = results.filter((r) => r === "skip").length;
  const fail = results.filter((r) => r === "error").length;
  console.log(`\nDone: ${ok} generated, ${skip} skipped, ${fail} failed.\n`);
}

main();
