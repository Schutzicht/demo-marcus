#!/usr/bin/env node
/**
 * Download the 8 beat-clips (in order) and extract one continuous JPG frame
 * sequence into public/film/frames/ for the scroll-scrubbed canvas.
 *
 * Usage:
 *   node scripts/extract-frames.mjs <url0> <url1> ... <url7>
 *   node scripts/extract-frames.mjs            # re-extract from public/film/clips/beat*.mp4
 *
 * Writes public/film/frames/f0001.jpg .. and public/film/frames/manifest.json
 */

import ffmpegPath from "ffmpeg-static";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const CLIPS = path.join(ROOT, "public", "film", "clips");
const FRAMES = path.join(ROOT, "public", "film", "frames");
const TMP = path.join(ROOT, "public", "film", "_tmp");

const FPS = 6;       // frames per second uit elke clip
const WIDTH = 1200;  // breedte van elk frame (hoogte volgt 16:9)
const QUALITY = 6;   // jpg kwaliteit (lager = beter, 2-31)

for (const d of [CLIPS, FRAMES, TMP]) fs.mkdirSync(d, { recursive: true });

const urls = process.argv.slice(2);

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download ${url} -> ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
  console.log(`downloaded ${path.basename(dest)} (${(buf.length / 1e6).toFixed(1)} MB)`);
}

async function main() {
  // 1) zorg dat de clips lokaal staan
  const clipPaths = [];
  if (urls.length) {
    for (let i = 0; i < urls.length; i++) {
      const dest = path.join(CLIPS, `beat${i}.mp4`);
      await download(urls[i], dest);
      clipPaths.push(dest);
    }
  } else {
    const existing = fs.readdirSync(CLIPS).filter((f) => /^beat\d+\.mp4$/.test(f)).sort();
    for (const f of existing) clipPaths.push(path.join(CLIPS, f));
  }
  if (!clipPaths.length) { console.error("Geen clips gevonden."); process.exit(1); }

  // 2) frames opnieuw opbouwen
  fs.rmSync(FRAMES, { recursive: true, force: true });
  fs.mkdirSync(FRAMES, { recursive: true });

  let counter = 0;
  let dims = null;
  for (let i = 0; i < clipPaths.length; i++) {
    fs.rmSync(TMP, { recursive: true, force: true });
    fs.mkdirSync(TMP, { recursive: true });
    console.log(`extracting beat ${i} ...`);
    execFileSync(ffmpegPath, [
      "-y", "-i", clipPaths[i],
      "-vf", `fps=${FPS},scale=${WIDTH}:-2:flags=lanczos`,
      "-q:v", String(QUALITY),
      path.join(TMP, "%04d.jpg"),
    ], { stdio: ["ignore", "ignore", "inherit"] });

    const frames = fs.readdirSync(TMP).filter((f) => f.endsWith(".jpg")).sort();
    // grensframe ontdubbelen: laat het eerste frame van vervolg-clips weg
    const start = i === 0 ? 0 : 1;
    for (let j = start; j < frames.length; j++) {
      counter++;
      const out = path.join(FRAMES, `f${String(counter).padStart(4, "0")}.jpg`);
      fs.copyFileSync(path.join(TMP, frames[j]), out);
      if (!dims) {
        // dimensies eenmalig bepalen
        dims = { width: WIDTH };
      }
    }
  }
  fs.rmSync(TMP, { recursive: true, force: true });

  const manifest = { count: counter, fps: FPS, width: WIDTH, pattern: "f%04d.jpg" };
  fs.writeFileSync(path.join(FRAMES, "manifest.json"), JSON.stringify(manifest, null, 2));

  // totale grootte
  let bytes = 0;
  for (const f of fs.readdirSync(FRAMES)) bytes += fs.statSync(path.join(FRAMES, f)).size;
  console.log(`\nKlaar: ${counter} frames, ${(bytes / 1e6).toFixed(1)} MB totaal.`);
  console.log(`manifest: ${JSON.stringify(manifest)}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
