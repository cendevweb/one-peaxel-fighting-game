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
    /**
     * Mirror this animation horizontally.
     *
     * A rip is not consistent about which way its fighter faces: Luffy's
     * Gum-Gum Pistol is drawn shooting left while his Gatling is drawn
     * punching right, on the same sheet. The renderer flips a fighter as a
     * whole, so a row drawn the wrong way round plays backwards — the arm
     * leaves through the fighter's back. Flipping is per animation because
     * the sheet is inconsistent per row.
     */
    flip?: boolean;
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
            { animation: 'jump', band: 34, range: [5, 9], frameRate: 9 },
            { animation: 'hurt', band: 74, range: [0, 1], frameRate: 9 },
            { animation: 'knockdown', band: 74, range: [2, 7], frameRate: 8 },
            // Six moves, six rows. The rip carries a dedicated animation for
            // every one of them; the first cut of this file reused three.
            { animation: 'punch', band: 1, range: [0, 8], frameRate: 15 },
            { animation: 'hound', band: 7, range: [0, 6], frameRate: 11 },
            // Read left to right this row shows the magma ball shrinking; it is the
            // ball being *formed*, drawn backwards. Played in sheet order the
            // punch ends with an empty fist.
            { animation: 'meigo', band: 8, order: [6, 5, 4, 3, 2, 1, 0], frameRate: 13 },
            { animation: 'funka', band: 6, range: [0, 11], frameRate: 10 },
            { animation: 'reach', band: 41, range: [0, 8], frameRate: 14 },
            { animation: 'smash', band: 37, range: [0, 9], frameRate: 13 },
            // The magma. Eight rows of it sit beside the fighter in the rip and
            // none of it was published before.
            { animation: 'fx-magma', band: 2, range: [0, 3], frameRate: 12 },
            { animation: 'fx-comet', band: 4, range: [3, 8], frameRate: 14 },
            { animation: 'fx-eruption', band: 10, range: [0, 8], frameRate: 12 },
            { animation: 'fx-burst', band: 38, range: [0, 10], frameRate: 18 },
            { animation: 'fx-spikes', band: 35, range: [3, 11], frameRate: 16 },
            { animation: 'fx-rain', band: 36, range: [0, 5], frameRate: 12 }
        ]
    },
    {
        id: 'luffy',
        texture: 'luffy',
        file: 'luffy.png',
        scale: 1,
        // This rip letters its impacts: a dozen rows carry a katakana sound
        // effect drawn at sprite size, right next to the frames it belongs to.
        // Segmentation cannot tell "ドドド" from a puff of smoke, and a label
        // left in becomes a frame of the move — Luffy's whip used to flash a
        // word halfway through. The two Gear 3 cut-scene panels are worse: they
        // are 500 pixels tall and swallow the whole transformation row.
        ignore: [
            { left: 0, top: 345, right: 120, bottom: 405, reason: 'onomatopee ドドド' },
            { left: 520, top: 610, right: 645, bottom: 675, reason: 'onomatopee ドギュルルル' },
            { left: 383, top: 765, right: 545, bottom: 835, reason: 'onomatopee ブオッ' },
            { left: 540, top: 1230, right: 660, bottom: 1278, reason: 'onomatopee ドドド' },
            { left: 325, top: 2225, right: 475, bottom: 2285, reason: 'onomatopee ビッパァァ' },
            { left: 205, top: 2450, right: 282, bottom: 2505, reason: 'onomatopee ドドド' },
            { left: 235, top: 2815, right: 355, bottom: 2862, reason: 'onomatopee ギュルルル' },
            { left: 0, top: 2870, right: 318, bottom: 3060, reason: 'portrait Gear 2' },
            { left: 0, top: 3190, right: 490, bottom: 3455, reason: 'portrait et panneau de vitesse' },
            { left: 0, top: 3528, right: 165, bottom: 3628, reason: 'onomatopee' },
            { left: 0, top: 3630, right: 410, bottom: 3988, reason: 'panneaux de cinematique Gear 3' },
            { left: 400, top: 3630, right: 771, bottom: 3996, reason: 'panneaux de cinematique Gear 3' }
        ],
        bands: [
            { animation: 'idle', band: 0, range: [0, 2], frameRate: 5, repeat: -1 },
            { animation: 'walk', band: 0, range: [3, 10], frameRate: 13, repeat: -1 },
            { animation: 'hurt', band: 0, range: [11, 12], frameRate: 10 },
            { animation: 'guard', band: 0, order: [11], frameRate: 1, repeat: -1 },
            { animation: 'knockdown', band: 0, order: [12, 12], frameRate: 4 },
            { animation: 'jump', band: 25, range: [0, 5], frameRate: 9 },
            { animation: 'jab', band: 1, range: [0, 3], frameRate: 16 },
            { animation: 'gatling', band: 10, range: [0, 7], frameRate: 18 },
            { animation: 'pistol', band: 8, range: [0, 6], frameRate: 15, flip: true },
            // Gear 3. The row the first cut used only showed him inflating his
            // arm, which is why the ultimate never appeared to hit anything.
            // Band 40 is the Gear 3 wind-up and band 43 the Gigant Pistol, but
            // both are drawn well above their row's ground line and both end
            // on full-height motion blur: in game Luffy floated and the last
            // drawing became a slab across the screen. Band 41 is the landing
            // of the Gigant stamp — the giant foot with Luffy on top of it,
            // sitting on the row's own baseline — so it anchors correctly and
            // ends on a pose worth holding.
            { animation: 'gigant', band: 41, range: [0, 4], frameRate: 10 },
            { animation: 'whip', band: 26, range: [0, 6], frameRate: 15 },
            { animation: 'axe', band: 12, range: [0, 9], frameRate: 12 },
            { animation: 'fx-spark', band: 3, range: [0, 5], frameRate: 22 },
            { animation: 'fx-ring', band: 7, range: [0, 5], frameRate: 20 },
            { animation: 'fx-burst', band: 5, range: [0, 3], frameRate: 20 },
            { animation: 'fx-fire', band: 12, range: [10, 12], frameRate: 14 }
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
            { animation: 'rankyaku', band: 10, range: [0, 7], frameRate: 14 },
            { animation: 'madara', band: 12, range: [0, 9], frameRate: 16 },
            // The real Rokuogan: leopard form, the golden discharge, and the
            // shockwave rings that follow it. The row the first cut pointed at
            // was a leopard *running*.
            { animation: 'rokuogan', band: 26, order: [2, 1, 0, 5, 4], frameRate: 11 },
            { animation: 'air-kick', band: 18, range: [0, 4], frameRate: 15 },
            { animation: 'air-rankyaku', band: 20, range: [0, 8], frameRate: 14 },
            { animation: 'fx-spiral', band: 23, range: [0, 5], frameRate: 16 },
            { animation: 'fx-rings', band: 26, range: [6, 9], frameRate: 14 },
            { animation: 'fx-spikes', band: 30, range: [0, 6], frameRate: 16 }
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
            { left: 466, top: 332, right: 924, bottom: 596, reason: 'portraits de cinematique' },
            { left: 185, top: 1720, right: 924, bottom: 1870, reason: 'portraits de cinematique' },
            { left: 595, top: 1935, right: 924, bottom: 2018, reason: 'portrait de cinematique' },
            { left: 0, top: 2016, right: 924, bottom: 2514, reason: 'panneaux de tempete de sable' },
            { left: 795, top: 2570, right: 924, bottom: 2635, reason: 'credit du ripper' }
        ],
        bands: [
            { animation: 'idle', band: 0, range: [0, 5], frameRate: 5, repeat: -1 },
            { animation: 'walk', band: 1, range: [0, 9], frameRate: 11, repeat: -1 },
            // The old hurt opened on band 3's first frame, which the column profile
            // merges out of four overlapping coats: one frame showing four
            // Crocodiles at once. The real stagger, fall and wake-up are further
            // down the sheet, on their own row.
            { animation: 'hurt', band: 23, range: [0, 3], frameRate: 10 },
            { animation: 'knockdown', band: 23, range: [4, 8], frameRate: 8 },
            { animation: 'guard', band: 3, order: [1], frameRate: 1, repeat: -1 },
            { animation: 'jump', band: 4, range: [3, 7], frameRate: 10 },
            { animation: 'slash', band: 9, range: [0, 9], frameRate: 15 },
            { animation: 'spada', band: 11, range: [0, 11], frameRate: 14 },
            // The ranged sand combo: the arm stays out and the sand keeps
            // coming, which is the row this sheet always had and the game
            // never used.
            { animation: 'sables', band: 17, range: [0, 11], frameRate: 14 },
            { animation: 'girasole', band: 19, range: [0, 11], frameRate: 12 },
            { animation: 'air-hook', band: 14, range: [0, 8], frameRate: 15 },
            { animation: 'grave', band: 15, range: [0, 9], frameRate: 13 },
            { animation: 'fx-sand', band: 6, range: [2, 5], frameRate: 16 },
            { animation: 'fx-serpent', band: 7, range: [3, 6], frameRate: 14 },
            { animation: 'fx-tornado', band: 19, range: [12, 14], frameRate: 12 },
            { animation: 'fx-burst', band: 24, range: [1, 6], frameRate: 14 }
        ]
    },
    {
        id: 'enel',
        texture: 'enel',
        file: 'enel.png',
        scale: 1,
        // "Run:" and "Dash:" are printed over the first frame of their own row,
        // so the first run frame used to be unusable and the walk cycle started
        // on its second step.
        ignore: [
            { left: 0, top: 126, right: 135, bottom: 158, reason: 'etiquette Run:' },
            { left: 765, top: 128, right: 905, bottom: 154, reason: 'etiquette Dash:' },
            { left: 1670, top: 4635, right: 1745, bottom: 4680, reason: 'etiquette x5' },
            { left: 8, top: 2472, right: 38, bottom: 2502, reason: 'icone de commande du Raigo' }
        ],
        bands: [
            { animation: 'idle', band: 0, range: [0, 2], frameRate: 5, repeat: -1 },
            { animation: 'walk', band: 1, range: [0, 6], frameRate: 12, repeat: -1 },
            { animation: 'jump', band: 2, range: [1, 6], frameRate: 10 },
            { animation: 'guard', band: 3, range: [0, 1], frameRate: 6, repeat: -1 },
            { animation: 'hurt', band: 4, range: [0, 3], frameRate: 10 },
            { animation: 'knockdown', band: 4, range: [4, 8], frameRate: 8 },
            { animation: 'staff', band: 6, range: [0, 7], frameRate: 14 },
            { animation: 'elthor', band: 16, range: [0, 5], frameRate: 12 },
            { animation: 'bolt', band: 11, range: [0, 7], frameRate: 14 },
            // The ultimate mode: Enel raises his staff and the storm closes
            // over him. Everything below was in the rip from the start, which
            // is why "the Raigo is just a staff hit" was a fair complaint.
            { animation: 'raigo', band: 24, range: [0, 7], frameRate: 8 },
            { animation: 'air-staff', band: 20, range: [0, 4], frameRate: 15 },
            { animation: 'air-swing', band: 22, range: [0, 9], frameRate: 14 },
            { animation: 'fx-bolt', band: 11, range: [8, 9], frameRate: 16 },
            { animation: 'fx-pillar', band: 29, range: [0, 6], frameRate: 12 },
            { animation: 'fx-raigo', band: 35, range: [0, 8], frameRate: 12 },
            { animation: 'fx-spark', band: 26, range: [8, 11], frameRate: 16 },
            { animation: 'fx-dragon', band: 38, range: [0, 9], frameRate: 14 }
        ]
    }
];
