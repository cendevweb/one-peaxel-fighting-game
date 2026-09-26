"""Render a sheet's detected bands with their indices, for mapping by eye.

    python3 tools/sprites/inspect_sheet.py luffy out_dir [--row-gap N] [--col-gap N]

Writes out_dir/<id>_bands_<k>.png: each band redrawn on a neutral backdrop,
every frame boxed and labelled `band.frame`. These images are what the
`chars/<id>.json` mapping is written from.
"""

from __future__ import annotations

import argparse
import json
import os

from PIL import Image, ImageDraw

from config import load_config
from sheet import detect, load

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("id")
    ap.add_argument("out")
    ap.add_argument("--per-image", type=int, default=8)
    args = ap.parse_args()

    config = load_config()
    src = config[args.id]
    seg = src.get("segment", {})
    rgba = load(os.path.join(ROOT, "assets", "sheets", src["sheet"]), src.get("ignore"))
    bands = detect(rgba, seg.get("rowGap", 2), seg.get("colGap", 3))
    os.makedirs(args.out, exist_ok=True)
    sheet = Image.fromarray(rgba)
    print(f"{args.id}: {len(bands)} bands")
    for start in range(0, len(bands), args.per_image):
        chunk = bands[start:start + args.per_image]
        rows = []
        for bi, frames in enumerate(chunk, start):
            h = max(f.h for f in frames) + 14
            w = sum(f.w + 6 for f in frames) + 40
            row = Image.new("RGBA", (w, h), (40, 44, 52, 255))
            d = ImageDraw.Draw(row)
            d.text((2, 2), f"B{bi}", fill=(255, 220, 90, 255))
            x = 34
            for fi, f in enumerate(frames):
                crop = sheet.crop((f.x0, f.y0, f.x1, f.y1))
                row.alpha_composite(crop, (x, 12 + (h - 14 - f.h)))
                d.rectangle((x - 1, 11, x + f.w, h - 1), outline=(90, 160, 255, 255))
                d.text((x + 1, 1), f"{fi}", fill=(255, 255, 255, 255))
                x += f.w + 6
            rows.append(row)
            print(f"  B{bi}: {len(frames)} frames, y={frames[0].y0}")
        W = max(r.width for r in rows)
        H = sum(r.height + 2 for r in rows)
        img = Image.new("RGBA", (W, H), (20, 20, 24, 255))
        y = 0
        for r in rows:
            img.alpha_composite(r, (0, y))
            y += r.height + 2
        scale = 2 if W < 700 else 1
        img = img.resize((W * scale, H * scale), Image.NEAREST)
        img.save(os.path.join(args.out, f"{args.id}_bands_{start // args.per_image:02d}.png"))


if __name__ == "__main__":
    main()
