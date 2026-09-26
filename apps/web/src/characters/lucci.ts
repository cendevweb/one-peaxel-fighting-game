import manifest from '../generated/sprites/lucci.json';
import type { CharacterDef, SpriteManifest } from '../engine/types';

/**
 * Rob Lucci — the rushdown. Fast walk and Soru dash, quick Shigan pokes,
 * less health than anyone. The Rokushiki as a kit: Shigan (normals and the
 * Soru rush), Rankyaku (the air-blade projectile), Geppo (the air step),
 * and the Rokuogan as the ultimate, in his Neko Neko leopard form.
 *
 * Stance animations use the human form; specials, the ultimate and a few
 * heavy normals switch to the leopard hybrid (see tools/sprites/chars/lucci.json).
 * Every `durations` array has exactly one entry per animation frame.
 */
export const lucci: CharacterDef = {
    id: 'lucci',
    name: 'Rob Lucci',
    title: 'Assassin du CP9',
    health: 950,
    walk: 2.0,
    back: 1.5,
    dash: 5.2,
    backdash: [4.0, 2.6],
    jump: [2.5, 7.4],
    gravity: 0.37,
    width: 11,
    height: 64,
    crouchHeight: 36,
    color: '#d4a02a',
    manifest: manifest as unknown as SpriteManifest,
    moves: {
        lightA: {
            name: 'Shigan éclair', anim: 'lightA', kind: 'normal', stance: 'stand',
            durations: [3, 3, 6],
            hits: [{ frames: [1, 1], box: [4, 26, 30, 16], damage: 28, guard: 'mid', hitstun: 13, blockstun: 9, push: 9, hitstop: 6, spark: 'light' }],
            chain: ['lightB', 'crouchLight', 'heavy', 'heavyFwd', 'heavyBack', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        lightB: {
            name: 'Shigan', anim: 'lightB', kind: 'normal', stance: 'stand',
            durations: [3, 2, 3, 3, 6],
            hits: [{ frames: [1, 2], box: 'auto', damage: 34, guard: 'mid', hitstun: 15, blockstun: 10, push: 11, hitstop: 7, spark: 'cut' }],
            chain: ['lightC', 'heavy', 'heavyFwd', 'crouchHeavy'], cancelable: true, sfx: 'slash'
        },
        lightC: {
            name: 'Coup de pied direct', anim: 'lightC', kind: 'normal', stance: 'stand',
            durations: [4, 4, 4, 8],
            hits: [{ frames: [1, 2], box: 'auto', damage: 48, guard: 'mid', hitstun: 18, blockstun: 12, push: 18, hitstop: 9, spark: 'heavy' }],
            cancelable: true, sfx: 'swing'
        },
        crouchLight: {
            name: 'Griffe basse', anim: 'crouchLight', kind: 'normal', stance: 'crouch',
            durations: [3, 3, 6],
            hits: [{ frames: [1, 1], box: [6, 2, 30, 18], damage: 24, guard: 'low', hitstun: 12, blockstun: 8, push: 8, hitstop: 6, spark: 'cut' }],
            chain: ['crouchLight', 'lightB', 'crouchHeavy'], cancelable: true, sfx: 'slash'
        },
        crouchHeavy: {
            name: 'Rankyaku fauchant', anim: 'crouchHeavy', kind: 'normal', stance: 'crouch',
            durations: [7, 3, 4, 12],
            hits: [{ frames: [1, 2], box: [6, 0, 40, 22], damage: 64, guard: 'low', hitstun: 20, blockstun: 12, push: 14, knockdown: true, launch: [1.2, 2.4], hitstop: 10, spark: 'cut' }],
            cancelable: true, sfx: 'slash'
        },
        heavy: {
            name: 'Shigan Madara', anim: 'heavy', kind: 'normal', stance: 'stand',
            durations: [6, 3, 3, 3, 4, 6, 6],
            hits: [
                { frames: [1, 3], box: 'auto', damage: 16, guard: 'mid', hitstun: 16, blockstun: 9, push: 2, rehit: 3, hitstop: 3, spark: 'light' },
                { frames: [4, 4], box: [4, 20, 36, 30], damage: 34, guard: 'mid', hitstun: 21, blockstun: 13, push: 18, hitstop: 10, spark: 'heavy', shake: 2 }
            ],
            cancelable: true, sfx: 'slash'
        },
        heavyFwd: {
            name: 'Rankyaku Gaichō (coup haut)', anim: 'heavyFwd', kind: 'normal', stance: 'stand',
            durations: [7, 5, 4, 4, 6, 9],
            hits: [{ frames: [2, 3], box: [0, 0, 40, 72], damage: 72, guard: 'high', hitstun: 22, blockstun: 14, push: 14, hitstop: 12, spark: 'cut', shake: 3 }],
            cancelable: true, sfx: 'slash'
        },
        heavyBack: {
            name: 'Shigan ascendant', anim: 'heavyBack', kind: 'normal', stance: 'stand',
            durations: [5, 3, 3, 3, 4, 6, 6, 6],
            hits: [{ frames: [1, 3], box: [0, 34, 34, 60], damage: 62, guard: 'mid', hitstun: 22, blockstun: 12, push: 8, launch: [0.6, 6.4], hitstop: 10, spark: 'cut' }],
            invuln: [1, 2],
            cancelable: true, sfx: 'slash'
        },
        airLight: {
            name: 'Genou aérien', anim: 'airLight', kind: 'normal', stance: 'air',
            durations: [4, 10],
            hits: [{ frames: [1, 1], box: [-2, -6, 28, 30], damage: 32, guard: 'high', hitstun: 14, blockstun: 9, push: 8, hitstop: 7 }],
            chain: ['airHeavy'], cancelable: true, sfx: 'swing'
        },
        airHeavy: {
            name: 'Rankyaku plongeant', anim: 'airHeavy', kind: 'normal', stance: 'air',
            durations: [5, 6, 10],
            hits: [{ frames: [1, 2], box: 'auto', damage: 64, guard: 'high', hitstun: 18, blockstun: 12, push: 12, hitstop: 10, spark: 'cut' }],
            cancelable: true, landLag: 5, sfx: 'slash'
        },
        airSpecial: {
            name: 'Geppo — Rankyaku aérien', anim: 'airSpecial', kind: 'special', stance: 'air',
            durations: [4, 4, 4, 6, 10],
            motion: [[0, 0.6, 2.2], [2, 0.2, 0]],
            noGravity: true,
            hits: [],
            projectile: {
                anim: 'fx_rankyakuAir', atFrame: 2, offset: [26, 10], speed: 4.2, speedY: -2.0, life: 45,
                box: [-12, -14, 26, 28],
                hit: { damage: 70, guard: 'high', hitstun: 20, blockstun: 14, push: 14, hitstop: 10, spark: 'cut', knockdown: true, launch: [1.4, 2.6] },
                fps: 12
            },
            sfx: 'slash'
        },
        specialN: {
            name: 'Rankyaku « Hyōbi »', anim: 'specialN', kind: 'special', stance: 'stand',
            durations: [4, 5, 4, 3, 3, 4, 5, 6, 6, 4],
            hits: [],
            projectile: {
                anim: 'fx_rankyaku', atFrame: 4, offset: [32, 16], speed: 4.6, life: 75,
                box: [-22, -8, 44, 16],
                hit: { damage: 82, guard: 'mid', hitstun: 22, blockstun: 16, push: 18, hitstop: 11, spark: 'cut', shake: 2 },
                fps: 14
            },
            sfx: 'slash'
        },
        specialF: {
            name: 'Soru — Shigan', anim: 'specialF', kind: 'special', stance: 'stand',
            durations: [5, 4, 3, 4, 5, 8, 7],
            motion: [[0, 5.2, 0], [2, 0.6, 0], [4, 0, 0]],
            hits: [{ frames: [2, 3], box: 'auto', damage: 92, guard: 'mid', hitstun: 24, blockstun: 14, push: 22, launch: [3.0, 3.2], hitstop: 13, spark: 'cut', shake: 4 }],
            sfx: 'swing'
        },
        specialU: {
            name: 'Shigan « Ōren »', anim: 'specialU', kind: 'special', stance: 'stand',
            durations: [3, 3, 4, 5, 6, 7, 9],
            motion: [[2, 1.0, 6.0]],
            invuln: [0, 3],
            hits: [{ frames: [2, 4], box: [0, 18, 32, 66], damage: 100, guard: 'mid', hitstun: 24, blockstun: 16, push: 10, launch: [1.0, 7.2], hitstop: 12, spark: 'big', shake: 4 }],
            sfx: 'slash'
        },
        specialD: {
            name: 'Griffes du léopard', anim: 'specialD', kind: 'special', stance: 'stand',
            durations: [9, 4, 3, 4, 4, 7, 11],
            motion: [[1, 3.6, 0], [4, 0, 0]],
            hits: [
                { frames: [2, 3], box: 'auto', damage: 44, guard: 'mid', hitstun: 22, blockstun: 12, push: 4, hitstop: 7, spark: 'cut' },
                { frames: [4, 4], box: 'auto', damage: 70, guard: 'mid', hitstun: 26, blockstun: 16, push: 26, launch: [4.6, 3.6], wallBounce: true, hitstop: 14, spark: 'big', shake: 5 }
            ],
            sfx: 'slash'
        },
        ultimate: {
            name: 'Rokuōgan', anim: 'ultimate', kind: 'ultimate', stance: 'stand',
            durations: [8, 8, 6, 6, 3, 3, 4, 6, 4, 4, 4, 8, 12],
            superFreeze: 55, cost: 100, invuln: [0, 6],
            motion: [[4, 7.5, 0], [6, 0, 0]],
            hits: [
                { frames: [4, 5], box: 'auto', damage: 70, guard: 'mid', hitstun: 50, blockstun: 20, push: 2, hitstop: 8, spark: 'cut', shake: 4 },
                { frames: [8, 10], box: [0, 0, 70, 64], damage: 260, guard: 'mid', hitstun: 50, blockstun: 22, push: 34, launch: [6.6, 5.2], wallBounce: true, hitstop: 24, spark: 'big', shake: 10 }
            ],
            fx: [[8, 'fx_rokuogan', 44, 32]],
            sfx: 'beam'
        },
        throw: {
            name: 'Saisie du CP9', anim: 'throw', kind: 'throw', stance: 'stand',
            durations: [3, 4, 4, 3, 4, 6, 9],
            hits: [{ frames: [0, 1], box: [4, 10, 28, 40], damage: 0, guard: 'unblockable', hitstun: 0, blockstun: 0, push: 0 }],
            throwRelease: { frame: 3, damage: 105, launch: [1.4, 6.2] },
            sfx: 'grab'
        }
    }
};
