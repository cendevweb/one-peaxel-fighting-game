import manifest from '../generated/sprites/vivi.json';
import type { CharacterDef, SpriteManifest } from '../engine/types';

/**
 * Nefertari Vivi — the princess of Alabasta and her Peacock Slashers, the
 * bladed rings on strings. Wide ring slashes for normals, the Peacock String
 * lances and spiral, Karoo charging across the stage (Karoo, fonce !), a
 * spinning ride on Karoo's back, the rising whirl as her reversal and the
 * perfume dance of her dancer disguise. Kujaku Slasher Ranbu (the "Special 2"
 * row) is the one-bar ultimate; the Super Spot-Billed Duck Squad stampede of
 * the Hyper row is the two-bar one.
 *
 * Every animation and effect comes from the Gigant Battle 2 sheet
 * (tools/sprites/chars/vivi.json). Every `durations` array has one entry per
 * animation frame.
 */
export const vivi: CharacterDef = {
    id: 'vivi',
    name: 'Vivi',
    title: "Princesse d'Alabasta",
    health: 960,
    walk: 1.6,
    back: 1.3,
    dash: 4.6,
    backdash: [3.8, 2.6],
    jump: [2.3, 7.2],
    gravity: 0.37,
    width: 11,
    height: 62,
    crouchHeight: 44,
    color: '#5bb8e8',
    manifest: manifest as unknown as SpriteManifest,
    moves: {
        lightA: {
            name: 'Peacock Slasher', anim: 'lightA', kind: 'normal', stance: 'stand',
            durations: [4, 3, 3, 4, 6],
            hits: [{ frames: [1, 2], box: [4, 14, 54, 30], damage: 28, guard: 'mid', hitstun: 14, blockstun: 9, push: 6, hitstop: 6, spark: 'cut' }],
            chain: ['lightB', 'crouchLight', 'heavy', 'heavyFwd', 'heavyBack', 'crouchHeavy'], cancelable: true, sfx: 'slash'
        },
        lightB: {
            name: 'Anneau ascendant', anim: 'lightB', kind: 'normal', stance: 'stand',
            durations: [3, 3, 3, 4, 5, 6],
            hits: [{ frames: [1, 2], box: [4, 14, 52, 42], damage: 32, guard: 'mid', hitstun: 16, blockstun: 10, push: 7, hitstop: 7, spark: 'cut' }],
            chain: ['lightC', 'heavy', 'heavyFwd', 'crouchHeavy'], cancelable: true, sfx: 'slash'
        },
        lightC: {
            name: 'Peacock Slasher — anneau tournant', anim: 'lightC', kind: 'normal', stance: 'stand',
            durations: [4, 4, 3, 3, 3, 3, 4, 5, 6, 6],
            hits: [
                { frames: [2, 5], box: [14, 12, 54, 50], damage: 14, guard: 'mid', hitstun: 16, blockstun: 9, push: 1, rehit: 4, hitstop: 3, spark: 'cut', sfx: 'slash' },
                { frames: [6, 6], box: [14, 12, 50, 44], damage: 30, guard: 'mid', hitstun: 18, blockstun: 12, push: 18, hitstop: 8, spark: 'thread', shake: 2 }
            ],
            cancelable: true, sfx: 'slash'
        },
        crouchLight: {
            name: 'Fil rasant', anim: 'crouchLight', kind: 'normal', stance: 'crouch',
            durations: [3, 4, 6],
            hits: [{ frames: [1, 1], box: [6, 0, 34, 18], damage: 22, guard: 'low', hitstun: 12, blockstun: 8, push: 8, hitstop: 6, spark: 'thread' }],
            chain: ['crouchLight', 'lightB', 'crouchHeavy'], cancelable: true, sfx: 'thread'
        },
        crouchHeavy: {
            name: 'Fauchage des anneaux', anim: 'crouchHeavy', kind: 'normal', stance: 'crouch',
            durations: [5, 3, 5, 6, 8],
            hits: [{ frames: [1, 2], box: [6, 0, 46, 24], damage: 64, guard: 'low', hitstun: 20, blockstun: 12, push: 14, knockdown: true, launch: [1.2, 2.6], hitstop: 10, spark: 'cut' }],
            cancelable: true, sfx: 'slash'
        },
        heavy: {
            name: 'Peacock String — spirale', anim: 'heavy', kind: 'normal', stance: 'stand',
            durations: [5, 3, 3, 3, 3, 3, 3, 4, 9],
            hits: [
                { frames: [1, 2], box: [0, 8, 50, 60], damage: 46, guard: 'mid', hitstun: 22, blockstun: 14, push: 4, hitstop: 8, spark: 'thread' },
                { frames: [3, 7], box: [-26, 0, 72, 80], damage: 14, guard: 'mid', hitstun: 20, blockstun: 10, push: 3, rehit: 5, hitstop: 3, spark: 'thread' }
            ],
            cancelable: true, sfx: 'thread'
        },
        heavyFwd: {
            name: 'Peacock String Slasher', anim: 'heavyFwd', kind: 'normal', stance: 'stand',
            durations: [5, 4, 3, 4, 4, 5, 8],
            hits: [{ frames: [2, 4], box: [16, 26, 90, 64], damage: 72, guard: 'mid', hitstun: 22, blockstun: 14, push: 18, hitstop: 11, spark: 'thread', shake: 2 }],
            cancelable: true, sfx: 'thread'
        },
        heavyBack: {
            name: 'Croissant du paon', anim: 'heavyBack', kind: 'normal', stance: 'stand',
            durations: [4, 4, 3, 3, 4, 6, 7],
            hits: [{ frames: [2, 4], box: [-8, 30, 54, 58], damage: 62, guard: 'mid', hitstun: 22, blockstun: 12, push: 8, launch: [0.6, 6.4], hitstop: 10, spark: 'cut' }],
            invuln: [1, 2],
            cancelable: true, sfx: 'slash'
        },
        airLight: {
            name: 'Revers aérien', anim: 'airLight', kind: 'normal', stance: 'air',
            durations: [4, 4, 10],
            hits: [{ frames: [1, 2], box: [2, 14, 36, 30], damage: 32, guard: 'high', hitstun: 14, blockstun: 9, push: 8, hitstop: 7, spark: 'cut' }],
            chain: ['airHeavy'], cancelable: true, sfx: 'swing'
        },
        airHeavy: {
            name: 'Anneau plongeant', anim: 'airHeavy', kind: 'normal', stance: 'air',
            durations: [4, 3, 3, 4, 5, 8],
            hits: [{ frames: [1, 3], box: [0, -8, 50, 60], damage: 62, guard: 'high', hitstun: 18, blockstun: 12, push: 12, hitstop: 10, spark: 'cut' }],
            cancelable: true, landLag: 5, sfx: 'slash'
        },
        airSpecial: {
            name: 'Peacock String — pluie de fils', anim: 'airSpecial', kind: 'special', stance: 'air',
            durations: [3, 3, 4, 4, 4, 4, 30, 4, 5, 5, 6],
            motion: [[0, 0, 0], [3, 1.2, -4.2]],
            noGravity: true, landFrame: 7,
            hits: [{ frames: [3, 6], box: [-14, -84, 42, 96], damage: 76, guard: 'high', hitstun: 20, blockstun: 14, push: 14, knockdown: true, launch: [1.4, 3.4], hitstop: 12, spark: 'thread', shake: 3 }],
            sfx: 'thread'
        },
        specialN: {
            name: 'Karoo, fonce !', anim: 'specialN', kind: 'special', stance: 'stand',
            durations: [4, 4, 4, 4, 5, 6, 6, 6, 6],
            hits: [],
            projectile: {
                anim: 'fx_karoo', atFrame: 3, offset: [40, 26], speed: 4.6, life: 90,
                box: [-30, -26, 100, 52], fps: 14, hits: 1,
                hit: { damage: 78, guard: 'mid', hitstun: 22, blockstun: 16, push: 18, knockdown: true, launch: [2.2, 4.0], hitstop: 11, spark: 'sand', shake: 3, sfx: 'thud' }
            },
            fx: [[3, 'fx_karooflash', 40, 26]],
            sfx: 'dash'
        },
        specialF: {
            name: 'Karoo — Peacock Slasher roulant', anim: 'specialF', kind: 'special', stance: 'stand',
            durations: [4, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 6, 5, 6],
            motion: [[2, 4.2, 0], [15, 0, 0], [16, -1.6, 3.2], [17, 0, 0]],
            hits: [
                { frames: [2, 14], box: [-4, 0, 58, 60], damage: 18, guard: 'mid', hitstun: 22, blockstun: 10, push: 2, rehit: 6, hitstop: 4, spark: 'cut' },
                { frames: [15, 15], box: [-4, 0, 60, 60], damage: 40, guard: 'mid', hitstun: 24, blockstun: 14, push: 18, launch: [3.0, 3.8], hitstop: 12, spark: 'big', shake: 4 }
            ],
            sfx: 'dash'
        },
        specialU: {
            name: 'Peacock Slasher — tourbillon', anim: 'specialU', kind: 'special', stance: 'stand',
            durations: [3, 3, 3, 3, 4, 5, 6, 8, 8, 8],
            motion: [[4, 0.8, 6.8]],
            invuln: [0, 5],
            hits: [
                { frames: [3, 4], box: [-8, 10, 48, 64], damage: 56, guard: 'mid', hitstun: 24, blockstun: 16, push: 8, launch: [0.8, 6.8], hitstop: 10, spark: 'cut', shake: 2 },
                { frames: [5, 6], box: [-10, 14, 48, 76], damage: 44, guard: 'mid', hitstun: 24, blockstun: 16, push: 10, launch: [1.2, 7.2], hitstop: 10, spark: 'big', shake: 3 }
            ],
            sfx: 'slashHeavy'
        },
        specialD: {
            name: 'Danse du parfum', anim: 'specialD', kind: 'special', stance: 'stand',
            durations: [4, 4, 4, 4, 5, 6, 6, 6, 6, 6, 8],
            hits: [
                { frames: [6, 9], box: [8, 0, 70, 72], damage: 18, guard: 'mid', hitstun: 24, blockstun: 10, push: 1, rehit: 7, hitstop: 4, spark: 'love' },
                { frames: [10, 10], box: [8, 0, 70, 72], damage: 40, guard: 'mid', hitstun: 26, blockstun: 14, push: 14, knockdown: true, launch: [1.4, 4.2], hitstop: 10, spark: 'petal', shake: 2 }
            ],
            fx: [[5, 'fx_perfume', 44, 34]],
            sfx: 'love'
        },
        ultimate: {
            name: 'Kujaku Slasher Ranbu', anim: 'ultimate', kind: 'ultimate', stance: 'stand',
            durations: [6, 5, 3, 3, 3, 3, 4, 3, 3, 3, 4, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 3, 3, 4, 6, 12],
            superFreeze: 55, cost: 100, invuln: [0, 6],
            motion: [[2, 2.4, 0], [6, 0, 0], [19, 1.4, 0], [21, 0, 0]],
            hits: [
                { frames: [2, 5], box: [-10, 0, 76, 70], damage: 60, guard: 'mid', hitstun: 40, blockstun: 16, push: 1, rehit: 6, hitstop: 5, spark: 'cut', shake: 3 },
                { frames: [7, 8], box: [-10, 0, 84, 60], damage: 90, guard: 'mid', hitstun: 40, blockstun: 18, push: 1, hitstop: 8, spark: 'thread', shake: 4 },
                { frames: [13, 13], box: [-10, 0, 70, 90], damage: 70, guard: 'mid', hitstun: 50, blockstun: 18, push: 1, hitstop: 6, spark: 'cut', shake: 3 },
                { frames: [19, 22], box: [-10, 0, 100, 70], damage: 60, guard: 'mid', hitstun: 40, blockstun: 18, push: 1, rehit: 6, hitstop: 5, spark: 'cut', shake: 3 },
                { frames: [23, 23], box: [-10, 0, 100, 76], damage: 170, guard: 'mid', hitstun: 50, blockstun: 22, push: 30, launch: [5.4, 5.6], wallBounce: true, hitstop: 22, spark: 'big', shake: 10 }
            ],
            sfx: 'slashHeavy'
        },
        // Two bars: the Hyper row. Vivi twirls, raises her fist, and the
        // whole Super Spot-Billed Duck Squad thunders across the stage,
        // trampling everything in its path.
        ultimate2: {
            name: 'Chō Karugamo Butai', anim: 'ultimate2', kind: 'ultimate', stance: 'stand',
            durations: [6, 5, 5, 5, 5, 5, 5, 6, 8, 10, 12, 14],
            superFreeze: 70, cost: 200, invuln: [0, 11],
            hits: [],
            projectile: {
                anim: 'fx_stampede', atFrame: 8, offset: [30, 40], speed: 3.0, life: 200,
                box: [-120, -40, 200, 96], fps: 12, hits: 6,
                hit: { damage: 95, guard: 'mid', hitstun: 34, blockstun: 16, push: 4, launch: [1.4, 3.2], knockdown: true, hitstop: 8, spark: 'sand', shake: 8, sfx: 'quake' }
            },
            fx: [[8, 'fx_stampflash', 30, 40]],
            sfx: 'quake'
        },
        throw: {
            name: 'Peacock Slasher — étreinte', anim: 'throw', kind: 'throw', stance: 'stand',
            durations: [3, 4, 5, 6, 6, 8],
            hits: [{ frames: [0, 1], box: [4, 10, 30, 40], damage: 0, guard: 'unblockable', hitstun: 0, blockstun: 0, push: 0 }],
            throwRelease: { frame: 3, damage: 105, launch: [2.6, 5.0] },
            sfx: 'grab'
        }
    }
};
