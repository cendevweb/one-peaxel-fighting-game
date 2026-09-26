import manifest from '../generated/sprites/enel.json';
import type { CharacterDef, SpriteManifest } from '../engine/types';

/**
 * Enel — the zoner. Long Nonosama bo normals, a Sango lightning ball that
 * crosses the screen, El Thor dropping from the sky at mid range, a
 * lightning-body dash and an invincible 1-million-volt discharge to keep
 * rushdown honest. Mamaragan is the ultimate.
 *
 * Every `durations` array has exactly one entry per frame of the animation
 * it plays (see tools/sprites/chars/enel.json); a test checks it.
 */
export const enel: CharacterDef = {
    id: 'enel',
    name: 'Enel',
    title: 'Dieu de Skypiea',
    health: 980,
    walk: 1.6,
    back: 1.3,
    dash: 5.0,
    backdash: [4.2, 2.6],
    jump: [2.2, 7.2],
    gravity: 0.36,
    width: 13,
    height: 70,
    crouchHeight: 52,
    color: '#4cc3ff',
    manifest: manifest as unknown as SpriteManifest,
    moves: {
        lightA: {
            name: 'Estoc du bâton', anim: 'lightA', kind: 'normal', stance: 'stand',
            durations: [4, 2, 3, 6],
            hits: [{ frames: [1, 2], box: 'auto', damage: 30, guard: 'mid', hitstun: 13, blockstun: 9, push: 10, hitstop: 6 }],
            chain: ['lightB', 'crouchLight', 'heavy', 'heavyFwd', 'heavyBack', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        lightB: {
            name: 'Revers du Nonosama', anim: 'lightB', kind: 'normal', stance: 'stand',
            durations: [4, 3, 3, 7],
            hits: [{ frames: [1, 2], box: 'auto', damage: 36, guard: 'mid', hitstun: 15, blockstun: 10, push: 12, hitstop: 7 }],
            chain: ['lightC', 'heavy', 'heavyFwd', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        lightC: {
            name: 'Moulinet divin', anim: 'lightC', kind: 'normal', stance: 'stand',
            durations: [5, 5, 5, 8],
            hits: [{ frames: [1, 2], box: [0, 6, 36, 62], damage: 18, guard: 'mid', hitstun: 16, blockstun: 10, push: 6, rehit: 4, hitstop: 4, spark: 'light' }],
            cancelable: true, sfx: 'swingHeavy'
        },
        crouchLight: {
            name: 'Pique basse', anim: 'crouchLight', kind: 'normal', stance: 'crouch',
            durations: [4, 4, 6],
            hits: [{ frames: [1, 1], box: [6, 2, 34, 18], damage: 24, guard: 'low', hitstun: 12, blockstun: 8, push: 8, hitstop: 6 }],
            chain: ['crouchLight', 'lightB', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        crouchHeavy: {
            name: 'Fauchage foudroyant', anim: 'crouchHeavy', kind: 'normal', stance: 'crouch',
            durations: [5, 4, 3, 3, 4, 8, 9],
            hits: [{ frames: [2, 4], box: [8, 0, 46, 22], damage: 70, guard: 'low', hitstun: 20, blockstun: 12, push: 14, knockdown: true, launch: [1.2, 2.6], hitstop: 10, spark: 'electric' }],
            cancelable: true, sfx: 'swingHeavy'
        },
        heavy: {
            name: 'Grand balayage', anim: 'heavy', kind: 'normal', stance: 'stand',
            durations: [3, 3, 3, 3, 4, 5, 6, 7],
            hits: [{ frames: [3, 4], box: 'auto', damage: 74, guard: 'mid', hitstun: 21, blockstun: 14, push: 20, hitstop: 11, spark: 'heavy', shake: 2 }],
            cancelable: true, sfx: 'swingHeavy'
        },
        heavyFwd: {
            name: 'Voltige du bâton (coup haut)', anim: 'heavyFwd', kind: 'normal', stance: 'stand',
            durations: [4, 4, 3, 3, 3, 3, 4, 4, 6, 6, 6],
            motion: [[2, 1.6, 0], [7, 0, 0]],
            hits: [{ frames: [6, 7], box: [4, 0, 36, 76], damage: 80, guard: 'high', hitstun: 22, blockstun: 14, push: 14, hitstop: 12, spark: 'heavy', shake: 4 }],
            cancelable: true, sfx: 'swingHeavy'
        },
        heavyBack: {
            name: 'Hélice céleste', anim: 'heavyBack', kind: 'normal', stance: 'stand',
            durations: [7, 3, 3, 3, 4, 9],
            hits: [{ frames: [1, 4], box: [-8, 30, 56, 64], damage: 64, guard: 'mid', hitstun: 22, blockstun: 12, push: 8, launch: [0.6, 6.4], hitstop: 10, spark: 'heavy' }],
            cancelable: true, sfx: 'swingHeavy'
        },
        airLight: {
            name: 'Paume électrique', anim: 'airLight', kind: 'normal', stance: 'air',
            durations: [4, 10],
            hits: [{ frames: [1, 1], box: [0, 16, 30, 40], damage: 34, guard: 'high', hitstun: 14, blockstun: 9, push: 8, hitstop: 7, spark: 'electric' }],
            chain: ['airHeavy'], cancelable: true, sfx: 'electric'
        },
        airHeavy: {
            name: 'Taille aérienne', anim: 'airHeavy', kind: 'normal', stance: 'air',
            durations: [4, 4, 6, 8, 8],
            hits: [{ frames: [1, 2], box: 'auto', damage: 68, guard: 'high', hitstun: 18, blockstun: 12, push: 12, hitstop: 10, spark: 'heavy' }],
            cancelable: true, landLag: 5, sfx: 'swingHeavy'
        },
        airSpecial: {
            name: 'Plongeon de l’éclair', anim: 'airSpecial', kind: 'special', stance: 'air',
            durations: [3, 3, 4, 30, 6, 8],
            motion: [[0, 3.8, -5.2]],
            noGravity: true, landFrame: 4,
            hits: [{ frames: [0, 3], box: [-6, -4, 36, 44], damage: 80, guard: 'high', hitstun: 20, blockstun: 14, push: 16, knockdown: true, launch: [1.8, 3.4], hitstop: 12, spark: 'electric', shake: 4 }],
            fx: [[4, 'fx_flash', 0, 30]],
            sfx: 'electric'
        },
        specialN: {
            name: 'Sango', anim: 'specialN', kind: 'special', stance: 'stand',
            durations: [4, 2, 2, 2, 2, 4, 6, 7, 9],
            hits: [],
            projectile: {
                anim: 'fx_sango', atFrame: 5, offset: [36, 52], speed: 3.6, life: 110,
                box: [-13, -13, 26, 26], fps: 12, hits: 1,
                hit: { damage: 72, guard: 'mid', hitstun: 22, blockstun: 16, push: 18, hitstop: 10, spark: 'electric', shake: 2, sfx: 'electric' }
            },
            sfx: 'electric'
        },
        specialF: {
            name: 'Trident de Nonosama', anim: 'specialF', kind: 'special', stance: 'stand',
            durations: [4, 4, 3, 3, 3, 3, 4, 3, 3, 6, 7, 8],
            motion: [[2, 2.4, 0], [6, 0, 0]],
            hits: [
                { frames: [2, 5], box: 'auto', damage: 16, guard: 'mid', hitstun: 16, blockstun: 8, push: 2, rehit: 4, hitstop: 3, spark: 'electric' },
                { frames: [6, 8], box: 'auto', damage: 58, guard: 'mid', hitstun: 24, blockstun: 14, push: 24, launch: [3.2, 3.6], wallBounce: true, hitstop: 13, spark: 'electric', shake: 5 }
            ],
            sfx: 'electric'
        },
        specialU: {
            name: 'Kari — 1 million de volts', anim: 'specialU', kind: 'special', stance: 'stand',
            durations: [4, 4, 4, 4, 5, 6, 7, 8],
            invuln: [0, 3],
            hits: [{ frames: [1, 3], box: [-30, 0, 70, 88], damage: 105, guard: 'mid', hitstun: 24, blockstun: 16, push: 12, launch: [1.4, 6.8], knockdown: true, hitstop: 12, spark: 'electric', shake: 4 }],
            fx: [[1, 'fx_kari', 0, 40]],
            sfx: 'electric'
        },
        specialD: {
            name: 'El Thor', anim: 'specialD', kind: 'special', stance: 'stand',
            durations: [6, 5, 5, 8, 10, 14],
            hits: [{ frames: [3, 4], box: [62, 0, 38, 200], damage: 100, guard: 'mid', hitstun: 26, blockstun: 16, push: 10, knockdown: true, launch: [0.8, 4.2], hitstop: 14, spark: 'electric', shake: 6 }],
            fx: [[3, 'fx_elthor', 80, 0]],
            sfx: 'beam'
        },
        ultimate: {
            name: 'Mamaragan', anim: 'ultimate', kind: 'ultimate', stance: 'stand',
            durations: [6, 6, 6, 6, 5, 5, 5, 5, 5, 5, 5, 5, 5, 8, 8, 8, 10, 12],
            superFreeze: 55, cost: 100, invuln: [0, 8],
            hits: [
                { frames: [4, 12], box: 'auto', damage: 22, guard: 'mid', hitstun: 40, blockstun: 20, push: 2, rehit: 5, hitstop: 4, spark: 'electric', shake: 4 },
                { frames: [13, 14], box: [0, 0, 110, 200], damage: 150, guard: 'mid', hitstun: 40, blockstun: 20, push: 30, launch: [5.4, 6.0], wallBounce: true, hitstop: 22, spark: 'big', shake: 10 }
            ],
            fx: [[13, 'fx_raigo', 70, 0]],
            sfx: 'beam'
        },
        throw: {
            name: 'Vari — décharge à bout portant', anim: 'throw', kind: 'throw', stance: 'stand',
            durations: [3, 4, 5, 5, 4, 6, 6, 8],
            hits: [{ frames: [0, 1], box: [4, 10, 30, 44], damage: 0, guard: 'unblockable', hitstun: 0, blockstun: 0, push: 0 }],
            throwRelease: { frame: 5, damage: 110, launch: [4.0, 4.6] },
            fx: [[5, 'fx_zap', 34, 52]],
            sfx: 'grab'
        }
    }
};
