#!/usr/bin/env python3
"""Convert generated raw PNGs -> optimized .webp, overwriting placeholders in public/img/."""
import os, glob
from PIL import Image

HERE = os.path.dirname(__file__)
RAW = os.path.join(HERE, "..", "_work", "ai-raw")
OUT = os.path.join(HERE, "..", "public", "img")

def target(w, h):
    if w > h:   return 1600, int(1600 * h / w)      # landscape
    if h > w:   return int(1500 * w / h), 1500       # portrait
    return 1200, 1200                                 # square

done = 0
for png in sorted(glob.glob(os.path.join(RAW, "*.png"))):
    name = os.path.splitext(os.path.basename(png))[0]
    im = Image.open(png).convert("RGB")
    tw, th = target(*im.size)
    im = im.resize((tw, th), Image.LANCZOS)
    out = os.path.join(OUT, name + ".webp")
    im.save(out, "WEBP", quality=84, method=6)
    print(f"{name}: {im.size[0]}x{im.size[1]} -> {os.path.getsize(out)//1024} KB")
    done += 1
print(f"converted {done} image(s)")
