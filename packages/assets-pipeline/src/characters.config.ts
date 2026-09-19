import type { IgnoreRect } from './mask.js';
import { DEFAULT_SEGMENT_OPTIONS, type SegmentOptions } from './segment.js';

/**
 * Source configuration, one entry per playable fighter.
 *
 * `bands` is the only hand-written part of the pipeline, and deliberately so:
 * an algorithm can find where the frames are, but it cannot know that the
 * fourth row of a rip is a Gum-Gum Pistol rather than a taunt. Each entry maps
 * a detected band onto an animation, optionally trimming the frames that are
 * part of the row but not part of the move, and giving the playback order.
 *
 * Run `npm run analyse --workspace @opfg/assets-pipeline` to list the bands a
 * sheet actually has, and `npm run contact` to render them for inspection,
 * before editing this file.
 */
export interface BandMapping {
    /** Animation key, without the character prefix. */
    animation: string;
    /** Band index as reported by `analyse`. Several animations may point at
     *  the same band: a row of a rip often holds two moves back to back. */
    band: number;
    /** Frames of the band to use, as inclusive indices. Defaults to all. */
    range?: [number, number];
    /** Explicit playback order, as band-frame indices. Overrides `range`. */
    order?: number[];
    frameRate: number;
    /** -1 loops forever. */
    repeat?: number;
}

export interface CharacterSource {
    id: string;
    texture: string;
    file: string;
    scale: number;
    segment?: Partial<SegmentOptions>;
    plate?: { cut: number; fade: number };
    /** Regions of the sheet that are not sprites (logos, portraits, labels). */
    ignore?: IgnoreRect[];
    bands: BandMapping[];
}

export const segmentOptionsFor = (source: CharacterSource): SegmentOptions => ({
    ...DEFAULT_SEGMENT_OPTIONS,
    ...source.segment
});

