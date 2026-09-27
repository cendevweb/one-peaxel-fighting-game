import manifest from '../generated/sprites/mihawk.json';
import type { CharacterDef, SpriteManifest } from '../engine/types';

/**
 * Dracule Mihawk — the greatest swordsman, and Yoru's reach. Slow, long
 * normals drawn with the black blade's trails; the flying crescent slash
 * for mid range, a dashing cut, the rising Yoru slash as his reversal and
 * the Kogatana, the little cross-shaped knife, stabbed in a flurry.
 * The ultimate is the giant Yoru slash whose ground wave crosses the
 * stage; two bars unleash Kokutō Issen, the sheet's longest sequence.
 *
 * Every animation and effect comes from the Gigant Battle sheet
 * (tools/sprites/chars/mihawk.json): the white crescent, the long purple
 * wave, the ground spikes of the dive, the orange flash and the smoke of
 * Kokutō Issen are the sheet's own effect rows. Every `durations` array has
 * one entry per animation frame.
 */
export const mihawk: CharacterDef = {
    id: 'mihawk',
    name: 'Mihawk',
    title: 'Le plus grand sabreur',
    health: 1030,
    walk: 1.5,
    back: 1.3,
    dash: 4.6,
    backdash: [3.8, 2.6],
    jump: [2.2, 7.1],
    gravity: 0.37,
    width: 12,
    height: 66,
    crouchHeight: 44,
    color: '#8c2f4a',
    manifest: manifest as unknown as SpriteManifest,
    moves: {
        lightA: {
            name: 'Estoc de Yoru', anim: 'lightA', kind: 'normal', stance: 'stand',
            durations: [3, 3, 3, 7],
            hits: [{ frames: [1, 2], box: [6, 26, 56, 18], damage: 30, guard: 'mid', hitstun: 14, blockstun: 9, push: 7, hitstop: 6, spark: 'cut' }],
            chain: ['lightB', 'crouchLight', 'heavy', 'heavyFwd', 'heavyBack', 'crouchHeavy'], cancelable: true, sfx: 'slash'
        },
        lightB: {
            name: 'Taille plongeante', anim: 'lightB', kind: 'normal', stance: 'stand',
            durations: [3, 3, 3, 4, 7],
            hits: [{ frames: [1, 2], box: [4, 10, 50, 70], damage: 36, guard: 'mid', hitstun: 16, blockstun: 10, push: 7, hitstop: 7, spark: 'cut' }],
            chain: ['lightC', 'heavy', 'heavyFwd', 'crouchHeavy'], cancelable: true, sfx: 'slash'
        },
        lightC: {
            name: 'Grand arc noir', anim: 'lightC', kind: 'normal', stance: 'stand',
            durations: [3, 3, 3, 4, 4, 4, 5, 7],
            hits: [{ frames: [2, 3], box: [0, 8, 60, 92], damage: 54, guard: 'mid', hitstun: 19, blockstun: 12, push: 18, hitstop: 9, spark: 'blade', shake: 2 }],
            cancelable: true, sfx: 'slash'
        },
        crouchLight: {
            name: 'Estoc bas', anim: 'crouchLight', kind: 'normal', stance: 'crouch',
            durations: [3, 4, 6],
            hits: [{ frames: [1, 1], box: [6, 2, 40, 16], damage: 24, guard: 'low', hitstun: 12, blockstun: 8, push: 8, hitstop: 6, spark: 'cut' }],
            chain: ['crouchLight', 'lightB', 'crouchHeavy'], cancelable: true, sfx: 'slash'
        },
        crouchHeavy: {
            name: 'Fauchage de Yoru', anim: 'crouchHeavy', kind: 'normal', stance: 'crouch',
            durations: [6, 3, 4, 5, 10],
            hits: [{ frames: [1, 2], box: [6, 0, 60, 40], damage: 70, guard: 'low', hitstun: 20, blockstun: 12, push: 14, knockdown: true, launch: [1.2, 2.6], hitstop: 10, spark: 'blade' }],
            cancelable: true, sfx: 'slashHeavy'
        },
        heavy: {
            name: 'Taille descendante', anim: 'heavy', kind: 'normal', stance: 'stand',
            durations: [5, 4, 3, 4, 6, 8],
            hits: [{ frames: [2, 3], box: [2, 6, 52, 78], damage: 76, guard: 'mid', hitstun: 21, blockstun: 14, push: 18, hitstop: 11, spark: 'blade', shake: 2 }],
            cancelable: true, sfx: 'slashHeavy'
        },
        heavyFwd: {
            name: 'Chute de Yoru', anim: 'heavyFwd', kind: 'normal', stance: 'stand',
            durations: [4, 4, 4, 3, 3, 4, 5, 6, 6],
            hits: [{ frames: [3, 4], box: [6, 0, 58, 110], damage: 82, guard: 'high', hitstun: 22, blockstun: 14, push: 14, hitstop: 12, spark: 'blade', shake: 4 }],
            cancelable: true, sfx: 'slashHeavy'
        },
        heavyBack: {
            name: 'Estoc ascendant', anim: 'heavyBack', kind: 'normal', stance: 'stand',
            durations: [4, 3, 3, 3, 4, 6, 7],
            hits: [{ frames: [3, 5], box: [4, 30, 70, 84], damage: 64, guard: 'mid', hitstun: 22, blockstun: 12, push: 8, launch: [0.6, 6.4], hitstop: 10, spark: 'blade' }],
            invuln: [1, 2],
            cancelable: true, sfx: 'slash'
        },
        airLight: {
            name: 'Taille aérienne', anim: 'airLight', kind: 'normal', stance: 'air',
            durations: [3, 3, 4, 10],
            hits: [{ frames: [1, 2], box: [-4, 0, 52, 60], damage: 34, guard: 'high', hitstun: 14, blockstun: 9, push: 8, hitstop: 7, spark: 'cut' }],
            chain: ['airHeavy'], cancelable: true, sfx: 'slash'
        },
        airHeavy: {
            name: 'Double croissant aérien', anim: 'airHeavy', kind: 'normal', stance: 'air',
            durations: [3, 3, 3, 4, 4, 5, 8],
            hits: [{ frames: [3, 5], box: [-4, -10, 62, 72], damage: 68, guard: 'high', hitstun: 18, blockstun: 12, push: 12, hitstop: 10, spark: 'blade' }],
            cancelable: true, landLag: 5, sfx: 'slash'
        },
        // Yoru held point down, Mihawk drops on the blade: it bites into the
        // ground and the black spikes burst around it.
        airSpecial: {
            name: 'Chute de la lame noire', anim: 'airSpecial', kind: 'special', stance: 'air',
            durations: [5, 30, 4, 5, 6, 6, 5, 6],
            motion: [[1, 1.6, -6.4]],
            noGravity: true, landFrame: 2,
            hits: [
                { frames: [1, 2], box: [-12, -8, 36, 60], damage: 70, guard: 'high', hitstun: 22, blockstun: 14, push: 8, hitstop: 10, spark: 'blade', shake: 3 },
                { frames: [3, 3], box: [-30, 0, 90, 40], damage: 40, guard: 'mid', hitstun: 24, blockstun: 12, push: 14, knockdown: true, launch: [1.6, 4.0], hitstop: 10, spark: 'big', shake: 5 }
            ],
            fx: [[2, 'fx_spikes', 10, 26], [2, 'fx_don', -26, 110]],
            sfx: 'slashHeavy'
        },
        specialN: {
            name: 'Zangeki — croissant volant', anim: 'specialN', kind: 'special', stance: 'stand',
            durations: [5, 4, 4, 4, 4, 6, 8],
            hits: [],
            projectile: {
                anim: 'fx_crescent', atFrame: 3, offset: [52, 40], speed: 4.6, life: 80,
                box: [-16, -40, 32, 80], fps: 12, hits: 1,
                hit: { damage: 78, guard: 'mid', hitstun: 22, blockstun: 16, push: 18, hitstop: 11, spark: 'blade', shake: 2, sfx: 'slashHeavy' }
            },
            fx: [[3, 'fx_arc', 34, 44]],
            sfx: 'slashHeavy'
        },
        specialF: {
            name: 'Ruée de Yoru', anim: 'specialF', kind: 'special', stance: 'stand',
            durations: [4, 4, 5, 3, 3, 4, 8, 8],
            motion: [[3, 6.4, 0], [6, 0, 0]],
            hits: [{ frames: [3, 5], box: [-6, 4, 64, 50], damage: 94, guard: 'mid', hitstun: 24, blockstun: 14, push: 22, launch: [3.0, 3.6], hitstop: 14, spark: 'blade', shake: 4 }],
            sfx: 'slashHeavy'
        },
        specialU: {
            name: 'Taille céleste', anim: 'specialU', kind: 'special', stance: 'stand',
            durations: [3, 3, 3, 4, 4, 5, 6, 6, 5, 5, 6],
            motion: [[2, 1.0, 6.4]],
            invuln: [0, 3],
            hits: [
                { frames: [2, 3], box: [-10, 14, 56, 100], damage: 64, guard: 'mid', hitstun: 24, blockstun: 16, push: 8, launch: [0.8, 6.8], hitstop: 10, spark: 'blade', shake: 3 },
                { frames: [4, 5], box: [-10, 60, 56, 80], damage: 44, guard: 'mid', hitstun: 24, blockstun: 16, push: 10, launch: [1.2, 7.2], hitstop: 10, spark: 'big', shake: 4 }
            ],
            sfx: 'slashHeavy'
        },
        // The little cross-shaped knife: a dash, then a flurry of stabs.
        specialD: {
            name: 'Kogatana', anim: 'specialD', kind: 'special', stance: 'stand',
            durations: [4, 4, 4, 5, 5, 5, 6, 10],
            motion: [[0, 4.4, 0], [3, 0, 0]],
            hits: [
                { frames: [2, 5], box: [0, 22, 62, 30], damage: 20, guard: 'mid', hitstun: 22, blockstun: 10, push: 2, rehit: 5, hitstop: 4, spark: 'cut' },
                { frames: [6, 6], box: [0, 22, 62, 30], damage: 44, guard: 'mid', hitstun: 26, blockstun: 14, push: 16, launch: [2.4, 4.6], hitstop: 12, spark: 'blade', shake: 3 }
            ],
            sfx: 'slash'
        },
        // One bar: Yoru rises above the head, comes down, and the giant
        // wave it sends skims the ground across the whole stage.
        ultimate: {
            name: 'Yoru — entaille géante', anim: 'ultimate', kind: 'ultimate', stance: 'stand',
            durations: [5, 5, 5, 4, 4, 6, 6, 8, 4, 6, 10, 12],
            superFreeze: 55, cost: 100, invuln: [0, 8],
            motion: [[8, 3.4, 0], [9, 0, 0]],
            hits: [
                { frames: [0, 1], box: [0, 14, 84, 30], damage: 45, guard: 'mid', hitstun: 70, blockstun: 20, push: 1, hitstop: 6, spark: 'cut', shake: 2 },
                { frames: [8, 9], box: [-10, 0, 92, 70], damage: 80, guard: 'mid', hitstun: 60, blockstun: 20, push: 2, hitstop: 10, spark: 'blade', shake: 5 }
            ],
            projectile: {
                anim: 'fx_wave', atFrame: 8, offset: [70, 22], speed: 6.0, life: 100,
                box: [-110, -22, 200, 44], fps: 10, hits: 1,
                hit: { damage: 220, guard: 'mid', hitstun: 50, blockstun: 24, push: 30, launch: [5.6, 6.0], wallBounce: true, knockdown: true, hitstop: 24, spark: 'big', shake: 10, sfx: 'slashHeavy' }
            },
            fx: [[8, 'fx_arc', 40, 50]],
            sfx: 'slashHeavy'
        },
        // Two bars: Kokutō Issen. Three great strokes of the black blade,
        // then a flash-step through the opponent and the orange streak of
        // the cut, which bursts into smoke.
        ultimate2: {
            name: 'Kokutō Issen', anim: 'ultimate2', kind: 'ultimate', stance: 'stand',
            durations: [6, 6, 6, 3, 5, 4, 4, 4, 3, 5, 4, 4, 4, 3, 5, 4, 4, 6, 8, 4, 4, 6, 8, 10, 12],
            superFreeze: 70, cost: 200, invuln: [0, 19],
            motion: [[19, 7.0, 0], [20, 0, 0]],
            hits: [
                { frames: [3, 4], box: [-10, 0, 92, 110], damage: 60, guard: 'mid', hitstun: 70, blockstun: 20, push: 2, hitstop: 8, spark: 'blade', shake: 3 },
                { frames: [8, 9], box: [-10, 0, 92, 120], damage: 80, guard: 'mid', hitstun: 70, blockstun: 20, push: 2, hitstop: 8, spark: 'blade', shake: 4 },
                { frames: [13, 14], box: [-10, 0, 92, 120], damage: 90, guard: 'mid', hitstun: 80, blockstun: 20, push: 2, hitstop: 10, spark: 'blade', shake: 4 },
                { frames: [19, 19], box: [-20, 0, 150, 90], damage: 150, guard: 'mid', hitstun: 80, blockstun: 22, push: 1, hitstop: 14, spark: 'big', shake: 6 },
                { frames: [21, 21], box: [-40, 0, 160, 110], damage: 200, guard: 'mid', hitstun: 50, blockstun: 24, push: 30, launch: [5.8, 6.2], wallBounce: true, knockdown: true, hitstop: 26, spark: 'big', shake: 12 }
            ],
            fx: [[19, 'fx_streak', 40, 40], [21, 'fx_flash', 40, 46], [22, 'fx_smoke', 50, 40], [22, 'fx_dogon', 30, 110]],
            sfx: 'slashHeavy'
        },
        throw: {
            name: 'Garde de Yoru', anim: 'throw', kind: 'throw', stance: 'stand',
            durations: [3, 4, 4, 4, 4, 6, 6, 8],
            hits: [{ frames: [0, 1], box: [4, 10, 30, 40], damage: 0, guard: 'unblockable', hitstun: 0, blockstun: 0, push: 0 }],
            throwRelease: { frame: 4, damage: 110, launch: [2.6, 5.0] },
            fx: [[4, 'fx_spark', 30, 40]],
            sfx: 'grab'
        }
    }
};
