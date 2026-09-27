import manifest from '../generated/sprites/chopper.json';
import type { CharacterDef, SpriteManifest } from '../engine/types';

/**
 * Tony Tony Chopper — the doctor. He stands and moves as the small Brain
 * Point and turns into another form for every blow, as in Gigant Battle:
 * Heavy Point for the punches, Kung Fu Point for the spinning kick, Horn
 * Point for the antler charge, Arm Point for the hoof strikes (the pink
 * "Kokutei" marks), the Guard Point fur ball for blocking, and the Rumble
 * Ball that turns him into the Monster Point for the two-bar ultimate.
 *
 * Every animation and effect comes from the Gigant Battle DS sheet
 * (tools/sprites/chars/chopper.json). Every `durations` array has one entry
 * per animation frame.
 */
export const chopper: CharacterDef = {
    id: 'chopper',
    name: 'Chopper',
    title: 'Médecin de bord',
    health: 960,
    walk: 1.7,
    back: 1.4,
    dash: 5.0,
    backdash: [4.0, 2.8],
    jump: [2.4, 7.4],
    gravity: 0.38,
    width: 11,
    height: 52,
    crouchHeight: 36,
    color: '#e0607e',
    manifest: manifest as unknown as SpriteManifest,
    moves: {
        lightA: {
            name: 'Heavy Point — direct', anim: 'lightA', kind: 'normal', stance: 'stand',
            durations: [3, 2, 3, 8],
            hits: [{ frames: [1, 2], box: [6, 28, 52, 18], damage: 30, guard: 'mid', hitstun: 14, blockstun: 9, push: 6, hitstop: 6, spark: 'light' }],
            chain: ['lightB', 'crouchLight', 'heavy', 'heavyFwd', 'heavyBack', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        lightB: {
            name: 'Heavy Point — crochet', anim: 'lightB', kind: 'normal', stance: 'stand',
            durations: [3, 3, 3, 7],
            hits: [{ frames: [1, 2], box: [4, 12, 46, 46], damage: 34, guard: 'mid', hitstun: 16, blockstun: 10, push: 7, hitstop: 7, spark: 'light' }],
            chain: ['lightC', 'heavy', 'heavyFwd', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        lightC: {
            name: 'Heavy Point — revers', anim: 'lightC', kind: 'normal', stance: 'stand',
            durations: [4, 3, 3, 4, 6, 8],
            hits: [{ frames: [1, 2], box: [4, 12, 56, 40], damage: 52, guard: 'mid', hitstun: 18, blockstun: 12, push: 18, hitstop: 9, spark: 'heavy', shake: 2 }],
            cancelable: true, sfx: 'swingHeavy'
        },
        crouchLight: {
            name: 'Heavy Point — coup bas', anim: 'crouchLight', kind: 'normal', stance: 'crouch',
            durations: [3, 3, 6],
            hits: [{ frames: [1, 1], box: [6, 0, 34, 22], damage: 24, guard: 'low', hitstun: 12, blockstun: 8, push: 8, hitstop: 6, spark: 'light' }],
            chain: ['crouchLight', 'lightB', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        crouchHeavy: {
            name: 'Heavy Point — balayage montant', anim: 'crouchHeavy', kind: 'normal', stance: 'crouch',
            durations: [5, 3, 3, 4, 6, 10],
            hits: [{ frames: [3, 4], box: [4, 0, 40, 44], damage: 66, guard: 'low', hitstun: 20, blockstun: 12, push: 12, knockdown: true, launch: [1.2, 3.0], hitstop: 10, spark: 'heavy' }],
            cancelable: true, sfx: 'swingHeavy'
        },
        heavy: {
            name: 'Heavy Point — grand direct', anim: 'heavy', kind: 'normal', stance: 'stand',
            durations: [4, 4, 3, 3, 5, 6, 8],
            hits: [{ frames: [3, 4], box: [8, 28, 64, 26], damage: 74, guard: 'mid', hitstun: 21, blockstun: 14, push: 18, hitstop: 11, spark: 'heavy', shake: 2 }],
            cancelable: true, sfx: 'swingHeavy'
        },
        heavyFwd: {
            name: 'Kung Fu Point', anim: 'heavyFwd', kind: 'normal', stance: 'stand',
            durations: [4, 4, 4, 3, 4, 6, 8],
            motion: [[1, 1.6, 0], [3, 0, 0]],
            hits: [
                { frames: [2, 2], box: [-6, 4, 50, 52], damage: 40, guard: 'mid', hitstun: 20, blockstun: 12, push: 4, hitstop: 8, spark: 'heavy' },
                { frames: [4, 4], box: [4, 20, 36, 40], damage: 44, guard: 'mid', hitstun: 20, blockstun: 12, push: 16, hitstop: 10, spark: 'heavy', shake: 2 }
            ],
            cancelable: true, sfx: 'swingHeavy'
        },
        heavyBack: {
            name: 'Horn Point', anim: 'heavyBack', kind: 'normal', stance: 'stand',
            durations: [4, 4, 3, 4, 6, 6, 8],
            motion: [[1, 2.6, 0], [3, 0, 0]],
            hits: [{ frames: [3, 4], box: [0, 10, 48, 70], damage: 64, guard: 'mid', hitstun: 22, blockstun: 12, push: 8, launch: [0.6, 6.4], hitstop: 10, spark: 'heavy' }],
            invuln: [1, 2],
            cancelable: true, sfx: 'swingHeavy'
        },
        airLight: {
            name: 'Jump Point — griffes', anim: 'airLight', kind: 'normal', stance: 'air',
            durations: [3, 10],
            hits: [{ frames: [1, 1], box: [0, -4, 40, 48], damage: 32, guard: 'high', hitstun: 14, blockstun: 9, push: 8, hitstop: 7, spark: 'light' }],
            chain: ['airHeavy'], cancelable: true, sfx: 'swing'
        },
        airHeavy: {
            name: 'Heavy Point — marteau aérien', anim: 'airHeavy', kind: 'normal', stance: 'air',
            durations: [3, 4, 4, 8],
            hits: [{ frames: [1, 2], box: [0, -8, 52, 74], damage: 64, guard: 'high', hitstun: 18, blockstun: 12, push: 12, hitstop: 10, spark: 'heavy', shake: 2 }],
            cancelable: true, landLag: 5, sfx: 'swingHeavy'
        },
        airSpecial: {
            name: 'Arm Point — Kokutei Cross', anim: 'airSpecial', kind: 'special', stance: 'air',
            durations: [4, 4, 30, 4, 5, 6, 8],
            motion: [[2, 2.6, -6.2]],
            noGravity: true, landFrame: 3,
            hits: [{ frames: [2, 4], box: [-4, -22, 60, 52], damage: 80, guard: 'high', hitstun: 20, blockstun: 14, push: 16, knockdown: true, launch: [1.6, 3.6], hitstop: 12, spark: 'petal', shake: 4 }],
            sfx: 'swingHeavy'
        },
        specialN: {
            name: 'Arm Point — Kokutei', anim: 'specialN', kind: 'special', stance: 'stand',
            durations: [4, 4, 4, 5, 6, 8, 8],
            hits: [],
            projectile: {
                anim: 'fx_hoof', atFrame: 3, offset: [44, 32], speed: 4.2, life: 80,
                box: [-18, -18, 36, 36], fps: 12, hits: 1,
                hit: { damage: 76, guard: 'mid', hitstun: 22, blockstun: 16, push: 18, hitstop: 11, spark: 'petal', shake: 2, sfx: 'swingHeavy' }
            },
            sfx: 'swingHeavy'
        },
        specialF: {
            name: 'Heavy Gong', anim: 'specialF', kind: 'special', stance: 'stand',
            durations: [3, 3, 3, 3, 3, 3, 4, 5, 6, 6, 6, 8],
            motion: [[0, 5.2, 0], [3, 2.4, 0], [6, 0, 0]],
            hits: [{ frames: [3, 7], box: [-4, 10, 62, 56], damage: 94, guard: 'mid', hitstun: 24, blockstun: 14, push: 22, launch: [3.0, 3.6], hitstop: 14, spark: 'heavy', shake: 4 }],
            sfx: 'swingHeavy'
        },
        specialU: {
            name: 'Heavy Point — uppercut', anim: 'specialU', kind: 'special', stance: 'stand',
            durations: [2, 2, 2, 3, 4, 6, 8, 10],
            motion: [[4, 1.0, 6.6]],
            invuln: [0, 4],
            hits: [
                { frames: [4, 4], box: [-8, 10, 46, 70], damage: 60, guard: 'mid', hitstun: 24, blockstun: 16, push: 8, launch: [0.8, 6.8], hitstop: 10, spark: 'heavy', shake: 3 },
                { frames: [5, 6], box: [-10, 20, 50, 80], damage: 48, guard: 'mid', hitstun: 24, blockstun: 16, push: 10, launch: [1.2, 7.4], hitstop: 10, spark: 'big', shake: 4 }
            ],
            sfx: 'swingHeavy'
        },
        specialD: {
            name: 'Heavy Point — martèlement', anim: 'specialD', kind: 'special', stance: 'stand',
            durations: [5, 5, 5, 6, 4, 8, 12],
            hits: [{ frames: [5, 6], box: [-40, 0, 116, 30], damage: 86, guard: 'low', hitstun: 24, blockstun: 14, push: 16, knockdown: true, launch: [1.6, 4.4], hitstop: 12, spark: 'heavy', shake: 6 }],
            fx: [[5, 'fx_shock', 4, 8]],
            sfx: 'gigant'
        },
        ultimate: {
            name: 'Kokutei Roseo', anim: 'ultimate', kind: 'ultimate', stance: 'stand',
            durations: [8, 8, 6, 4, 4, 4, 4, 4, 10, 14],
            superFreeze: 55, cost: 100, invuln: [0, 4],
            motion: [[3, 6.4, 0], [5, 0, 0]],
            hits: [
                { frames: [4, 7], box: [-8, 10, 76, 50], damage: 32, guard: 'mid', hitstun: 60, blockstun: 20, push: 1, rehit: 4, hitstop: 4, spark: 'petal', shake: 3 },
                { frames: [8, 8], box: [-8, 4, 90, 70], damage: 240, guard: 'mid', hitstun: 50, blockstun: 22, push: 30, launch: [5.8, 5.6], wallBounce: true, hitstop: 24, spark: 'big', shake: 10 }
            ],
            fx: [[8, 'fx_boom', 64, 30], [8, 'fx_petals', 70, 34]],
            sfx: 'swingHeavy'
        },
        // Two bars: he swallows the Rumble Ball and swells into the Monster
        // Point, then the rampage: two ground-shaking swipes that reach far
        // past any of his other moves, before he shrinks back.
        ultimate2: {
            name: 'Monster Point', anim: 'ultimate2', kind: 'ultimate', stance: 'stand',
            durations: [4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 6, 4, 4, 4, 6, 5, 4, 4, 4, 4, 6, 8, 8, 6, 6, 8],
            superFreeze: 70, cost: 200, invuln: [0, 13],
            motion: [[11, 2.4, 0], [14, 1.4, 0], [17, 2.0, 0], [20, 0, 0]],
            hits: [
                { frames: [11, 13], box: [-10, 0, 90, 90], damage: 50, guard: 'mid', hitstun: 60, blockstun: 18, push: 1, rehit: 4, hitstop: 5, spark: 'heavy', shake: 4 },
                { frames: [14, 15], box: [-10, 0, 112, 60], damage: 170, guard: 'mid', hitstun: 60, blockstun: 20, push: 2, hitstop: 12, spark: 'big', shake: 8 },
                { frames: [16, 18], box: [-10, 0, 100, 90], damage: 45, guard: 'mid', hitstun: 60, blockstun: 18, push: 1, rehit: 4, hitstop: 5, spark: 'heavy', shake: 4 },
                { frames: [20, 21], box: [-10, 0, 120, 90], damage: 260, guard: 'mid', hitstun: 50, blockstun: 24, push: 30, launch: [6.0, 6.4], wallBounce: true, knockdown: true, hitstop: 26, spark: 'big', shake: 12 }
            ],
            fx: [[14, 'fx_quake', 70, 26], [14, 'fx_dust', 40, 9], [20, 'fx_quake', 80, 26], [20, 'fx_dust', 50, 9], [21, 'fx_boom', 90, 40]],
            sfx: 'gigant'
        },
        throw: {
            name: 'Arm Point — projection', anim: 'throw', kind: 'throw', stance: 'stand',
            durations: [3, 4, 4, 4, 8, 6, 8],
            hits: [{ frames: [0, 1], box: [4, 10, 30, 40], damage: 0, guard: 'unblockable', hitstun: 0, blockstun: 0, push: 0 }],
            throwRelease: { frame: 4, damage: 110, launch: [2.6, 5.0] },
            sfx: 'grab'
        }
    }
};
