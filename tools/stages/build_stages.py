"""Turn the portrait backdrops into wide stage panoramas.

    python3 tools/stages/build_stages.py

The source images are portrait (941×1672). A fighting stage is wide, so each
one is cropped to the full-width band that ends at its horizon, scaled to the
stage's backdrop size. Mirroring the image sideways to fill a wider band was
tried and repeats the landmark, so the band is simply as wide as the image,
and the top of tall landmarks is cut, as the HUD would cover it anyway. The
floor the fighters stand on is drawn by the game, not taken from the image.
"""
import json
import os

import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
OUT = os.path.join(ROOT, "apps", "web", "public", "stages")

# Backdrop size in screen pixels at the game's 2× render scale.
HEIGHT = 380
WIDTH = 880

# Where the horizon sits, as a fraction of the source height: the band
# ends there.
HORIZON = {
    "arlong-park": 0.735,
    "enies-lobby": 0.70,
    "impel-down": 0.685,
    "rain-dinners": 0.665,
    "shandora": 0.60,
    "marineford": 0.725,
}


def main() -> None:
    os.makedirs(OUT, exist_ok=True)
    meta = {}
    for name, b in HORIZON.items():
        src = Image.open(os.path.join(ROOT, "assets", "backgrounds", f"{name}.png")).convert("RGB")
        W, H = src.size
        band = round(W * HEIGHT / WIDTH)
        bottom = int(H * b)
        crop = src.crop((0, bottom - band, W, bottom))
        img = crop.resize((WIDTH, HEIGHT), Image.LANCZOS)
        img.save(os.path.join(OUT, f"{name}.png"), optimize=True)
        # Colours the game uses for its floor and sky, sampled from the image.
        a = np.asarray(img).astype(int)
        meta[name] = {
            "sky": "#%02x%02x%02x" % tuple(a[:6].reshape(-1, 3).mean(axis=0).astype(int)),
            "horizon": "#%02x%02x%02x" % tuple(a[-8:].reshape(-1, 3).mean(axis=0).astype(int)),
        }
        print(name, img.size)
    with open(os.path.join(ROOT, "apps", "web", "src", "generated", "stages.json"), "w") as f:
        json.dump(meta, f, indent=1)


if __name__ == "__main__":
    main()
