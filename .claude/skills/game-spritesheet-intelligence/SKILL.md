---
name: game-spritesheet-intelligence
description: Turn an irregular, non-grid sprite sheet (a ROM rip, a fan sheet, an artist's export) into a trimmed texture atlas with stable anchors and typed animation metadata. Use when frames are not on a grid, when extracted animations jitter or drift, or when a sheet mixes sprites with logos, portraits or text labels.
---

# Sprite sheet intelligence

## When this applies

A sheet where frames are not on a regular grid: rows of different heights,
frames of different widths, uneven gaps, and often artwork that is not a
sprite at all. Measuring hundreds of rectangles by hand is the usual answer,
and it is what produces animations that jitter — because a hand-measured box
is centred on the box, not on the character.

## The method

Work in this order. Each step feeds the next, and skipping the verification
step is how bad frames reach the game.

### 1. Key the background out

The background colour is the **modal colour of the image's border pixels**,
not a colour you guess. Key it with a fade ramp rather than a hard cut, or
anti-aliased outlines keep a halo:

```
distance = |r - bg.r| + |g - bg.g| + |b - bg.b|
distance <= cut            -> alpha 0
distance <  cut + fade     -> alpha scaled across the ramp
otherwise                  -> opaque
```

### 2. Exclude what is not a sprite

Before any segmentation, let the configuration declare rectangles to ignore.
Logos, cut-scene portraits and text labels are the usual culprits, and they
do real damage: a logo spanning two rows merges them into one band, and a
"Dash:" label becomes a frame of the walk cycle.

This cannot be inferred. Make it a declared list, and find the entries by
looking at the contact sheets from step 5.

### 3. Segment rows, then columns

Build a horizontal profile of opaque pixels: a run of empty rows at least
`rowGap` tall separates two bands. Then, inside each band, a vertical profile
gives the frames.

`rowGap` is per sheet and matters more than it looks. Some sheets separate
rows by one pixel; a default of 3 silently merges five rows into one band.
Start permissive, look at the result, tighten.

Merge column gaps that are shorter than a threshold, or an outstretched arm
separated from the body counts as its own frame.

### 4. Anchor on the feet, never on the centre

**This is the step that decides whether the animation is usable.**

The centre of a frame's bounding box is not the centre of the character. A
punch extends the silhouette sideways, so a frame anchored on its box centre
shifts the whole body — the character slides around while it attacks.

Take the **centre of mass of the bottom ~18 % of opaque rows**: the feet. The
feet stay planted and the body moves around them, which is what the source
animation actually did.

For an effect (a projectile, a flash), there are no feet. Detect those by
name convention and give them their own tight box.

### 5. Publish contact sheets and look at them

Generate one image per animation showing its frames in order, plus an
animated preview. Then **actually look at them**. This is not optional and
no amount of metric validation replaces it. Real defects found only this way:

- a super move whose last frames were truncated giant limbs;
- a walk cycle that had swallowed a text label;
- a guard animation pointing at a row of walk frames.

### 6. Publish a trimmed atlas

Give every frame of a character **one shared logical box** (`sourceSize`) with
per-frame offsets (`spriteSourceSize`), so no animation jumps between frames.
Effects get their own box, or one wide flash forces a 1200-px logical box on
the whole character.

Publish **only the frames an animation actually references**. Packing every
detected frame is how a 300 KB atlas becomes 1.9 MB.

### 7. Separate visual data from gameplay data

The manifest says where the pixels are and how fast to play them. It says
nothing about damage, startup frames or hitboxes — those live in the game's
character data and reference animations by key.

Then bind the two with a test: every animation a character or a move names
must resolve in the published manifest. A re-extraction that drops a frame
range fails the test suite instead of failing in front of a player.

## What stays hand-written

One mapping file: which band and which frame range form which animation. No
image analysis can know that band 14 is a super and not a guard. Keep it to
that, and keep everything else derived:

```ts
luffy: {
    sheet: 'luffy.png',
    segment: { rowGap: 1 },                    // only when the default fails
    ignore: [{ x: 0, y: 0, w: 128, h: 208 }],  // logo
    animations: {
        gear3: { band: 14, frames: [0, 5], frameRate: 9 }
    }
}
```

## Checklist

- [ ] Background keyed from the border's modal colour, with a fade ramp
- [ ] Non-sprite artwork declared as ignore rectangles
- [ ] `rowGap` tuned per sheet, verified against the band count you expect
- [ ] Anchors from the feet's centre of mass, not the box centre
- [ ] Contact sheets generated **and read**
- [ ] One logical box per character, a separate one for effects
- [ ] Only referenced frames published
- [ ] A test binding gameplay data to the published manifest
- [ ] Source rights checked before anything is shipped publicly

## Rights

A sheet from a ROM rip is not licence-free, whatever site hosts it. Build the
pipeline so the sheets are replaceable — one config file and one command —
and say plainly which assets are unlicensed rather than letting a deployment
assume otherwise.

## Reference implementation

`packages/assets-pipeline` in this repository, and `docs/ASSET_PIPELINE.md`
for how it was tuned against four real sheets.
