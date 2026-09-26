"""Zoom on chosen bands: python3 band_zoom.py <id> <out.png> <band> [<band>...] [--scale 3]"""
import json, os, sys
from PIL import Image, ImageDraw
from config import load_config
from sheet import detect, load
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
args = sys.argv[1:]
scale = 3
if "--scale" in args:
    i = args.index("--scale"); scale = int(args[i + 1]); del args[i:i + 2]
cid, out, *bands = args
src = load_config()[cid]
seg = src.get("segment", {})
rgba = load(os.path.join(ROOT, "assets", "sheets", src["sheet"]), src.get("ignore"))
det = detect(rgba, seg.get("rowGap", 2), seg.get("colGap", 3))
sheet = Image.fromarray(rgba)
rows = []
for b in map(int, bands):
    fr = det[b]
    h = max(f.h for f in fr) + 12
    w = sum(f.w + 4 for f in fr) + 30
    row = Image.new("RGBA", (w, h), (46, 50, 58, 255)); d = ImageDraw.Draw(row)
    d.text((1, 1), f"B{b}", fill=(255, 220, 90, 255)); x = 28
    for i, f in enumerate(fr):
        row.alpha_composite(sheet.crop((f.x0, f.y0, f.x1, f.y1)), (x, h - f.h))
        d.text((x, 0), str(i), fill=(255, 255, 255, 255)); x += f.w + 4
    rows.append(row)
W = max(r.width for r in rows); H = sum(r.height for r in rows)
img = Image.new("RGBA", (W, H), (20, 20, 24, 255)); y = 0
for r in rows: img.alpha_composite(r, (0, y)); y += r.height
img.resize((W * scale, H * scale), Image.NEAREST).save(out)
