import manifest from '../generated/sprites/law.json';
import type { CharacterDef, SpriteManifest } from '../engine/types';

/**
 * Trafalgar Law — the surgeon. Kicks and scabbard swings up close, the
 * nodachi Kikoku drawn for the long cuts, and the Ope Ope no Mi for the
 * rest: Radio Knife (the cyan flying cut), Injection Shot (the spinning
 * scabbard and the lunge), Takt (the rising thrust, his reversal),
 * Shambles — Counter Shock (a swap-dash into the electric palm), Gamma
 * Knife as the throw, and the Room — Amputate as the ultimate.
 *
 * Every animation and effect comes from the Gigant Battle 2 sheet
 * (tools/sprites/chars/law.json): the cyan slash arcs, the Room dome and the
 * Shambles ring are the sheet's own effect rows. Every `durations` array has
 * exactly one entry per animation frame.
 */
export const law: CharacterDef = {
    id: 'law',
    name: 'Law',
    title: 'Chirurgien de la mort',
    health: 980,
    walk: 1.7,
    back: 1.4,
    dash: 4.8,
    backdash: [3.8, 2.6],
    jump: [2.3, 7.2],
    gravity: 0.36,
    width: 11,
    height: 62,
    crouchHeight: 40,
    color: '#f0b429',
    manifest: manifest as unknown as SpriteManifest,
    moves: {
        lightA: {
            name: 'Coup de pied bas', anim: 'lightA', kind: 'normal', stance: 'stand',
            durations: [3, 3, 2, 3, 6],
            hits: [{ frames: [1, 2], box: [6, 4, 32, 26], damage: 30, guard: 'mid', hitstun: 14, blockstun: 9, push: 6, hitstop: 6 }],
            chain: ['lightB', 'crouchLight', 'heavy', 'heavyFwd', 'heavyBack', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        lightB: {
            name: 'Coup de pied circulaire', anim: 'lightB', kind: 'normal', stance: 'stand',
            durations: [3, 2, 3, 3, 3, 6],
            hits: [{ frames: [2, 3], box: [6, 14, 36, 34], damage: 34, guard: 'mid', hitstun: 17, blockstun: 10, push: 7, hitstop: 7 }],
            chain: ['lightC', 'heavy', 'heavyFwd', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        lightC: {
            name: 'Revers de fourreau', anim: 'lightC', kind: 'normal', stance: 'stand',
            durations: [4, 3, 4, 4, 5, 7],
            hits: [{ frames: [2, 3], box: [4, 14, 50, 36], damage: 52, guard: 'mid', hitstun: 19, blockstun: 12, push: 20, hitstop: 9, spark: 'heavy' }],
            cancelable: true, sfx: 'swingHeavy'
        },
        crouchLight: {
            name: 'Taille accroupie', anim: 'crouchLight', kind: 'normal', stance: 'crouch',
            durations: [3, 4, 6],
            hits: [{ frames: [1, 1], box: [6, 2, 40, 18], damage: 26, guard: 'low', hitstun: 12, blockstun: 8, push: 8, hitstop: 6, spark: 'cut' }],
            chain: ['crouchLight', 'lightB', 'crouchHeavy'], cancelable: true, sfx: 'slash'
        },
        crouchHeavy: {
            name: 'Balayage appuyé', anim: 'crouchHeavy', kind: 'normal', stance: 'crouch',
            durations: [6, 3, 4, 3, 5, 9],
            hits: [{ frames: [1, 2], box: [4, 0, 44, 20], damage: 66, guard: 'low', hitstun: 20, blockstun: 12, push: 14, knockdown: true, launch: [1.2, 2.6], hitstop: 10, spark: 'heavy' }],
            cancelable: true, sfx: 'swingHeavy'
        },
        heavy: {
            name: 'Kikoku — Iai', anim: 'heavy', kind: 'normal', stance: 'stand',
            durations: [3, 3, 3, 2, 4, 4, 6, 6],
            hits: [{ frames: [4, 5], box: [0, 10, 52, 56], damage: 74, guard: 'mid', hitstun: 22, blockstun: 14, push: 18, hitstop: 11, spark: 'room', shake: 2 }],
            cancelable: true, sfx: 'slashHeavy'
        },
        heavyFwd: {
            name: 'Kikoku — Taille plongeante', anim: 'heavyFwd', kind: 'normal', stance: 'stand',
            durations: [6, 5, 3, 4, 5, 7],
            motion: [[0, 1.8, 3.0]],
            landFrame: 4,
            hits: [{ frames: [2, 3], box: [0, -4, 44, 70], damage: 78, guard: 'high', hitstun: 22, blockstun: 14, push: 14, hitstop: 12, spark: 'room', shake: 3 }],
            cancelable: true, sfx: 'slash'
        },
        heavyBack: {
            name: 'Coup de pied ascendant', anim: 'heavyBack', kind: 'normal', stance: 'stand',
            durations: [4, 3, 3, 3, 4, 5, 6, 6],
            hits: [{ frames: [2, 4], box: [4, 18, 36, 70], damage: 64, guard: 'mid', hitstun: 22, blockstun: 12, push: 8, launch: [0.6, 6.4], hitstop: 10, spark: 'heavy' }],
            invuln: [2, 3],
            cancelable: true, sfx: 'swingHeavy'
        },
        airLight: {
            name: 'Coup de pied aérien', anim: 'airLight', kind: 'normal', stance: 'air',
            durations: [4, 6, 8],
            hits: [{ frames: [0, 1], box: [-2, -4, 34, 30], damage: 32, guard: 'high', hitstun: 14, blockstun: 9, push: 8, hitstop: 7 }],
            chain: ['airHeavy'], cancelable: true, sfx: 'swing'
        },
        airHeavy: {
            name: 'Kikoku — Taille retournée', anim: 'airHeavy', kind: 'normal', stance: 'air',
            durations: [4, 4, 5, 10],
            hits: [{ frames: [2, 3], box: [-6, -10, 44, 44], damage: 66, guard: 'high', hitstun: 18, blockstun: 12, push: 12, hitstop: 10, spark: 'room' }],
            cancelable: true, landLag: 5, sfx: 'slash'
        },
        airSpecial: {
            name: 'Kikoku — Tourbillon', anim: 'airSpecial', kind: 'special', stance: 'air',
            durations: [4, 4, 4, 10],
            motion: [[0, 1.6, 1.4], [3, 0.6, 0]],
            hits: [{ frames: [0, 2], box: [-10, -12, 50, 50], damage: 26, guard: 'high', hitstun: 20, blockstun: 12, push: 6, rehit: 4, hitstop: 5, spark: 'room' }],
            sfx: 'slash'
        },
        specialN: {
            name: 'Radio Knife', anim: 'specialN', kind: 'special', stance: 'stand',
            durations: [4, 3, 3, 3, 3, 3, 4, 5, 6, 6],
            hits: [{ frames: [5, 6], box: [0, 6, 50, 50], damage: 40, guard: 'mid', hitstun: 22, blockstun: 14, push: 6, hitstop: 8, spark: 'room' }],
            projectile: {
                anim: 'fx_amputate', atFrame: 6, offset: [34, 30], speed: 4.4, life: 44,
                box: [-14, -24, 28, 48],
                hit: { damage: 70, guard: 'mid', hitstun: 22, blockstun: 16, push: 16, hitstop: 10, spark: 'room', shake: 2, sfx: 'slash' },
                fps: 12
            },
            sfx: 'slashHeavy'
        },
        specialF: {
            name: 'Injection Shot', anim: 'specialF', kind: 'special', stance: 'stand',
            durations: [4, 3, 3, 3, 3, 3, 4, 5, 6, 8],
            motion: [[0, 1.4, 0], [4, 4.6, 0], [6, 0.4, 0], [7, 0, 0]],
            hits: [
                { frames: [0, 3], box: [0, 4, 40, 50], damage: 14, guard: 'mid', hitstun: 18, blockstun: 8, push: 2, rehit: 4, hitstop: 3, spark: 'room' },
                { frames: [5, 6], box: 'auto', damage: 70, guard: 'mid', hitstun: 24, blockstun: 14, push: 24, launch: [3.4, 3.4], wallBounce: true, hitstop: 13, spark: 'big', shake: 5 }
            ],
            sfx: 'slash'
        },
        specialU: {
            name: 'Takt', anim: 'specialU', kind: 'special', stance: 'stand',
            durations: [3, 3, 3, 3, 4, 5, 6, 7, 8],
            invuln: [0, 3],
            hits: [{ frames: [3, 5], box: [-4, 20, 40, 110], damage: 100, guard: 'mid', hitstun: 26, blockstun: 16, push: 8, launch: [0.8, 7.6], hitstop: 12, spark: 'big', shake: 4 }],
            sfx: 'swingHeavy'
        },
        specialD: {
            name: 'Shambles — Counter Shock', anim: 'specialD', kind: 'special', stance: 'stand',
            durations: [4, 4, 5, 4, 3, 3, 3, 3, 8, 10],
            motion: [[0, 6.4, 0], [2, 0, 0]],
            invuln: [0, 1],
            hits: [
                { frames: [4, 6], box: [4, 14, 34, 40], damage: 22, guard: 'mid', hitstun: 22, blockstun: 10, push: 1, rehit: 3, hitstop: 4, spark: 'electric' },
                { frames: [7, 7], box: [4, 14, 36, 40], damage: 60, guard: 'mid', hitstun: 30, blockstun: 16, push: 26, launch: [3.8, 3.6], hitstop: 14, spark: 'electric', shake: 5, sfx: 'electric' }
            ],
            fx: [[0, 'fx_shambles', -8, 0], [2, 'fx_shambles', 0, 0]],
            sfx: 'room'
        },
        ultimate: {
            name: 'Room — Amputate', anim: 'ultimate', kind: 'ultimate', stance: 'stand',
            durations: [6, 6, 6, 8, 4, 3, 3, 3, 5, 5, 4, 4, 4, 5, 6, 8, 10, 10],
            superFreeze: 55, cost: 100, invuln: [0, 8],
            motion: [[4, 6.0, 0], [7, 0, 0]],
            hits: [
                { frames: [8, 9], box: [-10, 0, 80, 80], damage: 70, guard: 'mid', hitstun: 50, blockstun: 20, push: 2, rehit: 5, hitstop: 8, spark: 'room', shake: 4 },
                { frames: [13, 14], box: [-10, 0, 80, 80], damage: 190, guard: 'mid', hitstun: 50, blockstun: 22, push: 32, launch: [5.8, 5.4], wallBounce: true, hitstop: 22, spark: 'big', shake: 10 }
            ],
            fx: [[1, 'fx_room', 0, 0], [4, 'fx_shambles', -6, 0], [7, 'fx_shambles', 0, 0]],
            sfx: 'room'
        },
        throw: {
            name: 'Gamma Knife', anim: 'throw', kind: 'throw', stance: 'stand',
            durations: [3, 4, 3, 4, 5, 4, 4, 5, 5, 6, 8],
            hits: [{ frames: [0, 1], box: [4, 10, 30, 40], damage: 0, guard: 'unblockable', hitstun: 0, blockstun: 0, push: 0 }],
            throwRelease: { frame: 4, damage: 110, launch: [3.6, 4.2] },
            sfx: 'grab'
        }
    }
};
