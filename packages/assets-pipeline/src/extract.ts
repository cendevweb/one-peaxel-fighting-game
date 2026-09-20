import { basename } from 'node:path';
import { createImage, loadImage, type RawImage } from './image.js';
import { buildMask, detectPlate, keyedAlpha, type Plate } from './mask.js';
import { pack, type PackInput } from './pack.js';
import { segment, type Band } from './segment.js';
import { segmentOptionsFor, type CharacterSource } from './characters.config.js';
import type { AtlasFile, AtlasFrame, CharacterManifest } from './atlas.js';

export interface AnalysedSheet {
    source: CharacterSource;
    image: RawImage;
    plate: Plate;
    bands: Band[];
}

export const analyseSheet = async (source: CharacterSource, file: string): Promise<AnalysedSheet> => {
    const image = await loadImage(file);
    const plate = detectPlate(image, source.plate?.cut ?? 20, source.plate?.fade ?? 16);
    const mask = buildMask(image, plate, 128, source.ignore ?? []);
    const bands = segment(mask, segmentOptionsFor(source));
    return { source, image, plate, bands };
};

/**
 * Frames keep their coordinates as their name — `b3f7` is the eighth frame of
 * the fourth band. Naming them after an animation instead would make a frame
 * belong to exactly one move, and several moves legitimately share frames (a
 * hurt pose doubling as a guard, a run frame opening a dash). The semantic
 * layer lives in the animation list, not in the frame ids.
 */
const frameName = (bandIndex: number, frameIndex: number): string => `b${bandIndex}f${frameIndex}`;

interface PlacedFrame {
    key: string;
    bandIndex: number;
    frameIndex: number;
    /** Effects carry their own box instead of the fighter's. */
    effect: boolean;
    /** Source rectangle of the trimmed content. */
    sx: number;
    sy: number;
    w: number;
    h: number;
    /** Offset of the trimmed content inside the logical frame box. */
    ox: number;
    oy: number;
}

export interface ExtractionResult {
    atlas: AtlasFile;
    image: RawImage;
    manifest: CharacterManifest;
}

/** Effects are not fighters: a lightning bolt has no feet and no ground line,
 *  and forcing it into the fighter's logical box would make that box as wide
 *  as the bolt for every frame of the character. They keep their own tight box
 *  and are drawn from their centre. */
export const isEffectAnimation = (animation: string): boolean => animation.startsWith('fx-');

/** Frame indices an animation asks for, per band, split by kind. */
const requestedFrames = (
    source: CharacterSource,
    bands: readonly Band[]
): { wanted: Set<string>; effects: Set<string> } => {
    const wanted = new Set<string>();
    const effects = new Set<string>();
    for (const mapping of source.bands) {
        const band = bands.find((entry) => entry.index === mapping.band);
        if (!band) {
            continue;
        }
        const indices = mapping.order
            ? mapping.order
            : Array.from(
                  { length: (mapping.range?.[1] ?? band.frames.length - 1) - (mapping.range?.[0] ?? 0) + 1 },
                  (_, offset) => (mapping.range?.[0] ?? 0) + offset
              );
        for (const index of indices) {
            if (index >= 0 && index < band.frames.length) {
                const key = frameName(mapping.band, index);
                wanted.add(key);
                if (isEffectAnimation(mapping.animation)) {
                    effects.add(key);
                }
            }
        }
    }
    return { wanted, effects };
};

