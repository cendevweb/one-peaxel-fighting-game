import manifest from '../generated/sprites/drake.json';
import type { CharacterDef, SpriteManifest } from '../engine/types';

/**
 * X Drake — Ryū Ryū no Mi, modèle Allosaurus. In human form he fights with
 * a sabre and an axe (the sheet's slash, crescent and rapid-thrust rows);
 * the fruit shows up as a half-transformed claw (overhead rake, rising
 * rake, the claw grab of the throw) and an allosaur tail (low sweep, air
 * spin). The full allosaur is kept for the two ultimates: a rearing lunge
 * bite for one bar, and for two bars the transformation burst, the roar,
 * a charge across the stage, the bite and the burning X of the claws.
 *
 * Every animation and effect comes from the Gigant Battle 2 sheet
 * (tools/sprites/chars/drake.json). Every `durations` array has one entry
 * per animation frame.
 */
export const drake: CharacterDef = {
    id: 'drake',
    name: 'X Drake',
    title: 'Le Drapeau rouge',
    health: 1030,
    walk: 1.5,
    back: 1.2,
    dash: 4.6,
    backdash: [3.6, 2.6],
    jump: [2.2, 7.1],
    gravity: 0.37,
    width: 13,
    height: 66,
    crouchHeight: 46,
    color: '#4a5fc0',
    manifest: manifest as unknown as SpriteManifest,
    moves: {
        lightA: {
            name: 'Taille du sabre', anim: 'lightA', kind: 'normal', stance: 'stand',
            durations: [4, 5, 8],
            hits: [{ frames: [1, 1], box: [4, 28, 40, 46], damage: 30, guard: 'mid', hitstun: 15, blockstun: 9, push: 6, hitstop: 6, spark: 'cut' }],
            chain: ['lightB', 'crouchLight', 'heavy', 'heavyFwd', 'heavyBack', 'crouchHeavy'], cancelable: true, sfx: 'slash'
        },
        lightB: {
            name: 'Croissant de hache', anim: 'lightB', kind: 'normal', stance: 'stand',
            durations: [4, 3, 3, 8],
            hits: [{ frames: [1, 2], box: [2, 4, 48, 56], damage: 36, guard: 'mid', hitstun: 17, blockstun: 10, push: 7, hitstop: 7, spark: 'blade' }],
            chain: ['lightC', 'heavy', 'heavyFwd', 'crouchHeavy'], cancelable: true, sfx: 'swingHeavy'
        },
        lightC: {
            name: 'Double fauchage', anim: 'lightC', kind: 'normal', stance: 'stand',
            durations: [4, 3, 3, 3, 3, 4, 6, 8],
            motion: [[1, 2.0, 0], [4, 0, 0]],
            hits: [
                { frames: [2, 3], box: [2, 2, 44, 50], damage: 30, guard: 'mid', hitstun: 18, blockstun: 10, push: 4, hitstop: 6, spark: 'blade' },
                { frames: [4, 5], box: [0, 0, 44, 46], damage: 42, guard: 'mid', hitstun: 20, blockstun: 12, push: 18, hitstop: 9, spark: 'blade', shake: 2 }
            ],
            cancelable: true, sfx: 'slash'
        },
        crouchLight: {
            name: 'Estoc bas', anim: 'crouchLight', kind: 'normal', stance: 'crouch',
            durations: [3, 4, 6],
            hits: [{ frames: [1, 1], box: [6, 4, 40, 24], damage: 24, guard: 'low', hitstun: 12, blockstun: 8, push: 8, hitstop: 6, spark: 'cut' }],
            chain: ['crouchLight', 'lightB', 'crouchHeavy'], cancelable: true, sfx: 'slash'
        },
        crouchHeavy: {
            name: "Balayage de l'allosaure", anim: 'crouchHeavy', kind: 'normal', stance: 'crouch',
            durations: [4, 3, 3, 3, 4, 4, 4, 6, 8],
            hits: [{ frames: [2, 5], box: [4, 0, 84, 26], damage: 66, guard: 'low', hitstun: 20, blockstun: 12, push: 14, knockdown: true, launch: [1.4, 2.8], hitstop: 10, spark: 'heavy' }],
            cancelable: true, sfx: 'swingHeavy'
        },
        heavy: {
            name: 'Hache et sabre', anim: 'heavy', kind: 'normal', stance: 'stand',
            durations: [7, 3, 3, 3, 3, 3, 4, 5, 6, 7],
            hits: [
                { frames: [1, 1], box: [8, 28, 54, 30], damage: 40, guard: 'mid', hitstun: 22, blockstun: 12, push: 4, hitstop: 8, spark: 'heavy' },
                { frames: [4, 6], box: [0, 10, 64, 78], damage: 46, guard: 'mid', hitstun: 22, blockstun: 14, push: 18, hitstop: 10, spark: 'blade', shake: 2 }
            ],
            cancelable: true, sfx: 'swingHeavy'
        },
        heavyFwd: {
            name: 'Griffe plongeante', anim: 'heavyFwd', kind: 'normal', stance: 'stand',
            durations: [5, 4, 4, 4, 3, 3, 6, 8],
            hits: [{ frames: [4, 5], box: [0, 6, 50, 84], damage: 78, guard: 'high', hitstun: 22, blockstun: 14, push: 14, hitstop: 12, spark: 'heavy', shake: 4 }],
            fx: [[4, 'fx_claw', 34, 34]],
            cancelable: true, sfx: 'swingHeavy'
        },
        heavyBack: {
            name: 'Griffe montante', anim: 'heavyBack', kind: 'normal', stance: 'stand',
            durations: [4, 3, 3, 3, 4, 5, 5, 7],
            hits: [{ frames: [2, 3], box: [-4, 18, 50, 72], damage: 62, guard: 'mid', hitstun: 22, blockstun: 12, push: 8, launch: [0.6, 6.4], hitstop: 10, spark: 'heavy' }],
            invuln: [1, 2],
            cancelable: true, sfx: 'swingHeavy'
        },
        airLight: {
            name: 'Croissant aérien', anim: 'airLight', kind: 'normal', stance: 'air',
            durations: [4, 3, 3, 8],
            hits: [{ frames: [1, 2], box: [-2, 0, 46, 52], damage: 34, guard: 'high', hitstun: 14, blockstun: 9, push: 8, hitstop: 7, spark: 'blade' }],
            chain: ['airHeavy'], cancelable: true, sfx: 'slash'
        },
        airHeavy: {
            name: "Queue de l'allosaure", anim: 'airHeavy', kind: 'normal', stance: 'air',
            durations: [3, 3, 3, 3, 3, 4, 4, 6],
            hits: [{ frames: [1, 4], box: [-20, -10, 74, 84], damage: 64, guard: 'high', hitstun: 18, blockstun: 12, push: 12, hitstop: 10, spark: 'heavy' }],
            cancelable: true, landLag: 5, sfx: 'swingHeavy'
        },
        airSpecial: {
            name: 'Hache tombante', anim: 'airSpecial', kind: 'special', stance: 'air',
            durations: [4, 3, 3, 30, 4, 6, 6, 8],
            motion: [[2, 1.8, -7.0]],
            noGravity: true, landFrame: 4,
            hits: [{ frames: [2, 4], box: [-6, -8, 44, 52], damage: 84, guard: 'high', hitstun: 20, blockstun: 14, push: 16, knockdown: true, launch: [1.6, 3.6], hitstop: 12, spark: 'big', shake: 4 }],
            fx: [[4, 'fx_dust', 10, 4]],
            sfx: 'swingHeavy'
        },
        specialN: {
            name: 'Estocades en rafale', anim: 'specialN', kind: 'special', stance: 'stand',
            durations: [5, 5, 3, 3, 4, 4, 4, 4, 4, 4, 6, 8, 8],
            motion: [[2, 4.0, 0], [4, 0.6, 0], [10, 0, 0]],
            hits: [
                { frames: [2, 8], box: [8, 8, 104, 42], damage: 18, guard: 'mid', hitstun: 20, blockstun: 10, push: 2, rehit: 5, hitstop: 4, spark: 'cut' },
                { frames: [9, 9], box: [8, 8, 116, 42], damage: 52, guard: 'mid', hitstun: 24, blockstun: 14, push: 20, launch: [2.4, 4.2], hitstop: 12, spark: 'blade', shake: 3 }
            ],
            sfx: 'slash'
        },
        specialF: {
            name: 'Ruée du Drapeau rouge', anim: 'specialF', kind: 'special', stance: 'stand',
            durations: [4, 4, 3, 3, 4, 4, 5, 6, 8, 8],
            motion: [[0, 7.0, 0], [4, 1.0, 0], [6, 0, 0]],
            hits: [
                { frames: [3, 5], box: [6, 10, 96, 50], damage: 70, guard: 'mid', hitstun: 24, blockstun: 14, push: 4, hitstop: 10, spark: 'blade', shake: 3 },
                { frames: [6, 7], box: [6, 15, 94, 45], damage: 44, guard: 'mid', hitstun: 24, blockstun: 14, push: 18, launch: [2.8, 4.6], hitstop: 12, spark: 'heavy', shake: 3 }
            ],
            sfx: 'slashHeavy'
        },
        specialU: {
            name: 'Taille ascendante', anim: 'specialU', kind: 'special', stance: 'stand',
            durations: [3, 3, 3, 4, 4, 4, 4, 5, 6, 7, 7, 7, 8],
            motion: [[3, 1.2, 6.6]],
            invuln: [0, 4],
            hits: [
                { frames: [3, 5], box: [-6, 10, 50, 62], damage: 56, guard: 'mid', hitstun: 24, blockstun: 16, push: 8, launch: [0.8, 6.8], hitstop: 10, spark: 'blade', shake: 3 },
                { frames: [7, 8], box: [-8, 18, 82, 70], damage: 50, guard: 'mid', hitstun: 24, blockstun: 16, push: 10, launch: [1.4, 7.4], hitstop: 10, spark: 'big', shake: 4 }
            ],
            sfx: 'slashHeavy'
        },
        specialD: {
            name: 'Croix du Drapeau rouge', anim: 'specialD', kind: 'special', stance: 'stand',
            durations: [4, 4, 4, 4, 4, 4, 4, 4, 8, 8, 8],
            motion: [[0, 2.0, 6.0]],
            hits: [{ frames: [5, 7], box: [-12, -56, 80, 116], damage: 92, guard: 'high', hitstun: 24, blockstun: 14, push: 16, knockdown: true, launch: [1.8, 3.4], hitstop: 13, spark: 'blade', shake: 5 }],
            fx: [[8, 'fx_dust', 10, 4]],
            sfx: 'slashHeavy'
        },
        // One bar: the full allosaur rears, roars, and lunges into a
        // burning bite.
        ultimate: {
            name: "Morsure de l'allosaure", anim: 'ultimate', kind: 'ultimate', stance: 'stand',
            durations: [5, 5, 5, 6, 5, 5, 6, 6, 4, 4, 6, 8, 6, 5, 5, 6],
            superFreeze: 55, cost: 100, invuln: [0, 9],
            motion: [[8, 5.0, 0], [10, 0, 0]],
            hits: [
                { frames: [8, 9], box: [0, 0, 92, 72], damage: 45, guard: 'mid', hitstun: 40, blockstun: 16, push: 2, rehit: 5, hitstop: 5, spark: 'heavy', shake: 3 },
                { frames: [10, 10], box: [0, 0, 106, 76], damage: 260, guard: 'mid', hitstun: 50, blockstun: 22, push: 30, launch: [5.4, 5.8], wallBounce: true, hitstop: 24, spark: 'big', shake: 10 }
            ],
            fx: [[10, 'fx_fire', 84, 40]],
            sfx: 'swingHeavy'
        },
        // Two bars: the transformation burst, the roar (golden rings), a
        // charge across the whole stage, the bite, then the lunge that
        // leaves the burning X of the claws.
        ultimate2: {
            name: "Charge de l'Allosaurus", anim: 'ultimate2', kind: 'ultimate', stance: 'stand',
            durations: [5, 5, 5, 6, 5, 6, 6, 6, 4, 4, 4, 4, 4, 4, 5, 6, 5, 8, 8, 8, 10],
            superFreeze: 70, cost: 200, invuln: [0, 9],
            motion: [[8, 6.5, 0], [14, 1.5, 0], [16, 0, 0]],
            hits: [
                { frames: [1, 2], box: [-24, 0, 96, 96], damage: 40, guard: 'mid', hitstun: 50, blockstun: 18, push: 2, hitstop: 6, spark: 'heavy', shake: 3 },
                { frames: [5, 6], box: [-50, 0, 150, 130], damage: 60, guard: 'mid', hitstun: 60, blockstun: 18, push: 2, hitstop: 8, spark: 'big', shake: 6 },
                { frames: [9, 12], box: [0, 0, 100, 70], damage: 80, guard: 'mid', hitstun: 50, blockstun: 18, push: 2, hitstop: 8, spark: 'heavy', shake: 4 },
                { frames: [14, 15], box: [0, 0, 110, 76], damage: 150, guard: 'mid', hitstun: 50, blockstun: 20, push: 2, hitstop: 10, spark: 'heavy', shake: 5 },
                { frames: [16, 17], box: [0, 0, 112, 82], damage: 290, guard: 'mid', hitstun: 50, blockstun: 24, push: 30, launch: [6.0, 6.4], wallBounce: true, knockdown: true, hitstop: 26, spark: 'big', shake: 12 }
            ],
            fx: [[5, 'fx_ring', 76, 104], [14, 'fx_fire', 90, 40], [16, 'fx_xfire', 86, 40]],
            sfx: 'swingHeavy'
        },
        throw: {
            name: "Serre de l'allosaure", anim: 'throw', kind: 'throw', stance: 'stand',
            durations: [3, 4, 4, 4, 4, 4, 5, 4, 4, 6, 6, 6, 8],
            hits: [{ frames: [0, 1], box: [4, 10, 30, 40], damage: 0, guard: 'unblockable', hitstun: 0, blockstun: 0, push: 0 }],
            throwRelease: { frame: 9, damage: 112, launch: [2.6, 4.6] },
            fx: [[8, 'fx_claw', 34, 30]],
            sfx: 'grab'
        }
    }
};
