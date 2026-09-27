import manifest from '../generated/sprites/kid.json';
import type { CharacterDef, SpriteManifest } from '../engine/types';

/**
 * Eustass « Captain » Kid — Jiki Jiki no Mi, magnetism. Heavy brawler
 * punches, Repel sends a burst of scrap across the screen, Attraction pulls
 * the opponent in from mid range for a follow-up punch, a scrap pillar
 * erupts from the ground (↓S), a rising metal uppercut is his reversal and
 * the giant scrap arm of Punk Gibson is the ultimate.
 *
 * Every animation and effect comes from the Gigant Battle 2 sheet
 * (tools/sprites/chars/kid.json): the gear burst, the scrap spikes, the
 * ground wave and the giant hand are the sheet's own metal effects. Every
 * `durations` array has one entry per animation frame.
 */
export const kid: CharacterDef = {
    id: 'kid',
    name: 'Kid',
    title: 'Capitaine magnétique',
    health: 1040,
    walk: 1.5,
    back: 1.2,
    dash: 4.6,
    backdash: [3.6, 2.6],
    jump: [2.2, 7.1],
    gravity: 0.38,
    width: 13,
    height: 68,
    crouchHeight: 46,
    color: '#c8322a',
    manifest: manifest as unknown as SpriteManifest,
    moves: {
        lightA: {
            name: 'Direct', anim: 'lightA', kind: 'normal', stance: 'stand',
            durations: [3, 3, 3, 7],
            hits: [{ frames: [1, 2], box: [6, 34, 36, 14], damage: 30, guard: 'mid', hitstun: 14, blockstun: 9, push: 6, hitstop: 6, spark: 'light' }],
            chain: ['lightB', 'crouchLight', 'heavy', 'heavyFwd', 'heavyBack', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        lightB: {
            name: 'Crochet de fer', anim: 'lightB', kind: 'normal', stance: 'stand',
            durations: [3, 3, 4, 7],
            hits: [{ frames: [0, 1], box: [4, 30, 38, 20], damage: 34, guard: 'mid', hitstun: 16, blockstun: 10, push: 7, hitstop: 7, spark: 'light' }],
            chain: ['lightC', 'heavy', 'heavyFwd', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        lightC: {
            name: 'Revers de ferraille', anim: 'lightC', kind: 'normal', stance: 'stand',
            durations: [3, 3, 3, 3, 4, 6, 8],
            hits: [{ frames: [2, 4], box: [4, 18, 44, 34], damage: 52, guard: 'mid', hitstun: 18, blockstun: 12, push: 20, hitstop: 9, spark: 'heavy', shake: 2 }],
            cancelable: true, sfx: 'swingHeavy'
        },
        crouchLight: {
            name: 'Poing bas', anim: 'crouchLight', kind: 'normal', stance: 'crouch',
            durations: [3, 4, 6],
            hits: [{ frames: [1, 1], box: [6, 4, 46, 22], damage: 24, guard: 'low', hitstun: 12, blockstun: 8, push: 8, hitstop: 6, spark: 'light' }],
            chain: ['crouchLight', 'lightB', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        crouchHeavy: {
            name: 'Vague de ferraille', anim: 'crouchHeavy', kind: 'normal', stance: 'crouch',
            durations: [5, 3, 3, 4, 5, 10],
            hits: [{ frames: [2, 4], box: [6, 0, 58, 22], damage: 66, guard: 'low', hitstun: 20, blockstun: 12, push: 14, knockdown: true, launch: [1.2, 2.6], hitstop: 10, spark: 'magnet' }],
            fx: [[2, 'fx_wave', 44, 0]],
            cancelable: true, sfx: 'magnet'
        },
        heavy: {
            name: 'Poing magnétique', anim: 'heavy', kind: 'normal', stance: 'stand',
            durations: [5, 4, 4, 4, 6, 8],
            hits: [{ frames: [2, 3], box: [4, 12, 56, 44], damage: 74, guard: 'mid', hitstun: 21, blockstun: 14, push: 20, hitstop: 11, spark: 'heavy', shake: 2 }],
            cancelable: true, sfx: 'swingHeavy'
        },
        heavyFwd: {
            name: 'Marteau de fer', anim: 'heavyFwd', kind: 'normal', stance: 'stand',
            durations: [4, 4, 4, 4, 4, 6, 7],
            hits: [{ frames: [3, 4], box: [0, 0, 48, 76], damage: 80, guard: 'high', hitstun: 22, blockstun: 14, push: 14, hitstop: 12, spark: 'heavy', shake: 4 }],
            cancelable: true, sfx: 'swingHeavy'
        },
        heavyBack: {
            name: 'Uppercut de fer', anim: 'heavyBack', kind: 'normal', stance: 'stand',
            durations: [4, 3, 3, 3, 4, 6, 7],
            hits: [{ frames: [3, 4], box: [0, 20, 44, 62], damage: 64, guard: 'mid', hitstun: 22, blockstun: 12, push: 8, launch: [0.6, 6.4], hitstop: 10, spark: 'heavy' }],
            invuln: [2, 3],
            cancelable: true, sfx: 'swingHeavy'
        },
        airLight: {
            name: 'Paume aérienne', anim: 'airLight', kind: 'normal', stance: 'air',
            durations: [4, 4, 8],
            hits: [{ frames: [1, 2], box: [0, 14, 44, 30], damage: 34, guard: 'high', hitstun: 14, blockstun: 9, push: 8, hitstop: 7, spark: 'light' }],
            chain: ['airHeavy'], cancelable: true, sfx: 'swing'
        },
        airHeavy: {
            name: 'Moulinet de ferraille', anim: 'airHeavy', kind: 'normal', stance: 'air',
            durations: [4, 4, 5, 9],
            hits: [{ frames: [1, 2], box: [-4, 0, 50, 50], damage: 66, guard: 'high', hitstun: 18, blockstun: 12, push: 12, hitstop: 10, spark: 'heavy' }],
            cancelable: true, landLag: 5, sfx: 'swingHeavy'
        },
        airSpecial: {
            name: 'Chute de ferraille', anim: 'airSpecial', kind: 'special', stance: 'air',
            durations: [4, 3, 30, 5, 5, 6, 8],
            motion: [[1, 2.0, -6.4]],
            noGravity: true, landFrame: 3,
            hits: [
                { frames: [1, 2], box: [-8, -6, 44, 46], damage: 70, guard: 'high', hitstun: 20, blockstun: 14, push: 14, knockdown: true, launch: [1.4, 3.4], hitstop: 12, spark: 'heavy', shake: 3 },
                { frames: [3, 4], box: [-20, 0, 90, 40], damage: 40, guard: 'mid', hitstun: 20, blockstun: 12, push: 10, launch: [1.6, 5.0], hitstop: 10, spark: 'magnet', shake: 5, sfx: 'magnet' }
            ],
            fx: [[3, 'fx_spikes', 30, 0]],
            sfx: 'swingHeavy'
        },
        specialN: {
            name: 'Repel', anim: 'specialN', kind: 'special', stance: 'stand',
            durations: [6, 5, 5, 8, 12],
            hits: [],
            projectile: {
                anim: 'fx_scrap', atFrame: 2, offset: [42, 38], speed: 4.6, life: 80,
                box: [-22, -28, 44, 56], fps: 12, hits: 1,
                hit: { damage: 78, guard: 'mid', hitstun: 22, blockstun: 16, push: 20, hitstop: 11, spark: 'magnet', shake: 3, sfx: 'magnet' }
            },
            sfx: 'magnet'
        },
        specialF: {
            name: 'Attraction', anim: 'specialF', kind: 'special', stance: 'stand',
            durations: [5, 5, 4, 5, 5, 5, 6, 8, 10],
            hits: [
                { frames: [2, 3], box: [20, 8, 150, 56], damage: 28, guard: 'mid', hitstun: 30, blockstun: 12, push: 4, launch: [-4.2, 3.6], hitstop: 8, spark: 'magnet', sfx: 'magnet' },
                { frames: [5, 7], box: [0, 8, 58, 64], damage: 66, guard: 'mid', hitstun: 24, blockstun: 14, push: 18, launch: [2.6, 5.4], hitstop: 12, spark: 'heavy', shake: 4 }
            ],
            sfx: 'magnet'
        },
        specialU: {
            name: 'Uppercut de ferraille', anim: 'specialU', kind: 'special', stance: 'stand',
            durations: [3, 3, 4, 5, 5, 7, 8],
            motion: [[1, 1.0, 6.4]],
            invuln: [0, 2],
            hits: [
                { frames: [1, 2], box: [-8, 16, 46, 64], damage: 60, guard: 'mid', hitstun: 24, blockstun: 16, push: 8, launch: [0.8, 6.8], hitstop: 10, spark: 'heavy', shake: 3 },
                { frames: [3, 4], box: [-8, 30, 46, 70], damage: 44, guard: 'mid', hitstun: 24, blockstun: 16, push: 10, launch: [1.2, 7.4], hitstop: 10, spark: 'magnet', shake: 4 }
            ],
            sfx: 'magnet'
        },
        specialD: {
            name: 'Pilier de ferraille', anim: 'specialD', kind: 'special', stance: 'stand',
            durations: [5, 5, 5, 6, 6, 8, 10],
            hits: [
                { frames: [3, 4], box: [26, 0, 70, 80], damage: 22, guard: 'mid', hitstun: 22, blockstun: 10, push: 2, rehit: 4, hitstop: 4, spark: 'magnet' },
                { frames: [5, 5], box: [26, 0, 70, 84], damage: 52, guard: 'mid', hitstun: 26, blockstun: 16, push: 12, launch: [1.2, 6.6], hitstop: 12, spark: 'big', shake: 4 }
            ],
            fx: [[3, 'fx_spikes', 60, 0]],
            sfx: 'magnet'
        },
        ultimate: {
            name: 'Punk Gibson', anim: 'ultimate', kind: 'ultimate', stance: 'stand',
            durations: [6, 6, 6, 6, 8, 3, 4, 5, 5, 5, 6, 8, 12],
            superFreeze: 55, cost: 100, invuln: [0, 6],
            motion: [[5, 4.0, 0], [7, 0, 0]],
            hits: [
                { frames: [5, 6], box: [0, 0, 120, 96], damage: 36, guard: 'mid', hitstun: 60, blockstun: 20, push: 1, rehit: 3, hitstop: 4, spark: 'magnet', shake: 3 },
                { frames: [7, 9], box: [0, 0, 130, 100], damage: 250, guard: 'mid', hitstun: 50, blockstun: 22, push: 30, launch: [5.6, 5.8], wallBounce: true, hitstop: 24, spark: 'big', shake: 10, sfx: 'gigant' }
            ],
            fx: [[5, 'fx_hand', 40, 0], [7, 'fx_gears', 86, 40]],
            sfx: 'gigant'
        },
        throw: {
            name: 'Répulsion à bout portant', anim: 'throw', kind: 'throw', stance: 'stand',
            durations: [3, 4, 5, 4, 4, 5, 6, 8],
            hits: [{ frames: [0, 1], box: [4, 10, 30, 40], damage: 0, guard: 'unblockable', hitstun: 0, blockstun: 0, push: 0 }],
            throwRelease: { frame: 5, damage: 110, launch: [3.4, 4.6] },
            fx: [[5, 'fx_gears', 40, 36]],
            sfx: 'grab'
        }
    }
};
