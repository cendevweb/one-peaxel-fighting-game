import type { RawImage } from './image.js';
import { pixelIndex } from './image.js';

/**
 * Sprite rips ship on a flat opaque plate rather than on transparency, and the
 * plate colour is different on every sheet. Guessing it from the border is
 * reliable: the outer ring of a rip is plate and nothing else.
 */
export interface Plate {
    r: number;
    g: number;
    b: number;
    /** Manhattan distance below which a pixel counts as plate. */
    cut: number;
    /** Ramp above `cut` over which alpha fades back in, which keeps the
     *  anti-aliased outline of a sprite instead of biting into it. */
    fade: number;
}

export const detectPlate = (image: RawImage, cut = 20, fade = 16): Plate => {
    const counts = new Map<number, number>();
    const sample = (x: number, y: number): void => {
        const index = pixelIndex(image, x, y);
        const alpha = image.data[index + 3] ?? 0;
        if (alpha === 0) {
            return;
        }
        const key =
            ((image.data[index] ?? 0) << 16) |
            ((image.data[index + 1] ?? 0) << 8) |
            (image.data[index + 2] ?? 0);
        counts.set(key, (counts.get(key) ?? 0) + 1);
    };

    for (let x = 0; x < image.width; x += 1) {
        sample(x, 0);
        sample(x, image.height - 1);
    }
    for (let y = 0; y < image.height; y += 1) {
        sample(0, y);
        sample(image.width - 1, y);
    }

    let best = 0;
    let bestCount = -1;
    for (const [key, count] of counts) {
        if (count > bestCount) {
            best = key;
            bestCount = count;
        }
    }

    return { r: (best >> 16) & 0xff, g: (best >> 8) & 0xff, b: best & 0xff, cut, fade };
};

export const plateDistance = (image: RawImage, index: number, plate: Plate): number =>
    Math.abs((image.data[index] ?? 0) - plate.r) +
    Math.abs((image.data[index + 1] ?? 0) - plate.g) +
    Math.abs((image.data[index + 2] ?? 0) - plate.b);

/** Alpha a pixel should end up with once the plate is keyed out. */
export const keyedAlpha = (image: RawImage, index: number, plate: Plate): number => {
    const source = image.data[index + 3] ?? 0;
    if (source === 0) {
        return 0;
    }
    const distance = plateDistance(image, index, plate);
    if (distance <= plate.cut) {
        return 0;
    }
    if (plate.fade > 0 && distance < plate.cut + plate.fade) {
        return Math.round((source * (distance - plate.cut)) / plate.fade);
    }
    return source;
};

/** One bit per pixel: does this pixel belong to a sprite? */
export interface Mask {
    width: number;
    height: number;
    bits: Uint8Array;
    /** Opaque pixels per row and per column, precomputed for segmentation. */
    rowCounts: Int32Array;
    columnCounts: Int32Array;
}

/** A rectangle of the sheet to keep out of segmentation. */
export interface IgnoreRect {
    left: number;
    top: number;
    right: number;
    bottom: number;
    /** Why it is excluded, for the manifest. */
    reason?: string;
}

const inside = (rects: readonly IgnoreRect[], x: number, y: number): boolean =>
    rects.some((rect) => x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom);

/**
 * A pixel only counts as sprite once it is solid enough; the faded rim is
 * kept in the output but must not drag a frame's bounding box outwards.
 *
 * `ignore` exists because a rip is not only sprites. Crocodile's sheet opens
 * with a 200-pixel-tall Baroque Works logo and carries five cutscene portraits
 * in its middle; both bridge several rows of sprites, and a row profile cannot
 * tell them apart from a very tall attack. Excluding them by hand is the
 * smallest honest fix.
 */
export const buildMask = (
    image: RawImage,
    plate: Plate,
    solidAlpha = 128,
    ignore: readonly IgnoreRect[] = []
): Mask => {
    const bits = new Uint8Array(image.width * image.height);
    const rowCounts = new Int32Array(image.height);
    const columnCounts = new Int32Array(image.width);

    for (let y = 0; y < image.height; y += 1) {
        for (let x = 0; x < image.width; x += 1) {
            if (ignore.length > 0 && inside(ignore, x, y)) {
                continue;
            }
            const index = (y * image.width + x) * 4;
            if (keyedAlpha(image, index, plate) >= solidAlpha) {
                bits[y * image.width + x] = 1;
                rowCounts[y] = (rowCounts[y] ?? 0) + 1;
                columnCounts[x] = (columnCounts[x] ?? 0) + 1;
            }
        }
    }

    return { width: image.width, height: image.height, bits, rowCounts, columnCounts };
};