/** Filled in after inspecting the contact sheets; see `docs/ASSET_PIPELINE.md`. */
export const CHARACTER_SOURCES: CharacterSource[] = [
    {
        id: 'akainu',
        texture: 'akainu',
        file: 'akainu.png',
        scale: 1,
        // The last row of the sheet is the ripper's credit banner and a large
        // character portrait, neither of which is a sprite. Left in, they merge
        // three rows of frames into one unusable band.
        ignore: [{ left: 0, top: 7855, right: 999, bottom: 8217, reason: 'banniere du ripper et portrait' }],
        bands: [
            { animation: 'idle', band: 0, range: [0, 5], frameRate: 6, repeat: -1 },
            { animation: 'walk', band: 0, range: [6, 13], frameRate: 11, repeat: -1 },
            { animation: 'guard', band: 0, order: [14], frameRate: 1, repeat: -1 },
            { animation: 'jump', band: 34, range: [3, 6], frameRate: 9 },
            { animation: 'hurt', band: 74, range: [0, 1], frameRate: 9 },
            { animation: 'knockdown', band: 74, range: [2, 7], frameRate: 8 },
            { animation: 'jab', band: 1, range: [0, 8], frameRate: 15 },
            { animation: 'smash', band: 37, range: [0, 9], frameRate: 13 },
            { animation: 'meteor', band: 8, range: [0, 6], frameRate: 13 },
            { animation: 'hound', band: 7, range: [0, 6], frameRate: 11 },
            { animation: 'fx-magma', band: 2, range: [0, 3], frameRate: 12, repeat: -1 }
        ]
    },
    {
        id: 'luffy',
        texture: 'luffy',
        file: 'luffy.png',
        scale: 1,
        bands: [
            { animation: 'idle', band: 0, range: [0, 2], frameRate: 5, repeat: -1 },
            { animation: 'walk', band: 0, range: [3, 10], frameRate: 13, repeat: -1 },
            { animation: 'hurt', band: 0, range: [11, 12], frameRate: 10 },
            { animation: 'guard', band: 0, order: [11], frameRate: 1, repeat: -1 },
            { animation: 'knockdown', band: 0, order: [12, 12], frameRate: 4 },
            { animation: 'jump', band: 25, range: [0, 5], frameRate: 9 },
            { animation: 'jab', band: 1, range: [0, 3], frameRate: 16 },
            { animation: 'pistol', band: 2, range: [0, 6], frameRate: 14 },
            { animation: 'whip', band: 6, range: [0, 8], frameRate: 15 },
            { animation: 'gatling', band: 10, range: [0, 7], frameRate: 16 },
            { animation: 'axe', band: 12, range: [0, 9], frameRate: 12 },
            { animation: 'gear3', band: 14, range: [0, 5], frameRate: 9 },
            { animation: 'fx-spark', band: 3, range: [0, 5], frameRate: 22 },
            { animation: 'fx-burst', band: 5, range: [2, 5], frameRate: 20 }
        ]
    },
    {
        id: 'lucci',
        texture: 'lucci',
        file: 'lucci.png',
        scale: 1,
        bands: [
            { animation: 'idle', band: 0, range: [0, 2], frameRate: 5, repeat: -1 },
            { animation: 'walk', band: 1, range: [0, 7], frameRate: 12, repeat: -1 },
            { animation: 'jump', band: 3, range: [0, 6], frameRate: 10 },
            { animation: 'guard', band: 6, range: [0, 1], frameRate: 8, repeat: -1 },
            { animation: 'hurt', band: 5, range: [0, 2], frameRate: 10 },
            { animation: 'knockdown', band: 5, range: [3, 5], frameRate: 8 },
            { animation: 'shigan', band: 7, range: [0, 4], frameRate: 17 },
            { animation: 'leopard', band: 11, range: [0, 4], frameRate: 13 },
            { animation: 'rankyaku', band: 10, range: [0, 7], frameRate: 14 },
            { animation: 'rokuogan', band: 13, range: [0, 10], frameRate: 12 },
            { animation: 'fx-slash', band: 8, range: [1, 5], frameRate: 18 }
        ]
    },
    {
        id: 'crocodile',
        texture: 'crocodile',
        file: 'crocodile.png',
        scale: 1,
        // This rip packs its rows one pixel apart, so the default gap of three
        // empty scanlines swallows five rows into one band.
        segment: { rowGap: 1 },
        ignore: [
            { left: 0, top: 0, right: 128, bottom: 208, reason: 'logo Baroque Works' },
            { left: 466, top: 332, right: 924, bottom: 596, reason: 'portraits de cinematique' }
        ],
        bands: [
            { animation: 'idle', band: 0, range: [0, 5], frameRate: 5, repeat: -1 },
            { animation: 'walk', band: 1, range: [0, 9], frameRate: 11, repeat: -1 },
            { animation: 'hurt', band: 3, range: [0, 3], frameRate: 10 },
            { animation: 'knockdown', band: 3, range: [4, 5], frameRate: 8 },
            { animation: 'jump', band: 4, range: [6, 11], frameRate: 10 },
            { animation: 'guard', band: 3, order: [0], frameRate: 1, repeat: -1 },
            { animation: 'slash', band: 9, range: [0, 7], frameRate: 15 },
            { animation: 'spada', band: 11, range: [0, 7], frameRate: 15 },
            { animation: 'fx-sand', band: 6, range: [1, 5], frameRate: 16 }
        ]
    },
    {
        id: 'enel',
        texture: 'enel',
        file: 'enel.png',
        scale: 1,
        bands: [
            { animation: 'idle', band: 0, range: [0, 2], frameRate: 5, repeat: -1 },
            { animation: 'walk', band: 1, range: [1, 6], frameRate: 12, repeat: -1 },
            { animation: 'jump', band: 2, range: [1, 6], frameRate: 10 },
            { animation: 'guard', band: 3, range: [0, 1], frameRate: 6, repeat: -1 },
            { animation: 'hurt', band: 4, range: [0, 3], frameRate: 10 },
            { animation: 'knockdown', band: 4, range: [4, 8], frameRate: 8 },
            { animation: 'staff', band: 6, range: [0, 7], frameRate: 14 },
            { animation: 'thunder', band: 10, range: [0, 10], frameRate: 13 },
            { animation: 'fx-bolt', band: 11, range: [6, 9], frameRate: 16 }
        ]
    }
];
