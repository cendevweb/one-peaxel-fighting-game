import manifest from '../generated/sprites/doflamingo.json';
import type { CharacterDef, SpriteManifest } from '../engine/types';

/**
 * Donquixote Doflamingo — the puppeteer. Long legs up close (the B, B, B
 * kick string of Gigant Battle 2), and the Ito Ito no Mi for the rest:
 * Tamaito (a string bullet flicked from the fingers), Overheat (the red-hot
 * string whip), Fulbright (strings raining from above, his reversal),
 * Parasite (the raised finger that seizes the foe and leaves him open), a
 * string puppet throw, and the Torikago — Birdcage as the ultimate.
 *
 * Every animation and effect comes from the Gigant Battle 2 sheet
 * (tools/sprites/chars/doflamingo.json): the thin white strings, the
 * crossing cuts, the string rain and the cage are the sheet's own effect
 * rows. Every `durations` array has exactly one entry per animation frame.
 */
export const doflamingo: CharacterDef = {
    id: 'doflamingo',
    name: 'Doflamingo',
    title: 'Démon céleste',
    health: 1040,
    walk: 1.6,
    back: 1.3,
    dash: 4.6,
    backdash: [3.8, 2.8],
    jump: [2.4, 7.4],
    gravity: 0.35,
    width: 14,
    height: 68,
    crouchHeight: 46,
    color: '#f06ba8',
    manifest: manifest as unknown as SpriteManifest,
    moves: {
        lightA: {
            name: 'Coup de pied', anim: 'lightA', kind: 'normal', stance: 'stand',
            durations: [4, 2, 3, 4, 5],
            hits: [{ frames: [1, 2], box: 'auto', damage: 30, guard: 'mid', hitstun: 14, blockstun: 9, push: 5, hitstop: 6 }],
            chain: ['lightB', 'crouchLight', 'heavy', 'heavyFwd', 'heavyBack', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        lightB: {
            name: 'Double écrasement', anim: 'lightB', kind: 'normal', stance: 'stand',
            durations: [3, 2, 3, 3, 4, 6],
            hits: [{ frames: [2, 3], box: [6, 0, 40, 34], damage: 34, guard: 'mid', hitstun: 17, blockstun: 10, push: 6, hitstop: 7 }],
            chain: ['lightC', 'heavy', 'heavyFwd', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        lightC: {
            name: 'Talon retourné', anim: 'lightC', kind: 'normal', stance: 'stand',
            durations: [2, 2, 2, 2, 3, 3, 4, 5, 6],
            hits: [{ frames: [4, 6], box: [4, 4, 50, 62], damage: 52, guard: 'mid', hitstun: 19, blockstun: 12, push: 20, hitstop: 9, spark: 'heavy' }],
            cancelable: true, sfx: 'swingHeavy'
        },
        crouchLight: {
            name: 'Direct accroupi', anim: 'crouchLight', kind: 'normal', stance: 'crouch',
            durations: [3, 3, 7],
            hits: [{ frames: [1, 1], box: [6, 2, 40, 22], damage: 25, guard: 'low', hitstun: 12, blockstun: 8, push: 8, hitstop: 6 }],
            chain: ['crouchLight', 'lightB', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        crouchHeavy: {
            name: 'Glissade', anim: 'crouchHeavy', kind: 'normal', stance: 'crouch',
            durations: [6, 4, 4, 6, 9],
            motion: [[1, 2.4, 0], [3, 0, 0]],
            hits: [{ frames: [1, 2], box: [4, 0, 52, 22], damage: 66, guard: 'low', hitstun: 20, blockstun: 12, push: 14, knockdown: true, launch: [1.2, 2.6], hitstop: 10, spark: 'heavy' }],
            cancelable: true, sfx: 'swingHeavy'
        },
        heavy: {
            name: 'Fil tranchant', anim: 'heavy', kind: 'normal', stance: 'stand',
            durations: [7, 3, 4, 8, 10],
            hits: [{ frames: [1, 2], box: [0, 10, 58, 64], damage: 74, guard: 'mid', hitstun: 22, blockstun: 14, push: 18, hitstop: 11, spark: 'thread', shake: 2 }],
            fx: [[1, 'fx_itocut', 40, 36]],
            cancelable: true, sfx: 'thread'
        },
        heavyFwd: {
            name: 'Ruée du flamant', anim: 'heavyFwd', kind: 'normal', stance: 'stand',
            durations: [3, 2, 2, 2, 2, 4, 5, 12],
            motion: [[2, 3.4, 0], [5, 0.8, 0], [6, 0, 0]],
            hits: [{ frames: [5, 6], box: [0, 0, 44, 64], damage: 80, guard: 'high', hitstun: 22, blockstun: 14, push: 14, hitstop: 12, spark: 'heavy', shake: 4 }],
            fx: [[6, 'fx_dust', 28, 0]],
            cancelable: true, sfx: 'swingHeavy'
        },
        heavyBack: {
            name: 'Coup de pied ascendant', anim: 'heavyBack', kind: 'normal', stance: 'stand',
            durations: [7, 3, 3, 4, 6, 10],
            hits: [{ frames: [1, 3], box: [4, 14, 38, 72], damage: 66, guard: 'mid', hitstun: 22, blockstun: 12, push: 8, launch: [0.6, 6.4], hitstop: 10, spark: 'heavy' }],
            invuln: [1, 2],
            cancelable: true, sfx: 'swingHeavy'
        },
        airLight: {
            name: 'Coup de pied aérien', anim: 'airLight', kind: 'normal', stance: 'air',
            durations: [4, 4, 4, 8],
            hits: [{ frames: [1, 2], box: [-2, -8, 36, 34], damage: 32, guard: 'high', hitstun: 14, blockstun: 9, push: 8, hitstop: 7 }],
            chain: ['airHeavy'], cancelable: true, sfx: 'swing'
        },
        airHeavy: {
            name: 'Revers de plumes', anim: 'airHeavy', kind: 'normal', stance: 'air',
            durations: [4, 4, 3, 4, 5, 8],
            hits: [{ frames: [2, 4], box: [0, -12, 44, 56], damage: 68, guard: 'high', hitstun: 18, blockstun: 12, push: 12, hitstop: 10, spark: 'heavy' }],
            cancelable: true, landLag: 5, sfx: 'swingHeavy'
        },
        airSpecial: {
            name: 'Plongeon du flamant', anim: 'airSpecial', kind: 'special', stance: 'air',
            durations: [4, 30, 4, 4, 4, 5, 6, 7],
            motion: [[1, 2.6, -5.5]],
            noGravity: true, landFrame: 4,
            hits: [{ frames: [1, 4], box: [-6, -6, 36, 40], damage: 80, guard: 'high', hitstun: 20, blockstun: 14, push: 18, knockdown: true, launch: [1.8, 3.4], hitstop: 12, spark: 'heavy', shake: 4 }],
            fx: [[4, 'fx_dust', 16, 0]],
            sfx: 'swingHeavy'
        },
        specialN: {
            name: 'Tamaito', anim: 'specialN', kind: 'special', stance: 'stand',
            durations: [6, 4, 3, 5, 14],
            hits: [],
            projectile: {
                anim: 'fx_tamaito', atFrame: 3, offset: [44, 40], speed: 5.0, life: 48,
                box: [-26, -6, 52, 12],
                hit: { damage: 64, guard: 'mid', hitstun: 20, blockstun: 14, push: 12, hitstop: 9, spark: 'thread', sfx: 'thread' },
                fps: 12
            },
            sfx: 'thread'
        },
        specialF: {
            name: 'Overheat', anim: 'specialF', kind: 'special', stance: 'stand',
            durations: [4, 3, 3, 3, 3, 4, 4, 5, 6, 8],
            hits: [{ frames: [4, 6], box: 'auto', damage: 96, guard: 'mid', hitstun: 24, blockstun: 16, push: 26, launch: [3.4, 3.2], wallBounce: true, hitstop: 13, spark: 'fire', shake: 5 }],
            sfx: 'fire'
        },
        specialU: {
            name: 'Fulbright', anim: 'specialU', kind: 'special', stance: 'stand',
            durations: [3, 3, 4, 5, 6, 8, 10],
            invuln: [0, 2],
            hits: [{ frames: [1, 3], box: [-16, 28, 66, 104], damage: 100, guard: 'mid', hitstun: 26, blockstun: 16, push: 8, launch: [0.8, 7.4], hitstop: 12, spark: 'thread', shake: 4 }],
            fx: [[2, 'fx_rain', 30, 0]],
            sfx: 'thread'
        },
        specialD: {
            name: 'Parasite', anim: 'specialD', kind: 'special', stance: 'stand',
            durations: [5, 4, 5, 3, 3, 6, 10],
            hits: [{ frames: [3, 4], box: 'auto', damage: 60, guard: 'mid', hitstun: 40, blockstun: 14, push: 2, hitstop: 10, spark: 'thread', shake: 2 }],
            fx: [[2, 'fx_itocut', 48, 38]],
            sfx: 'thread'
        },
        ultimate: {
            name: 'Torikago — Birdcage', anim: 'ultimate', kind: 'ultimate', stance: 'stand',
            durations: [6, 5, 5, 5, 5, 4, 4, 4, 5, 6, 6, 5, 5, 5, 6, 6, 8, 8, 10],
            superFreeze: 55, cost: 100, invuln: [0, 8],
            hits: [
                { frames: [9, 13], box: [10, 0, 120, 110], damage: 50, guard: 'mid', hitstun: 40, blockstun: 20, push: 1, rehit: 6, hitstop: 5, spark: 'thread', shake: 4 },
                { frames: [14, 14], box: [10, 0, 120, 110], damage: 195, guard: 'mid', hitstun: 40, blockstun: 22, push: 30, launch: [5.6, 5.8], wallBounce: true, hitstop: 22, spark: 'big', shake: 10 }
            ],
            fx: [[8, 'fx_cage', 64, 0], [11, 'fx_cage', 64, 0], [14, 'fx_itocut', 60, 40]],
            sfx: 'thread'
        },
        // Awakening: arms spread, laughing, he turns the ground into string.
        // Eruptions march out to the far side of the screen, then he rushes
        // in with a burning string slash and the whole floor bursts under
        // the foe (the Support call and the Dash B rows of the sheet).
        ultimate2: {
            name: 'Kakusei — Awakening', anim: 'ultimate2', kind: 'ultimate', stance: 'stand',
            durations: [6, 6, 5, 5, 5, 5, 5, 5, 4, 3, 5, 6, 5, 8, 12, 14],
            superFreeze: 70, cost: 200, invuln: [0, 3],
            motion: [[8, 0, 0], [9, 5.5, 0], [10, 2, 0], [11, 0, 0]],
            hits: [
                { frames: [3, 7], box: [0, 0, 210, 72], damage: 60, guard: 'mid', hitstun: 32, blockstun: 16, push: 1, rehit: 8, hitstop: 4, spark: 'thread', shake: 4, sfx: 'quake' },
                { frames: [10, 11], box: [0, 0, 72, 66], damage: 110, guard: 'mid', hitstun: 32, blockstun: 16, push: 2, hitstop: 10, spark: 'fire', shake: 6, sfx: 'fire' },
                { frames: [13, 13], box: [-10, 0, 140, 110], damage: 350, guard: 'mid', hitstun: 40, blockstun: 22, push: 30, launch: [5.6, 6.2], wallBounce: true, hitstop: 22, spark: 'big', shake: 12, sfx: 'quake' }
            ],
            fx: [
                [2, 'fx_awaken', 30, 0], [3, 'fx_awaken2', 70, 0], [4, 'fx_awaken', 110, 0],
                [5, 'fx_awaken2', 150, 0], [6, 'fx_awaken', 190, 0], [7, 'fx_awaken2', 50, 0],
                [10, 'fx_itocut', 50, 40],
                [13, 'fx_awaken2', 30, 0], [13, 'fx_awaken', 75, 0], [13, 'fx_awaken2', 120, 0], [13, 'fx_itocut', 70, 44]
            ],
            sfx: 'quake'
        },
        throw: {
            name: 'Marionnette', anim: 'throw', kind: 'throw', stance: 'stand',
            durations: [3, 4, 4, 4, 4, 4, 5, 6, 8],
            hits: [{ frames: [0, 1], box: [4, 10, 32, 44], damage: 0, guard: 'unblockable', hitstun: 0, blockstun: 0, push: 0 }],
            throwRelease: { frame: 6, damage: 110, launch: [3.8, 4.4] },
            sfx: 'grab'
        }
    }
};
