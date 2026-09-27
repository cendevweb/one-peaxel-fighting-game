import manifest from '../generated/sprites/hody.json';
import type { CharacterDef, SpriteManifest } from '../engine/types';

/**
 * Hody Jones — the New Fish-Man Pirates' captain, pumped on Energy Steroids.
 * A heavy trident fighter: long pokes, the Uchimizu water drops flicked
 * from his fingers, the Yabusame water-arrow lunge, the Shark Darts
 * torpedo, the Ikaku Dōjō slam whose waves run along the ground, and a
 * bite for a throw. The one-bar ultimate is an Uchimizu barrage ending in a
 * torrent; the two-bar one swallows the steroids and rushes in monster form.
 *
 * Every animation and effect comes from the Gigant Battle 2 sheet
 * (tools/sprites/chars/hody.json): the water drops, arrows, spikes, torrent
 * and the red steroid aura are the sheet's own effect rows. Every
 * `durations` array has one entry per animation frame.
 */
export const hody: CharacterDef = {
    id: 'hody',
    name: 'Hody Jones',
    title: 'Homme-poisson dopé',
    health: 1080,
    walk: 1.3,
    back: 1.05,
    dash: 4.2,
    backdash: [3.2, 2.4],
    jump: [2.1, 7.0],
    gravity: 0.37,
    width: 17,
    height: 82,
    crouchHeight: 56,
    color: '#d05a8c',
    manifest: manifest as unknown as SpriteManifest,
    moves: {
        lightA: {
            name: 'Griffe', anim: 'lightA', kind: 'normal', stance: 'stand',
            durations: [3, 3, 3, 8],
            hits: [{ frames: [1, 2], box: [8, 34, 42, 26], damage: 30, guard: 'mid', hitstun: 14, blockstun: 9, push: 6, hitstop: 6, spark: 'light' }],
            chain: ['lightB', 'crouchLight', 'heavy', 'heavyFwd', 'heavyBack', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        lightB: {
            name: 'Coup de pied latéral', anim: 'lightB', kind: 'normal', stance: 'stand',
            durations: [4, 3, 3, 4, 8],
            hits: [{ frames: [1, 3], box: [8, 8, 46, 26], damage: 36, guard: 'mid', hitstun: 16, blockstun: 10, push: 7, hitstop: 7, spark: 'light' }],
            chain: ['lightC', 'heavy', 'heavyFwd', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        lightC: {
            name: 'Revers tournoyant', anim: 'lightC', kind: 'normal', stance: 'stand',
            durations: [4, 3, 3, 4, 4, 5, 6, 7],
            hits: [{ frames: [2, 3], box: [4, 28, 54, 36], damage: 52, guard: 'mid', hitstun: 18, blockstun: 12, push: 18, hitstop: 9, spark: 'heavy', shake: 2 }],
            cancelable: true, sfx: 'swingHeavy'
        },
        crouchLight: {
            name: 'Estoc bas', anim: 'crouchLight', kind: 'normal', stance: 'crouch',
            durations: [3, 3, 3, 7],
            hits: [{ frames: [1, 2], box: [8, 0, 46, 24], damage: 26, guard: 'low', hitstun: 12, blockstun: 8, push: 8, hitstop: 6, spark: 'light' }],
            chain: ['crouchLight', 'lightB', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        crouchHeavy: {
            name: 'Fauchage au trident', anim: 'crouchHeavy', kind: 'normal', stance: 'crouch',
            durations: [8, 4, 4, 12],
            hits: [{ frames: [1, 2], box: [6, 0, 58, 22], damage: 66, guard: 'low', hitstun: 20, blockstun: 12, push: 14, knockdown: true, launch: [1.2, 2.6], hitstop: 10, spark: 'heavy' }],
            cancelable: true, sfx: 'swingHeavy'
        },
        heavy: {
            name: 'Estoc du trident', anim: 'heavy', kind: 'normal', stance: 'stand',
            durations: [5, 5, 3, 4, 4, 4, 6, 8],
            hits: [{ frames: [2, 3], box: [10, 24, 80, 28], damage: 72, guard: 'mid', hitstun: 24, blockstun: 14, push: 18, hitstop: 11, spark: 'ice', shake: 2 }],
            cancelable: true, sfx: 'swingHeavy'
        },
        heavyFwd: {
            name: 'Yabusame', anim: 'heavyFwd', kind: 'normal', stance: 'stand',
            durations: [6, 5, 4, 4, 6, 6, 8],
            motion: [[2, 4.4, 0], [4, 0, 0]],
            hits: [{ frames: [2, 3], box: [8, 10, 74, 32], damage: 78, guard: 'mid', hitstun: 22, blockstun: 14, push: 16, hitstop: 12, spark: 'ice', shake: 3 }],
            fx: [[3, 'fx_arrow', 84, 24]],
            cancelable: true, sfx: 'swingHeavy'
        },
        heavyBack: {
            name: 'Estoc ascendant', anim: 'heavyBack', kind: 'normal', stance: 'stand',
            durations: [5, 4, 3, 4, 4, 6, 9],
            hits: [{ frames: [3, 5], box: [4, 36, 64, 64], damage: 64, guard: 'mid', hitstun: 22, blockstun: 12, push: 8, launch: [0.8, 6.4], hitstop: 10, spark: 'ice' }],
            invuln: [1, 2],
            fx: [[3, 'fx_arrowdiag', 104, 92]],
            cancelable: true, sfx: 'swingHeavy'
        },
        airLight: {
            name: 'Poing plongeant', anim: 'airLight', kind: 'normal', stance: 'air',
            durations: [3, 3, 4, 8],
            hits: [{ frames: [1, 2], box: [2, 6, 50, 52], damage: 34, guard: 'high', hitstun: 14, blockstun: 9, push: 8, hitstop: 7, spark: 'light' }],
            chain: ['airHeavy'], cancelable: true, sfx: 'swing'
        },
        airHeavy: {
            name: 'Salto du trident', anim: 'airHeavy', kind: 'normal', stance: 'air',
            durations: [3, 3, 3, 4, 5, 8],
            hits: [{ frames: [3, 5], box: [-4, -6, 58, 66], damage: 64, guard: 'high', hitstun: 18, blockstun: 12, push: 12, hitstop: 10, spark: 'heavy' }],
            cancelable: true, landLag: 5, sfx: 'swingHeavy'
        },
        airSpecial: {
            name: 'Shark Darts — plongée', anim: 'airSpecial', kind: 'special', stance: 'air',
            durations: [4, 4, 3, 3, 3, 3, 30, 12],
            motion: [[2, 3.0, -6.0]],
            noGravity: true, landFrame: 7,
            hits: [{ frames: [2, 6], box: [-6, -8, 52, 50], damage: 80, guard: 'high', hitstun: 20, blockstun: 14, push: 16, knockdown: true, launch: [1.6, 3.6], hitstop: 12, spark: 'heavy', shake: 4 }],
            fx: [[7, 'fx_impact', 24, 10]],
            sfx: 'swingHeavy'
        },
        specialN: {
            name: 'Uchimizu', anim: 'specialN', kind: 'special', stance: 'stand',
            durations: [5, 4, 3, 4, 6, 6, 8],
            hits: [],
            projectile: {
                anim: 'fx_drops', atFrame: 3, offset: [54, 62], speed: 5.0, life: 80,
                box: [-18, -30, 36, 42], fps: 10, hits: 2,
                hit: { damage: 42, guard: 'mid', hitstun: 22, blockstun: 14, push: 10, hitstop: 8, spark: 'ice', sfx: 'ice' }
            },
            fx: [[3, 'fx_splash', 52, 76]],
            sfx: 'ice'
        },
        specialF: {
            name: 'Shark Darts', anim: 'specialF', kind: 'special', stance: 'stand',
            durations: [4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 12],
            motion: [[4, 5.4, 0], [13, 0, 0]],
            hits: [
                { frames: [4, 11], box: [-4, 6, 58, 46], damage: 22, guard: 'mid', hitstun: 22, blockstun: 10, push: 2, rehit: 6, hitstop: 4, spark: 'ice' },
                { frames: [12, 12], box: [-4, 6, 58, 46], damage: 52, guard: 'mid', hitstun: 24, blockstun: 14, push: 14, launch: [3.0, 4.4], hitstop: 12, spark: 'heavy', shake: 4 }
            ],
            sfx: 'swingHeavy'
        },
        specialU: {
            name: 'Trident du requin', anim: 'specialU', kind: 'special', stance: 'stand',
            durations: [3, 4, 5, 5, 5, 5, 6, 6, 8],
            motion: [[1, 1.0, 7.0]],
            invuln: [0, 2],
            hits: [
                { frames: [1, 2], box: [-6, 0, 54, 76], damage: 56, guard: 'mid', hitstun: 24, blockstun: 16, push: 8, launch: [0.8, 6.6], hitstop: 10, spark: 'heavy', shake: 3 },
                { frames: [3, 4], box: [-10, 30, 50, 64], damage: 44, guard: 'mid', hitstun: 24, blockstun: 16, push: 10, launch: [1.2, 7.2], hitstop: 10, spark: 'ice', shake: 3 }
            ],
            fx: [[1, 'fx_spikes', 22, 12]],
            sfx: 'ice'
        },
        specialD: {
            name: 'Ikaku Dōjō', anim: 'specialD', kind: 'special', stance: 'stand',
            durations: [5, 4, 4, 4, 4, 5, 6, 6, 6, 8],
            hits: [{ frames: [4, 5], box: [6, 0, 62, 72], damage: 70, guard: 'mid', hitstun: 24, blockstun: 14, push: 14, launch: [1.4, 4.8], hitstop: 12, spark: 'heavy', shake: 4 }],
            projectile: {
                anim: 'fx_spikes', atFrame: 5, offset: [62, 13], speed: 3.8, life: 60,
                box: [-16, -13, 32, 36], fps: 10, hits: 1,
                hit: { damage: 60, guard: 'mid', hitstun: 22, blockstun: 14, push: 12, launch: [1.0, 4.6], hitstop: 10, spark: 'ice', shake: 2, sfx: 'ice' }
            },
            sfx: 'swingHeavy'
        },
        // One bar: the Uchimizu barrage of the sheet's long flicking rows,
        // four volleys of drops at point blank, then a torrent that crosses
        // the stage.
        ultimate: {
            name: 'Uchimizu — déluge', anim: 'ultimate', kind: 'ultimate', stance: 'stand',
            durations: [5, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 3, 3, 4, 4, 5, 6, 14],
            superFreeze: 55, cost: 100, invuln: [0, 6],
            hits: [{ frames: [3, 14], box: [8, 18, 66, 54], damage: 40, guard: 'mid', hitstun: 44, blockstun: 16, push: 1, rehit: 12, hitstop: 5, spark: 'ice', shake: 2 }],
            projectile: {
                anim: 'fx_torrent', atFrame: 18, offset: [46, 44], speed: 6.0, life: 90,
                box: [-32, -24, 64, 48], fps: 12, hits: 1,
                hit: { damage: 300, guard: 'mid', hitstun: 50, blockstun: 22, push: 30, launch: [4.8, 5.6], wallBounce: true, knockdown: true, hitstop: 22, spark: 'big', shake: 8, sfx: 'ice' }
            },
            fx: [[3, 'fx_splash', 52, 56], [7, 'fx_splash', 56, 44], [11, 'fx_splash', 52, 60], [14, 'fx_splash', 56, 48]],
            sfx: 'ice'
        },
        // Two bars: the Energy Steroids — he bulks up under the red aura,
        // bull-rushes, pounds, spins and ends with a claw sweep that bursts
        // into the sheet's giant water explosion.
        ultimate2: {
            name: 'Energy Steroid — forme monstrueuse', anim: 'ultimate2', kind: 'ultimate', stance: 'stand',
            durations: [2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 5, 4, 6, 8, 8, 10, 12],
            superFreeze: 70, cost: 200, invuln: [0, 11],
            motion: [[6, 7.5, 0], [12, 0, 0]],
            hits: [
                { frames: [6, 11], box: [0, 0, 64, 74], damage: 80, guard: 'mid', hitstun: 70, blockstun: 20, push: 1, hitstop: 8, spark: 'heavy', shake: 4 },
                { frames: [13, 16], box: [0, 10, 70, 60], damage: 60, guard: 'mid', hitstun: 70, blockstun: 18, push: 1, rehit: 6, hitstop: 6, spark: 'heavy', shake: 3 },
                { frames: [18, 21], box: [-20, 0, 92, 72], damage: 80, guard: 'mid', hitstun: 70, blockstun: 18, push: 2, hitstop: 8, spark: 'ice', shake: 4 },
                { frames: [23, 24], box: [-10, 0, 104, 96], damage: 340, guard: 'mid', hitstun: 60, blockstun: 24, push: 30, launch: [5.6, 6.4], wallBounce: true, knockdown: true, hitstop: 26, spark: 'big', shake: 12, sfx: 'ice' }
            ],
            fx: [[0, 'fx_aura', 0, 44], [13, 'fx_impact', 62, 40], [23, 'fx_burst', 74, 44]],
            sfx: 'swingHeavy'
        },
        throw: {
            name: 'Morsure du requin', anim: 'throw', kind: 'throw', stance: 'stand',
            durations: [3, 4, 4, 4, 4, 4, 4, 6, 8],
            hits: [{ frames: [0, 1], box: [6, 10, 32, 50], damage: 0, guard: 'unblockable', hitstun: 0, blockstun: 0, push: 0 }],
            throwRelease: { frame: 7, damage: 110, launch: [2.4, 4.8] },
            fx: [[4, 'fx_impact', 34, 52]],
            sfx: 'grab'
        }
    }
};
