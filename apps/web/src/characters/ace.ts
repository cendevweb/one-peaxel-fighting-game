import manifest from '../generated/sprites/ace.json';
import type { CharacterDef, SpriteManifest } from '../engine/types';

/**
 * Portgas D. Ace — Hiken no Ace, the Mera Mera fire zoner. Quick fists, a
 * fire fist that crosses the screen (Hiken), rapid finger-gun bullets
 * (Higan), a fire pillar anti-air (Hibashira), a wall of flames (Enjōmō)
 * and the sun he hurls from above for the ultimate (Dai Enkai — Entei).
 * Every effect comes from the sheet's own flame rows.
 *
 * Every `durations` array has exactly one entry per frame of the animation
 * it plays (see tools/sprites/chars/ace.json); a test checks it.
 */
export const ace: CharacterDef = {
    id: 'ace',
    name: 'Ace',
    title: 'Poing ardent',
    health: 1000,
    walk: 1.7,
    back: 1.3,
    dash: 4.6,
    backdash: [3.6, 2.6],
    jump: [2.3, 7.2],
    gravity: 0.36,
    width: 12,
    height: 60,
    crouchHeight: 38,
    color: '#f08a1c',
    manifest: manifest as unknown as SpriteManifest,
    moves: {
        lightA: {
            name: 'Crochet', anim: 'lightA', kind: 'normal', stance: 'stand',
            durations: [3, 2, 3, 3, 6],
            hits: [{ frames: [2, 3], box: [6, 20, 30, 32], damage: 30, guard: 'mid', hitstun: 14, blockstun: 9, push: 5, hitstop: 6 }],
            chain: ['lightB', 'crouchLight', 'heavy', 'heavyFwd', 'heavyBack', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        lightB: {
            name: 'Revers', anim: 'lightB', kind: 'normal', stance: 'stand',
            durations: [3, 4, 4, 7],
            hits: [{ frames: [1, 1], box: [6, 26, 32, 26], damage: 34, guard: 'mid', hitstun: 16, blockstun: 10, push: 6, hitstop: 7 }],
            chain: ['lightC', 'heavy', 'heavyFwd', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        lightC: {
            name: 'Griffe de feu', anim: 'lightC', kind: 'normal', stance: 'stand',
            durations: [4, 3, 4, 4, 5, 7],
            hits: [{ frames: [2, 3], box: [4, 10, 40, 52], damage: 50, guard: 'mid', hitstun: 18, blockstun: 12, push: 20, hitstop: 9, spark: 'fire' }],
            fx: [[2, 'fx_claw', 30, 36]],
            cancelable: true, sfx: 'fire'
        },
        crouchLight: {
            name: 'Coup bas', anim: 'crouchLight', kind: 'normal', stance: 'crouch',
            durations: [3, 4, 5],
            hits: [{ frames: [1, 1], box: [6, 4, 28, 22], damage: 24, guard: 'low', hitstun: 12, blockstun: 8, push: 8, hitstop: 6 }],
            chain: ['crouchLight', 'lightB', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        crouchHeavy: {
            name: 'Frappe du sol', anim: 'crouchHeavy', kind: 'normal', stance: 'crouch',
            durations: [7, 3, 4, 6, 9],
            hits: [{ frames: [1, 2], box: [8, 0, 46, 24], damage: 66, guard: 'low', hitstun: 20, blockstun: 12, push: 14, knockdown: true, launch: [1.2, 2.6], hitstop: 10, spark: 'fire' }],
            fx: [[1, 'fx_burst', 34, 0]],
            cancelable: true, sfx: 'fire'
        },
        heavy: {
            name: 'Poing ardent', anim: 'heavy', kind: 'normal', stance: 'stand',
            durations: [4, 3, 3, 3, 4, 4, 4, 6, 6],
            hits: [{ frames: [3, 5], box: [6, 26, 52, 22], damage: 72, guard: 'mid', hitstun: 21, blockstun: 14, push: 20, hitstop: 11, spark: 'fire', shake: 2 }],
            fx: [[3, 'fx_flame', 54, 40]],
            cancelable: true, sfx: 'swingHeavy'
        },
        heavyFwd: {
            name: 'Hache de feu', anim: 'heavyFwd', kind: 'normal', stance: 'stand',
            durations: [5, 4, 3, 3, 3, 4, 7, 7],
            hits: [{ frames: [3, 5], box: [4, 0, 44, 64], damage: 80, guard: 'high', hitstun: 22, blockstun: 14, push: 14, hitstop: 12, spark: 'fire', shake: 4 }],
            fx: [[4, 'fx_flame', 40, 8]],
            cancelable: true, sfx: 'swingHeavy'
        },
        heavyBack: {
            name: 'Uppercut de flammes', anim: 'heavyBack', kind: 'normal', stance: 'stand',
            durations: [4, 3, 3, 3, 5, 5, 6, 6],
            hits: [{ frames: [2, 4], box: [4, 20, 38, 56], damage: 66, guard: 'mid', hitstun: 22, blockstun: 12, push: 8, launch: [0.6, 6.4], hitstop: 10, spark: 'fire' }],
            fx: [[3, 'fx_flame', 22, 64]],
            cancelable: true, sfx: 'swingHeavy'
        },
        airLight: {
            name: 'Coup de pied aérien', anim: 'airLight', kind: 'normal', stance: 'air',
            durations: [4, 4, 9],
            hits: [{ frames: [1, 2], box: [-2, -8, 32, 34], damage: 34, guard: 'high', hitstun: 14, blockstun: 9, push: 8, hitstop: 7 }],
            chain: ['airHeavy'], cancelable: true, sfx: 'swing'
        },
        airHeavy: {
            name: 'Balayage aérien', anim: 'airHeavy', kind: 'normal', stance: 'air',
            durations: [4, 4, 6, 10],
            hits: [{ frames: [1, 2], box: [0, -6, 40, 32], damage: 66, guard: 'high', hitstun: 18, blockstun: 12, push: 12, hitstop: 10, spark: 'heavy' }],
            cancelable: true, landLag: 5, sfx: 'swingHeavy'
        },
        airSpecial: {
            name: 'Kagerō', anim: 'airSpecial', kind: 'special', stance: 'air',
            durations: [5, 6, 24, 6, 10],
            motion: [[1, 4.0, -4.2]],
            noGravity: true, landFrame: 4,
            hits: [{ frames: [1, 3], box: [-6, -6, 56, 36], damage: 80, guard: 'high', hitstun: 20, blockstun: 14, push: 18, knockdown: true, launch: [1.8, 3.4], hitstop: 12, spark: 'fire', shake: 4 }],
            fx: [[4, 'fx_burst', 10, 0]],
            sfx: 'fire'
        },
        specialN: {
            name: 'Hiken', anim: 'specialN', kind: 'special', stance: 'stand',
            durations: [4, 3, 3, 2, 3, 5, 4, 4, 5, 6, 8],
            projectile: {
                anim: 'fx_hiken', atFrame: 5, offset: [58, 40], speed: 4.2, life: 70,
                box: [-40, -16, 88, 32], fps: 12, hits: 1,
                hit: { damage: 90, guard: 'mid', hitstun: 22, blockstun: 16, push: 24, knockdown: true, launch: [3.0, 3.2], hitstop: 12, spark: 'fire', shake: 4, sfx: 'fire' }
            },
            hits: [],
            fx: [[4, 'fx_hikenspark', 44, 42]],
            sfx: 'fire'
        },
        specialF: {
            name: 'Higan', anim: 'specialF', kind: 'special', stance: 'stand',
            durations: [8, 3, 3, 3, 3, 8, 12],
            hits: [{ frames: [1, 4], box: [16, 30, 66, 26], damage: 24, guard: 'mid', hitstun: 18, blockstun: 10, push: 4, rehit: 4, hitstop: 4, spark: 'fire' }],
            fx: [[4, 'fx_higan', 74, 44]],
            sfx: 'fire'
        },
        specialU: {
            name: 'Hibashira', anim: 'specialU', kind: 'special', stance: 'stand',
            durations: [3, 3, 4, 5, 5, 6, 7, 9],
            invuln: [0, 3],
            hits: [{ frames: [2, 5], box: [-8, 0, 42, 112], damage: 110, guard: 'mid', hitstun: 24, blockstun: 16, push: 10, launch: [1.0, 7.4], hitstop: 12, spark: 'fire', shake: 4 }],
            fx: [[2, 'fx_hibashira', 12, 0]],
            sfx: 'fire'
        },
        specialD: {
            name: 'Enjōmō', anim: 'specialD', kind: 'special', stance: 'stand',
            durations: [6, 6, 6, 8, 10, 14],
            hits: [
                { frames: [2, 3], box: [26, 0, 62, 50], damage: 28, guard: 'mid', hitstun: 22, blockstun: 12, push: 3, rehit: 7, hitstop: 5, spark: 'fire' },
                { frames: [4, 4], box: [26, 0, 62, 56], damage: 55, guard: 'mid', hitstun: 24, blockstun: 16, push: 18, knockdown: true, launch: [2.4, 4.2], hitstop: 12, spark: 'fire', shake: 4 }
            ],
            fx: [[2, 'fx_firewall', 58, 0]],
            sfx: 'fire'
        },
        ultimate: {
            name: 'Dai Enkai — Entei', anim: 'ultimate', kind: 'ultimate', stance: 'stand',
            durations: [3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 6, 6, 6, 6, 8, 10, 12],
            superFreeze: 55, cost: 100, invuln: [0, 19],
            projectile: {
                anim: 'fx_entei', atFrame: 18, offset: [20, 96], speed: 3.2, speedY: -1.8, life: 24,
                box: [-46, -56, 92, 100], fps: 12, hits: 3,
                hit: { damage: 60, guard: 'mid', hitstun: 40, blockstun: 20, push: 4, hitstop: 5, spark: 'fire', shake: 6 }
            },
            hits: [
                { frames: [22, 22], box: [30, 0, 120, 120], damage: 170, guard: 'mid', hitstun: 40, blockstun: 20, push: 30, knockdown: true, launch: [5.0, 5.2], wallBounce: true, hitstop: 22, spark: 'big', shake: 10 }
            ],
            fx: [
                [9, 'fx_entei', 8, 102],
                [22, 'fx_enteiboom', 96, 52],
                [22, 'fx_eruption', 96, 0],
                [23, 'fx_groundfire', 60, 0]
            ],
            sfx: 'fire'
        },
        throw: {
            name: 'Prise de feu', anim: 'throw', kind: 'throw', stance: 'stand',
            durations: [3, 4, 4, 4, 4, 4, 6, 6, 8],
            hits: [{ frames: [0, 1], box: [4, 10, 30, 44], damage: 0, guard: 'unblockable', hitstun: 0, blockstun: 0, push: 0 }],
            throwRelease: { frame: 6, damage: 110, launch: [3.8, 4.6] },
            fx: [[6, 'fx_boom', 30, 30]],
            sfx: 'grab'
        }
    }
};
