"""Reading a ripped sprite sheet: background keying and frame detection.

A sheet from the ROM rip is not a grid. Frames sit in rows ("bands") of
uneven height, separated by strips of the background colour, and each band
holds frames of uneven width. This module finds them; it knows nothing about
which frame belongs to which move. That knowledge lives in `characters.json`.
"""

from __future__ import annotations

from collections import Counter
from dataclasses import dataclass

import numpy as np
from PIL import Image


@dataclass
class Box:
    x0: int
    y0: int
    x1: int  # exclusive
    y1: int  # exclusive

    @property
    def w(self) -> int:
        return self.x1 - self.x0

    @property
    def h(self) -> int:
        return self.y1 - self.y0


def border_colour(rgb: np.ndarray) -> tuple[int, int, int]:
    """The background is the most frequent colour on the sheet's border."""
    edge = np.concatenate([rgb[0], rgb[-1], rgb[:, 0], rgb[:, -1]])
    counts = Counter(map(tuple, edge.tolist()))
    return counts.most_common(1)[0][0]


def key_background(rgb: np.ndarray, cut: int = 24, fade: int = 24) -> np.ndarray:
    """Return an RGBA array with the background made transparent.

    The alpha ramps over `fade` units of colour distance rather than cutting
    hard, so the dark outline pixels that were anti-aliased against the
    background do not keep a coloured halo.
    """
    bg = np.array(border_colour(rgb), dtype=np.int32)
    dist = np.abs(rgb.astype(np.int32) - bg).sum(axis=2)
    alpha = np.clip((dist - cut) * 255 // max(fade, 1), 0, 255).astype(np.uint8)
    return np.dstack([rgb, alpha])


def load(path: str, ignore: list[list[int]] | None = None, cut: int = 24, fade: int = 24) -> np.ndarray:
    rgb = np.asarray(Image.open(path).convert("RGB"))
    rgba = key_background(rgb, cut, fade)
    for x0, y0, x1, y1 in ignore or []:
        rgba[y0:y1, x0:x1, 3] = 0
    return rgba


def _runs(profile: np.ndarray, gap: int) -> list[tuple[int, int]]:
    """Runs of non-empty entries, merging holes shorter than `gap`."""
    filled = np.flatnonzero(profile)
    if filled.size == 0:
        return []
    runs: list[tuple[int, int]] = []
    start = prev = int(filled[0])
    for i in filled[1:]:
        i = int(i)
        if i - prev > gap:
            runs.append((start, prev + 1))
            start = i
        prev = i
    runs.append((start, prev + 1))
    return runs


def detect(rgba: np.ndarray, row_gap: int = 2, col_gap: int = 3, min_px: int = 12) -> list[list[Box]]:
    """Bands top to bottom, each a list of frame boxes left to right."""
    solid = rgba[:, :, 3] > 96
    bands: list[list[Box]] = []
    for y0, y1 in _runs(solid.sum(axis=1), row_gap):
        strip = solid[y0:y1]
        frames: list[Box] = []
        for x0, x1 in _runs(strip.sum(axis=0), col_gap):
            cell = strip[:, x0:x1]
            if cell.sum() < min_px:
                continue
            rows = np.flatnonzero(cell.any(axis=1))
            frames.append(Box(x0, y0 + int(rows[0]), x1, y0 + int(rows[-1]) + 1))
        if frames:
            bands.append(frames)
    return bands


def feet_anchor(rgba: np.ndarray, box: Box, side: str | None = None) -> tuple[int, int]:
    """Where the fighter stands, in sheet pixels.

    Horizontal: the centre of mass of the lowest ~18 % of opaque rows, so a
    punch that stretches the silhouette sideways does not drag the body with
    it. Vertical: the lowest opaque row.

    `side` ("left" or "right") restricts the search to that 40 % of the
    frame, for frames where a giant limb reaches the ground beside the body.
    """
    solid = rgba[box.y0:box.y1, box.x0:box.x1, 3] > 96
    if side:
        cut = int(box.w * 0.4)
        mask = np.zeros_like(solid)
        if side == "left":
            mask[:, :cut] = True
        else:
            mask[:, box.w - cut:] = True
        solid = solid & mask
    rows = np.flatnonzero(solid.any(axis=1))
    bottom = int(rows[-1])
    top = max(int(rows[0]), bottom - max(3, int(box.h * 0.18)))
    ys, xs = np.nonzero(solid[top:bottom + 1])
    return box.x0 + int(round(xs.mean())), box.y0 + bottom + 1
