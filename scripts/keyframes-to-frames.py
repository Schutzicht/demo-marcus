#!/usr/bin/env python3
"""Turn the bean-to-cup keyframes into the film frame sequence the canvas reads.
Cover-crops each keyframe to a uniform 16:9 and writes public/film/frames/f0001.jpg..
plus manifest.json. Later, Kling-interpolated frames replace these for true motion."""
import os, glob, json, shutil
from PIL import Image

HERE = os.path.dirname(__file__)
KEYS = os.path.join(HERE, "..", "public", "film", "keyframes")
FRAMES = os.path.join(HERE, "..", "public", "film", "frames")
W, H = 1280, 720

def cover(im, w, h):
    iw, ih = im.size
    s = max(w / iw, h / ih)
    nw, nh = int(iw * s + 0.5), int(ih * s + 0.5)
    im = im.resize((nw, nh), Image.LANCZOS)
    x, y = (nw - w) // 2, (nh - h) // 2
    return im.crop((x, y, x + w, y + h))

shutil.rmtree(FRAMES, ignore_errors=True)
os.makedirs(FRAMES, exist_ok=True)

keys = sorted(glob.glob(os.path.join(KEYS, "k*.png")))
if not keys:
    raise SystemExit("no keyframes found in " + KEYS)

n = 0
for k in keys:
    im = Image.open(k).convert("RGB")
    im = cover(im, W, H)
    n += 1
    im.save(os.path.join(FRAMES, f"f{n:04d}.jpg"), "JPEG", quality=88)
    print(f"frame {n:04d}  <- {os.path.basename(k)}")

manifest = {"count": n, "fps": 6, "width": W, "pattern": "f%04d.jpg", "mode": "keyframes"}
with open(os.path.join(FRAMES, "manifest.json"), "w") as f:
    json.dump(manifest, f, indent=2)
print(f"wrote {n} frames + manifest")
