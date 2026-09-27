import manifest from '../generated/sprites/luffy.json';
import type { CharacterDef, SpriteManifest } from '../engine/types';

/**
 * Monkey D. Luffy — the all-rounder. Stretchy normals with long reach, a
 * Pistol that covers half the screen, and the Gatling as a combo ender.
 *
 * Every `durations` array has exactly one entry per frame of the animation
 * it plays (see tools/sprites/chars/luffy.json); a test checks it.
 */
export const luffy: CharacterDef = {
    id: 'luffy',
    name: 'Luffy',
    title: 'Chapeau de paille',
    health: 1000,
    walk: 1.7,
    back: 1.3,
    dash: 4.4,
    backdash: [3.6, 2.6],
    jump: [2.3, 7.2],
    gravity: 0.36,
    width: 11,
    height: 56,
    crouchHeight: 36,
    color: '#e8412c',
    manifest: manifest as unknown as SpriteManifest,
    moves: {
        lightA: {
            name: 'Jab', anim: 'lightA', kind: 'normal', stance: 'stand',
            durations: [3, 2, 3, 5],
            hits: [{ frames: [1, 2], box: 'auto', damage: 30, guard: 'mid', hitstun: 14, blockstun: 9, push: 5, hitstop: 6 }],
            chain: ['lightB', 'crouchLight', 'heavy', 'heavyFwd', 'heavyBack', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        lightB: {
            name: 'Double coup', anim: 'lightB', kind: 'normal', stance: 'stand',
            durations: [3, 2, 3, 6],
            hits: [{ frames: [1, 2], box: [8, 24, 30, 16], damage: 34, guard: 'mid', hitstun: 16, blockstun: 10, push: 6, hitstop: 7 }],
            chain: ['lightC', 'heavy', 'heavyFwd', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        lightC: {
            name: 'Gomu Gomu no… petit Pistol', anim: 'lightC', kind: 'normal', stance: 'stand',
            durations: [3, 4, 4, 5, 6, 6],
            hits: [{ frames: [1, 2], box: 'auto', damage: 52, guard: 'mid', hitstun: 18, blockstun: 12, push: 22, hitstop: 9, spark: 'heavy' }],
            cancelable: true, sfx: 'stretch'
        },
        crouchLight: {
            name: 'Coup bas', anim: 'crouchLight', kind: 'normal', stance: 'crouch',
            durations: [3, 4, 5],
            hits: [{ frames: [1, 1], box: [6, 2, 24, 18], damage: 24, guard: 'low', hitstun: 12, blockstun: 8, push: 8, hitstop: 6 }],
            chain: ['crouchLight', 'lightB', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        crouchHeavy: {
            name: 'Gomu Gomu no Muchi', anim: 'crouchHeavy', kind: 'normal', stance: 'crouch',
            durations: [5, 3, 3, 3, 3, 7, 9],
            hits: [{ frames: [2, 4], box: [8, 0, 58, 24], damage: 68, guard: 'low', hitstun: 20, blockstun: 12, push: 14, knockdown: true, launch: [1.2, 2.6], hitstop: 10, spark: 'heavy' }],
            cancelable: true, sfx: 'swingHeavy'
        },
        heavy: {
            name: 'Gomu Gomu no Bullet', anim: 'heavy', kind: 'normal', stance: 'stand',
            durations: [4, 3, 3, 5, 4, 4, 4, 5, 5],
            hits: [{ frames: [3, 4], box: [6, 14, 34, 30], damage: 72, guard: 'mid', hitstun: 21, blockstun: 14, push: 20, hitstop: 11, spark: 'heavy', shake: 2 }],
            cancelable: true, sfx: 'swingHeavy'
        },
        heavyFwd: {
            name: 'Gomu Gomu no Ono', anim: 'heavyFwd', kind: 'normal', stance: 'stand',
            durations: [4, 4, 3, 4, 3, 2, 6, 6, 6, 6],
            hits: [{ frames: [5, 6], box: [4, 0, 36, 70], damage: 80, guard: 'high', hitstun: 22, blockstun: 14, push: 14, hitstop: 12, spark: 'fire', shake: 4 }],
            fx: [[6, 'fx_fire', 22, 4]],
            cancelable: true, sfx: 'swingHeavy'
        },
        heavyBack: {
            name: 'Coup de pied lanceur', anim: 'heavyBack', kind: 'normal', stance: 'stand',
            durations: [4, 3, 3, 3, 4, 5, 6, 6],
            hits: [{ frames: [3, 5], box: [6, 16, 42, 74], damage: 66, guard: 'mid', hitstun: 22, blockstun: 12, push: 8, launch: [0.6, 6.4], hitstop: 10, spark: 'heavy' }],
            invuln: [2, 3],
            cancelable: true, sfx: 'swingHeavy'
        },
        airLight: {
            name: 'Toupie aérienne', anim: 'airLight', kind: 'normal', stance: 'air',
            durations: [4, 10],
            hits: [{ frames: [1, 1], box: [-4, -6, 30, 30], damage: 34, guard: 'high', hitstun: 14, blockstun: 9, push: 8, hitstop: 7 }],
            chain: ['airHeavy'], cancelable: true, sfx: 'swing'
        },
        airHeavy: {
            name: 'Coup de pied étiré aérien', anim: 'airHeavy', kind: 'normal', stance: 'air',
            durations: [4, 4, 7, 10],
            hits: [{ frames: [1, 3], box: 'auto', damage: 68, guard: 'high', hitstun: 18, blockstun: 12, push: 12, hitstop: 10, spark: 'heavy' }],
            cancelable: true, landLag: 5, sfx: 'swingHeavy'
        },
        airSpecial: {
            name: 'Gomu Gomu no Meteor', anim: 'airSpecial', kind: 'special', stance: 'air',
            durations: [4, 30, 4, 4, 5, 7],
            motion: [[0, 3.4, -5.5]],
            noGravity: true, landFrame: 2,
            hits: [{ frames: [0, 1], box: [-6, -4, 34, 34], damage: 80, guard: 'high', hitstun: 20, blockstun: 14, push: 18, knockdown: true, launch: [1.8, 3.4], hitstop: 12, spark: 'fire', shake: 4 }],
            sfx: 'fire'
        },
        specialN: {
            name: 'Gomu Gomu no Pistol', anim: 'specialN', kind: 'special', stance: 'stand',
            durations: [8, 2, 2, 2, 3, 4, 3, 3, 3, 8],
            hits: [{ frames: [1, 6], box: 'auto', damage: 90, guard: 'mid', hitstun: 22, blockstun: 16, push: 26, hitstop: 12, spark: 'heavy', shake: 3 }],
            sfx: 'stretch'
        },
        specialF: {
            name: 'Gomu Gomu no Gatling', anim: 'specialF', kind: 'special', stance: 'stand',
            durations: [4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 5, 4, 4, 3, 4, 5, 7],
            motion: [[1, 1.2, 0], [10, 0, 0]],
            hits: [
                { frames: [1, 9], box: [4, 10, 40, 44], damage: 12, guard: 'mid', hitstun: 16, blockstun: 8, push: 2, rehit: 4, hitstop: 3, spark: 'light' },
                { frames: [10, 12], box: 'auto', damage: 60, guard: 'mid', hitstun: 24, blockstun: 14, push: 24, launch: [3.2, 3.6], wallBounce: true, hitstop: 13, spark: 'big', shake: 5 }
            ],
            sfx: 'gatling'
        },
        specialU: {
            name: 'Gomu Gomu no Rocket Uppercut', anim: 'specialU', kind: 'special', stance: 'stand',
            durations: [3, 3, 4, 5, 6, 7, 8],
            motion: [[2, 1.4, 6.2]],
            invuln: [0, 2],
            hits: [{ frames: [2, 3], box: [0, 18, 34, 60], damage: 105, guard: 'mid', hitstun: 24, blockstun: 16, push: 10, launch: [1.0, 7.4], hitstop: 12, spark: 'big', shake: 4 }],
            sfx: 'swingHeavy'
        },
        specialD: {
            name: 'Gomu Gomu no Bazooka', anim: 'specialD', kind: 'special', stance: 'stand',
            durations: [5, 5, 5, 3, 3, 3, 5, 7, 9],
            hits: [{ frames: [4, 6], box: 'auto', damage: 115, guard: 'mid', hitstun: 26, blockstun: 18, push: 30, launch: [5.4, 3.4], wallBounce: true, hitstop: 15, spark: 'big', shake: 6 }],
            sfx: 'bazooka'
        },
        ultimate: {
            name: 'Gear Third — Gigant Rifle', anim: 'ultimate', kind: 'ultimate', stance: 'stand',
            durations: [7, 6, 7, 8, 5, 4, 4, 4, 4, 3, 3, 3, 3, 5, 10, 10, 10, 10],
            superFreeze: 55, cost: 100, invuln: [0, 8],
            hits: [
                { frames: [6, 8], box: 'auto', damage: 70, guard: 'mid', hitstun: 40, blockstun: 20, push: 4, rehit: 5, hitstop: 5, spark: 'big', shake: 6 },
                { frames: [9, 13], box: 'auto', damage: 150, guard: 'mid', hitstun: 40, blockstun: 20, push: 30, launch: [6.2, 5.4], wallBounce: true, hitstop: 22, spark: 'big', shake: 10 }
            ],
            sfx: 'gigant'
        },
        // Gear Second steam, a Jet Pistol that pins the foe, then Gear Third:
        // the leg inflates into a giant foot that comes down in front of him
        // (Gigant Axe) and stamps the ground with Luffy riding on top.
        ultimate2: {
            name: 'Gear Third — Gigant Axe', anim: 'ultimate2', kind: 'ultimate', stance: 'stand',
            durations: [3, 3, 3, 3, 2, 3, 4, 6, 5, 5, 5, 5, 6, 5, 5, 5, 6, 3, 3, 4, 4, 4, 5, 8, 12, 7, 7, 8],
            superFreeze: 70, cost: 200, invuln: [0, 4],
            hits: [
                { frames: [5, 6], box: [6, 20, 48, 26], damage: 40, guard: 'mid', hitstun: 75, blockstun: 22, push: 3, rehit: 4, hitstop: 7, spark: 'heavy', shake: 3 },
                { frames: [17, 19], box: [0, 0, 72, 130], damage: 170, guard: 'mid', hitstun: 60, blockstun: 24, push: 0, hitstop: 16, spark: 'quake', shake: 10, sfx: 'quake' },
                { frames: [20, 21], box: [0, 0, 92, 70], damage: 70, guard: 'mid', hitstun: 50, blockstun: 20, push: 0, rehit: 4, hitstop: 6, spark: 'big', shake: 6 },
                { frames: [22, 23], box: [0, 0, 96, 70], damage: 220, guard: 'mid', hitstun: 40, blockstun: 24, push: 30, knockdown: true, launch: [4.2, 5.6], hitstop: 24, spark: 'big', shake: 14, sfx: 'gigant' }
            ],
            fx: [[22, 'fx_blast', 52, 12]],
            sfx: 'gigant'
        },
        throw: {
            name: 'Projection élastique', anim: 'throw', kind: 'throw', stance: 'stand',
            durations: [3, 4, 5, 3, 3, 3, 6, 9],
            hits: [{ frames: [0, 1], box: [4, 10, 30, 40], damage: 0, guard: 'unblockable', hitstun: 0, blockstun: 0, push: 0 }],
            throwRelease: { frame: 4, damage: 110, launch: [4.2, 4.4] },
            sfx: 'grab'
        }
    }
};
