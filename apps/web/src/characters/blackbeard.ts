import manifest from '../generated/sprites/blackbeard.json';
import type { CharacterDef, SpriteManifest } from '../engine/types';

/**
 * Marshall D. Teach, Barbe Noire — the Yami Yami no Mi. Heavy, slow and
 * greedy: big haymakers up close, Kurouzu to drag the opponent in from
 * mid range (an unblockable pull), Black Hole spreading darkness along the
 * ground, and the quake power stolen from Whitebeard in his lunging punch
 * and his ground smash. Liberation — every pillar of darkness released at
 * once — is the ultimate.
 *
 * Every animation and effect comes from the Gigant Battle sheet
 * (tools/sprites/chars/blackbeard.json): the purple vortex, the black ground,
 * the pillars with their debris and the quake rings are the sheet's own
 * effect rows. Every `durations` array has one entry per animation frame.
 */
export const blackbeard: CharacterDef = {
    id: 'blackbeard',
    name: 'Barbe Noire',
    title: 'Yami Yami no Mi',
    health: 1100,
    walk: 1.3,
    back: 1.0,
    dash: 3.9,
    backdash: [3.2, 2.4],
    jump: [2.1, 6.9],
    gravity: 0.38,
    width: 15,
    height: 66,
    crouchHeight: 48,
    color: '#5b2a86',
    manifest: manifest as unknown as SpriteManifest,
    moves: {
        lightA: {
            name: 'Paume', anim: 'lightA', kind: 'normal', stance: 'stand',
            durations: [4, 3, 7],
            hits: [{ frames: [1, 2], box: [8, 30, 36, 22], damage: 32, guard: 'mid', hitstun: 14, blockstun: 9, push: 8, hitstop: 6 }],
            chain: ['lightB', 'crouchLight', 'heavy', 'heavyFwd', 'heavyBack', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        lightB: {
            name: 'Direct du pirate', anim: 'lightB', kind: 'normal', stance: 'stand',
            durations: [3, 3, 3, 4, 7],
            hits: [{ frames: [2, 3], box: [10, 30, 58, 16], damage: 38, guard: 'mid', hitstun: 16, blockstun: 10, push: 10, hitstop: 7 }],
            chain: ['lightC', 'heavy', 'heavyFwd', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        lightC: {
            name: 'Revers ravageur', anim: 'lightC', kind: 'normal', stance: 'stand',
            durations: [3, 3, 3, 3, 3, 4, 5, 6],
            hits: [{ frames: [3, 5], box: [4, 14, 66, 40], damage: 54, guard: 'mid', hitstun: 18, blockstun: 12, push: 18, hitstop: 9, spark: 'heavy', shake: 2 }],
            cancelable: true, sfx: 'swingHeavy'
        },
        crouchLight: {
            name: 'Poing bas', anim: 'crouchLight', kind: 'normal', stance: 'crouch',
            durations: [4, 3, 6],
            hits: [{ frames: [1, 1], box: [8, 2, 36, 20], damage: 26, guard: 'low', hitstun: 12, blockstun: 8, push: 8, hitstop: 6 }],
            chain: ['crouchLight', 'lightB', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        crouchHeavy: {
            name: 'Frappe sismique', anim: 'crouchHeavy', kind: 'normal', stance: 'crouch',
            durations: [5, 4, 3, 4, 6, 10],
            hits: [{ frames: [2, 3], box: [0, 0, 62, 24], damage: 70, guard: 'low', hitstun: 20, blockstun: 12, push: 12, knockdown: true, launch: [1.2, 3.0], hitstop: 11, spark: 'quake', shake: 4 }],
            fx: [[2, 'fx_impact', 30, 0]],
            cancelable: true, sfx: 'quake'
        },
        heavy: {
            name: 'Marteau de Teach', anim: 'heavy', kind: 'normal', stance: 'stand',
            durations: [5, 4, 3, 4, 6, 9],
            hits: [{ frames: [2, 3], box: [4, 10, 50, 60], damage: 74, guard: 'mid', hitstun: 21, blockstun: 14, push: 18, hitstop: 11, spark: 'heavy', shake: 3 }],
            cancelable: true, sfx: 'swingHeavy'
        },
        heavyFwd: {
            name: 'Coup de massue plongeant', anim: 'heavyFwd', kind: 'normal', stance: 'stand',
            durations: [5, 4, 4, 3, 3, 4, 5, 5, 6],
            motion: [[1, 1.8, 0], [5, 0, 0]],
            hits: [{ frames: [3, 4], box: [6, 6, 58, 64], damage: 80, guard: 'high', hitstun: 22, blockstun: 14, push: 14, hitstop: 12, spark: 'heavy', shake: 4 }],
            cancelable: true, sfx: 'swingHeavy'
        },
        heavyBack: {
            name: 'Crochet montant', anim: 'heavyBack', kind: 'normal', stance: 'stand',
            durations: [4, 3, 4, 3, 4, 5, 6, 7],
            hits: [{ frames: [3, 4], box: [4, 26, 58, 54], damage: 64, guard: 'mid', hitstun: 22, blockstun: 12, push: 8, launch: [0.6, 6.2], hitstop: 10, spark: 'heavy' }],
            cancelable: true, sfx: 'swingHeavy'
        },
        airLight: {
            name: 'Coup de pied roulé', anim: 'airLight', kind: 'normal', stance: 'air',
            durations: [4, 4, 8],
            hits: [{ frames: [1, 1], box: [0, -18, 46, 48], damage: 34, guard: 'high', hitstun: 14, blockstun: 9, push: 8, hitstop: 7 }],
            chain: ['airHeavy'], cancelable: true, sfx: 'swing'
        },
        airHeavy: {
            name: 'Poing plongeant', anim: 'airHeavy', kind: 'normal', stance: 'air',
            durations: [4, 3, 4, 8],
            hits: [{ frames: [2, 3], box: [0, -20, 62, 70], damage: 66, guard: 'high', hitstun: 18, blockstun: 12, push: 12, hitstop: 10, spark: 'heavy' }],
            cancelable: true, landLag: 5, sfx: 'swingHeavy'
        },
        airSpecial: {
            name: 'Écrasement du gros ventre', anim: 'airSpecial', kind: 'special', stance: 'air',
            durations: [4, 4, 30, 5, 5, 6, 8],
            motion: [[1, 2.0, -6.0]],
            noGravity: true, landFrame: 3,
            hits: [{ frames: [1, 4], box: [-10, -10, 52, 46], damage: 84, guard: 'high', hitstun: 20, blockstun: 14, push: 16, knockdown: true, launch: [1.6, 3.6], hitstop: 12, spark: 'quake', shake: 5 }],
            fx: [[3, 'fx_impact', 20, 0]],
            sfx: 'swingHeavy'
        },
        specialN: {
            name: 'Kurouzu', anim: 'specialN', kind: 'special', stance: 'stand',
            durations: [5, 5, 4, 6, 8, 6, 8],
            hits: [{ frames: [2, 4], box: [24, 14, 116, 58], damage: 50, guard: 'unblockable', hitstun: 24, blockstun: 0, push: 0, launch: [-4.4, 3.4], hitstop: 12, spark: 'dark', shake: 3, sfx: 'dark' }],
            fx: [[2, 'fx_vortex', 64, 36]],
            cancelable: true, sfx: 'dark'
        },
        specialF: {
            name: 'Gura Gura — poing du séisme', anim: 'specialF', kind: 'special', stance: 'stand',
            durations: [6, 5, 4, 3, 4, 6, 8, 8],
            motion: [[2, 4.8, 0], [4, 0, 0]],
            hits: [{ frames: [3, 4], box: [8, 10, 68, 50], damage: 96, guard: 'mid', hitstun: 24, blockstun: 14, push: 22, launch: [4.2, 4.0], wallBounce: true, hitstop: 14, spark: 'quake', shake: 6 }],
            fx: [[3, 'fx_quake', 78, 36]],
            sfx: 'quake'
        },
        specialU: {
            name: 'Uppercut des ténèbres', anim: 'specialU', kind: 'special', stance: 'stand',
            durations: [3, 3, 3, 4, 4, 5, 6, 7, 8],
            motion: [[1, 1.0, 6.6]],
            invuln: [0, 3],
            hits: [
                { frames: [1, 3], box: [-6, 20, 48, 72], damage: 58, guard: 'mid', hitstun: 24, blockstun: 16, push: 8, launch: [0.6, 6.8], hitstop: 10, spark: 'dark', shake: 3 },
                { frames: [4, 5], box: [-8, 30, 52, 80], damage: 44, guard: 'mid', hitstun: 24, blockstun: 16, push: 10, launch: [1.2, 7.4], hitstop: 10, spark: 'big', shake: 4 }
            ],
            sfx: 'dark'
        },
        specialD: {
            name: 'Black Hole', anim: 'specialD', kind: 'special', stance: 'stand',
            durations: [6, 5, 4, 4, 4, 4, 3, 4, 4, 6, 6, 8],
            hits: [
                { frames: [1, 4], box: [0, 0, 110, 22], damage: 16, guard: 'low', hitstun: 26, blockstun: 10, push: 2, rehit: 6, hitstop: 4, spark: 'dark' },
                { frames: [7, 8], box: [4, 8, 64, 52], damage: 60, guard: 'mid', hitstun: 24, blockstun: 14, push: 16, knockdown: true, launch: [2.4, 4.0], hitstop: 12, spark: 'heavy', shake: 4 }
            ],
            fx: [[1, 'fx_hole', 70, -2]],
            sfx: 'dark'
        },
        ultimate: {
            name: 'Liberation', anim: 'ultimate', kind: 'ultimate', stance: 'stand',
            durations: [8, 8, 6, 6, 6, 6, 6, 8, 10, 8, 8, 12],
            superFreeze: 55, cost: 100, invuln: [0, 8],
            hits: [
                { frames: [1, 3], box: [0, 0, 130, 26], damage: 24, guard: 'mid', hitstun: 60, blockstun: 20, push: 0, rehit: 8, hitstop: 4, spark: 'dark', shake: 2 },
                { frames: [6, 8], box: [0, 0, 130, 130], damage: 300, guard: 'mid', hitstun: 50, blockstun: 22, push: 20, launch: [2.6, 8.0], hitstop: 24, spark: 'dark', shake: 10, sfx: 'quake' }
            ],
            fx: [[1, 'fx_hole', 64, -2], [6, 'fx_burst', 56, 0], [6, 'fx_rise', 104, 0], [6, 'fx_pillar', 18, 0]],
            sfx: 'dark'
        },
        ultimate2: {
            name: 'Kaishin des ténèbres', anim: 'ultimate2', kind: 'ultimate', stance: 'stand',
            durations: [8, 8, 10, 6, 6, 6, 6, 6, 8, 6, 12, 12, 14],
            superFreeze: 70, cost: 200, invuln: [0, 9],
            hits: [
                { frames: [3, 7], box: [0, 0, 200, 120], damage: 60, guard: 'mid', hitstun: 50, blockstun: 18, push: 0, rehit: 10, hitstop: 4, spark: 'dark', shake: 3, sfx: 'dark' },
                { frames: [9, 10], box: [-10, 0, 210, 160], damage: 350, guard: 'mid', hitstun: 50, blockstun: 24, push: 24, knockdown: true, launch: [3.2, 7.6], hitstop: 26, spark: 'quake', shake: 12, sfx: 'quake' }
            ],
            fx: [
                [3, 'fx_cracks', 64, 0], [3, 'fx_pillar', 40, 0], [3, 'fx_pillar', 90, 0], [3, 'fx_pillar', 140, 0], [3, 'fx_pillar', 190, 0],
                [5, 'fx_cracks', 150, 0], [6, 'fx_pillar', 60, 0], [6, 'fx_pillar', 115, 0], [6, 'fx_pillar', 170, 0],
                [9, 'fx_dust', 26, 0], [9, 'fx_quake', 60, 36], [9, 'fx_nova', 80, 0], [9, 'fx_nova', 170, 0]
            ],
            sfx: 'quake'
        },
        throw: {
            name: 'Poigne du trou noir', anim: 'throw', kind: 'throw', stance: 'stand',
            durations: [3, 4, 4, 6, 4, 6, 6, 8],
            hits: [{ frames: [0, 1], box: [4, 10, 32, 40], damage: 0, guard: 'unblockable', hitstun: 0, blockstun: 0, push: 0 }],
            throwRelease: { frame: 4, damage: 110, launch: [1.8, 5.0] },
            fx: [[4, 'fx_impact', 30, 0]],
            sfx: 'grab'
        }
    }
};
