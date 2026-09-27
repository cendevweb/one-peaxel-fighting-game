import manifest from '../generated/sprites/franky.json';
import type { CharacterDef, SpriteManifest } from '../engine/types';

/**
 * Franky (après l'ellipse, BF-37) — the cyborg shipwright. Huge steel fists:
 * slow but long normals, the rocket fist of Strong Right for mid range, the
 * Coup de Boo jet charge, Fresh Fire's flame wall, and the laser of his left
 * arm cannon as his reversal. One bar fires the shoulder rocket launcher
 * point-blank; two bars inflate the air cannon of the Coup de Vent, the
 * technique the sheet gives its anime cut-in.
 *
 * Every animation and effect comes from the Gigant Battle 2 sheet
 * (tools/sprites/chars/franky.json). Every `durations` array has one entry
 * per animation frame.
 */
export const franky: CharacterDef = {
    id: 'franky',
    name: 'Franky',
    title: 'Cyborg du Sunny',
    health: 1080,
    walk: 1.3,
    back: 1.1,
    dash: 4.2,
    backdash: [3.4, 2.4],
    jump: [2.1, 7.0],
    gravity: 0.38,
    width: 18,
    height: 76,
    crouchHeight: 54,
    color: '#3fa7d6',
    manifest: manifest as unknown as SpriteManifest,
    moves: {
        lightA: {
            name: 'Direct d\'acier', anim: 'lightA', kind: 'normal', stance: 'stand',
            durations: [4, 3, 3, 8],
            hits: [{ frames: [1, 2], box: [16, 28, 56, 24], damage: 32, guard: 'mid', hitstun: 14, blockstun: 9, push: 6, hitstop: 6, spark: 'light' }],
            chain: ['lightB', 'crouchLight', 'heavy', 'heavyFwd', 'heavyBack', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        lightB: {
            name: 'Crochet cybernétique', anim: 'lightB', kind: 'normal', stance: 'stand',
            durations: [3, 3, 3, 3, 7],
            hits: [{ frames: [2, 3], box: [16, 30, 66, 30], damage: 36, guard: 'mid', hitstun: 16, blockstun: 10, push: 7, hitstop: 7, spark: 'light' }],
            chain: ['lightC', 'heavy', 'heavyFwd', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        lightC: {
            name: 'Franky Gatling', anim: 'lightC', kind: 'normal', stance: 'stand',
            durations: [4, 4, 4, 4, 5, 9],
            hits: [{ frames: [1, 4], box: [16, 14, 80, 54], damage: 16, guard: 'mid', hitstun: 16, blockstun: 10, push: 3, rehit: 5, hitstop: 4, spark: 'heavy' }],
            cancelable: true, sfx: 'gatling'
        },
        crouchLight: {
            name: 'Poing bas', anim: 'crouchLight', kind: 'normal', stance: 'crouch',
            durations: [3, 4, 7],
            hits: [{ frames: [1, 1], box: [16, 4, 34, 24], damage: 26, guard: 'low', hitstun: 12, blockstun: 8, push: 8, hitstop: 6, spark: 'light' }],
            chain: ['crouchLight', 'lightB', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        crouchHeavy: {
            name: 'Canon au ras du sol', anim: 'crouchHeavy', kind: 'normal', stance: 'crouch',
            durations: [5, 4, 3, 4, 6, 10],
            hits: [{ frames: [2, 4], box: [14, 0, 58, 26], damage: 66, guard: 'low', hitstun: 20, blockstun: 12, push: 14, knockdown: true, launch: [1.2, 2.6], hitstop: 10, spark: 'fire' }],
            fx: [[2, 'fx_muzzle', 56, 12]],
            cancelable: true, sfx: 'bazooka'
        },
        heavy: {
            name: 'Crochet de fer', anim: 'heavy', kind: 'normal', stance: 'stand',
            durations: [4, 4, 3, 3, 4, 7, 9],
            hits: [{ frames: [2, 4], box: [14, 10, 74, 50], damage: 76, guard: 'mid', hitstun: 21, blockstun: 14, push: 18, hitstop: 11, spark: 'heavy', shake: 2 }],
            cancelable: true, sfx: 'swingHeavy'
        },
        heavyFwd: {
            name: 'Franky Hammer', anim: 'heavyFwd', kind: 'normal', stance: 'stand',
            durations: [3, 3, 2, 2, 3, 3, 4, 6, 6, 9],
            hits: [{ frames: [5, 6], box: [18, 0, 86, 86], damage: 84, guard: 'high', hitstun: 22, blockstun: 14, push: 14, hitstop: 12, spark: 'big', shake: 4 }],
            fx: [[6, 'fx_spikes', 96, 14]],
            cancelable: true, sfx: 'swingHeavy'
        },
        heavyBack: {
            name: 'Paume montante', anim: 'heavyBack', kind: 'normal', stance: 'stand',
            durations: [4, 3, 3, 4, 4, 6, 8],
            hits: [{ frames: [2, 3], box: [4, 30, 56, 88], damage: 64, guard: 'mid', hitstun: 22, blockstun: 12, push: 8, launch: [0.6, 6.4], hitstop: 10, spark: 'heavy' }],
            invuln: [1, 2],
            cancelable: true, sfx: 'swingHeavy'
        },
        airLight: {
            name: 'Poing plongeant', anim: 'airLight', kind: 'normal', stance: 'air',
            durations: [4, 5, 10],
            hits: [{ frames: [1, 2], box: [0, 6, 50, 40], damage: 36, guard: 'high', hitstun: 14, blockstun: 9, push: 8, hitstop: 7, spark: 'light' }],
            chain: ['airHeavy'], cancelable: true, sfx: 'swing'
        },
        airHeavy: {
            name: 'Marteau aérien', anim: 'airHeavy', kind: 'normal', stance: 'air',
            durations: [4, 4, 5, 9],
            hits: [{ frames: [1, 2], box: [0, -12, 58, 56], damage: 68, guard: 'high', hitstun: 18, blockstun: 12, push: 12, hitstop: 10, spark: 'heavy' }],
            cancelable: true, landLag: 5, sfx: 'swingHeavy'
        },
        airSpecial: {
            name: 'Franky Meteor', anim: 'airSpecial', kind: 'special', stance: 'air',
            durations: [4, 3, 3, 4, 30, 12],
            motion: [[1, 3.0, -6.4]],
            noGravity: true, landFrame: 5,
            hits: [{ frames: [1, 4], box: [0, -12, 52, 56], damage: 84, guard: 'high', hitstun: 20, blockstun: 14, push: 16, knockdown: true, launch: [1.6, 3.6], hitstop: 12, spark: 'big', shake: 4 }],
            fx: [[5, 'fx_impact', 30, 8]],
            sfx: 'swingHeavy'
        },
        // The fist flies off on its rocket and comes back on its chain.
        specialN: {
            name: 'Strong Right', anim: 'specialN', kind: 'special', stance: 'stand',
            durations: [4, 4, 3, 3, 4, 12, 10, 8],
            hits: [],
            projectile: {
                anim: 'fx_fist', atFrame: 5, offset: [66, 50], speed: 7.0, life: 24,
                box: [-24, -12, 48, 24], fps: 14, hits: 1,
                hit: { damage: 82, guard: 'mid', hitstun: 22, blockstun: 16, push: 18, hitstop: 11, spark: 'fire', shake: 3, sfx: 'bazooka' }
            },
            sfx: 'bazooka'
        },
        specialF: {
            name: 'Coup de Boo', anim: 'specialF', kind: 'special', stance: 'stand',
            durations: [7, 5, 5, 5, 5, 8, 10],
            motion: [[1, 6.4, 0], [5, 0, 0]],
            hits: [{ frames: [1, 4], box: [10, 8, 64, 44], damage: 94, guard: 'mid', hitstun: 24, blockstun: 14, push: 22, launch: [3.0, 3.8], hitstop: 14, spark: 'big', shake: 4 }],
            sfx: 'gigant'
        },
        // Left arm cannon aimed at the sky: the arm rises (invincible), then
        // the laser fires along it.
        specialU: {
            name: 'Weapons Left', anim: 'specialU', kind: 'special', stance: 'stand',
            durations: [3, 4, 4, 4, 4, 4, 5, 6, 12],
            invuln: [0, 3],
            hits: [
                { frames: [1, 2], box: [0, 24, 70, 70], damage: 56, guard: 'mid', hitstun: 24, blockstun: 14, push: 6, launch: [0.8, 6.8], hitstop: 10, spark: 'heavy', shake: 2 },
                { frames: [5, 7], box: [30, 56, 120, 96], damage: 60, guard: 'mid', hitstun: 26, blockstun: 16, push: 8, launch: [1.4, 7.0], hitstop: 12, spark: 'laser', shake: 4, sfx: 'laser' }
            ],
            fx: [[5, 'fx_muzzle', 66, 86], [5, 'fx_laser', 62, 82]],
            sfx: 'beam'
        },
        // Cola-fuelled breath: a wall of flame crawls forward and burns on.
        specialD: {
            name: 'Fresh Fire', anim: 'specialD', kind: 'special', stance: 'stand',
            durations: [5, 5, 5, 5, 6, 10, 8, 8],
            hits: [],
            projectile: {
                anim: 'fx_fire', atFrame: 4, offset: [38, 36], speed: 0.9, life: 60,
                box: [-30, -36, 60, 72], fps: 10, hits: 4,
                hit: { damage: 28, guard: 'mid', hitstun: 22, blockstun: 10, push: 2, hitstop: 4, spark: 'fire', sfx: 'fire' }
            },
            sfx: 'fire'
        },
        // One bar: the dashing gatling drives in, then the shoulder rocket
        // launcher fires point-blank and the missile blows up in front.
        ultimate: {
            name: 'Franky Rocket Launcher', anim: 'ultimate', kind: 'ultimate', stance: 'stand',
            durations: [8, 4, 4, 4, 4, 6, 6, 4, 4, 5, 6, 8, 10, 12],
            superFreeze: 55, cost: 100, invuln: [0, 5],
            motion: [[1, 5.0, 0], [5, 0, 0]],
            hits: [
                { frames: [1, 4], box: [0, 10, 90, 60], damage: 28, guard: 'mid', hitstun: 60, blockstun: 20, push: 1, rehit: 4, hitstop: 4, spark: 'heavy', shake: 2 },
                { frames: [9, 10], box: [10, 0, 110, 96], damage: 300, guard: 'mid', hitstun: 50, blockstun: 22, push: 30, launch: [5.6, 6.0], wallBounce: true, hitstop: 22, spark: 'fire', shake: 10, sfx: 'bazooka' }
            ],
            fx: [[9, 'fx_launch', 70, 60], [10, 'fx_boom', 72, 40]],
            sfx: 'bazooka'
        },
        // Two bars: the pompadour flares, the forearm swells into an air
        // cannon and the Coup de Vent crosses the whole stage.
        ultimate2: {
            name: 'Coup de Vent', anim: 'ultimate2', kind: 'ultimate', stance: 'stand',
            durations: [6, 5, 5, 6, 6, 5, 4, 4, 4, 4, 4, 4, 4, 5, 6, 6, 8, 12, 14],
            superFreeze: 70, cost: 200, invuln: [0, 15],
            hits: [
                { frames: [15, 16], box: [10, 0, 90, 84], damage: 90, guard: 'mid', hitstun: 60, blockstun: 20, push: 1, hitstop: 12, spark: 'big', shake: 6 }
            ],
            projectile: {
                anim: 'fx_vent', atFrame: 15, offset: [34, 44], speed: 3.6, life: 90,
                box: [-44, -52, 228, 104], fps: 12, hits: 5,
                hit: { damage: 84, guard: 'mid', hitstun: 34, blockstun: 16, push: 36, hitstop: 2, spark: 'big', shake: 8, sfx: 'beam' }
            },
            fx: [[15, 'fx_ventring', 40, 44], [16, 'fx_ventring', 44, 44]],
            sfx: 'gigant'
        },
        throw: {
            name: 'Franky Boxing', anim: 'throw', kind: 'throw', stance: 'stand',
            durations: [3, 4, 4, 4, 4, 6, 6, 6, 8],
            hits: [{ frames: [0, 1], box: [10, 10, 34, 50], damage: 0, guard: 'unblockable', hitstun: 0, blockstun: 0, push: 0 }],
            throwRelease: { frame: 4, damage: 112, launch: [3.0, 5.0] },
            fx: [[4, 'fx_crescent', 50, 50]],
            sfx: 'grab'
        }
    }
};
