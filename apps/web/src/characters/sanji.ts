import manifest from '../generated/sprites/sanji.json';
import type { CharacterDef, SpriteManifest } from '../engine/types';

/**
 * Sanji — never uses his hands. Fast kicks with long legs, the Party Table
 * as an invincible spinning anti-air, and Diable Jambe for the fire moves:
 * Premier Hachis, Flambage Shot, the ultimate Poêle à Frire : Spectre and the
 * two-bar Hell Memories (rows 40–41 and the flaming handstand kick of row 7).
 *
 * Rows come from the Gigant Battle 2 sheet (see tools/sprites/chars/sanji.json);
 * the fire moves use the sheet's own flame-leg frames.
 * Every `durations` array has exactly one entry per animation frame.
 */
export const sanji: CharacterDef = {
    id: 'sanji',
    name: 'Sanji',
    title: 'Jambe noire',
    health: 960,
    walk: 1.9,
    back: 1.4,
    dash: 4.8,
    backdash: [3.8, 2.6],
    jump: [2.4, 7.3],
    gravity: 0.36,
    width: 10,
    height: 62,
    crouchHeight: 38,
    color: '#e8b830',
    manifest: manifest as unknown as SpriteManifest,
    moves: {
        lightA: {
            name: 'Coup de pied direct', anim: 'lightA', kind: 'normal', stance: 'stand',
            durations: [3, 3, 3, 6],
            hits: [{ frames: [1, 2], box: 'auto', damage: 28, guard: 'mid', hitstun: 14, blockstun: 9, push: 6, hitstop: 6 }],
            chain: ['lightB', 'crouchLight', 'heavy', 'heavyFwd', 'heavyBack', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        lightB: {
            name: 'Croissant', anim: 'lightB', kind: 'normal', stance: 'stand',
            durations: [3, 3, 3, 4, 7],
            hits: [{ frames: [2, 3], box: [4, 18, 36, 48], damage: 34, guard: 'mid', hitstun: 16, blockstun: 10, push: 7, hitstop: 7 }],
            chain: ['lightC', 'heavy', 'heavyFwd', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        lightC: {
            name: 'Poitrine Shot', anim: 'lightC', kind: 'normal', stance: 'stand',
            durations: [3, 3, 2, 3, 3, 4, 5, 6],
            hits: [{ frames: [3, 5], box: [4, 14, 42, 60], damage: 50, guard: 'mid', hitstun: 18, blockstun: 12, push: 20, hitstop: 9, spark: 'heavy' }],
            cancelable: true, sfx: 'swingHeavy'
        },
        crouchLight: {
            name: 'Coup de pied bas', anim: 'crouchLight', kind: 'normal', stance: 'crouch',
            durations: [3, 4, 6],
            hits: [{ frames: [1, 1], box: [6, 2, 30, 16], damage: 24, guard: 'low', hitstun: 12, blockstun: 8, push: 8, hitstop: 6 }],
            chain: ['crouchLight', 'lightB', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        crouchHeavy: {
            name: 'Glissade', anim: 'crouchHeavy', kind: 'normal', stance: 'crouch',
            durations: [6, 3, 4, 5, 10],
            motion: [[1, 2.4, 0], [3, 0, 0]],
            hits: [{ frames: [1, 3], box: [6, 0, 42, 18], damage: 64, guard: 'low', hitstun: 20, blockstun: 12, push: 14, knockdown: true, launch: [1.2, 2.6], hitstop: 10, spark: 'heavy' }],
            cancelable: true, sfx: 'swingHeavy'
        },
        heavy: {
            name: 'Collier Shot', anim: 'heavy', kind: 'normal', stance: 'stand',
            durations: [5, 4, 3, 4, 4, 5, 7],
            hits: [{ frames: [2, 4], box: [6, 30, 42, 22], damage: 70, guard: 'mid', hitstun: 21, blockstun: 14, push: 20, hitstop: 11, spark: 'heavy', shake: 2 }],
            cancelable: true, sfx: 'swingHeavy'
        },
        heavyFwd: {
            name: 'Épaule Shot', anim: 'heavyFwd', kind: 'normal', stance: 'stand',
            durations: [2, 2, 2, 2, 2, 3, 4, 5, 5, 6],
            motion: [[2, 1.2, 0], [5, 0, 0]],
            hits: [{ frames: [5, 6], box: [4, 0, 44, 66], damage: 78, guard: 'high', hitstun: 22, blockstun: 14, push: 14, hitstop: 12, spark: 'heavy', shake: 3 }],
            cancelable: true, sfx: 'swingHeavy'
        },
        heavyBack: {
            name: 'Anti-Manner Kick Course', anim: 'heavyBack', kind: 'normal', stance: 'stand',
            durations: [3, 2, 2, 3, 3, 4, 5, 5, 6],
            hits: [{ frames: [3, 5], box: [0, 16, 36, 74], damage: 64, guard: 'mid', hitstun: 22, blockstun: 12, push: 8, launch: [0.6, 6.6], hitstop: 10, spark: 'heavy' }],
            invuln: [2, 3],
            cancelable: true, sfx: 'swingHeavy'
        },
        airLight: {
            name: 'Coup de pied aérien', anim: 'airLight', kind: 'normal', stance: 'air',
            durations: [4, 10],
            hits: [{ frames: [0, 1], box: [0, 10, 36, 22], damage: 32, guard: 'high', hitstun: 14, blockstun: 9, push: 8, hitstop: 7 }],
            chain: ['airHeavy'], cancelable: true, sfx: 'swing'
        },
        airHeavy: {
            name: 'Croissant aérien', anim: 'airHeavy', kind: 'normal', stance: 'air',
            durations: [4, 4, 5, 5, 8],
            hits: [{ frames: [1, 3], box: 'auto', damage: 66, guard: 'high', hitstun: 18, blockstun: 12, push: 12, hitstop: 10, spark: 'heavy' }],
            cancelable: true, landLag: 5, sfx: 'swingHeavy'
        },
        airSpecial: {
            name: 'Flanchet Strasse', anim: 'airSpecial', kind: 'special', stance: 'air',
            durations: [3, 3, 3, 30, 4, 4, 4, 8],
            motion: [[0, 0.4, 1.0], [3, 4.0, -3.6]],
            noGravity: true, landFrame: 7,
            hits: [{ frames: [3, 6], box: [-4, -6, 40, 36], damage: 78, guard: 'high', hitstun: 20, blockstun: 14, push: 18, knockdown: true, launch: [2.0, 3.2], hitstop: 12, spark: 'heavy', shake: 3 }],
            sfx: 'swingHeavy'
        },
        specialN: {
            name: 'Diable Jambe — Premier Hachis', anim: 'specialN', kind: 'special', stance: 'stand',
            durations: [3, 2, 2, 2, 2, 2, 2, 3, 4, 4, 4, 6, 8],
            hits: [
                { frames: [7, 9], box: [4, 0, 56, 52], damage: 20, guard: 'mid', hitstun: 22, blockstun: 10, push: 3, rehit: 4, hitstop: 4, spark: 'fire' },
                { frames: [10, 10], box: [4, 0, 56, 52], damage: 48, guard: 'mid', hitstun: 26, blockstun: 16, push: 24, launch: [3.6, 4.0], hitstop: 12, spark: 'fire', shake: 4 }
            ],
            fx: [[1, 'fx_flame', 2, 8]],
            sfx: 'fire'
        },
        specialF: {
            name: 'Diable Jambe — Flambage Shot', anim: 'specialF', kind: 'special', stance: 'stand',
            durations: [3, 3, 2, 2, 2, 2, 4, 4, 3, 3, 3, 3, 6, 8],
            motion: [[2, 2.6, 0], [4, 3.4, 0], [6, 3.2, 0], [8, 0.6, 0], [10, 0, 0]],
            hits: [{ frames: [6, 8], box: [0, 4, 54, 44], damage: 100, guard: 'mid', hitstun: 24, blockstun: 14, push: 24, launch: [4.4, 3.6], wallBounce: true, hitstop: 13, spark: 'fire', shake: 5 }],
            sfx: 'fire'
        },
        specialU: {
            name: 'Party Table Kick Course', anim: 'specialU', kind: 'special', stance: 'stand',
            durations: [3, 3, 3, 4, 4, 4, 4, 5, 5, 6, 7],
            invuln: [0, 4],
            hits: [{ frames: [2, 6], box: [-10, 6, 48, 96], damage: 30, guard: 'mid', hitstun: 26, blockstun: 12, push: 4, rehit: 5, launch: [1.0, 6.4], hitstop: 7, spark: 'heavy', shake: 2 }],
            sfx: 'swingHeavy'
        },
        specialD: {
            name: 'Concassé', anim: 'specialD', kind: 'special', stance: 'stand',
            durations: [3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 6, 6],
            motion: [[2, 2.4, 4.4], [8, 0, 0]],
            hits: [{ frames: [8, 9], box: [-4, 0, 48, 44], damage: 110, guard: 'high', hitstun: 26, blockstun: 18, push: 20, knockdown: true, launch: [2.4, 4.2], hitstop: 15, spark: 'big', shake: 6 }],
            sfx: 'swingHeavy'
        },
        ultimate: {
            name: 'Poêle à Frire : Spectre', anim: 'ultimate', kind: 'ultimate', stance: 'stand',
            durations: [
                4, 4, 4,
                3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
                3, 3, 3, 3,
                3, 3, 3, 3, 3, 3, 3, 3,
                4, 4,
                3, 3, 3,
                3, 3, 3, 3,
                10, 14
            ],
            superFreeze: 55, cost: 100, invuln: [0, 6],
            motion: [[0, 5.6, 0], [3, 0, 0], [33, 3.0, 0], [36, 0, 0]],
            hits: [
                { frames: [3, 18], box: [-4, 0, 74, 76], damage: 70, guard: 'mid', hitstun: 70, blockstun: 16, push: 1, rehit: 24, hitstop: 8, spark: 'fire', shake: 3 },
                { frames: [20, 22], box: [-4, 0, 74, 80], damage: 70, guard: 'mid', hitstun: 70, blockstun: 16, push: 1, hitstop: 9, spark: 'fire', shake: 3 },
                { frames: [24, 30], box: [-4, 0, 78, 76], damage: 60, guard: 'mid', hitstun: 70, blockstun: 16, push: 1, hitstop: 8, spark: 'fire', shake: 3 },
                { frames: [36, 39], box: [-4, 0, 78, 60], damage: 40, guard: 'mid', hitstun: 70, blockstun: 16, push: 1, hitstop: 6, spark: 'heavy', shake: 2 },
                { frames: [40, 40], box: [-4, 0, 80, 76], damage: 200, guard: 'mid', hitstun: 70, blockstun: 22, push: 34, launch: [6.4, 5.4], wallBounce: true, hitstop: 24, spark: 'big', shake: 10 }
            ],
            fx: [[3, 'fx_fireBig', 30, 36], [20, 'fx_flame', 28, 50], [40, 'fx_spectre', 44, 36]],
            sfx: 'fire'
        },
        ultimate2: {
            name: 'Diable Jambe — Hell Memories', anim: 'ultimate2', kind: 'ultimate', stance: 'stand',
            durations: [
                4, 4, 4, 3, 3, 3, 3, 3, 3, 4,
                3, 3, 3,
                5, 5, 5,
                3, 3,
                3, 3, 3, 3,
                4, 4,
                3, 3, 3, 3,
                3, 4, 4, 5,
                6, 10, 14
            ],
            superFreeze: 70, cost: 200, invuln: [0, 12],
            motion: [[6, 2.6, 0], [10, 6.0, 0], [13, 0.8, 0], [16, 0, 0], [18, 1.2, 0], [22, 0, 0], [26, 1.6, 0], [29, 0, 0]],
            hits: [
                { frames: [13, 15], box: [-12, 0, 92, 92], damage: 80, guard: 'mid', hitstun: 70, blockstun: 20, push: 1, rehit: 8, hitstop: 10, spark: 'fire', shake: 5 },
                { frames: [18, 19], box: [-4, 0, 80, 84], damage: 90, guard: 'mid', hitstun: 70, blockstun: 18, push: 1, hitstop: 9, spark: 'fire', shake: 4 },
                { frames: [20, 21], box: [-20, 0, 96, 70], damage: 90, guard: 'mid', hitstun: 70, blockstun: 18, push: 1, hitstop: 9, spark: 'fire', shake: 4 },
                { frames: [29, 31], box: [-4, 0, 96, 90], damage: 250, guard: 'mid', hitstun: 60, blockstun: 26, push: 36, launch: [6.8, 6.0], wallBounce: true, hitstop: 26, spark: 'big', shake: 12, sfx: 'fire' }
            ],
            fx: [[13, 'fx_fireBig', 40, 40], [29, 'fx_hellMemories', 56, 44]],
            sfx: 'fire'
        },
        throw: {
            name: 'Mouton Shot', anim: 'throw', kind: 'throw', stance: 'stand',
            durations: [3, 4, 4, 3, 3, 4, 4, 5, 8],
            hits: [{ frames: [0, 1], box: [4, 10, 30, 40], damage: 0, guard: 'unblockable', hitstun: 0, blockstun: 0, push: 0 }],
            throwRelease: { frame: 4, damage: 105, launch: [2.4, 5.6] },
            sfx: 'grab'
        }
    }
};
