import manifest from '../generated/sprites/robin.json';
import type { CharacterDef, SpriteManifest } from '../engine/types';

/**
 * Nico Robin (après l'ellipse) — Hana Hana no Mi. A ranged fighter: her arms
 * sprout from the ground away from her body, so most of her blows land
 * well in front of her. Seis Fleurs sends a cluster of hands creeping along
 * the floor, Cien Fleurs grows a tree of arms at long range, Cien Fleurs
 * Wing is the anti-air (two wings of arms that clap overhead), Gigante Fleur
 * raises a giant pillar of arms that pops the foe up then slams down on
 * them, Clutch folds the foe in two, and Mil Fleurs: Gigantesco Mano is the
 * ultimate (two giant hands that grab then sweep the whole screen).
 * Cien Fleurs — Delphinium is the 2-bar ultimate: a field of paired arms
 * clutches the foe, then two giant trees of arms bloom over half the screen.
 *
 * Every animation and effect comes from the Gigant Battle 2 sheet
 * (tools/sprites/chars/robin.json): the sprouting arms, the petals, the tree
 * and the giant hands are the sheet's own effect rows. Effects play at 3
 * ticks per image, and the hits of the ranged moves are timed on them.
 * Every `durations` array has one entry per animation frame.
 */
export const robin: CharacterDef = {
    id: 'robin',
    name: 'Robin',
    title: 'Enfant du démon',
    health: 950,
    walk: 1.5,
    back: 1.3,
    dash: 4.4,
    backdash: [3.8, 2.8],
    jump: [2.2, 7.1],
    gravity: 0.36,
    width: 11,
    height: 62,
    crouchHeight: 42,
    color: '#5a3fb8',
    manifest: manifest as unknown as SpriteManifest,
    moves: {
        lightA: {
            name: 'Palma', anim: 'lightA', kind: 'normal', stance: 'stand',
            durations: [4, 3, 3, 7],
            hits: [{ frames: [1, 2], box: [4, 26, 44, 16], damage: 28, guard: 'mid', hitstun: 14, blockstun: 9, push: 6, hitstop: 6, spark: 'light' }],
            chain: ['lightB', 'crouchLight', 'heavy', 'heavyFwd', 'heavyBack', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        lightB: {
            name: 'Ocho Fleurs — fauchage', anim: 'lightB', kind: 'normal', stance: 'stand',
            durations: [4, 3, 4, 5, 8],
            hits: [{ frames: [1, 2], box: [0, 8, 58, 44], damage: 36, guard: 'mid', hitstun: 17, blockstun: 10, push: 8, hitstop: 7, spark: 'petal' }],
            chain: ['lightC', 'heavy', 'heavyFwd', 'crouchHeavy'], cancelable: true, sfx: 'flutter'
        },
        lightC: {
            name: 'Cuatro Fleurs — gerbe', anim: 'lightC', kind: 'normal', stance: 'stand',
            durations: [4, 3, 4, 3, 4, 5, 8],
            hits: [{ frames: [2, 3], box: [2, 14, 66, 44], damage: 50, guard: 'mid', hitstun: 19, blockstun: 12, push: 18, hitstop: 9, spark: 'petal', shake: 2 }],
            cancelable: true, sfx: 'flutter'
        },
        crouchLight: {
            name: 'Dos Fleurs — croc', anim: 'crouchLight', kind: 'normal', stance: 'crouch',
            durations: [3, 3, 3, 3, 6],
            hits: [{ frames: [1, 2], box: [6, 0, 44, 18], damage: 24, guard: 'low', hitstun: 12, blockstun: 8, push: 8, hitstop: 6, spark: 'light' }],
            fx: [[0, 'fx_poke', 30, 0]],
            chain: ['crouchLight', 'lightB', 'crouchHeavy'], cancelable: true, sfx: 'flutter'
        },
        crouchHeavy: {
            name: 'Cuarenta Fleurs — croc-en-jambe', anim: 'crouchHeavy', kind: 'normal', stance: 'crouch',
            durations: [4, 4, 8, 12, 8, 8],
            hits: [{ frames: [2, 3], box: [6, 0, 66, 22], damage: 66, guard: 'low', hitstun: 20, blockstun: 12, push: 12, knockdown: true, launch: [1.0, 2.6], hitstop: 10, spark: 'petal' }],
            fx: [[0, 'fx_clasp', 40, 0]],
            cancelable: true, sfx: 'flutter'
        },
        heavy: {
            name: 'Seis Fleurs — Slap', anim: 'heavy', kind: 'normal', stance: 'stand',
            durations: [3, 4, 5, 4, 5, 4, 6, 8],
            hits: [{ frames: [3, 4], box: [12, 0, 60, 58], damage: 70, guard: 'mid', hitstun: 22, blockstun: 14, push: 14, hitstop: 11, spark: 'petal', shake: 2 }],
            fx: [[1, 'fx_sprout', 44, 0]],
            cancelable: true, sfx: 'flutter'
        },
        heavyFwd: {
            name: 'Treinta Fleurs — fouet', anim: 'heavyFwd', kind: 'normal', stance: 'stand',
            durations: [3, 3, 2, 2, 3, 3, 4, 5, 6, 6],
            hits: [{ frames: [5, 6], box: [6, 0, 54, 76], damage: 78, guard: 'high', hitstun: 22, blockstun: 14, push: 14, hitstop: 12, spark: 'heavy', shake: 3 }],
            cancelable: true, sfx: 'swingHeavy'
        },
        heavyBack: {
            name: 'Veinte Fleurs — liane', anim: 'heavyBack', kind: 'normal', stance: 'stand',
            durations: [3, 3, 3, 4, 4, 4, 5, 6, 7],
            hits: [{ frames: [4, 5], box: [12, 0, 44, 92], damage: 60, guard: 'mid', hitstun: 22, blockstun: 12, push: 6, launch: [0.8, 6.4], hitstop: 10, spark: 'petal' }],
            fx: [[1, 'fx_vine', 30, 0]],
            cancelable: true, sfx: 'flutter'
        },
        airLight: {
            name: 'Palma aérienne', anim: 'airLight', kind: 'normal', stance: 'air',
            durations: [3, 3, 4, 8],
            hits: [{ frames: [1, 2], box: [0, 18, 46, 22], damage: 32, guard: 'high', hitstun: 14, blockstun: 9, push: 8, hitstop: 7, spark: 'light' }],
            chain: ['airHeavy'], cancelable: true, sfx: 'swing'
        },
        airHeavy: {
            name: 'Brazo Cadena', anim: 'airHeavy', kind: 'normal', stance: 'air',
            durations: [4, 3, 3, 4, 4, 3, 6],
            hits: [{ frames: [2, 4], box: [4, 22, 64, 20], damage: 58, guard: 'high', hitstun: 18, blockstun: 12, push: 12, hitstop: 9, spark: 'heavy' }],
            cancelable: true, landLag: 5, sfx: 'stretch'
        },
        airSpecial: {
            name: 'Cien Fleurs — faux', anim: 'airSpecial', kind: 'special', stance: 'air',
            durations: [4, 3, 3, 30, 6, 6, 8],
            motion: [[0, 0.4, 0.6], [1, 1.8, -5.0]],
            noGravity: true, landFrame: 4,
            hits: [{ frames: [1, 3], box: [-20, -52, 72, 62], damage: 76, guard: 'high', hitstun: 20, blockstun: 14, push: 14, knockdown: true, launch: [1.4, 3.4], hitstop: 11, spark: 'petal', shake: 3 }],
            sfx: 'flutter'
        },
        specialN: {
            name: 'Seis Fleurs', anim: 'specialN', kind: 'special', stance: 'stand',
            durations: [4, 4, 3, 3, 3, 4, 5, 5, 7],
            hits: [],
            projectile: {
                anim: 'fx_seis', atFrame: 4, offset: [44, 0], speed: 2.0, life: 40,
                box: [-14, 0, 28, 44], fps: 12, hits: 3,
                hit: { damage: 32, guard: 'mid', hitstun: 20, blockstun: 12, push: 4, hitstop: 7, spark: 'petal', sfx: 'flutter' }
            },
            sfx: 'flutter'
        },
        specialF: {
            name: 'Cien Fleurs — arbre de bras', anim: 'specialF', kind: 'special', stance: 'stand',
            durations: [4, 4, 4, 4, 6, 6, 8, 8, 6],
            hits: [
                { frames: [4, 5], box: [36, 0, 76, 100], damage: 20, guard: 'mid', hitstun: 24, blockstun: 10, push: 1, rehit: 6, hitstop: 3, spark: 'petal' },
                { frames: [6, 6], box: [36, 0, 76, 100], damage: 52, guard: 'mid', hitstun: 26, blockstun: 14, push: 12, launch: [1.2, 6.0], hitstop: 11, spark: 'big', shake: 3 }
            ],
            fx: [[2, 'fx_tree', 72, 0]],
            sfx: 'flutter'
        },
        specialU: {
            name: 'Cien Fleurs Wing', anim: 'specialU', kind: 'special', stance: 'stand',
            durations: [2, 2, 2, 3, 3, 4, 4, 4, 4, 4, 5, 6, 8],
            invuln: [0, 4],
            hits: [
                { frames: [3, 6], box: [-62, 18, 124, 62], damage: 44, guard: 'mid', hitstun: 24, blockstun: 14, push: 6, launch: [0.6, 5.6], hitstop: 9, spark: 'petal', shake: 2 },
                { frames: [7, 9], box: [-30, 48, 60, 72], damage: 50, guard: 'mid', hitstun: 24, blockstun: 16, push: 8, launch: [1.0, 6.6], hitstop: 12, spark: 'big', shake: 4 }
            ],
            sfx: 'flutter'
        },
        specialD: {
            name: 'Gigante Fleur', anim: 'specialD', kind: 'special', stance: 'stand',
            durations: [4, 4, 4, 5, 5, 5, 6, 8, 8, 8],
            hits: [
                { frames: [2, 3], box: [26, 0, 36, 96], damage: 40, guard: 'mid', hitstun: 30, blockstun: 12, push: 2, launch: [0.3, 5.6], hitstop: 8, spark: 'petal', shake: 2 },
                { frames: [6, 7], box: [20, 0, 110, 44], damage: 70, guard: 'mid', hitstun: 24, blockstun: 16, push: 14, knockdown: true, launch: [1.0, 3.0], hitstop: 14, spark: 'big', shake: 6 }
            ],
            fx: [[1, 'fx_pillar', 48, 0]],
            sfx: 'flutter'
        },
        ultimate: {
            name: 'Mil Fleurs — Gigantesco Mano', anim: 'ultimate', kind: 'ultimate', stance: 'stand',
            durations: [6, 6, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 8, 10, 12],
            superFreeze: 55, cost: 100, invuln: [0, 10],
            hits: [
                { frames: [6, 7], box: [0, 0, 130, 100], damage: 30, guard: 'mid', hitstun: 60, blockstun: 20, push: 1, rehit: 4, hitstop: 2, spark: 'petal', shake: 3 },
                { frames: [8, 9], box: [0, 0, 240, 90], damage: 290, guard: 'mid', hitstun: 50, blockstun: 22, push: 30, launch: [6.0, 5.4], wallBounce: true, hitstop: 24, spark: 'big', shake: 10 }
            ],
            fx: [[2, 'fx_mano', 24, 0]],
            sfx: 'flutter'
        },
        ultimate2: {
            // SP.2 row of the sheet (arms spread wide, palm thrust, hands
            // clasped): a single arm blooms out of the petals, a field of
            // paired arms grabs the foe (Clutch), then two giant trees of
            // arms, the ^>BBB ones, burst out and the clasp snaps them shut.
            name: 'Cien Fleurs — Delphinium', anim: 'ultimate2', kind: 'ultimate', stance: 'stand',
            durations: [4, 4, 4, 4, 5, 6, 6, 6, 5, 5, 10, 8, 8, 10, 10, 12],
            superFreeze: 70, cost: 200, invuln: [0, 5],
            hits: [
                { frames: [6, 8], box: [0, 0, 150, 72], damage: 60, guard: 'mid', hitstun: 60, blockstun: 20, push: 0, rehit: 7, hitstop: 3, spark: 'petal', shake: 2, sfx: 'grab' },
                { frames: [10, 11], box: [0, 0, 230, 150], damage: 90, guard: 'mid', hitstun: 60, blockstun: 22, push: 0, launch: [0.2, 3.2], rehit: 6, hitstop: 4, spark: 'petal', shake: 5, sfx: 'flutter' },
                { frames: [13, 13], box: [0, 0, 230, 170], damage: 270, guard: 'mid', hitstun: 50, blockstun: 24, push: 30, knockdown: true, launch: [3.6, 5.2], hitstop: 24, spark: 'big', shake: 12, sfx: 'gigant' }
            ],
            fx: [[1, 'fx_bloom', 44, 0], [2, 'fx_bloom', 96, 0], [3, 'fx_clutchfield', 38, 0], [3, 'fx_clutchfield', 68, 0], [4, 'fx_clutchfield', 98, 0], [4, 'fx_clutchfield', 128, 0], [9, 'fx_delph', 30, 0], [10, 'fx_delph', 112, 0]],
            sfx: 'flutter'
        },
        throw: {
            name: 'Clutch', anim: 'throw', kind: 'throw', stance: 'stand',
            durations: [3, 4, 3, 4, 4, 5, 5, 6, 6, 8],
            hits: [{ frames: [0, 1], box: [4, 10, 30, 40], damage: 0, guard: 'unblockable', hitstun: 0, blockstun: 0, push: 0 }],
            throwRelease: { frame: 7, damage: 110, launch: [2.4, 5.0] },
            fx: [[2, 'fx_clutch', 16, 0]],
            sfx: 'grab'
        }
    }
};
