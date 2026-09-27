import manifest from '../generated/sprites/shanks.json';
import type { CharacterDef, SpriteManifest } from '../engine/types';

/**
 * « Le Roux » Shanks — one of the Four Emperors, a one-armed swordsman
 * whose sword is drenched in Conqueror's haki. Fast Gryphon slashes, a
 * kick charged with haki, a flying crimson crescent at mid range, a rush
 * that crosses the screen, a rising thrust as his reversal and the
 * Haoshoku burst that leaves the foe stunned; Kamusari (Divine Departure)
 * is the ultimate: one huge crimson slash that splits the ground.
 *
 * Every animation and effect comes from the Gigant Battle 2 sheet
 * (tools/sprites/chars/shanks.json): the crimson crescents, the haki arches
 * and the Kamusari wave are the sheet's own effect rows. Every `durations`
 * array has one entry per animation frame.
 */
export const shanks: CharacterDef = {
    id: 'shanks',
    name: 'Shanks',
    title: 'Le Roux',
    health: 1040,
    walk: 1.7,
    back: 1.35,
    dash: 5.0,
    backdash: [3.8, 2.6],
    jump: [2.3, 7.2],
    gravity: 0.37,
    width: 12,
    height: 66,
    crouchHeight: 46,
    color: '#b3202a',
    manifest: manifest as unknown as SpriteManifest,
    moves: {
        lightA: {
            name: 'Estoc de Gryphon', anim: 'lightA', kind: 'normal', stance: 'stand',
            durations: [3, 3, 3, 7],
            hits: [{ frames: [1, 2], box: [6, 34, 38, 22], damage: 30, guard: 'mid', hitstun: 14, blockstun: 9, push: 6, hitstop: 6, spark: 'cut' }],
            chain: ['lightB', 'crouchLight', 'heavy', 'heavyFwd', 'heavyBack', 'crouchHeavy'], cancelable: true, sfx: 'slash'
        },
        lightB: {
            name: 'Coup de pied tournant', anim: 'lightB', kind: 'normal', stance: 'stand',
            durations: [3, 3, 3, 3, 4, 7],
            hits: [{ frames: [2, 3], box: [4, 10, 32, 50], damage: 34, guard: 'mid', hitstun: 16, blockstun: 10, push: 7, hitstop: 7, spark: 'light' }],
            chain: ['lightC', 'heavy', 'heavyFwd', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        lightC: {
            name: 'Coup de pied du Haki', anim: 'lightC', kind: 'normal', stance: 'stand',
            durations: [4, 3, 3, 3, 5, 9],
            hits: [{ frames: [1, 3], box: [4, 14, 52, 42], damage: 50, guard: 'mid', hitstun: 18, blockstun: 12, push: 20, hitstop: 9, spark: 'heavy', shake: 2 }],
            cancelable: true, sfx: 'swingHeavy'
        },
        crouchLight: {
            name: 'Estoc rasant', anim: 'crouchLight', kind: 'normal', stance: 'crouch',
            durations: [3, 4, 6],
            hits: [{ frames: [1, 1], box: [6, 0, 50, 16], damage: 24, guard: 'low', hitstun: 12, blockstun: 8, push: 8, hitstop: 6, spark: 'cut' }],
            chain: ['crouchLight', 'lightB', 'crouchHeavy'], cancelable: true, sfx: 'slash'
        },
        crouchHeavy: {
            name: 'Taille rasante', anim: 'crouchHeavy', kind: 'normal', stance: 'crouch',
            durations: [5, 3, 3, 4, 6, 10],
            hits: [{ frames: [2, 3], box: [6, 0, 50, 28], damage: 68, guard: 'low', hitstun: 20, blockstun: 12, push: 14, knockdown: true, launch: [1.2, 2.6], hitstop: 10, spark: 'blade' }],
            cancelable: true, sfx: 'slash'
        },
        heavy: {
            name: 'Taille en croissant', anim: 'heavy', kind: 'normal', stance: 'stand',
            durations: [4, 4, 3, 4, 4, 6, 8],
            hits: [{ frames: [3, 4], box: [2, 8, 46, 80], damage: 74, guard: 'mid', hitstun: 21, blockstun: 14, push: 20, hitstop: 11, spark: 'blade', shake: 2 }],
            cancelable: true, sfx: 'slashHeavy'
        },
        heavyFwd: {
            name: 'Taille plongeante', anim: 'heavyFwd', kind: 'normal', stance: 'stand',
            durations: [5, 5, 4, 4, 5, 6, 7],
            hits: [{ frames: [2, 3], box: [4, 0, 46, 80], damage: 80, guard: 'high', hitstun: 22, blockstun: 14, push: 14, hitstop: 12, spark: 'blade', shake: 4 }],
            cancelable: true, sfx: 'slashHeavy'
        },
        heavyBack: {
            name: 'Taille ascendante', anim: 'heavyBack', kind: 'normal', stance: 'stand',
            durations: [4, 3, 3, 3, 4, 6, 8],
            hits: [{ frames: [2, 4], box: [0, 18, 44, 76], damage: 64, guard: 'mid', hitstun: 22, blockstun: 12, push: 8, launch: [0.6, 6.4], hitstop: 10, spark: 'blade' }],
            invuln: [1, 2],
            cancelable: true, sfx: 'slash'
        },
        airLight: {
            name: 'Estoc aérien', anim: 'airLight', kind: 'normal', stance: 'air',
            durations: [4, 5, 8],
            hits: [{ frames: [1, 1], box: [-2, -10, 42, 44], damage: 34, guard: 'high', hitstun: 14, blockstun: 9, push: 8, hitstop: 7, spark: 'cut' }],
            chain: ['airHeavy'], cancelable: true, sfx: 'slash'
        },
        airHeavy: {
            name: 'Croissant aérien', anim: 'airHeavy', kind: 'normal', stance: 'air',
            durations: [4, 4, 5, 8],
            hits: [{ frames: [1, 2], box: [-10, -20, 58, 62], damage: 66, guard: 'high', hitstun: 18, blockstun: 12, push: 12, hitstop: 10, spark: 'blade' }],
            cancelable: true, landLag: 5, sfx: 'slashHeavy'
        },
        airSpecial: {
            name: 'Estoc plongeant', anim: 'airSpecial', kind: 'special', stance: 'air',
            durations: [5, 30, 10],
            motion: [[1, 2.4, -6.4]],
            noGravity: true, landFrame: 2,
            hits: [{ frames: [1, 1], box: [-6, -8, 38, 50], damage: 82, guard: 'high', hitstun: 20, blockstun: 14, push: 16, knockdown: true, launch: [1.6, 3.6], hitstop: 12, spark: 'blade', shake: 4 }],
            fx: [[2, 'fx_ground', 14, 0]],
            sfx: 'slashHeavy'
        },
        specialN: {
            name: 'Onde tranchante du Haki', anim: 'specialN', kind: 'special', stance: 'stand',
            durations: [5, 4, 3, 4, 5, 6, 8],
            hits: [],
            projectile: {
                anim: 'fx_wave', atFrame: 2, offset: [40, 32], speed: 4.8, life: 80,
                box: [-14, -24, 28, 48], fps: 12, hits: 1,
                hit: { damage: 76, guard: 'mid', hitstun: 22, blockstun: 16, push: 18, hitstop: 11, spark: 'blade', shake: 2, sfx: 'slashHeavy' }
            },
            sfx: 'slashHeavy'
        },
        specialF: {
            name: 'Gryphon — ruée', anim: 'specialF', kind: 'special', stance: 'stand',
            durations: [5, 4, 4, 3, 5, 8, 8],
            motion: [[1, 6.4, 0], [3, 1.2, 0], [4, 0, 0]],
            hits: [{ frames: [2, 4], box: [-6, 4, 54, 54], damage: 94, guard: 'mid', hitstun: 24, blockstun: 14, push: 22, launch: [3.0, 3.6], hitstop: 14, spark: 'blade', shake: 4 }],
            fx: [[3, 'fx_line', 30, 34]],
            sfx: 'slashHeavy'
        },
        specialU: {
            name: 'Estoc céleste', anim: 'specialU', kind: 'special', stance: 'stand',
            durations: [3, 3, 3, 4, 5, 7, 10],
            motion: [[2, 1.4, 6.6]],
            invuln: [0, 3],
            hits: [
                { frames: [2, 3], box: [-8, 16, 48, 70], damage: 62, guard: 'mid', hitstun: 24, blockstun: 16, push: 8, launch: [0.8, 6.8], hitstop: 10, spark: 'blade', shake: 3 },
                { frames: [4, 5], box: [0, 30, 76, 64], damage: 46, guard: 'mid', hitstun: 24, blockstun: 16, push: 10, launch: [1.2, 7.4], hitstop: 10, spark: 'big', shake: 4 }
            ],
            fx: [[3, 'fx_streak', 50, 76]],
            sfx: 'slashHeavy'
        },
        specialD: {
            name: 'Haoshoku Haki', anim: 'specialD', kind: 'special', stance: 'stand',
            durations: [6, 6, 4, 4, 5, 8, 10],
            invuln: [0, 2],
            hits: [{ frames: [2, 4], box: [-34, 0, 100, 90], damage: 40, guard: 'mid', hitstun: 50, blockstun: 16, push: 14, hitstop: 16, spark: 'dark', shake: 6 }],
            fx: [[1, 'fx_haki', 0, 0]],
            sfx: 'dark'
        },
        ultimate: {
            name: 'Kamusari', anim: 'ultimate', kind: 'ultimate', stance: 'stand',
            durations: [8, 6, 6, 5, 5, 10, 5, 10, 12, 14],
            superFreeze: 55, cost: 100, invuln: [0, 7],
            motion: [[6, 7.2, 0], [7, 0, 0]],
            hits: [
                { frames: [6, 6], box: [-10, 0, 120, 110], damage: 110, guard: 'mid', hitstun: 50, blockstun: 20, push: 2, hitstop: 12, spark: 'blade', shake: 6 },
                { frames: [7, 7], box: [-10, 0, 120, 110], damage: 220, guard: 'mid', hitstun: 50, blockstun: 22, push: 30, launch: [5.8, 5.6], wallBounce: true, hitstop: 24, spark: 'big', shake: 10 }
            ],
            fx: [[6, 'fx_kamusari', 110, 0], [7, 'fx_ultburst', 70, 0]],
            sfx: 'slashHeavy'
        },
        throw: {
            name: 'Chute du Roux', anim: 'throw', kind: 'throw', stance: 'stand',
            durations: [3, 4, 5, 5, 5, 5, 6, 10],
            hits: [{ frames: [0, 1], box: [4, 10, 30, 40], damage: 0, guard: 'unblockable', hitstun: 0, blockstun: 0, push: 0 }],
            throwRelease: { frame: 6, damage: 110, launch: [2.4, 5.0] },
            fx: [[6, 'fx_rocks', 26, 0]],
            sfx: 'grab'
        }
    }
};
