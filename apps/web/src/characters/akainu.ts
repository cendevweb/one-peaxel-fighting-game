import manifest from '../generated/sprites/akainu.json';
import type { CharacterDef, SpriteManifest } from '../engine/types';

/**
 * Akainu (Sakazuki) — the heavy powerhouse. Slow on his feet, the most
 * health on the roster, and every hit hurts: a magma fist that crosses the
 * screen (Dai Funka), a hellhound rush (Meigo), eruptions from the ground,
 * and a meteor rain for the ultimate (Ryusei Kazan).
 *
 * Every `durations` array has exactly one entry per frame of the animation
 * it plays (see tools/sprites/chars/akainu.json); a test checks it.
 */
export const akainu: CharacterDef = {
    id: 'akainu',
    name: 'Akainu',
    title: 'Amiral de la Marine',
    health: 1100,
    walk: 1.2,
    back: 0.95,
    dash: 3.6,
    backdash: [3.0, 2.3],
    jump: [2.0, 6.8],
    gravity: 0.38,
    width: 15,
    height: 74,
    crouchHeight: 50,
    color: '#b3202a',
    manifest: manifest as unknown as SpriteManifest,
    moves: {
        lightA: {
            name: 'Direct de lave', anim: 'lightA', kind: 'normal', stance: 'stand',
            durations: [4, 3, 4, 6],
            hits: [{ frames: [1, 2], box: 'auto', damage: 36, guard: 'mid', hitstun: 14, blockstun: 9, push: 10, hitstop: 7 }],
            chain: ['lightB', 'crouchLight', 'heavy', 'heavyFwd', 'heavyBack', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        lightB: {
            name: 'Revers du poing', anim: 'lightB', kind: 'normal', stance: 'stand',
            durations: [4, 3, 3, 4, 7],
            hits: [{ frames: [1, 3], box: [6, 30, 30, 30], damage: 40, guard: 'mid', hitstun: 16, blockstun: 10, push: 12, hitstop: 8 }],
            chain: ['lightC', 'heavy', 'heavyFwd', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        lightC: {
            name: 'Poing magmatique', anim: 'lightC', kind: 'normal', stance: 'stand',
            durations: [6, 4, 5, 6, 8],
            motion: [[1, 1.4, 0], [3, 0, 0]],
            hits: [{ frames: [1, 3], box: 'auto', damage: 62, guard: 'mid', hitstun: 19, blockstun: 13, push: 22, hitstop: 10, spark: 'fire' }],
            cancelable: true, sfx: 'swingHeavy'
        },
        crouchLight: {
            name: 'Coup bas', anim: 'crouchLight', kind: 'normal', stance: 'crouch',
            durations: [4, 4, 6],
            hits: [{ frames: [1, 1], box: [6, 2, 28, 22], damage: 30, guard: 'low', hitstun: 12, blockstun: 8, push: 8, hitstop: 6 }],
            chain: ['crouchLight', 'lightB', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        crouchHeavy: {
            name: 'Frappe du sol', anim: 'crouchHeavy', kind: 'normal', stance: 'crouch',
            durations: [7, 5, 3, 3, 4, 9, 11],
            hits: [{ frames: [2, 4], box: [8, 0, 40, 20], damage: 80, guard: 'low', hitstun: 22, blockstun: 13, push: 14, knockdown: true, launch: [1.2, 2.4], hitstop: 12, spark: 'magma', shake: 3 }],
            cancelable: true, sfx: 'magma'
        },
        heavy: {
            name: 'Ruée du volcan', anim: 'heavy', kind: 'normal', stance: 'stand',
            durations: [8, 5, 4, 3, 4, 5, 8, 9],
            motion: [[2, 2.6, 0], [4, 0, 0]],
            hits: [{ frames: [3, 5], box: 'auto', damage: 88, guard: 'mid', hitstun: 22, blockstun: 15, push: 22, hitstop: 12, spark: 'heavy', shake: 3 }],
            cancelable: true, sfx: 'swingHeavy'
        },
        heavyFwd: {
            name: 'Marteau de lave (coup haut)', anim: 'heavyFwd', kind: 'normal', stance: 'stand',
            durations: [7, 6, 6, 4, 4, 6, 8, 9],
            hits: [{ frames: [3, 4], box: [4, 0, 40, 76], damage: 95, guard: 'high', hitstun: 23, blockstun: 15, push: 14, hitstop: 13, spark: 'magma', shake: 5 }],
            cancelable: true, sfx: 'swingHeavy'
        },
        heavyBack: {
            name: 'Uppercut de magma', anim: 'heavyBack', kind: 'normal', stance: 'stand',
            durations: [5, 4, 4, 3, 4, 5, 7, 7, 8],
            hits: [{ frames: [3, 5], box: 'auto', damage: 80, guard: 'mid', hitstun: 22, blockstun: 12, push: 8, launch: [0.6, 6.6], hitstop: 11, spark: 'fire' }],
            cancelable: true, sfx: 'swingHeavy'
        },
        airLight: {
            name: 'Direct aérien', anim: 'airLight', kind: 'normal', stance: 'air',
            durations: [5, 11],
            hits: [{ frames: [0, 1], box: 'auto', damage: 40, guard: 'high', hitstun: 15, blockstun: 9, push: 8, hitstop: 7 }],
            chain: ['airHeavy'], cancelable: true, sfx: 'swing'
        },
        airHeavy: {
            name: 'Poing céleste', anim: 'airHeavy', kind: 'normal', stance: 'air',
            durations: [5, 4, 5, 7, 10],
            hits: [{ frames: [1, 3], box: 'auto', damage: 78, guard: 'high', hitstun: 19, blockstun: 12, push: 12, hitstop: 11, spark: 'fire' }],
            cancelable: true, landLag: 7, sfx: 'swingHeavy'
        },
        airSpecial: {
            name: 'Chute volcanique', anim: 'airSpecial', kind: 'special', stance: 'air',
            durations: [6, 5, 30, 7, 12],
            motion: [[2, 2.8, -6.0]],
            noGravity: true, landFrame: 3,
            hits: [{ frames: [2, 3], box: [-6, -4, 40, 40], damage: 95, guard: 'high', hitstun: 21, blockstun: 14, push: 18, knockdown: true, launch: [1.8, 3.4], hitstop: 13, spark: 'magma', shake: 5 }],
            fx: [[3, 'fx_eruption', 26, 0]],
            sfx: 'magma'
        },
        specialN: {
            name: 'Dai Funka', anim: 'specialN', kind: 'special', stance: 'stand',
            durations: [9, 5, 4, 4, 8, 6, 7, 9],
            projectile: {
                anim: 'fx_daifunka', atFrame: 3, offset: [44, 48], speed: 3.2, life: 80,
                box: [-40, -16, 88, 32], fps: 10, hits: 1,
                hit: { damage: 90, guard: 'mid', hitstun: 22, blockstun: 16, push: 24, knockdown: true, launch: [3.0, 3.2], hitstop: 12, spark: 'magma', shake: 4 }
            },
            hits: [],
            sfx: 'magma'
        },
        specialF: {
            name: 'Meigo', anim: 'specialF', kind: 'special', stance: 'stand',
            durations: [5, 5, 5, 4, 3, 3, 3, 4, 4, 4, 5, 6, 8, 9],
            motion: [[3, 5.2, 0], [6, 1.6, 0], [8, 0, 0]],
            hits: [{ frames: [6, 9], box: 'auto', damage: 135, guard: 'mid', hitstun: 26, blockstun: 18, push: 30, launch: [4.8, 4.0], wallBounce: true, hitstop: 16, spark: 'magma', shake: 7 }],
            fx: [[7, 'fx_hound', 64, 46]],
            sfx: 'magma'
        },
        specialU: {
            name: 'Colonne éruptive', anim: 'specialU', kind: 'special', stance: 'stand',
            durations: [4, 4, 5, 5, 6, 8, 12],
            invuln: [0, 3],
            hits: [{ frames: [2, 4], box: [0, 0, 40, 104], damage: 120, guard: 'mid', hitstun: 26, blockstun: 18, push: 10, launch: [1.0, 7.4], hitstop: 13, spark: 'fire', shake: 5 }],
            fx: [[2, 'fx_geyser', 24, 0]],
            sfx: 'fire'
        },
        specialD: {
            name: 'Éruption', anim: 'specialD', kind: 'special', stance: 'stand',
            durations: [6, 5, 5, 4, 5, 6, 10, 12],
            hits: [{ frames: [4, 6], box: [40, 0, 44, 110], damage: 115, guard: 'mid', hitstun: 26, blockstun: 18, push: 12, launch: [1.2, 7.0], hitstop: 14, spark: 'magma', shake: 6 }],
            fx: [[3, 'fx_eruption', 62, 0]],
            sfx: 'magma'
        },
        ultimate: {
            name: 'Ryusei Kazan', anim: 'ultimate', kind: 'ultimate', stance: 'stand',
            durations: [5, 5, 5, 6, 6, 6, 8, 8, 8, 8, 8, 10, 10, 12],
            superFreeze: 55, cost: 100, invuln: [0, 6],
            hits: [
                { frames: [6, 10], box: [10, 0, 160, 130], damage: 50, guard: 'mid', hitstun: 40, blockstun: 18, push: 3, rehit: 8, hitstop: 5, spark: 'magma', shake: 6 },
                { frames: [11, 11], box: [10, 0, 160, 130], damage: 150, guard: 'mid', hitstun: 40, blockstun: 20, push: 30, knockdown: true, launch: [5.0, 5.2], wallBounce: true, hitstop: 22, spark: 'big', shake: 10 }
            ],
            fx: [
                [6, 'fx_meteor', 50, 70],
                [7, 'fx_meteor', 110, 80],
                [8, 'fx_meteor', 70, 64],
                [9, 'fx_meteor', 140, 76],
                [10, 'fx_meteor', 90, 70],
                [11, 'fx_burst', 90, 24],
                [11, 'fx_eruption', 120, 0]
            ],
            sfx: 'magma'
        },
        throw: {
            name: 'Poigne de magma', anim: 'throw', kind: 'throw', stance: 'stand',
            durations: [4, 5, 5, 4, 4, 5, 8, 10],
            hits: [{ frames: [0, 1], box: [4, 12, 32, 48], damage: 0, guard: 'unblockable', hitstun: 0, blockstun: 0, push: 0 }],
            throwRelease: { frame: 3, damage: 125, launch: [3.6, 4.0] },
            sfx: 'grab'
        }
    }
};
