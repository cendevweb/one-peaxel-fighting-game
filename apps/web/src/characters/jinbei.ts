import manifest from '../generated/sprites/jinbei.json';
import type { CharacterDef, SpriteManifest } from '../engine/types';

/**
 * Jinbei — the fish-man karate master, heavy and patient. Open-palm strikes
 * that carry the water with them: Murasame flicks a spinning water disc
 * across the stage, Samegawara Seiken rushes in with a fist that bursts on
 * contact, Kairiken sweeps a rising water arc as his reversal and the
 * Senmaigawara palm sends a shockwave ring through the target. The ultimate
 * is Buraikan, a palm that fires a water cannon; the two-bar ultimate is
 * the Jinbei-zame Enbu of the sheet's cut-in: a fist driven into the ground
 * calls up a geyser and a whale shark that breaches in front of him.
 *
 * Every animation and effect comes from the Gigant Battle sheet
 * (tools/sprites/chars/jinbei.json): the water streaks, the cannon, the
 * shockwave ring, the white burst and the whale shark are the sheet's own
 * effect rows. Every `durations` array has one entry per animation frame.
 */
export const jinbei: CharacterDef = {
    id: 'jinbei',
    name: 'Jinbei',
    title: 'Chevalier des mers',
    health: 1100,
    walk: 1.3,
    back: 1.1,
    dash: 4.2,
    backdash: [3.4, 2.4],
    jump: [2.1, 6.9],
    gravity: 0.38,
    width: 16,
    height: 70,
    crouchHeight: 50,
    color: '#4f8fd6',
    manifest: manifest as unknown as SpriteManifest,
    moves: {
        lightA: {
            name: 'Paume rapide', anim: 'lightA', kind: 'normal', stance: 'stand',
            durations: [4, 3, 4, 6],
            hits: [{ frames: [1, 1], box: [6, 30, 46, 16], damage: 32, guard: 'mid', hitstun: 14, blockstun: 9, push: 6, hitstop: 6, spark: 'ice' }],
            chain: ['lightB', 'crouchLight', 'heavy', 'heavyFwd', 'heavyBack', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        lightB: {
            name: 'Seiken', anim: 'lightB', kind: 'normal', stance: 'stand',
            durations: [4, 3, 4, 7],
            hits: [{ frames: [1, 2], box: [6, 30, 46, 16], damage: 36, guard: 'mid', hitstun: 16, blockstun: 10, push: 7, hitstop: 7, spark: 'light' }],
            chain: ['lightC', 'heavy', 'heavyFwd', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        lightC: {
            name: 'Uchimizu', anim: 'lightC', kind: 'normal', stance: 'stand',
            durations: [5, 4, 3, 4, 6, 8],
            hits: [{ frames: [1, 2], box: [4, 18, 52, 30], damage: 54, guard: 'mid', hitstun: 18, blockstun: 12, push: 18, hitstop: 9, spark: 'ice', shake: 2 }],
            cancelable: true, sfx: 'ice'
        },
        crouchLight: {
            name: 'Paume basse', anim: 'crouchLight', kind: 'normal', stance: 'crouch',
            durations: [3, 4, 7],
            hits: [{ frames: [1, 1], box: [6, 0, 42, 18], damage: 26, guard: 'low', hitstun: 12, blockstun: 8, push: 8, hitstop: 6, spark: 'light' }],
            chain: ['crouchLight', 'lightB', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        crouchHeavy: {
            name: 'Griffes de requin', anim: 'crouchHeavy', kind: 'normal', stance: 'crouch',
            durations: [6, 3, 4, 4, 6, 8],
            hits: [{ frames: [1, 3], box: [4, 0, 58, 30], damage: 70, guard: 'low', hitstun: 20, blockstun: 12, push: 14, knockdown: true, launch: [1.2, 2.6], hitstop: 10, spark: 'ice' }],
            cancelable: true, sfx: 'swingHeavy'
        },
        heavy: {
            name: 'Poing chargé', anim: 'heavy', kind: 'normal', stance: 'stand',
            durations: [5, 4, 3, 4, 6, 6, 8],
            hits: [{ frames: [3, 4], box: [4, 8, 56, 50], damage: 78, guard: 'mid', hitstun: 22, blockstun: 14, push: 18, hitstop: 11, spark: 'heavy', shake: 2 }],
            cancelable: true, sfx: 'swingHeavy'
        },
        heavyFwd: {
            name: 'Talon du requin-baleine', anim: 'heavyFwd', kind: 'normal', stance: 'stand',
            durations: [4, 4, 5, 4, 4, 4, 5, 8],
            motion: [[2, 1.6, 0], [6, 0, 0]],
            hits: [{ frames: [3, 4], box: [4, 0, 48, 76], damage: 82, guard: 'high', hitstun: 22, blockstun: 14, push: 14, hitstop: 12, spark: 'heavy', shake: 4 }],
            cancelable: true, sfx: 'swingHeavy'
        },
        heavyBack: {
            name: 'Uppercut du courant', anim: 'heavyBack', kind: 'normal', stance: 'stand',
            durations: [5, 4, 3, 4, 6, 9],
            hits: [{ frames: [2, 3], box: [0, 26, 44, 60], damage: 64, guard: 'mid', hitstun: 22, blockstun: 12, push: 8, launch: [0.6, 6.4], hitstop: 10, spark: 'heavy' }],
            invuln: [1, 2],
            cancelable: true, sfx: 'swingHeavy'
        },
        airLight: {
            name: 'Poing plané', anim: 'airLight', kind: 'normal', stance: 'air',
            durations: [3, 4, 8],
            hits: [{ frames: [1, 2], box: [0, 10, 46, 30], damage: 34, guard: 'high', hitstun: 14, blockstun: 9, push: 8, hitstop: 7, spark: 'light' }],
            chain: ['airHeavy'], cancelable: true, sfx: 'swing'
        },
        airHeavy: {
            name: 'Salto du courant', anim: 'airHeavy', kind: 'normal', stance: 'air',
            durations: [3, 5, 5, 8],
            hits: [{ frames: [1, 2], box: [-4, 0, 54, 56], damage: 66, guard: 'high', hitstun: 18, blockstun: 12, push: 12, hitstop: 10, spark: 'ice' }],
            cancelable: true, landLag: 5, sfx: 'swingHeavy'
        },
        airSpecial: {
            name: 'Tourbillon plongeant', anim: 'airSpecial', kind: 'special', stance: 'air',
            durations: [4, 4, 4, 30, 5, 6, 8],
            motion: [[2, 1.8, -5.6]],
            noGravity: true, landFrame: 4,
            hits: [{ frames: [2, 3], box: [-6, -6, 50, 60], damage: 84, guard: 'high', hitstun: 20, blockstun: 14, push: 16, knockdown: true, launch: [1.6, 3.6], hitstop: 12, spark: 'ice', shake: 4 }],
            fx: [[4, 'fx_geyser', 20, 0]],
            sfx: 'ice'
        },
        specialN: {
            name: 'Murasame', anim: 'specialN', kind: 'special', stance: 'stand',
            durations: [5, 4, 3, 4, 4, 5, 6, 8],
            hits: [],
            projectile: {
                anim: 'fx_disc', atFrame: 3, offset: [34, 46], speed: 4.2, life: 90,
                box: [-22, -22, 44, 44], fps: 15, hits: 1,
                hit: { damage: 80, guard: 'mid', hitstun: 22, blockstun: 16, push: 18, hitstop: 10, spark: 'ice', shake: 2, sfx: 'ice' }
            },
            sfx: 'ice'
        },
        specialF: {
            name: 'Samegawara Seiken', anim: 'specialF', kind: 'special', stance: 'stand',
            durations: [6, 5, 4, 4, 6, 12],
            motion: [[1, 6.0, 0], [4, 0, 0]],
            hits: [{ frames: [2, 4], box: [0, 14, 58, 44], damage: 98, guard: 'mid', hitstun: 24, blockstun: 14, push: 22, launch: [3.0, 3.6], hitstop: 14, spark: 'big', shake: 5 }],
            fx: [[3, 'fx_burst', 56, 42]],
            sfx: 'swingHeavy'
        },
        specialU: {
            name: 'Kairiken', anim: 'specialU', kind: 'special', stance: 'stand',
            durations: [3, 3, 3, 4, 5, 8, 10],
            motion: [[3, 0.8, 0], [5, 0, 0]],
            invuln: [0, 3],
            hits: [
                { frames: [3, 3], box: [-10, 14, 56, 70], damage: 64, guard: 'mid', hitstun: 24, blockstun: 16, push: 8, launch: [0.8, 6.8], hitstop: 10, spark: 'ice', shake: 3 },
                { frames: [4, 4], box: [-6, 30, 48, 70], damage: 46, guard: 'mid', hitstun: 24, blockstun: 16, push: 10, launch: [1.2, 7.4], hitstop: 10, spark: 'big', shake: 4 }
            ],
            fx: [[3, 'fx_geyser', 26, 0]],
            sfx: 'ice'
        },
        specialD: {
            name: 'Senmaigawara Shōtei', anim: 'specialD', kind: 'special', stance: 'stand',
            durations: [5, 4, 4, 4, 5, 6, 6, 6, 6, 8],
            hits: [
                { frames: [3, 4], box: [6, 12, 62, 52], damage: 22, guard: 'mid', hitstun: 22, blockstun: 10, push: 2, rehit: 4, hitstop: 4, spark: 'ice' },
                { frames: [5, 5], box: [6, 12, 62, 52], damage: 58, guard: 'mid', hitstun: 26, blockstun: 16, push: 14, knockdown: true, launch: [2.2, 4.4], hitstop: 12, spark: 'big', shake: 4 }
            ],
            fx: [[3, 'fx_ring', 50, 50]],
            sfx: 'quake'
        },
        // One bar: the palm fires the water cannon of the sheet across the
        // screen; three pushes keep the target inside, the blast throws it.
        ultimate: {
            name: 'Gyojin Karate Ōgi — Buraikan', anim: 'ultimate', kind: 'ultimate', stance: 'stand',
            durations: [8, 6, 6, 4, 12, 12, 12, 10, 10, 12],
            superFreeze: 55, cost: 100, invuln: [0, 4],
            hits: [
                { frames: [3, 6], box: [6, 18, 160, 44], damage: 42, guard: 'mid', hitstun: 50, blockstun: 20, push: 1, rehit: 12, hitstop: 5, spark: 'ice', shake: 3 },
                { frames: [7, 7], box: [6, 18, 160, 44], damage: 240, guard: 'mid', hitstun: 50, blockstun: 22, push: 30, launch: [5.6, 5.4], wallBounce: true, hitstop: 22, spark: 'big', shake: 10, sfx: 'quake' }
            ],
            fx: [[3, 'fx_cannon', 30, 50]],
            sfx: 'ice'
        },
        // Two bars: the fist drives into the ground (the white splash), a
        // geyser bursts and the whale shark breaches across a wide area in
        // front of him — the sheet's Jinbei-zame Enbu cut-in.
        ultimate2: {
            name: 'Jinbei-zame Enbu', anim: 'ultimate2', kind: 'ultimate', stance: 'stand',
            durations: [4, 5, 5, 8, 8, 8, 8, 10, 12, 14],
            superFreeze: 70, cost: 200, invuln: [0, 5],
            hits: [
                { frames: [3, 3], box: [-10, 0, 66, 60], damage: 96, guard: 'mid', hitstun: 70, blockstun: 20, push: 1, hitstop: 12, spark: 'quake', shake: 6, sfx: 'quake' },
                { frames: [5, 6], box: [0, 0, 190, 120], damage: 380, guard: 'mid', hitstun: 50, blockstun: 24, push: 30, launch: [4.8, 7.2], wallBounce: true, knockdown: true, hitstop: 26, spark: 'big', shake: 12, sfx: 'ice' }
            ],
            fx: [[3, 'fx_geyser', 30, 0], [4, 'fx_whale', 50, 0]],
            sfx: 'quake'
        },
        throw: {
            name: 'Gyojin Jūjutsu — Mizugokoro', anim: 'throw', kind: 'throw', stance: 'stand',
            durations: [3, 5, 5, 5, 4, 6, 6, 8],
            hits: [{ frames: [0, 1], box: [4, 10, 30, 44], damage: 0, guard: 'unblockable', hitstun: 0, blockstun: 0, push: 0 }],
            throwRelease: { frame: 4, damage: 112, launch: [2.8, 5.0] },
            fx: [[4, 'fx_burst', 40, 40]],
            sfx: 'grab'
        }
    }
};
