import type { Mask } from './mask.js';

/**
 * Segmentation.
 *
 * A ripped sheet is not a grid. Frames sit on irregular rows, each row holds a
 * different number of frames, frames inside a row have different widths, and
 * two rows can be one pixel apart. So nothing here assumes a cell size: rows
 * are found by looking for runs of empty scanlines, and frames inside a row by
 * looking for runs of empty columns.
 */

export interface Band {
    index: number;
    top: number;
    bottom: number;
    /** Opaque pixels in the band, used to drop specks. */
    pixels: number;
    frames: Frame[];
}

export interface Frame {
    index: number;
    /** Tight content box, inclusive. */
    left: number;
    right: number;
    top: number;
    bottom: number;
    /** Column the fighter's weight sits on, in sheet coordinates. */
    anchorX: number;
    pixels: number;
}

export interface SegmentOptions {
    /** Empty scanlines needed to separate two bands. */
    rowGap: number;
    /** Empty columns needed to separate two frames. */
    columnGap: number;
    /** Bands and frames thinner than this are noise. */
    minBandHeight: number;
    minFrameWidth: number;
    minFramePixels: number;
    /** Fraction of a frame's height treated as "the feet", for the anchor. */
    footFraction: number;
    /** Cut a run that holds two drawings whose ink touches. Off by default:
     *  it re-numbers every frame of the bands it corrects, so a sheet opts in
     *  once its band mappings have been read again. */
    splitTouching: boolean;
}

export const DEFAULT_SEGMENT_OPTIONS: SegmentOptions = {
    rowGap: 3,
    columnGap: 3,
    minBandHeight: 14,
    minFrameWidth: 6,
    minFramePixels: 60,
    footFraction: 0.18,
    splitTouching: false
};

/** Runs of consecutive indices whose count is non-zero, merging runs that are
 *  closer together than `gap`. */
const runs = (counts: ArrayLike<number>, length: number, gap: number): Array<[number, number]> => {
    const found: Array<[number, number]> = [];
    let start = -1;
    let empty = 0;

    for (let index = 0; index < length; index += 1) {
        if ((counts[index] ?? 0) > 0) {
            if (start < 0) {
                start = index;
            }
            empty = 0;
        } else if (start >= 0) {
            empty += 1;
            if (empty >= gap) {
                found.push([start, index - empty]);
                start = -1;
                empty = 0;
            }
        }
    }
    if (start >= 0) {
        found.push([start, length - 1 - empty]);
    }
    return found;
};

/**
 * Two poses whose drawings touch leave no *empty* column between them, so the
 * column pass returns both as one frame and the game draws two fighters at
 * once. Akainu's Meigō row is eight poses and came out as seven frames: the
 * magma ball of one pose brushes the coat of the next by three pixels, and
 * the fighter was painted twice, the second copy standing exactly where the
 * projectile should have been.
 *
 * The join is still visible in the column profile — a handful of columns
 * holding three pixels where the body holds sixty — so a run that is much
 * wider than the band's own frames is cut at any short, nearly empty stretch
 * inside it, as long as both halves come out about as wide as the rest of the
 * band. Both guards earn their keep: Luffy's whip lays a thin rope across the
 * width of two frames, which is a long quiet stretch, and cutting there would
 * saw the whip off its owner; and the smoke Akainu's hound leaves hanging in
 * the air is a narrow puff beside a full pose, which is one drawing and not
 * two.
 */
const splitTouchingFrames = (
    columns: ArrayLike<number>,
    found: Array<[number, number]>,
    bandHeight: number,
    options: SegmentOptions
): Array<[number, number]> => {
    if (!options.splitTouching || found.length < 2) {
        return found;
    }
    const widths = found.map(([left, right]) => right - left + 1).sort((a, b) => a - b);
    const median = widths[widths.length >> 1] ?? 0;
    const noise = Math.max(1, Math.round(bandHeight * 0.05));
    const longestJoin = options.columnGap * 4;

    const out: Array<[number, number]> = [];
    for (const [left, right] of found) {
        if (right - left + 1 < median * 1.4) {
            out.push([left, right]);
            continue;
        }

        const narrowest = median * 0.6;
        let start = left;
        let quiet = -1;
        for (let x = left; x <= right; x += 1) {
            if ((columns[x] ?? 0) <= noise) {
                if (quiet < 0) {
                    quiet = x;
                }
                continue;
            }
            const width = quiet < 0 ? 0 : x - quiet;
            if (width >= options.columnGap && width <= longestJoin && quiet > start) {
                const cut = quiet + (width >> 1);
                if (cut - start + 1 >= narrowest && right - cut >= narrowest) {
                    out.push([start, cut]);
                    start = cut + 1;
                }
            }
            quiet = -1;
        }
        out.push([start, right]);
    }
    return out;
};

