import manifest from '../generated/sprites/buggy.json';
import type { CharacterDef, SpriteManifest } from '../engine/types';

/**
 * Buggy le Clown (Gigant Battle DS) — the Bara Bara no Mi: he comes apart.
 * His hands fly off (Bara Bara Hō, the flying claw of his normals), his legs
 * kick on their own (Bara Bara Senbei), his torso and head rise off his legs
 * (the reversal), his parts rain on the foe (Bara Bara Festival), and the
 * cannon fires the Buggy Ball. The two-bar ultimate calls the Impel Down
 * escapees: the giant knife claw pins the foe, then the crowd of prisoners
 * charges across the stage.
 *
 * Every animation and effect comes from the Gigant Battle sheet
 * (tools/sprites/chars/buggy.json). Every `durations` array has one entry
 * per animation frame.
 */
export const buggy: CharacterDef = {
    id: 'buggy',
    name: 'Buggy',
    title: 'Le Clown',
    health: 960,
    walk: 1.5,
    back: 1.3,
    dash: 4.6,
    backdash: [3.8, 2.6],
    jump: [2.3, 7.2],
    gravity: 0.37,
    width: 12,
    height: 58,
    crouchHeight: 42,
    color: '#3b7fd4',
    manifest: manifest as unknown as SpriteManifest,
    moves: {
        lightA: {
            name: 'Direct', anim: 'lightA', kind: 'normal', stance: 'stand',
            durations: [3, 4, 7],
            hits: [{ frames: [1, 1], box: [6, 28, 36, 16], damage: 28, guard: 'mid', hitstun: 14, blockstun: 9, push: 6, hitstop: 6, spark: 'light' }],
            chain: ['lightB', 'crouchLight', 'heavy', 'heavyFwd', 'heavyBack', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        lightB: {
            name: 'Poing Bara Bara', anim: 'lightB', kind: 'normal', stance: 'stand',
            durations: [3, 3, 4, 7],
            hits: [{ frames: [1, 2], box: [6, 28, 42, 18], damage: 32, guard: 'mid', hitstun: 16, blockstun: 10, push: 7, hitstop: 7, spark: 'light' }],
            chain: ['lightC', 'heavy', 'heavyFwd', 'crouchHeavy'], cancelable: true, sfx: 'stretch'
        },
        lightC: {
            name: 'Griffe de couteaux', anim: 'lightC', kind: 'normal', stance: 'stand',
            durations: [4, 3, 5, 6, 8],
            hits: [{ frames: [2, 2], box: [4, 26, 62, 26], damage: 50, guard: 'mid', hitstun: 18, blockstun: 12, push: 18, hitstop: 9, spark: 'cut', shake: 2 }],
            cancelable: true, sfx: 'slash'
        },
        crouchLight: {
            name: 'Coup de pied bas', anim: 'crouchLight', kind: 'normal', stance: 'crouch',
            durations: [3, 4, 6],
            hits: [{ frames: [1, 1], box: [6, 2, 40, 16], damage: 24, guard: 'low', hitstun: 12, blockstun: 8, push: 8, hitstop: 6, spark: 'light' }],
            chain: ['crouchLight', 'lightB', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        crouchHeavy: {
            name: 'Fauchage à la hache', anim: 'crouchHeavy', kind: 'normal', stance: 'crouch',
            durations: [5, 4, 5, 6, 10],
            hits: [{ frames: [2, 2], box: [0, 0, 46, 26], damage: 66, guard: 'low', hitstun: 20, blockstun: 12, push: 14, knockdown: true, launch: [1.2, 2.6], hitstop: 10, spark: 'heavy' }],
            cancelable: true, sfx: 'swingHeavy'
        },
        heavy: {
            name: 'Main volante', anim: 'heavy', kind: 'normal', stance: 'stand',
            durations: [4, 4, 4, 4, 6, 9],
            hits: [{ frames: [2, 3], box: [10, 28, 74, 22], damage: 72, guard: 'mid', hitstun: 21, blockstun: 14, push: 18, hitstop: 11, spark: 'heavy', shake: 2 }],
            cancelable: true, sfx: 'stretch'
        },
        heavyFwd: {
            name: 'Grande hache', anim: 'heavyFwd', kind: 'normal', stance: 'stand',
            durations: [4, 4, 5, 3, 4, 5, 6, 6],
            hits: [{ frames: [3, 4], box: [0, 10, 66, 60], damage: 80, guard: 'high', hitstun: 22, blockstun: 14, push: 14, hitstop: 12, spark: 'cut', shake: 4 }],
            cancelable: true, sfx: 'swingHeavy'
        },
        heavyBack: {
            name: 'Coup de pied montant', anim: 'heavyBack', kind: 'normal', stance: 'stand',
            durations: [4, 3, 5, 9],
            hits: [{ frames: [1, 2], box: [2, 18, 36, 44], damage: 62, guard: 'mid', hitstun: 22, blockstun: 12, push: 8, launch: [0.6, 6.4], hitstop: 10, spark: 'heavy' }],
            invuln: [1, 2],
            cancelable: true, sfx: 'swingHeavy'
        },
        airLight: {
            name: 'Revers aérien', anim: 'airLight', kind: 'normal', stance: 'air',
            durations: [4, 5, 8],
            hits: [{ frames: [1, 1], box: [0, 16, 36, 30], damage: 34, guard: 'high', hitstun: 14, blockstun: 9, push: 8, hitstop: 7, spark: 'cut' }],
            chain: ['airHeavy'], cancelable: true, sfx: 'slash'
        },
        airHeavy: {
            name: 'Cimeterre aérien', anim: 'airHeavy', kind: 'normal', stance: 'air',
            durations: [4, 3, 4, 5, 8],
            hits: [{ frames: [2, 3], box: [0, 6, 64, 66], damage: 64, guard: 'high', hitstun: 18, blockstun: 12, push: 12, hitstop: 10, spark: 'cut' }],
            cancelable: true, landLag: 5, sfx: 'slash'
        },
        // Head first, cape spread, from the air to the ground.
        airSpecial: {
            name: 'Plongeon du Clown', anim: 'airSpecial', kind: 'special', stance: 'air',
            durations: [4, 3, 3, 30, 4, 6, 7, 8],
            motion: [[1, 2.4, -6.0]],
            noGravity: true, landFrame: 5,
            hits: [{ frames: [1, 4], box: [-8, -4, 40, 46], damage: 78, guard: 'high', hitstun: 20, blockstun: 14, push: 16, knockdown: true, launch: [1.6, 3.6], hitstop: 12, spark: 'heavy', shake: 4 }],
            sfx: 'swingHeavy'
        },
        // The hand, knives between the fingers, flies off the wrist.
        specialN: {
            name: 'Bara Bara Hō', anim: 'specialN', kind: 'special', stance: 'stand',
            durations: [5, 4, 6, 6, 6, 6, 5, 5, 8],
            hits: [],
            projectile: {
                anim: 'fx_hand', atFrame: 1, offset: [44, 34], speed: 4.8, life: 70,
                box: [-16, -10, 32, 20], fps: 12, hits: 1,
                hit: { damage: 76, guard: 'mid', hitstun: 22, blockstun: 16, push: 16, hitstop: 10, spark: 'cut', shake: 2, sfx: 'slash' }
            },
            sfx: 'stretch'
        },
        // The legs come off and kick on their own across the ground.
        specialF: {
            name: 'Bara Bara Senbei', anim: 'specialF', kind: 'special', stance: 'stand',
            durations: [4, 4, 4, 4, 3, 3, 4, 5, 8, 8],
            motion: [[3, 5.0, 0], [8, 0, 0]],
            hits: [{ frames: [3, 7], box: [10, 2, 42, 24], damage: 90, guard: 'mid', hitstun: 24, blockstun: 14, push: 22, launch: [3.0, 3.6], hitstop: 13, spark: 'heavy', shake: 4 }],
            sfx: 'swingHeavy'
        },
        // Neck, torso and head float up off the legs, the knife spinning.
        specialU: {
            name: 'Bara Bara Kinkyū Dasshutsu', anim: 'specialU', kind: 'special', stance: 'stand',
            durations: [3, 3, 3, 4, 4, 4, 5, 6, 8, 8],
            invuln: [0, 4],
            hits: [
                { frames: [2, 4], box: [-14, 18, 54, 62], damage: 56, guard: 'mid', hitstun: 24, blockstun: 16, push: 8, launch: [0.8, 6.8], hitstop: 10, spark: 'cut', shake: 3 },
                { frames: [6, 8], box: [-16, 50, 56, 76], damage: 48, guard: 'mid', hitstun: 24, blockstun: 16, push: 10, launch: [1.2, 7.4], hitstop: 10, spark: 'big', shake: 4 }
            ],
            sfx: 'slash'
        },
        // The cannon: Buggy lights the fuse and the Buggy Ball rolls out.
        specialD: {
            name: 'Buggy Ball', anim: 'specialD', kind: 'special', stance: 'stand',
            durations: [5, 5, 5, 6, 5, 5, 5, 5, 5, 6, 6, 8],
            hits: [],
            projectile: {
                anim: 'fx_ball', atFrame: 4, offset: [56, 26], speed: 3.4, life: 90,
                box: [-22, -22, 44, 44], fps: 12, hits: 1,
                hit: { damage: 110, guard: 'mid', hitstun: 26, blockstun: 18, push: 20, knockdown: true, launch: [2.6, 5.2], hitstop: 14, spark: 'fire', shake: 6, sfx: 'bazooka' }
            },
            sfx: 'bazooka'
        },
        // Arms, legs, feet and knives fly off and rain on the foe.
        ultimate: {
            name: 'Bara Bara Festival', anim: 'ultimate', kind: 'ultimate', stance: 'stand',
            durations: [8, 5, 5, 5, 5, 5, 5, 5, 5, 8, 10, 12],
            superFreeze: 55, cost: 100, invuln: [0, 3],
            hits: [
                { frames: [1, 7], box: [8, 18, 82, 70], damage: 34, guard: 'mid', hitstun: 50, blockstun: 18, push: 1, rehit: 10, hitstop: 4, spark: 'cut', shake: 2 },
                { frames: [8, 9], box: [8, 18, 90, 76], damage: 250, guard: 'mid', hitstun: 50, blockstun: 22, push: 30, launch: [5.4, 5.6], wallBounce: true, hitstop: 20, spark: 'big', shake: 8 }
            ],
            sfx: 'gatling'
        },
        // Two bars: the giant knife claw pins the foe, then the Impel Down
        // escapees charge in from behind Buggy and trample through.
        ultimate2: {
            name: 'Captain Buggy !! Charge des évadés', anim: 'ultimate2', kind: 'ultimate', stance: 'stand',
            durations: [6, 10, 4, 3, 3, 24, 3, 3, 6, 26, 16],
            superFreeze: 70, cost: 200, invuln: [0, 9],
            hits: [
                { frames: [3, 7], box: [8, 26, 64, 30], damage: 40, guard: 'mid', hitstun: 70, blockstun: 20, push: 1, rehit: 18, hitstop: 4, spark: 'cut', shake: 3 },
                { frames: [8, 8], box: [8, 26, 50, 40], damage: 60, guard: 'mid', hitstun: 70, blockstun: 20, push: 1, hitstop: 10, spark: 'heavy', shake: 4 }
            ],
            projectile: {
                anim: 'fx_crew', atFrame: 9, offset: [-30, 36], speed: 5.2, life: 110,
                box: [-50, -36, 100, 72], fps: 6, hits: 4,
                hit: { damage: 150, guard: 'mid', hitstun: 40, blockstun: 20, push: 4, launch: [3.0, 2.6], hitstop: 10, spark: 'big', shake: 8, sfx: 'bazooka' }
            },
            sfx: 'grab'
        },
        throw: {
            name: 'Bara Bara Griffes', anim: 'throw', kind: 'throw', stance: 'stand',
            durations: [3, 4, 5, 5, 4, 4, 4, 6, 8, 8],
            hits: [{ frames: [0, 1], box: [4, 10, 30, 40], damage: 0, guard: 'unblockable', hitstun: 0, blockstun: 0, push: 0 }],
            throwRelease: { frame: 7, damage: 110, launch: [2.6, 5.0] },
            sfx: 'grab'
        }
    }
};
