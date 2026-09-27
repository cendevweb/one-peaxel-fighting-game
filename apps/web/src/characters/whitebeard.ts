import manifest from '../generated/sprites/whitebeard.json';
import type { CharacterDef, SpriteManifest } from '../engine/types';

/**
 * Edward Newgate, Barbe Blanche — Gura Gura no Mi. The heaviest fighter of
 * the roster: slow to walk and to jump, but his bisento reaches further than
 * anyone's and every quake cracks the air in front of him.
 *
 * Normals are bisento swings (long thrust, double slash, overhead cleave)
 * and a quake jab; the specials are the shockwave swung off the blade, the
 * quake punch that cracks the air (wall bounce), the spinning bisento above
 * his head as his reversal, and the grab of the air that overturns the
 * ground in front of him. Kaishin, both fists smashing the air, is the
 * ultimate; Shima Yurashi (O, two bars) stomps, cracks the sky and brings
 * the bisento down to send the quake across the whole screen.
 *
 * Every animation and effect comes from the Gigant Battle sheet
 * (tools/sprites/chars/whitebeard.json): the quake bubble, the yellow
 * shockwave, the ground eruption and the Kaishin burst are the sheet's own
 * effect rows. Every `durations` array has one entry per animation frame.
 */
export const whitebeard: CharacterDef = {
    id: 'whitebeard',
    name: 'Barbe Blanche',
    title: "L'homme le plus fort du monde",
    health: 1150,
    walk: 1.15,
    back: 1.0,
    dash: 3.9,
    backdash: [3.2, 2.2],
    jump: [2.0, 6.9],
    gravity: 0.36,
    width: 18,
    height: 90,
    crouchHeight: 66,
    color: '#e6dcc0',
    manifest: manifest as unknown as SpriteManifest,
    moves: {
        lightA: {
            name: 'Poing tremblant', anim: 'lightA', kind: 'normal', stance: 'stand',
            durations: [4, 3, 3, 8],
            hits: [{ frames: [1, 2], box: [6, 26, 48, 58], damage: 34, guard: 'mid', hitstun: 16, blockstun: 10, push: 6, hitstop: 7, spark: 'heavy' }],
            chain: ['lightB', 'crouchLight', 'heavy', 'heavyFwd', 'heavyBack', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        lightB: {
            name: 'Estoc du bisento', anim: 'lightB', kind: 'normal', stance: 'stand',
            durations: [4, 3, 3, 4, 8],
            hits: [{ frames: [2, 3], box: [10, 22, 90, 40], damage: 40, guard: 'mid', hitstun: 17, blockstun: 11, push: 9, hitstop: 8, spark: 'heavy' }],
            chain: ['lightC', 'heavy', 'heavyFwd', 'crouchHeavy'], cancelable: true, sfx: 'swingHeavy'
        },
        lightC: {
            name: 'Double taille du bisento', anim: 'lightC', kind: 'normal', stance: 'stand',
            durations: [4, 3, 3, 3, 3, 4, 3, 3, 4, 5, 6, 8],
            hits: [
                { frames: [4, 5], box: [0, 4, 72, 70], damage: 40, guard: 'mid', hitstun: 24, blockstun: 12, push: 4, hitstop: 8, spark: 'heavy' },
                { frames: [8, 8], box: [8, 12, 80, 40], damage: 50, guard: 'mid', hitstun: 22, blockstun: 12, push: 20, knockdown: true, launch: [2.4, 3.4], hitstop: 11, spark: 'big', shake: 3 }
            ],
            cancelable: true, sfx: 'swingHeavy'
        },
        crouchLight: {
            name: 'Balayage du manche', anim: 'crouchLight', kind: 'normal', stance: 'crouch',
            durations: [4, 4, 7],
            hits: [{ frames: [1, 1], box: [6, 0, 64, 22], damage: 26, guard: 'low', hitstun: 13, blockstun: 8, push: 8, hitstop: 6, spark: 'light' }],
            chain: ['crouchLight', 'lightB', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        crouchHeavy: {
            name: 'Fauchage au ras du sol', anim: 'crouchHeavy', kind: 'normal', stance: 'crouch',
            durations: [7, 3, 3, 3, 4, 6, 10],
            hits: [{ frames: [1, 4], box: [6, 0, 72, 24], damage: 70, guard: 'low', hitstun: 20, blockstun: 12, push: 14, knockdown: true, launch: [1.2, 2.6], hitstop: 10, spark: 'heavy' }],
            cancelable: true, sfx: 'swingHeavy'
        },
        heavy: {
            name: 'Taille horizontale', anim: 'heavy', kind: 'normal', stance: 'stand',
            durations: [6, 5, 3, 4, 6, 8, 10],
            hits: [{ frames: [2, 3], box: [0, 10, 100, 64], damage: 80, guard: 'mid', hitstun: 22, blockstun: 14, push: 22, hitstop: 12, spark: 'heavy', shake: 3 }],
            cancelable: true, sfx: 'swingHeavy'
        },
        heavyFwd: {
            name: 'Fendoir du ciel', anim: 'heavyFwd', kind: 'normal', stance: 'stand',
            durations: [5, 4, 4, 3, 3, 4, 6, 6, 10],
            hits: [{ frames: [3, 5], box: [4, 0, 80, 110], damage: 88, guard: 'high', hitstun: 22, blockstun: 14, push: 16, hitstop: 13, spark: 'big', shake: 5 }],
            cancelable: true, sfx: 'swingHeavy'
        },
        heavyBack: {
            name: 'Taille montante', anim: 'heavyBack', kind: 'normal', stance: 'stand',
            durations: [4, 4, 3, 3, 4, 5, 5, 5, 6, 8],
            hits: [{ frames: [2, 4], box: [-6, 16, 80, 104], damage: 64, guard: 'mid', hitstun: 22, blockstun: 12, push: 8, launch: [0.8, 6.6], hitstop: 10, spark: 'heavy' }],
            invuln: [1, 2],
            cancelable: true, sfx: 'swingHeavy'
        },
        airLight: {
            name: 'Poing aérien', anim: 'airLight', kind: 'normal', stance: 'air',
            durations: [5, 5, 10],
            hits: [{ frames: [1, 1], box: [4, 20, 50, 62], damage: 36, guard: 'high', hitstun: 15, blockstun: 9, push: 8, hitstop: 7, spark: 'heavy' }],
            chain: ['airHeavy'], cancelable: true, sfx: 'swing'
        },
        airHeavy: {
            name: 'Moulinet aérien', anim: 'airHeavy', kind: 'normal', stance: 'air',
            durations: [4, 4, 3, 3, 4, 6, 8],
            hits: [{ frames: [2, 4], box: [-10, -12, 72, 110], damage: 66, guard: 'high', hitstun: 18, blockstun: 12, push: 12, hitstop: 10, spark: 'heavy' }],
            cancelable: true, landLag: 6, sfx: 'swingHeavy'
        },
        airSpecial: {
            name: 'Chute du bisento', anim: 'airSpecial', kind: 'special', stance: 'air',
            durations: [4, 4, 4, 4, 30, 5, 6, 10],
            motion: [[3, 2.4, -6.5]],
            noGravity: true, landFrame: 5,
            hits: [{ frames: [3, 4], box: [-6, -12, 74, 76], damage: 84, guard: 'high', hitstun: 20, blockstun: 14, push: 16, knockdown: true, launch: [1.6, 3.6], hitstop: 12, spark: 'quake', shake: 5, sfx: 'quake' }],
            fx: [[5, 'fx_erupt', 48, 46]],
            sfx: 'swingHeavy'
        },
        specialN: {
            name: 'Gura Gura — onde de choc', anim: 'specialN', kind: 'special', stance: 'stand',
            durations: [5, 4, 4, 4, 3, 3, 5, 8, 10],
            hits: [],
            projectile: {
                anim: 'fx_wave', atFrame: 5, offset: [76, 24], speed: 4.0, life: 90,
                box: [-26, -26, 52, 52], fps: 10, hits: 1,
                hit: { damage: 84, guard: 'mid', hitstun: 22, blockstun: 16, push: 18, hitstop: 12, spark: 'quake', shake: 3, sfx: 'quake' }
            },
            sfx: 'swingHeavy'
        },
        specialF: {
            name: 'Gura Gura — poing séisme', anim: 'specialF', kind: 'special', stance: 'stand',
            durations: [5, 4, 4, 4, 4, 5, 6, 8, 10],
            motion: [[1, 3.6, 0], [3, 0, 0]],
            hits: [{ frames: [3, 5], box: [0, 10, 76, 80], damage: 100, guard: 'mid', hitstun: 26, blockstun: 16, push: 26, launch: [4.2, 4.0], wallBounce: true, hitstop: 16, spark: 'quake', shake: 6, sfx: 'quake' }],
            fx: [[3, 'fx_bubble', 58, 70], [3, 'fx_crack', 64, 66]],
            sfx: 'gigant'
        },
        specialU: {
            name: 'Moulinet du bisento', anim: 'specialU', kind: 'special', stance: 'stand',
            durations: [3, 3, 4, 4, 4, 4, 4, 7, 10],
            invuln: [0, 3],
            hits: [
                { frames: [2, 3], box: [-36, 20, 100, 110], damage: 54, guard: 'mid', hitstun: 24, blockstun: 16, push: 8, launch: [1.0, 6.8], hitstop: 10, spark: 'heavy', shake: 3 },
                { frames: [4, 6], box: [-36, 20, 100, 110], damage: 46, guard: 'mid', hitstun: 24, blockstun: 16, push: 10, launch: [1.4, 7.4], hitstop: 10, spark: 'big', shake: 4 }
            ],
            sfx: 'swingHeavy'
        },
        specialD: {
            name: "Gura Gura — saisie de l'air", anim: 'specialD', kind: 'special', stance: 'stand',
            durations: [2, 2, 2, 3, 3, 4, 4, 4, 5, 6, 6, 8],
            hits: [
                { frames: [6, 6], box: [10, 0, 76, 80], damage: 60, guard: 'low', hitstun: 30, blockstun: 14, push: 4, hitstop: 10, spark: 'quake', shake: 5 },
                { frames: [7, 8], box: [24, 0, 96, 100], damage: 52, guard: 'low', hitstun: 26, blockstun: 16, push: 12, knockdown: true, launch: [1.4, 6.2], hitstop: 12, spark: 'big', shake: 6 }
            ],
            fx: [[6, 'fx_erupt', 50, 48], [7, 'fx_erupt', 96, 48]],
            sfx: 'quake'
        },
        ultimate: {
            name: 'Kaishin', anim: 'ultimate', kind: 'ultimate', stance: 'stand',
            durations: [6, 5, 5, 5, 5, 6, 4, 6, 6, 6, 6, 6, 8, 10, 10, 12],
            superFreeze: 55, cost: 100, invuln: [0, 8],
            hits: [
                { frames: [6, 6], box: [-10, 0, 170, 130], damage: 90, guard: 'mid', hitstun: 60, blockstun: 20, push: 2, hitstop: 10, spark: 'quake', shake: 8 },
                { frames: [8, 10], box: [-10, 0, 170, 130], damage: 40, guard: 'mid', hitstun: 50, blockstun: 12, push: 1, rehit: 10, hitstop: 4, spark: 'quake', shake: 4 },
                { frames: [12, 12], box: [-10, 0, 170, 130], damage: 210, guard: 'mid', hitstun: 50, blockstun: 22, push: 30, launch: [6.0, 6.0], wallBounce: true, hitstop: 24, spark: 'big', shake: 12 }
            ],
            fx: [[6, 'fx_kaishin', 72, 52], [9, 'fx_erupt', 70, 48], [12, 'fx_kaishin', 96, 56]],
            sfx: 'quake'
        },
        ultimate2: {
            // The stomp that shakes the island, the fist that cracks the sky,
            // then the bisento brought down on the ground: the quake runs
            // across the whole screen in eruptions and a tidal wave of light.
            name: 'Shima Yurashi', anim: 'ultimate2', kind: 'ultimate', stance: 'stand',
            durations: [3, 3, 2, 2, 8, 5, 5, 6, 5, 8, 6, 8, 5, 5, 4, 4, 4, 4, 4, 5, 14, 8, 8, 10, 16],
            superFreeze: 70, cost: 200, invuln: [0, 8],
            hits: [
                { frames: [4, 4], box: [-30, 0, 180, 100], damage: 110, guard: 'mid', hitstun: 70, blockstun: 22, push: 2, hitstop: 12, spark: 'quake', shake: 9, sfx: 'quake' },
                { frames: [9, 9], box: [-30, 0, 180, 150], damage: 60, guard: 'mid', hitstun: 70, blockstun: 16, push: 1, hitstop: 8, spark: 'quake', shake: 8 },
                { frames: [11, 11], box: [-30, 0, 180, 150], damage: 60, guard: 'mid', hitstun: 70, blockstun: 16, push: 1, hitstop: 8, spark: 'quake', shake: 8, sfx: 'quake' },
                { frames: [19, 19], box: [0, 0, 160, 140], damage: 90, guard: 'mid', hitstun: 60, blockstun: 16, push: 1, hitstop: 10, spark: 'big', shake: 6 },
                { frames: [20, 20], box: [-10, 0, 230, 150], damage: 250, guard: 'mid', hitstun: 50, blockstun: 24, push: 30, knockdown: true, launch: [5.4, 6.6], hitstop: 26, spark: 'big', shake: 14, sfx: 'quake' }
            ],
            fx: [
                [4, 'fx_erupt', 30, 46], [4, 'fx_quakewave', 90, 18],
                [9, 'fx_kaishin', 30, 146], [9, 'fx_bubble', 12, 130], [11, 'fx_kaishin', 90, 130], [11, 'fx_bubble', 12, 130],
                [19, 'fx_bubble', 90, 80],
                [20, 'fx_erupt', 70, 46], [20, 'fx_quakewave', 120, 18], [20, 'fx_crack', 80, 60],
                [21, 'fx_erupt', 130, 46], [22, 'fx_erupt', 190, 46], [22, 'fx_quakewave', 220, 18],
                [23, 'fx_kaishin', 170, 64]
            ],
            sfx: 'gigant'
        },
        throw: {
            name: 'Poigne de Newgate', anim: 'throw', kind: 'throw', stance: 'stand',
            durations: [3, 4, 5, 5, 4, 6, 6, 6, 8],
            hits: [{ frames: [0, 1], box: [4, 16, 34, 56], damage: 0, guard: 'unblockable', hitstun: 0, blockstun: 0, push: 0 }],
            throwRelease: { frame: 4, damage: 120, launch: [3.6, 5.2] },
            fx: [[4, 'fx_bubble', 56, 62], [4, 'fx_crack', 60, 60]],
            sfx: 'grab'
        }
    }
};