const columnCountsInBand = (mask: Mask, top: number, bottom: number): Int32Array => {
    const counts = new Int32Array(mask.width);
    for (let y = top; y <= bottom; y += 1) {
        const row = y * mask.width;
        for (let x = 0; x < mask.width; x += 1) {
            if (mask.bits[row + x] === 1) {
                counts[x] = (counts[x] ?? 0) + 1;
            }
        }
    }
    return counts;
};

/**
 * The anchor is not the middle of the bounding box: a fighter whose arm
 * stretches across half the frame would be drawn walking sideways. It is the
 * centre of mass of the lowest slice of the sprite — its feet — which is what
 * actually stays put between two frames of the same animation.
 */
const anchorColumn = (
    mask: Mask,
    left: number,
    right: number,
    top: number,
    bottom: number,
    footFraction: number
): number => {
    const height = bottom - top + 1;
    const footRows = Math.max(3, Math.round(height * footFraction));
    let total = 0;
    let weighted = 0;

    for (let y = bottom; y > bottom - footRows && y >= top; y -= 1) {
        const row = y * mask.width;
        for (let x = left; x <= right; x += 1) {
            if (mask.bits[row + x] === 1) {
                total += 1;
                weighted += x;
            }
        }
    }

    if (total === 0) {
        return (left + right) >> 1;
    }
    return Math.round(weighted / total);
};

const contentBox = (
    mask: Mask,
    left: number,
    right: number,
    bandTop: number,
    bandBottom: number
): { top: number; bottom: number; pixels: number } => {
    let top = bandBottom;
    let bottom = bandTop;
    let pixels = 0;

    for (let y = bandTop; y <= bandBottom; y += 1) {
        const row = y * mask.width;
        let rowPixels = 0;
        for (let x = left; x <= right; x += 1) {
            if (mask.bits[row + x] === 1) {
                rowPixels += 1;
            }
        }
        if (rowPixels > 0) {
            if (y < top) {
                top = y;
            }
            bottom = y;
            pixels += rowPixels;
        }
    }

    return { top, bottom, pixels };
};

export const segment = (
    mask: Mask,
    options: SegmentOptions = DEFAULT_SEGMENT_OPTIONS
): Band[] => {
    const bands: Band[] = [];

    for (const [top, bottom] of runs(mask.rowCounts, mask.height, options.rowGap)) {
        if (bottom - top + 1 < options.minBandHeight) {
            continue;
        }

        const columns = columnCountsInBand(mask, top, bottom);
        const frames: Frame[] = [];

        const columnRuns = splitTouchingFrames(
            columns,
            runs(columns, mask.width, options.columnGap),
            bottom - top + 1,
            options
        );

        for (const [left, right] of columnRuns) {
            if (right - left + 1 < options.minFrameWidth) {
                continue;
            }
            const box = contentBox(mask, left, right, top, bottom);
            if (box.pixels < options.minFramePixels) {
                continue;
            }
            frames.push({
                index: frames.length,
                left,
                right,
                top: box.top,
                bottom: box.bottom,
                // The ground line is the band's floor, shared by every frame
                // of the band, so a walk cycle does not bob.
                anchorX: anchorColumn(mask, left, right, box.top, bottom, options.footFraction),
                pixels: box.pixels
            });
        }

        if (frames.length === 0) {
            continue;
        }

        bands.push({
            index: bands.length,
            top,
            bottom,
            pixels: frames.reduce((total, frame) => total + frame.pixels, 0),
            frames
        });
    }

    return bands;
};
