import manifest from '../generated/sprites/aokiji.json';
import type { CharacterDef, SpriteManifest } from '../engine/types';

/**
 * Aokiji (Kuzan), Hie Hie no Mi — the lazy admiral who freezes everything he
 * touches. Frosted palm and long kicks for normals, the Ice Saber for reach,
 * Partisan (a volley of ice spears) from afar, the Ice Time charge that
 * crosses the screen, a frost uppercut as his reversal and Ice Age, a wall of
 * ice spikes rising along the ground. Ice Block: Pheasant Beak is the
 * ultimate: a giant ice pheasant that ploughs through the opponent.
 *
 * Every animation and effect comes from the Gigant Battle sheet
 * (tools/sprites/chars/aokiji.json): the spears, the ice mountain, the ice
 * sphere of Ice Time and the pheasant are the sheet's own effect rows. Every
 * `durations` array has one entry per animation frame.
 */
export const aokiji: CharacterDef = {
    id: 'aokiji',
    name: 'Aokiji',
    title: 'Amiral de glace',
    health: 1040,
    walk: 1.4,
    back: 1.2,
    dash: 4.6,
    backdash: [3.6, 2.4],
    jump: [2.2, 7.1],
    gravity: 0.36,
    width: 13,
    height: 74,
    crouchHeight: 46,
    color: '#7cc4ec',
    manifest: manifest as unknown as SpriteManifest,
    moves: {
        lightA: {
            name: 'Paume givrée', anim: 'lightA', kind: 'normal', stance: 'stand',
            durations: [3, 4, 7],
            hits: [{ frames: [1, 1], box: [4, 36, 42, 30], damage: 30, guard: 'mid', hitstun: 14, blockstun: 9, push: 6, hitstop: 6, spark: 'ice' }],
            chain: ['lightB', 'crouchLight', 'heavy', 'heavyFwd', 'heavyBack', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        lightB: {
            name: 'Coup de pied glacé', anim: 'lightB', kind: 'normal', stance: 'stand',
            durations: [3, 3, 3, 3, 4, 6],
            hits: [{ frames: [2, 3], box: [4, 34, 46, 28], damage: 36, guard: 'mid', hitstun: 16, blockstun: 10, push: 7, hitstop: 7, spark: 'ice' }],
            chain: ['lightC', 'heavy', 'heavyFwd', 'heavyBack', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        lightC: {
            name: 'Ice Saber', anim: 'lightC', kind: 'normal', stance: 'stand',
            durations: [5, 3, 3, 3, 4, 8],
            hits: [{ frames: [1, 3], box: [0, 18, 62, 38], damage: 52, guard: 'mid', hitstun: 18, blockstun: 12, push: 18, hitstop: 9, spark: 'ice', shake: 2 }],
            cancelable: true, sfx: 'slash'
        },
        crouchLight: {
            name: 'Taille rasante', anim: 'crouchLight', kind: 'normal', stance: 'crouch',
            durations: [3, 3, 6],
            hits: [{ frames: [1, 1], box: [4, 2, 50, 20], damage: 24, guard: 'low', hitstun: 12, blockstun: 8, push: 8, hitstop: 6, spark: 'ice' }],
            chain: ['crouchLight', 'lightB', 'crouchHeavy'], cancelable: true, sfx: 'slash'
        },
        crouchHeavy: {
            name: 'Pieux de glace', anim: 'crouchHeavy', kind: 'normal', stance: 'crouch',
            durations: [4, 4, 4, 4, 4, 5, 6, 8],
            hits: [{ frames: [2, 4], box: [14, 0, 50, 34], damage: 66, guard: 'low', hitstun: 20, blockstun: 12, push: 12, knockdown: true, launch: [1.2, 3.0], hitstop: 10, spark: 'ice' }],
            fx: [[2, 'fx_spikes', 40, 0]],
            cancelable: true, sfx: 'ice'
        },
        heavy: {
            name: 'Coup de pied de l\'amiral', anim: 'heavy', kind: 'normal', stance: 'stand',
            durations: [4, 4, 4, 3, 3, 3, 4, 6, 8],
            hits: [{ frames: [3, 5], box: [4, 34, 56, 28], damage: 72, guard: 'mid', hitstun: 21, blockstun: 14, push: 18, hitstop: 11, spark: 'ice', shake: 2 }],
            fx: [[3, 'fx_frost', 54, 48]],
            cancelable: true, sfx: 'swingHeavy'
        },
        heavyFwd: {
            name: 'Ice Saber — taille haute', anim: 'heavyFwd', kind: 'normal', stance: 'stand',
            durations: [5, 4, 4, 3, 4, 6, 10],
            hits: [{ frames: [3, 4], box: [0, 24, 72, 90], damage: 78, guard: 'high', hitstun: 22, blockstun: 14, push: 14, hitstop: 12, spark: 'ice', shake: 3 }],
            cancelable: true, sfx: 'slashHeavy'
        },
        heavyBack: {
            name: 'Ice Saber — estoc montant', anim: 'heavyBack', kind: 'normal', stance: 'stand',
            durations: [4, 3, 3, 3, 3, 4, 5, 6, 7],
            hits: [{ frames: [3, 5], box: [0, 28, 60, 80], damage: 62, guard: 'mid', hitstun: 22, blockstun: 12, push: 8, launch: [0.6, 6.4], hitstop: 10, spark: 'ice' }],
            invuln: [1, 2],
            cancelable: true, sfx: 'slash'
        },
        airLight: {
            name: 'Paume aérienne', anim: 'airLight', kind: 'normal', stance: 'air',
            durations: [3, 4, 8],
            hits: [{ frames: [1, 2], box: [0, 26, 46, 34], damage: 34, guard: 'high', hitstun: 14, blockstun: 9, push: 8, hitstop: 7, spark: 'ice' }],
            chain: ['airHeavy'], cancelable: true, sfx: 'swing'
        },
        airHeavy: {
            name: 'Chute de stalactites', anim: 'airHeavy', kind: 'normal', stance: 'air',
            durations: [4, 4, 4, 6, 8],
            hits: [{ frames: [1, 3], box: [-12, -26, 50, 56], damage: 64, guard: 'high', hitstun: 18, blockstun: 12, push: 12, hitstop: 10, spark: 'ice' }],
            fx: [[1, 'fx_icicles', 8, 0]],
            cancelable: true, landLag: 6, sfx: 'ice'
        },
        airSpecial: {
            name: 'Ice Age — plongeon', anim: 'airSpecial', kind: 'special', stance: 'air',
            durations: [4, 3, 3, 30, 5, 8],
            motion: [[2, 2.6, -6.2]],
            noGravity: true, landFrame: 4,
            hits: [{ frames: [2, 3], box: [-6, -8, 50, 50], damage: 80, guard: 'high', hitstun: 20, blockstun: 14, push: 16, knockdown: true, launch: [1.6, 3.6], hitstop: 12, spark: 'ice', shake: 4 }],
            fx: [[2, 'fx_dive', -20, 30], [4, 'fx_spikes', 20, 0]],
            sfx: 'ice'
        },
        specialN: {
            name: 'Ice Block — Partisan', anim: 'specialN', kind: 'special', stance: 'stand',
            durations: [4, 4, 4, 3, 6, 6, 8],
            hits: [],
            projectile: {
                anim: 'fx_partisan', atFrame: 3, offset: [36, 44], speed: 4.6, life: 80,
                box: [-18, -26, 36, 52], fps: 12, hits: 1,
                hit: { damage: 80, guard: 'mid', hitstun: 22, blockstun: 16, push: 18, hitstop: 11, spark: 'ice', shake: 2, sfx: 'ice' }
            },
            sfx: 'ice'
        },
        specialF: {
            name: 'Ice Time', anim: 'specialF', kind: 'special', stance: 'stand',
            durations: [4, 4, 3, 3, 3, 4, 4, 6, 6, 6],
            motion: [[2, 6.8, 0], [6, 0, 0]],
            hits: [{ frames: [2, 6], box: [0, 10, 52, 54], damage: 92, guard: 'mid', hitstun: 26, blockstun: 14, push: 20, launch: [2.6, 3.8], hitstop: 16, spark: 'ice', shake: 4 }],
            sfx: 'ice'
        },
        specialU: {
            name: 'Ice Block — Poing du givre', anim: 'specialU', kind: 'special', stance: 'stand',
            durations: [3, 3, 3, 5, 5, 8, 10],
            invuln: [0, 3],
            hits: [
                { frames: [2, 3], box: [-8, 16, 50, 96], damage: 60, guard: 'mid', hitstun: 24, blockstun: 16, push: 8, launch: [0.8, 7.0], hitstop: 10, spark: 'ice', shake: 3 },
                { frames: [4, 4], box: [-8, 30, 46, 90], damage: 40, guard: 'mid', hitstun: 24, blockstun: 16, push: 10, launch: [1.2, 7.4], hitstop: 10, spark: 'big', shake: 3 }
            ],
            fx: [[3, 'fx_frostup', 16, 64]],
            sfx: 'ice'
        },
        specialD: {
            name: 'Ice Age', anim: 'specialD', kind: 'special', stance: 'stand',
            durations: [4, 4, 4, 4, 4, 5, 5, 8, 18, 10],
            hits: [
                { frames: [7, 8], box: [16, 0, 104, 56], damage: 22, guard: 'low', hitstun: 24, blockstun: 10, push: 2, rehit: 6, hitstop: 4, spark: 'ice' },
                { frames: [9, 9], box: [16, 0, 104, 64], damage: 52, guard: 'low', hitstun: 26, blockstun: 16, push: 12, launch: [1.4, 6.4], hitstop: 12, spark: 'big', shake: 4 }
            ],
            fx: [[7, 'fx_iceage', 66, 0]],
            sfx: 'ice'
        },
        ultimate: {
            name: 'Ice Block — Pheasant Beak', anim: 'ultimate', kind: 'ultimate', stance: 'stand',
            durations: [8, 8, 8, 8, 6, 6, 10, 12, 14],
            superFreeze: 55, cost: 100, invuln: [0, 6],
            hits: [],
            projectile: {
                anim: 'fx_pheasant', atFrame: 5, offset: [0, 46], speed: 2.8, life: 90,
                box: [-10, -44, 80, 88], fps: 8, hits: 5,
                hit: { damage: 72, guard: 'mid', hitstun: 40, blockstun: 16, push: 2, launch: [2.2, 3.6], hitstop: 3, spark: 'ice', shake: 6, sfx: 'ice' }
            },
            fx: [[4, 'fx_flash', 16, 46]],
            sfx: 'ice'
        },
        throw: {
            name: 'Ice Time — capsule', anim: 'throw', kind: 'throw', stance: 'stand',
            durations: [3, 4, 4, 4, 6, 8, 8],
            hits: [{ frames: [0, 1], box: [4, 10, 30, 50], damage: 0, guard: 'unblockable', hitstun: 0, blockstun: 0, push: 0 }],
            throwRelease: { frame: 4, damage: 110, launch: [2.4, 4.8] },
            fx: [[3, 'fx_iceball', 34, 40]],
            sfx: 'grab'
        }
    }
};
