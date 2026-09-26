import manifest from '../generated/sprites/crocodile.json';
import type { CharacterDef, SpriteManifest } from '../engine/types';

/**
 * Sir Crocodile — the zoner and grappler. Slow on his feet and heavier than
 * the rest, but the golden hook reaches far, the Desert Spada crawls along the
 * ground (a low projectile), the Barchan crescent caves a guard in, and the
 * Ground Death grab dries whoever he gets his hand on.
 *
 * Every `durations` array has exactly one entry per frame of the animation
 * it plays (see tools/sprites/chars/crocodile.json); a test checks it.
 */
export const crocodile: CharacterDef = {
    id: 'crocodile',
    name: 'Crocodile',
    title: 'Ancien Grand Corsaire',
    health: 1050,
    walk: 1.4,
    back: 1.1,
    dash: 3.8,
    backdash: [3.2, 2.4],
    jump: [2.0, 6.9],
    gravity: 0.36,
    width: 12,
    height: 60,
    crouchHeight: 42,
    color: '#d4a64a',
    manifest: manifest as unknown as SpriteManifest,
    moves: {
        lightA: {
            name: 'Estoc du crochet', anim: 'lightA', kind: 'normal', stance: 'stand',
            durations: [4, 3, 3, 6],
            hits: [{ frames: [1, 2], box: 'auto', damage: 32, guard: 'mid', hitstun: 13, blockstun: 9, push: 10, hitstop: 6, spark: 'cut' }],
            chain: ['lightB', 'crouchLight', 'heavy', 'heavyFwd', 'heavyBack', 'crouchHeavy'], cancelable: true, sfx: 'slash'
        },
        lightB: {
            name: 'Paume desséchante', anim: 'lightB', kind: 'normal', stance: 'stand',
            durations: [4, 3, 4, 7],
            hits: [{ frames: [1, 2], box: [6, 22, 30, 18], damage: 36, guard: 'mid', hitstun: 15, blockstun: 10, push: 10, hitstop: 7 }],
            chain: ['lightC', 'heavy', 'heavyFwd', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        lightC: {
            name: 'Ruée de sable', anim: 'lightC', kind: 'normal', stance: 'stand',
            durations: [5, 3, 4, 6, 8],
            motion: [[1, 2.4, 0], [3, 0, 0]],
            hits: [{ frames: [1, 2], box: [4, 14, 42, 32], damage: 54, guard: 'mid', hitstun: 18, blockstun: 12, push: 20, hitstop: 9, spark: 'sand' }],
            cancelable: true, sfx: 'sand'
        },
        crouchLight: {
            name: 'Crochet bas', anim: 'crouchLight', kind: 'normal', stance: 'crouch',
            durations: [3, 4, 6],
            hits: [{ frames: [1, 1], box: 'auto', damage: 26, guard: 'low', hitstun: 12, blockstun: 8, push: 8, hitstop: 6, spark: 'cut' }],
            chain: ['crouchLight', 'lightB', 'crouchHeavy'], cancelable: true, sfx: 'slash'
        },
        crouchHeavy: {
            name: 'Fauchage des sables', anim: 'crouchHeavy', kind: 'normal', stance: 'crouch',
            durations: [4, 4, 3, 4, 7, 10],
            hits: [{ frames: [2, 3], box: 'auto', damage: 70, guard: 'low', hitstun: 20, blockstun: 12, push: 14, knockdown: true, launch: [1.2, 2.6], hitstop: 10, spark: 'sand' }],
            cancelable: true, sfx: 'sand'
        },
        heavy: {
            name: 'Sables — Paume tourbillon', anim: 'heavy', kind: 'normal', stance: 'stand',
            durations: [3, 3, 3, 2, 3, 4, 4, 5, 7, 9],
            hits: [{ frames: [4, 7], box: 'auto', damage: 76, guard: 'mid', hitstun: 21, blockstun: 14, push: 22, hitstop: 11, spark: 'sand', shake: 2 }],
            cancelable: true, sfx: 'sand'
        },
        heavyFwd: {
            name: 'Crochet plongeant (coup haut)', anim: 'heavyFwd', kind: 'normal', stance: 'stand',
            durations: [5, 5, 4, 3, 4, 5, 5, 6, 7],
            hits: [{ frames: [3, 4], box: [4, 0, 40, 72], damage: 82, guard: 'high', hitstun: 22, blockstun: 14, push: 14, hitstop: 12, spark: 'cut', shake: 4 }],
            cancelable: true, sfx: 'slash'
        },
        heavyBack: {
            name: 'Corps de sable', anim: 'heavyBack', kind: 'normal', stance: 'stand',
            durations: [4, 4, 3, 3, 4, 5, 5, 6],
            hits: [{ frames: [2, 4], box: [-6, 0, 34, 70], damage: 66, guard: 'mid', hitstun: 22, blockstun: 12, push: 8, launch: [0.6, 6.6], hitstop: 10, spark: 'sand' }],
            invuln: [2, 3],
            cancelable: true, sfx: 'sand'
        },
        airLight: {
            name: 'Crochet aérien', anim: 'airLight', kind: 'normal', stance: 'air',
            durations: [4, 11],
            hits: [{ frames: [1, 1], box: 'auto', damage: 34, guard: 'high', hitstun: 14, blockstun: 9, push: 8, hitstop: 7, spark: 'cut' }],
            chain: ['airHeavy'], cancelable: true, sfx: 'slash'
        },
        airHeavy: {
            name: 'Griffe du désert', anim: 'airHeavy', kind: 'normal', stance: 'air',
            durations: [4, 4, 4, 6, 10],
            hits: [{ frames: [2, 3], box: 'auto', damage: 70, guard: 'high', hitstun: 18, blockstun: 12, push: 12, hitstop: 10, spark: 'cut' }],
            cancelable: true, landLag: 6, sfx: 'swingHeavy'
        },
        airSpecial: {
            name: 'Crochet d\'or — Chute', anim: 'airSpecial', kind: 'special', stance: 'air',
            durations: [4, 30, 4, 4, 5, 5, 6, 6, 6, 7],
            motion: [[0, 1.8, -6.0]],
            noGravity: true, landFrame: 4,
            hits: [{ frames: [0, 5], box: [-8, -4, 32, 40], damage: 84, guard: 'high', hitstun: 20, blockstun: 14, push: 16, knockdown: true, launch: [1.6, 3.2], hitstop: 12, spark: 'cut', shake: 4 }],
            sfx: 'slash'
        },
        specialN: {
            name: 'Desert Spada', anim: 'specialN', kind: 'special', stance: 'stand',
            durations: [3, 3, 3, 3, 2, 6, 10, 9],
            hits: [],
            projectile: {
                anim: 'fx_spada', atFrame: 5, offset: [34, 18], speed: 3.4, life: 100,
                box: [-24, -10, 50, 20], fps: 12, hits: 1,
                hit: { damage: 72, guard: 'low', hitstun: 22, blockstun: 14, push: 16, knockdown: true, launch: [1.4, 2.8], hitstop: 10, spark: 'sand', shake: 2, sfx: 'sand' }
            },
            sfx: 'sand'
        },
        specialF: {
            name: 'Barchan', anim: 'specialF', kind: 'special', stance: 'stand',
            durations: [3, 3, 3, 2, 3, 3, 4, 6, 7, 9],
            motion: [[3, 2.6, 0], [7, 0, 0]],
            hits: [{ frames: [4, 6], box: 'auto', damage: 110, guard: 'mid', hitstun: 26, blockstun: 18, push: 28, launch: [4.6, 3.6], wallBounce: true, hitstop: 14, spark: 'cut', shake: 5 }],
            sfx: 'slash'
        },
        specialU: {
            name: 'Desert Grande Espada', anim: 'specialU', kind: 'special', stance: 'stand',
            durations: [2, 3, 3, 4, 5, 6, 7, 10],
            invuln: [0, 3],
            hits: [{ frames: [2, 4], box: [-4, 0, 44, 80], damage: 105, guard: 'mid', hitstun: 24, blockstun: 16, push: 10, launch: [1.2, 7.2], hitstop: 12, spark: 'sand', shake: 4 }],
            sfx: 'sand'
        },
        specialD: {
            name: 'Desert Girasole', anim: 'specialD', kind: 'special', stance: 'stand',
            durations: [3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 5, 6, 6, 7],
            fx: [[5, 'fx_dust', 30, 12], [8, 'fx_dust', -30, 12]],
            hits: [
                { frames: [5, 10], box: [-44, 0, 108, 28], damage: 14, guard: 'low', hitstun: 20, blockstun: 10, push: 2, rehit: 6, hitstop: 3, spark: 'sand' },
                { frames: [11, 12], box: [-44, 0, 108, 40], damage: 44, guard: 'low', hitstun: 24, blockstun: 14, push: 18, knockdown: true, launch: [2.0, 4.2], hitstop: 12, spark: 'sand', shake: 4 }
            ],
            sfx: 'sand'
        },
        ultimate: {
            name: 'Sables — Tempête du désert', anim: 'ultimate', kind: 'ultimate', stance: 'stand',
            durations: [6, 5, 5, 5, 5, 4, 4, 4, 6, 6, 6, 6, 6, 6, 5, 5, 8, 12],
            superFreeze: 55, cost: 100, invuln: [0, 13],
            motion: [[6, 2.4, 0], [14, 0, 0]],
            fx: [[8, 'fx_sandstorm', 56, 36]],
            hits: [
                { frames: [8, 13], box: [-20, 0, 72, 90], damage: 30, guard: 'mid', hitstun: 40, blockstun: 20, push: 2, rehit: 5, hitstop: 4, spark: 'sand', shake: 5 },
                { frames: [14, 15], box: [-20, 0, 72, 90], damage: 120, guard: 'mid', hitstun: 40, blockstun: 20, push: 30, launch: [3.8, 7.4], wallBounce: true, hitstop: 20, spark: 'big', shake: 10 }
            ],
            sfx: 'sand'
        },
        throw: {
            name: 'Ground Death — Momification', anim: 'throw', kind: 'throw', stance: 'stand',
            durations: [3, 4, 5, 6, 8, 6, 8, 10],
            hits: [{ frames: [1, 2], box: [4, 10, 32, 40], damage: 0, guard: 'unblockable', hitstun: 0, blockstun: 0, push: 0 }],
            throwRelease: { frame: 5, damage: 125, launch: [2.6, 6.0] },
            sfx: 'grab'
        }
    }
};
