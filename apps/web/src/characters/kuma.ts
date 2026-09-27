import manifest from '../generated/sprites/kuma.json';
import type { CharacterDef, SpriteManifest } from '../engine/types';

/**
 * Bartholomew Kuma — the tyrant of the Nikyu Nikyu no Mi. A slow, heavy
 * body with long palm strikes that shove the opponent away, the Tsuppari
 * Pad Hō (a paw-shaped shock wave that flies across the screen), a
 * teleport that reappears palm first, a stomp whose shock wave crosses the
 * floor, and Ursus Shock: air squeezed into a paw-shaped bubble that bursts.
 *
 * Every animation and effect comes from the Gigant Battle sheet
 * (tools/sprites/chars/kuma.json): the blue paw rings, the ground paw
 * print, the stomp's shock wave and the Ursus bubble are the sheet's own
 * effect rows. Every `durations` array has one entry per animation frame.
 */
export const kuma: CharacterDef = {
    id: 'kuma',
    name: 'Kuma',
    title: 'Le tyran',
    health: 1120,
    walk: 1.15,
    back: 0.95,
    dash: 3.6,
    backdash: [3.0, 2.2],
    jump: [2.0, 6.7],
    gravity: 0.38,
    width: 17,
    height: 80,
    crouchHeight: 54,
    color: '#3a4f86',
    manifest: manifest as unknown as SpriteManifest,
    moves: {
        lightA: {
            name: 'Coussinet', anim: 'lightA', kind: 'normal', stance: 'stand',
            durations: [4, 3, 4, 8],
            hits: [{ frames: [1, 2], box: [8, 52, 38, 20], damage: 34, guard: 'mid', hitstun: 15, blockstun: 9, push: 8, hitstop: 7, spark: 'light' }],
            chain: ['lightB', 'crouchLight', 'heavy', 'heavyFwd', 'heavyBack', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        lightB: {
            name: 'Paume de côté', anim: 'lightB', kind: 'normal', stance: 'stand',
            durations: [4, 3, 4, 8],
            hits: [{ frames: [1, 2], box: [8, 42, 42, 20], damage: 38, guard: 'mid', hitstun: 16, blockstun: 10, push: 9, hitstop: 7, spark: 'light' }],
            chain: ['lightC', 'heavy', 'heavyFwd', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        lightC: {
            name: 'Double poussée', anim: 'lightC', kind: 'normal', stance: 'stand',
            durations: [5, 3, 4, 3, 5, 10],
            hits: [
                { frames: [2, 2], box: [8, 34, 42, 22], damage: 26, guard: 'mid', hitstun: 18, blockstun: 10, push: 4, hitstop: 6, spark: 'paw' },
                { frames: [4, 4], box: [8, 34, 42, 22], damage: 40, guard: 'mid', hitstun: 20, blockstun: 12, push: 22, hitstop: 9, spark: 'paw', shake: 2 }
            ],
            cancelable: true, sfx: 'paw'
        },
        crouchLight: {
            name: 'Revers bas', anim: 'crouchLight', kind: 'normal', stance: 'crouch',
            durations: [4, 3, 3, 8],
            hits: [{ frames: [1, 2], box: [10, 0, 44, 26], damage: 26, guard: 'low', hitstun: 13, blockstun: 8, push: 8, hitstop: 6, spark: 'light' }],
            chain: ['crouchLight', 'lightB', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        crouchHeavy: {
            name: 'Patte au sol', anim: 'crouchHeavy', kind: 'normal', stance: 'crouch',
            durations: [5, 5, 3, 4, 4, 6, 10],
            hits: [{ frames: [2, 4], box: [16, 0, 72, 26], damage: 70, guard: 'low', hitstun: 20, blockstun: 12, push: 14, knockdown: true, launch: [1.4, 2.6], hitstop: 10, spark: 'paw', shake: 2 }],
            cancelable: true, sfx: 'paw'
        },
        heavy: {
            name: 'Tsuppari', anim: 'heavy', kind: 'normal', stance: 'stand',
            durations: [6, 5, 3, 5, 12],
            hits: [{ frames: [2, 3], box: [10, 34, 54, 26], damage: 76, guard: 'mid', hitstun: 22, blockstun: 14, push: 24, hitstop: 11, spark: 'paw', shake: 2 }],
            cancelable: true, sfx: 'swingHeavy'
        },
        heavyFwd: {
            name: 'Patte d\'ours', anim: 'heavyFwd', kind: 'normal', stance: 'stand',
            durations: [5, 5, 5, 4, 5, 12],
            hits: [{ frames: [3, 4], box: [6, 16, 48, 58], damage: 82, guard: 'high', hitstun: 22, blockstun: 14, push: 16, hitstop: 12, spark: 'heavy', shake: 4 }],
            cancelable: true, sfx: 'swingHeavy'
        },
        heavyBack: {
            name: 'Revers tournoyant', anim: 'heavyBack', kind: 'normal', stance: 'stand',
            durations: [4, 4, 4, 4, 7, 9],
            hits: [{ frames: [2, 3], box: [-4, 14, 48, 78], damage: 66, guard: 'mid', hitstun: 22, blockstun: 12, push: 8, launch: [0.8, 6.4], hitstop: 10, spark: 'heavy' }],
            invuln: [1, 2],
            cancelable: true, sfx: 'swingHeavy'
        },
        airLight: {
            name: 'Paume aérienne', anim: 'airLight', kind: 'normal', stance: 'air',
            durations: [4, 4, 10],
            hits: [{ frames: [1, 2], box: [0, 8, 48, 52], damage: 36, guard: 'high', hitstun: 14, blockstun: 9, push: 8, hitstop: 7, spark: 'light' }],
            chain: ['airHeavy'], cancelable: true, sfx: 'swing'
        },
        airHeavy: {
            name: 'Rafale aérienne', anim: 'airHeavy', kind: 'normal', stance: 'air',
            durations: [4, 4, 3, 10],
            hits: [
                { frames: [1, 1], box: [0, 4, 56, 54], damage: 30, guard: 'high', hitstun: 16, blockstun: 10, push: 4, hitstop: 6, spark: 'paw' },
                { frames: [3, 3], box: [0, 4, 56, 54], damage: 40, guard: 'high', hitstun: 18, blockstun: 12, push: 12, hitstop: 9, spark: 'paw' }
            ],
            cancelable: true, landLag: 6, sfx: 'paw'
        },
        airSpecial: {
            name: 'Chute du tyran', anim: 'airSpecial', kind: 'special', stance: 'air',
            durations: [4, 4, 4, 30, 12],
            motion: [[2, 2.4, -6.2]],
            noGravity: true, landFrame: 4,
            hits: [{ frames: [2, 3], box: [-4, -6, 50, 56], damage: 84, guard: 'high', hitstun: 20, blockstun: 14, push: 16, knockdown: true, launch: [1.6, 3.6], hitstop: 12, spark: 'paw', shake: 4 }],
            fx: [[4, 'fx_ground', 26, 2]],
            sfx: 'paw'
        },
        specialN: {
            name: 'Tsuppari Pad Hō', anim: 'specialN', kind: 'special', stance: 'stand',
            durations: [5, 5, 3, 3, 4, 4, 5, 10],
            hits: [{ frames: [2, 3], box: [10, 36, 56, 30], damage: 30, guard: 'mid', hitstun: 22, blockstun: 12, push: 6, hitstop: 8, spark: 'paw' }],
            projectile: {
                anim: 'fx_pad', atFrame: 4, offset: [64, 50], speed: 4.6, life: 90,
                box: [-10, -24, 20, 48], fps: 12, hits: 1,
                hit: { damage: 78, guard: 'mid', hitstun: 22, blockstun: 16, push: 20, hitstop: 11, spark: 'paw', shake: 2, sfx: 'paw' }
            },
            sfx: 'paw'
        },
        specialF: {
            name: 'Téléportation — Pad Hō', anim: 'specialF', kind: 'special', stance: 'stand',
            durations: [4, 3, 3, 3, 4, 3, 4, 4, 4, 4, 10],
            motion: [[1, 8.0, 0], [4, 0, 0]],
            invuln: [0, 4],
            hits: [{ frames: [5, 7], box: [8, 26, 70, 56], damage: 96, guard: 'mid', hitstun: 24, blockstun: 14, push: 24, launch: [3.4, 3.6], hitstop: 14, spark: 'paw', shake: 4 }],
            sfx: 'paw'
        },
        specialU: {
            name: 'Pad Hō ascendant', anim: 'specialU', kind: 'special', stance: 'stand',
            durations: [3, 3, 3, 3, 4, 4, 5, 7, 10],
            invuln: [0, 3],
            hits: [{ frames: [2, 5], box: [0, 36, 64, 80], damage: 84, guard: 'mid', hitstun: 24, blockstun: 16, push: 8, launch: [1.4, 7.2], hitstop: 12, spark: 'paw', shake: 3 }],
            sfx: 'paw'
        },
        specialD: {
            name: 'Onde du tyran', anim: 'specialD', kind: 'special', stance: 'stand',
            durations: [5, 5, 6, 4, 8, 12],
            hits: [{ frames: [3, 4], box: [-40, -2, 124, 28], damage: 88, guard: 'low', hitstun: 22, blockstun: 16, push: 18, knockdown: true, launch: [1.6, 4.4], hitstop: 12, spark: 'big', shake: 6 }],
            fx: [[3, 'fx_shock', 20, 10], [3, 'fx_dust', -22, 6]],
            sfx: 'quake'
        },
        ultimate: {
            name: 'Ursus Shock', anim: 'ultimate', kind: 'ultimate', stance: 'stand',
            durations: [6, 6, 6, 6, 6, 5, 5, 5, 4, 6, 6, 6, 14],
            superFreeze: 55, cost: 100, invuln: [0, 9],
            hits: [
                { frames: [8, 10], box: [8, 0, 112, 110], damage: 36, guard: 'mid', hitstun: 60, blockstun: 20, push: 1, rehit: 4, hitstop: 4, spark: 'paw', shake: 4 },
                { frames: [11, 11], box: [8, 0, 120, 120], damage: 300, guard: 'mid', hitstun: 50, blockstun: 22, push: 30, launch: [5.6, 6.0], wallBounce: true, hitstop: 24, spark: 'big', shake: 12 }
            ],
            fx: [[1, 'fx_gather', 10, 100], [8, 'fx_ursus', 96, 54]],
            sfx: 'gigant'
        },
        ultimate2: {
            // PX-0's mouth laser: Kuma tips his head back, light gathers
            // between his jaws, the beam cuts forward, a rain of lasers
            // sweeps the whole floor, then the target blows up twice over.
            name: 'Laser du Pacifista', anim: 'ultimate2', kind: 'ultimate', stance: 'stand',
            durations: [3, 3, 3, 5, 16, 14, 10, 24, 22],
            superFreeze: 70, cost: 200, invuln: [0, 4],
            hits: [
                { frames: [4, 4], box: [6, 20, 160, 70], damage: 120, guard: 'mid', hitstun: 70, blockstun: 20, push: 2, hitstop: 12, spark: 'laser', shake: 6, sfx: 'laser' },
                { frames: [5, 5], box: [0, 0, 240, 110], damage: 80, guard: 'mid', hitstun: 70, blockstun: 16, push: 1, hitstop: 8, spark: 'laser', shake: 6, sfx: 'laser' },
                { frames: [6, 6], box: [0, 0, 200, 110], damage: 80, guard: 'mid', hitstun: 70, blockstun: 16, push: 1, hitstop: 10, spark: 'fire', shake: 8, sfx: 'fire' },
                { frames: [7, 7], box: [0, 0, 240, 130], damage: 250, guard: 'mid', hitstun: 50, blockstun: 24, push: 30, knockdown: true, launch: [5.4, 6.4], hitstop: 26, spark: 'big', shake: 14, sfx: 'quake' }
            ],
            fx: [
                [1, 'fx_glint', 14, 76],
                [4, 'fx_beam', 60, 66], [4, 'fx_glint', 14, 76],
                [5, 'fx_rain', 210, 52], [5, 'fx_beam', 60, 66],
                [6, 'fx_boom', 70, 48], [6, 'fx_rain', 230, 52],
                [7, 'fx_boom', 60, 50], [7, 'fx_boom', 150, 48], [7, 'fx_ursus', 110, 60],
                [8, 'fx_boom', 230, 48], [8, 'fx_shock', 80, 10]
            ],
            sfx: 'laser'
        },
        throw: {
            name: 'Nikyu — répulsion', anim: 'throw', kind: 'throw', stance: 'stand',
            durations: [3, 4, 6, 5, 3, 6, 12],
            hits: [{ frames: [0, 1], box: [4, 16, 32, 44], damage: 0, guard: 'unblockable', hitstun: 0, blockstun: 0, push: 0 }],
            throwRelease: { frame: 4, damage: 110, launch: [3.6, 4.4] },
            fx: [[4, 'fx_pad', 58, 48]],
            sfx: 'grab'
        }
    }
};
