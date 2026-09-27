import manifest from '../generated/sprites/hancock.json';
import type { CharacterDef, SpriteManifest } from '../engine/types';

/**
 * Boa Hancock — the Pirate Empress. Long, sweeping kicks from the Kuja
 * martial art for the normals, then the Mero Mero no Mi: Pistol Kiss (a
 * heart shot from the fingertip), Mero Mero Mellow (the growing heart beam
 * that petrifies: very long hitstun), Slave Arrow (the heart bubble drawn
 * like a bow, loosing a volley of arrows) and a somersault kick as the
 * reversal. Perfume Femur, the full dance of kicks ending on the handstand
 * spin, is the ultimate.
 *
 * Every animation and effect comes from the Gigant Battle sheet
 * (tools/sprites/chars/hancock.json). Every `durations` array has one entry
 * per animation frame.
 */
export const hancock: CharacterDef = {
    id: 'hancock',
    name: 'Hancock',
    title: 'Impératrice pirate',
    health: 970,
    walk: 1.7,
    back: 1.35,
    dash: 5.0,
    backdash: [3.9, 2.6],
    jump: [2.4, 7.3],
    gravity: 0.37,
    width: 11,
    height: 66,
    crouchHeight: 44,
    color: '#e0518f',
    manifest: manifest as unknown as SpriteManifest,
    moves: {
        lightA: {
            name: 'Coup de pied fouetté', anim: 'lightA', kind: 'normal', stance: 'stand',
            durations: [3, 2, 4, 7],
            hits: [{ frames: [1, 2], box: [4, 16, 44, 22], damage: 30, guard: 'mid', hitstun: 14, blockstun: 9, push: 6, hitstop: 6, spark: 'light' }],
            chain: ['lightB', 'crouchLight', 'heavy', 'heavyFwd', 'heavyBack', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        lightB: {
            name: 'Pivot de la robe', anim: 'lightB', kind: 'normal', stance: 'stand',
            durations: [3, 3, 3, 4, 7],
            hits: [{ frames: [1, 3], box: [2, 4, 42, 70], damage: 34, guard: 'mid', hitstun: 16, blockstun: 10, push: 7, hitstop: 7, spark: 'light' }],
            chain: ['lightC', 'heavy', 'heavyFwd', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        lightC: {
            name: 'Grande ruade tournoyante', anim: 'lightC', kind: 'normal', stance: 'stand',
            durations: [3, 3, 3, 3, 4, 4, 6, 8],
            hits: [
                { frames: [1, 2], box: [4, 24, 44, 40], damage: 26, guard: 'mid', hitstun: 18, blockstun: 10, push: 4, hitstop: 6, spark: 'light' },
                { frames: [3, 5], box: [0, 4, 50, 70], damage: 40, guard: 'mid', hitstun: 20, blockstun: 12, push: 18, knockdown: true, launch: [2.2, 3.4], hitstop: 10, spark: 'heavy', shake: 2 }
            ],
            cancelable: true, sfx: 'swingHeavy'
        },
        crouchLight: {
            name: 'Coup de talon bas', anim: 'crouchLight', kind: 'normal', stance: 'crouch',
            durations: [3, 3, 6],
            hits: [{ frames: [1, 2], box: [4, 0, 34, 18], damage: 24, guard: 'low', hitstun: 12, blockstun: 8, push: 8, hitstop: 6, spark: 'light' }],
            chain: ['crouchLight', 'lightB', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        crouchHeavy: {
            name: 'Balayage de la robe', anim: 'crouchHeavy', kind: 'normal', stance: 'crouch',
            durations: [4, 4, 3, 4, 6, 10],
            hits: [{ frames: [2, 3], box: [4, 0, 44, 22], damage: 66, guard: 'low', hitstun: 20, blockstun: 12, push: 14, knockdown: true, launch: [1.2, 2.6], hitstop: 10, spark: 'heavy' }],
            cancelable: true, sfx: 'swingHeavy'
        },
        heavy: {
            name: 'Coup de pied direct', anim: 'heavy', kind: 'normal', stance: 'stand',
            durations: [4, 4, 3, 4, 6, 9],
            hits: [{ frames: [2, 4], box: [4, 20, 48, 24], damage: 72, guard: 'mid', hitstun: 21, blockstun: 14, push: 18, hitstop: 11, spark: 'heavy', shake: 2 }],
            cancelable: true, sfx: 'swingHeavy'
        },
        heavyFwd: {
            name: 'Talon du scorpion', anim: 'heavyFwd', kind: 'normal', stance: 'stand',
            durations: [5, 6, 4, 4, 6, 8],
            hits: [{ frames: [2, 3], box: [4, 10, 38, 64], damage: 78, guard: 'high', hitstun: 22, blockstun: 14, push: 14, hitstop: 12, spark: 'heavy', shake: 3 }],
            cancelable: true, sfx: 'swingHeavy'
        },
        heavyBack: {
            name: 'Ruade renversée', anim: 'heavyBack', kind: 'normal', stance: 'stand',
            durations: [4, 3, 4, 4, 4, 5, 5, 6],
            hits: [{ frames: [2, 3], box: [0, 10, 44, 70], damage: 62, guard: 'mid', hitstun: 22, blockstun: 12, push: 8, launch: [0.6, 6.4], hitstop: 10, spark: 'heavy' }],
            invuln: [1, 2],
            cancelable: true, sfx: 'swing'
        },
        airLight: {
            name: 'Genou aérien', anim: 'airLight', kind: 'normal', stance: 'air',
            durations: [3, 6, 8],
            hits: [{ frames: [1, 1], box: [0, 14, 42, 38], damage: 32, guard: 'high', hitstun: 14, blockstun: 9, push: 8, hitstop: 7, spark: 'light' }],
            chain: ['airHeavy'], cancelable: true, sfx: 'swing'
        },
        airHeavy: {
            name: 'Vrille aérienne', anim: 'airHeavy', kind: 'normal', stance: 'air',
            durations: [3, 3, 5, 5, 8],
            hits: [{ frames: [1, 3], box: [-4, 0, 48, 58], damage: 64, guard: 'high', hitstun: 18, blockstun: 12, push: 12, hitstop: 10, spark: 'heavy' }],
            cancelable: true, landLag: 5, sfx: 'swingHeavy'
        },
        airSpecial: {
            name: 'Ruée de l\'Impératrice', anim: 'airSpecial', kind: 'special', stance: 'air',
            durations: [4, 4, 4, 30, 10],
            motion: [[1, 3.0, -5.2]],
            noGravity: true, landFrame: 4,
            hits: [{ frames: [0, 3], box: [-4, 0, 54, 54], damage: 78, guard: 'high', hitstun: 20, blockstun: 14, push: 16, knockdown: true, launch: [1.8, 3.4], hitstop: 12, spark: 'heavy', shake: 3 }],
            sfx: 'swingHeavy'
        },
        specialN: {
            name: 'Pistol Kiss', anim: 'specialN', kind: 'special', stance: 'stand',
            durations: [3, 3, 4, 4, 5, 6, 6, 6],
            hits: [],
            projectile: {
                anim: 'fx_kiss', atFrame: 3, offset: [34, 44], speed: 6.2, life: 70,
                box: [-10, -10, 20, 20], fps: 8, hits: 1,
                hit: { damage: 58, guard: 'mid', hitstun: 20, blockstun: 12, push: 12, hitstop: 8, spark: 'love', sfx: 'love' }
            },
            sfx: 'love'
        },
        specialF: {
            name: 'Mero Mero Mellow', anim: 'specialF', kind: 'special', stance: 'stand',
            durations: [3, 4, 4, 5, 5, 4, 4, 6, 8, 8, 8],
            hits: [],
            projectile: {
                anim: 'fx_mellow', atFrame: 6, offset: [30, 44], speed: 3.6, life: 60,
                box: [-18, -26, 36, 52], fps: 12, hits: 1,
                hit: { damage: 70, guard: 'mid', hitstun: 50, blockstun: 16, push: 4, hitstop: 14, spark: 'love', shake: 2, sfx: 'love' }
            },
            sfx: 'love'
        },
        specialU: {
            name: 'Salto de la Gorgone', anim: 'specialU', kind: 'special', stance: 'stand',
            durations: [3, 4, 5, 5, 6, 8, 8],
            motion: [[1, 1.2, 6.2]],
            invuln: [0, 2],
            hits: [
                { frames: [1, 1], box: [0, 16, 40, 50], damage: 40, guard: 'mid', hitstun: 24, blockstun: 14, push: 6, launch: [0.8, 6.8], hitstop: 8, spark: 'heavy' },
                { frames: [2, 3], box: [-12, 10, 52, 72], damage: 64, guard: 'mid', hitstun: 24, blockstun: 16, push: 10, launch: [1.4, 7.2], hitstop: 12, spark: 'petal', shake: 3 }
            ],
            sfx: 'swingHeavy'
        },
        specialD: {
            name: 'Slave Arrow', anim: 'specialD', kind: 'special', stance: 'stand',
            durations: [3, 3, 3, 3, 3, 3, 3, 3, 4, 8, 10],
            hits: [],
            projectile: {
                anim: 'fx_arrows', atFrame: 8, offset: [60, 40], speed: 4.2, life: 70,
                box: [-50, -20, 100, 40], hits: 3,
                hit: { damage: 30, guard: 'mid', hitstun: 22, blockstun: 10, push: 3, hitstop: 5, spark: 'love', sfx: 'love' }
            },
            sfx: 'flutter'
        },
        ultimate: {
            name: 'Perfume Femur', anim: 'ultimate', kind: 'ultimate', stance: 'stand',
            durations: [6, 6, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 4, 4, 4, 4, 4, 4, 4, 8, 10, 12],
            superFreeze: 55, cost: 100, invuln: [0, 8],
            motion: [[2, 2.4, 0], [8, 0, 0]],
            hits: [
                { frames: [2, 12], box: [-8, 0, 64, 72], damage: 26, guard: 'mid', hitstun: 44, blockstun: 18, push: 1, rehit: 14, hitstop: 4, spark: 'petal', shake: 2 },
                { frames: [17, 19], box: [-10, 0, 72, 90], damage: 280, guard: 'mid', hitstun: 50, blockstun: 22, push: 30, launch: [5.6, 5.8], wallBounce: true, hitstop: 24, spark: 'love', shake: 10, sfx: 'love' }
            ],
            sfx: 'flutter'
        },
        throw: {
            name: 'Coup de pied de l\'Impératrice', anim: 'throw', kind: 'throw', stance: 'stand',
            durations: [3, 4, 5, 4, 4, 8, 10],
            hits: [{ frames: [0, 1], box: [4, 10, 30, 40], damage: 0, guard: 'unblockable', hitstun: 0, blockstun: 0, push: 0 }],
            throwRelease: { frame: 5, damage: 110, launch: [2.8, 4.6] },
            sfx: 'grab'
        }
    }
};