export const extractCharacter = (analysed: AnalysedSheet, sourceFile: string): ExtractionResult => {
    const { source, image, plate, bands } = analysed;
    const warnings: string[] = [];

    // Only the frames some animation asks for are published. A rip carries a
    // great deal the game never plays — cut-scene portraits, unused specials,
    // several hundred effect frames — and packing all of it turns a 200 KB
    // atlas into a 4 MB one the player waits on for nothing.
    const { wanted, effects } = requestedFrames(source, bands);
    const publishAll = wanted.size === 0;

    // A single logical box for every frame of the character: the widest reach
    // on either side of the anchor, and the tallest band. Frames are stored
    // trimmed, so the padding costs nothing in the atlas.
    let halfWidth = 1;
    let frameHeight = 1;
    for (const band of bands) {
        band.frames.forEach((frame, frameIndex) => {
            const key = frameName(band.index, frameIndex);
            if (!publishAll && !wanted.has(key)) {
                return;
            }
            if (effects.has(key)) {
                return;
            }
            halfWidth = Math.max(halfWidth, frame.anchorX - frame.left + 1, frame.right - frame.anchorX + 1);
            frameHeight = Math.max(frameHeight, band.bottom - frame.top + 1);
        });
    }
    const frameWidth = halfWidth * 2;

    const placed: PlacedFrame[] = [];
    for (const band of bands) {
        band.frames.forEach((frame, frameIndex) => {
            const key = frameName(band.index, frameIndex);
            if (!publishAll && !wanted.has(key)) {
                return;
            }
            const width = frame.right - frame.left + 1;
            const height = frame.bottom - frame.top + 1;
            const effect = effects.has(key);
            placed.push({
                key,
                bandIndex: band.index,
                frameIndex,
                effect,
                sx: frame.left,
                sy: frame.top,
                w: width,
                h: height,
                ox: effect ? 0 : halfWidth - (frame.anchorX - frame.left),
                oy: effect ? 0 : frameHeight - (band.bottom - frame.top + 1)
            });
        });
    }

    const duplicates = new Set<string>();
    const seen = new Set<string>();
    for (const frame of placed) {
        if (seen.has(frame.key)) {
            duplicates.add(frame.key);
        }
        seen.add(frame.key);
    }
    if (duplicates.size > 0) {
        warnings.push(`Frames en double : ${[...duplicates].join(', ')}`);
    }

    const inputs: PackInput[] = placed.map((frame) => ({ key: frame.key, width: frame.w, height: frame.h }));
    const packed = pack(inputs);
    const atlasImage = createImage(packed.width, packed.height);
    const positions = new Map(packed.rects.map((rect) => [rect.key, rect]));

    for (const frame of placed) {
        const rect = positions.get(frame.key);
        if (!rect) {
            continue;
        }
        for (let y = 0; y < frame.h; y += 1) {
            for (let x = 0; x < frame.w; x += 1) {
                const sourceIndex = ((frame.sy + y) * image.width + (frame.sx + x)) * 4;
                const alpha = keyedAlpha(image, sourceIndex, plate);
                if (alpha === 0) {
                    continue;
                }
                const destIndex = ((rect.y + y) * atlasImage.width + (rect.x + x)) * 4;
                atlasImage.data[destIndex] = image.data[sourceIndex] ?? 0;
                atlasImage.data[destIndex + 1] = image.data[sourceIndex + 1] ?? 0;
                atlasImage.data[destIndex + 2] = image.data[sourceIndex + 2] ?? 0;
                atlasImage.data[destIndex + 3] = alpha;
            }
        }
    }

    const frames: AtlasFrame[] = placed.map((frame) => {
        const rect = positions.get(frame.key);
        return {
            filename: frame.key,
            frame: { x: rect?.x ?? 0, y: rect?.y ?? 0, w: frame.w, h: frame.h },
            rotated: false,
            trimmed: true,
            spriteSourceSize: { x: frame.ox, y: frame.oy, w: frame.w, h: frame.h },
            sourceSize: frame.effect ? { w: frame.w, h: frame.h } : { w: frameWidth, h: frameHeight }
        };
    });

    // Animations, from the band mapping. A mapping that points at frames the
    // sheet does not have is a warning, not a silent empty animation: a move
    // whose animation quietly vanished is the kind of thing that only shows up
    // in a match.
    const usedFrames = new Set<string>();
    const animations = source.bands.map((mapping) => {
        const key = `${source.texture}-${mapping.animation}`;
        const band = bands.find((entry) => entry.index === mapping.band);
        if (!band) {
            warnings.push(`La bande ${mapping.band} (${mapping.animation}) n'existe pas dans la planche.`);
            return {
                key,
                frames: [],
                frameRate: mapping.frameRate,
                repeat: mapping.repeat ?? 0,
                ...(mapping.flip ? { flip: true } : {})
            };
        }

        const indices = mapping.order
            ? mapping.order
            : Array.from(
                  { length: (mapping.range?.[1] ?? band.frames.length - 1) - (mapping.range?.[0] ?? 0) + 1 },
                  (_, offset) => (mapping.range?.[0] ?? 0) + offset
              );

        const names: string[] = [];
        for (const index of indices) {
            if (index < 0 || index >= band.frames.length) {
                warnings.push(
                    `${mapping.animation} : la frame ${index} n'existe pas (la bande ${mapping.band} en a ${band.frames.length}).`
                );
                continue;
            }
            const name = frameName(mapping.band, index);
            names.push(name);
            usedFrames.add(name);
        }

        if (names.length === 0) {
            warnings.push(`${mapping.animation} : aucune frame retenue.`);
        }

        return {
            key,
            frames: names,
            frameRate: mapping.frameRate,
            repeat: mapping.repeat ?? 0,
            ...(mapping.flip ? { flip: true } : {})
        };
    });

    const manifest: CharacterManifest = {
        id: source.id,
        texture: source.texture,
        source: basename(sourceFile),
        frameWidth,
        frameHeight,
        plate: { r: plate.r, g: plate.g, b: plate.b },
        bands: bands.map((band) => ({
            index: band.index,
            top: band.top,
            bottom: band.bottom,
            frameCount: band.frames.length,
            animation: source.bands.find((entry) => entry.band === band.index)?.animation
        })),
        animations,
        unusedFrames: placed.map((frame) => frame.key).filter((key) => !usedFrames.has(key)),
        skippedBands: bands
            .filter((band) => !source.bands.some((mapping) => mapping.band === band.index))
            .map((band) => band.index),
        warnings
    };

    return {
        atlas: {
            frames,
            meta: {
                app: 'opfg-sprites',
                version: '1.0',
                image: `${source.texture}.png`,
                format: 'RGBA8888',
                size: { w: packed.width, h: packed.height },
                scale: '1'
            }
        },
        image: atlasImage,
        manifest
    };
};
