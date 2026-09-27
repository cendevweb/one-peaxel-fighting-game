import manifest from '../generated/sprites/shiki.json';
import type { CharacterDef, SpriteManifest } from '../engine/types';

/**
 * Shiki le Lion d'or — Fuwa Fuwa no Mi, the two swords Ōka and Kogarashi
 * in place of legs. He floats rather than stands: long leg-sword slashes,
 * the golden Kogarashi crescent for mid range, a levitated boulder pushed
 * across the stage, the flip slash as his reversal. Shishi Odoshi (earth
 * lions) is the ultimate; with two bars, Shishi Odoshi: Chimaki adds the
 * golden lion and the earth spirals that burst from the ground.
 *
 * Every animation and effect comes from the Gigant Battle 2 sheet
 * (tools/sprites/chars/shiki.json): crescents, lions, spirals, rock and
 * shock rings are the sheet's own effect rows. Every `durations` array has
 * one entry per animation frame.
 */
export const shiki: CharacterDef = {
    id: 'shiki',
    name: 'Shiki',
    title: "Le Lion d'or",
    health: 1080,
    walk: 1.4,
    back: 1.2,
    dash: 4.4,
    backdash: [3.6, 2.4],
    jump: [2.2, 7.0],
    gravity: 0.34,
    width: 15,
    height: 76,
    crouchHeight: 56,
    color: '#e8b830',
    manifest: manifest as unknown as SpriteManifest,
    moves: {
        lightA: {
            name: 'Paume', anim: 'lightA', kind: 'normal', stance: 'stand',
            durations: [3, 3, 3, 7],
            hits: [{ frames: [1, 2], box: [4, 34, 40, 16], damage: 30, guard: 'mid', hitstun: 14, blockstun: 9, push: 6, hitstop: 6, spark: 'light' }],
            chain: ['lightB', 'crouchLight', 'heavy', 'heavyFwd', 'heavyBack', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        lightB: {
            name: 'Taille de Ōka', anim: 'lightB', kind: 'normal', stance: 'stand',
            durations: [3, 3, 3, 3, 7],
            hits: [{ frames: [2, 3], box: [2, 8, 46, 50], damage: 36, guard: 'mid', hitstun: 16, blockstun: 10, push: 7, hitstop: 7, spark: 'cut' }],
            chain: ['lightC', 'heavy', 'heavyFwd', 'crouchHeavy'], cancelable: true, sfx: 'slash'
        },
        lightC: {
            name: 'Moulinet des jambes-sabres', anim: 'lightC', kind: 'normal', stance: 'stand',
            durations: [4, 3, 3, 3, 4, 5, 7],
            hits: [{ frames: [2, 3], box: [0, 4, 60, 40], damage: 54, guard: 'mid', hitstun: 18, blockstun: 12, push: 18, hitstop: 9, spark: 'blade', shake: 2 }],
            cancelable: true, sfx: 'slash'
        },
        crouchLight: {
            name: 'Taille rasante', anim: 'crouchLight', kind: 'normal', stance: 'crouch',
            durations: [3, 4, 6],
            hits: [{ frames: [1, 1], box: [6, 0, 44, 16], damage: 26, guard: 'low', hitstun: 12, blockstun: 8, push: 8, hitstop: 6, spark: 'cut' }],
            chain: ['crouchLight', 'lightB', 'crouchHeavy'], cancelable: true, sfx: 'slash'
        },
        crouchHeavy: {
            name: 'Fauchage de Kogarashi', anim: 'crouchHeavy', kind: 'normal', stance: 'crouch',
            durations: [5, 4, 4, 5, 10],
            hits: [{ frames: [2, 3], box: [4, 0, 58, 22], damage: 68, guard: 'low', hitstun: 20, blockstun: 12, push: 14, knockdown: true, launch: [1.2, 2.6], hitstop: 10, spark: 'blade' }],
            cancelable: true, sfx: 'slash'
        },
        heavy: {
            name: 'Jambe-sabre levée', anim: 'heavy', kind: 'normal', stance: 'stand',
            durations: [4, 4, 3, 4, 4, 5, 6, 7],
            hits: [{ frames: [2, 4], box: [0, 10, 44, 86], damage: 74, guard: 'mid', hitstun: 22, blockstun: 14, push: 16, hitstop: 11, spark: 'blade', shake: 2 }],
            cancelable: true, sfx: 'slashHeavy'
        },
        heavyFwd: {
            name: 'Paume flottante', anim: 'heavyFwd', kind: 'normal', stance: 'stand',
            durations: [4, 4, 4, 3, 3, 4, 6, 8],
            motion: [[2, 3.2, 0], [5, 0, 0]],
            hits: [{ frames: [3, 5], box: [4, 24, 50, 30], damage: 80, guard: 'mid', hitstun: 22, blockstun: 14, push: 18, hitstop: 12, spark: 'heavy', shake: 3 }],
            cancelable: true, sfx: 'swingHeavy'
        },
        heavyBack: {
            name: 'Croissant ascendant', anim: 'heavyBack', kind: 'normal', stance: 'stand',
            durations: [4, 3, 3, 4, 5, 6, 7],
            hits: [{ frames: [2, 4], box: [-4, 20, 52, 70], damage: 64, guard: 'mid', hitstun: 22, blockstun: 12, push: 8, launch: [0.6, 6.4], hitstop: 10, spark: 'blade' }],
            invuln: [1, 2],
            cancelable: true, sfx: 'slash'
        },
        airLight: {
            name: 'Taille plongeante', anim: 'airLight', kind: 'normal', stance: 'air',
            durations: [3, 4, 8],
            hits: [{ frames: [1, 2], box: [-2, -8, 50, 34], damage: 36, guard: 'high', hitstun: 14, blockstun: 9, push: 8, hitstop: 7, spark: 'cut' }],
            chain: ['airHeavy'], cancelable: true, sfx: 'slash'
        },
        airHeavy: {
            name: 'Balayage de crinière', anim: 'airHeavy', kind: 'normal', stance: 'air',
            durations: [3, 3, 4, 4, 6, 8],
            hits: [{ frames: [1, 3], box: [0, 0, 56, 44], damage: 64, guard: 'high', hitstun: 18, blockstun: 12, push: 12, hitstop: 10, spark: 'heavy' }],
            cancelable: true, landLag: 5, sfx: 'swingHeavy'
        },
        airSpecial: {
            name: 'Ōka — vrille plongeante', anim: 'airSpecial', kind: 'special', stance: 'air',
            durations: [4, 3, 3, 3, 30, 4, 5, 6, 8],
            motion: [[1, 2.4, -5.6]],
            noGravity: true, landFrame: 5,
            hits: [{ frames: [1, 4], box: [-6, -6, 52, 50], damage: 84, guard: 'high', hitstun: 20, blockstun: 14, push: 16, knockdown: true, launch: [1.6, 3.6], hitstop: 12, spark: 'blade', shake: 4 }],
            fx: [[5, 'fx_spikes', 20, 0]],
            sfx: 'slashHeavy'
        },
        specialN: {
            name: 'Kogarashi', anim: 'specialN', kind: 'special', stance: 'stand',
            durations: [4, 3, 4, 3, 4, 6, 7, 8],
            hits: [],
            projectile: {
                anim: 'fx_crescent', atFrame: 3, offset: [44, 42], speed: 4.6, life: 80,
                box: [-14, -26, 28, 52], fps: 10, hits: 1,
                hit: { damage: 80, guard: 'mid', hitstun: 22, blockstun: 16, push: 18, hitstop: 11, spark: 'blade', shake: 2, sfx: 'slashHeavy' }
            },
            sfx: 'slashHeavy'
        },
        specialF: {
            name: 'Zan Sword', anim: 'specialF', kind: 'special', stance: 'stand',
            durations: [2, 2, 2, 2, 2, 2, 2, 3, 3, 4, 6, 6, 8],
            motion: [[7, 6.6, 0], [10, 0, 0]],
            hits: [{ frames: [7, 9], box: [-6, 16, 66, 40], damage: 96, guard: 'mid', hitstun: 24, blockstun: 14, push: 22, launch: [3.0, 3.6], hitstop: 14, spark: 'blade', shake: 4 }],
            sfx: 'slashHeavy'
        },
        specialU: {
            name: 'Kogarashi — croissant renversé', anim: 'specialU', kind: 'special', stance: 'stand',
            durations: [3, 3, 3, 3, 3, 4, 4, 5, 5, 7, 8],
            motion: [[2, 1.2, 6.6]],
            invuln: [0, 4],
            hits: [
                { frames: [2, 4], box: [-12, 16, 52, 70], damage: 58, guard: 'mid', hitstun: 24, blockstun: 16, push: 8, launch: [0.8, 6.8], hitstop: 10, spark: 'blade', shake: 3 },
                { frames: [5, 8], box: [-14, -6, 58, 80], damage: 48, guard: 'mid', hitstun: 24, blockstun: 16, push: 10, launch: [1.4, 7.2], hitstop: 10, spark: 'big', shake: 4 }
            ],
            sfx: 'slashHeavy'
        },
        specialD: {
            name: 'Fuwa Fuwa — rocher flottant', anim: 'specialD', kind: 'special', stance: 'stand',
            durations: [6, 5, 5, 6, 8, 10],
            hits: [],
            projectile: {
                anim: 'fx_rock', atFrame: 2, offset: [70, 50], speed: 3.4, life: 90,
                box: [-44, -30, 88, 60], hits: 1,
                hit: { damage: 96, guard: 'mid', hitstun: 26, blockstun: 18, push: 24, knockdown: true, launch: [2.4, 4.0], hitstop: 14, spark: 'big', shake: 6, sfx: 'quake' }
            },
            sfx: 'gigant'
        },
        // One bar: the turning slash, then Shiki lunges and the earth lion
        // of Shishi Odoshi charges across the stage.
        ultimate: {
            name: 'Shishi Odoshi', anim: 'ultimate', kind: 'ultimate', stance: 'stand',
            durations: [5, 5, 4, 4, 4, 4, 5, 6, 6, 8, 10, 12],
            superFreeze: 55, cost: 100, invuln: [0, 7],
            hits: [
                { frames: [5, 6], box: [-10, 0, 72, 84], damage: 40, guard: 'mid', hitstun: 60, blockstun: 20, push: 2, rehit: 4, hitstop: 5, spark: 'blade', shake: 3 }
            ],
            projectile: {
                anim: 'fx_lion', atFrame: 7, offset: [50, 52], speed: 5.2, life: 90,
                box: [-66, -54, 132, 108], fps: 10, hits: 1,
                hit: { damage: 260, guard: 'mid', hitstun: 50, blockstun: 22, push: 30, launch: [5.4, 5.6], wallBounce: true, hitstop: 22, spark: 'big', shake: 10, sfx: 'gigant' }
            },
            fx: [[7, 'fx_lionW', 60, 52]],
            sfx: 'slashHeavy'
        },
        // Two bars: the same slash, the lunge that carries the foe, the cape
        // spread that looses the golden lion, then the raised fist and the
        // leg-sword planted in the ground: three earth spirals (Chimaki)
        // burst up under the foe.
        ultimate2: {
            name: 'Shishi Odoshi : Chimaki', anim: 'ultimate2', kind: 'ultimate', stance: 'stand',
            durations: [4, 4, 3, 3, 4, 4, 5, 4, 4, 4, 4, 5, 5, 4, 4, 5, 6, 5, 5, 5, 6, 5, 5, 6, 8, 12],
            superFreeze: 70, cost: 200, invuln: [0, 12],
            motion: [[7, 5.2, 0], [11, 0, 0]],
            hits: [
                { frames: [5, 6], box: [-10, 0, 72, 84], damage: 110, guard: 'mid', hitstun: 60, blockstun: 20, push: 1, hitstop: 10, spark: 'blade', shake: 4 },
                { frames: [7, 11], box: [-8, 0, 70, 70], damage: 70, guard: 'mid', hitstun: 60, blockstun: 18, push: 1, hitstop: 8, spark: 'blade', shake: 3 },
                { frames: [21, 23], box: [0, 0, 260, 130], damage: 90, guard: 'mid', hitstun: 50, blockstun: 22, push: 1, hitstop: 10, spark: 'heavy', shake: 8, sfx: 'quake' },
                { frames: [24, 24], box: [0, 0, 260, 150], damage: 130, guard: 'mid', hitstun: 50, blockstun: 22, push: 20, launch: [3.0, 8.0], knockdown: true, hitstop: 22, spark: 'big', shake: 12 }
            ],
            projectile: {
                anim: 'fx_goldlion', atFrame: 13, offset: [50, 52], speed: 5.6, life: 80,
                box: [-66, -54, 132, 108], fps: 10, hits: 1,
                hit: { damage: 160, guard: 'mid', hitstun: 70, blockstun: 24, push: 4, hitstop: 18, spark: 'big', shake: 8, sfx: 'gigant' }
            },
            fx: [[12, 'fx_lionW', 60, 52], [17, 'fx_ring', 0, 60], [21, 'fx_spikes', 10, 0], [21, 'fx_spire', 60, 0], [22, 'fx_spire', 130, 0], [23, 'fx_spire', 200, 0]],
            sfx: 'slashHeavy'
        },
        throw: {
            name: 'Fuwa Fuwa — lévitation', anim: 'throw', kind: 'throw', stance: 'stand',
            durations: [3, 4, 4, 4, 4, 6, 6, 6, 8],
            hits: [{ frames: [0, 1], box: [4, 14, 32, 44], damage: 0, guard: 'unblockable', hitstun: 0, blockstun: 0, push: 0 }],
            throwRelease: { frame: 5, damage: 110, launch: [1.4, 7.6] },
            fx: [[5, 'fx_ring', 36, 70]],
            sfx: 'grab'
        }
    }
};
