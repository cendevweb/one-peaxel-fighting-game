import manifest from '../generated/sprites/usopp.json';
import type { CharacterDef, SpriteManifest } from '../engine/types';

/**
 * Usopp — the sniper of the Straw Hats, with the Kabuto slingshot. A zoner:
 * the lead ball (Namari Boshi) at mid range, the Kaen Boshi fireball, the
 * kneeling Tabasco Boshi, the Midori Boshi fired down from a jump, the
 * pole-vault on the Kabuto as his reversal, and the Impact Dial pressed
 * against the foe as his throw. Up close he swings his hammers: Usopp
 * Pound and the "5t" hammer; the one-bar ultimate is the "10t" hammer, the
 * two-bar one is Sogeking's Hi no Tori Boshi, the fire bird that crosses
 * the whole stage.
 *
 * Every animation and effect comes from the Gigant Battle sheet
 * (tools/sprites/chars/usopp.json). Every `durations` array has one entry
 * per animation frame.
 */
export const usopp: CharacterDef = {
    id: 'usopp',
    name: 'Usopp',
    title: 'Roi des tireurs',
    health: 960,
    walk: 1.5,
    back: 1.3,
    dash: 4.6,
    backdash: [4.0, 2.8],
    jump: [2.3, 7.2],
    gravity: 0.37,
    width: 12,
    height: 62,
    crouchHeight: 42,
    color: '#b8862e',
    manifest: manifest as unknown as SpriteManifest,
    moves: {
        lightA: {
            name: 'Coup de paume', anim: 'lightA', kind: 'normal', stance: 'stand',
            durations: [3, 3, 8],
            hits: [{ frames: [1, 1], box: [4, 26, 36, 16], damage: 28, guard: 'mid', hitstun: 14, blockstun: 9, push: 6, hitstop: 6, spark: 'light' }],
            chain: ['lightB', 'crouchLight', 'heavy', 'heavyFwd', 'heavyBack', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        lightB: {
            name: 'Estoc du Kabuto', anim: 'lightB', kind: 'normal', stance: 'stand',
            durations: [3, 3, 3, 8],
            hits: [{ frames: [1, 2], box: [4, 26, 48, 26], damage: 32, guard: 'mid', hitstun: 16, blockstun: 10, push: 7, hitstop: 7, spark: 'light' }],
            chain: ['lightC', 'heavy', 'heavyFwd', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        lightC: {
            name: 'Kabuto — coup de massue', anim: 'lightC', kind: 'normal', stance: 'stand',
            durations: [4, 4, 3, 4, 10],
            hits: [{ frames: [2, 3], box: [0, 8, 54, 60], damage: 50, guard: 'mid', hitstun: 18, blockstun: 12, push: 18, hitstop: 9, spark: 'heavy', shake: 2 }],
            cancelable: true, sfx: 'swingHeavy'
        },
        crouchLight: {
            name: 'Kabuto bas', anim: 'crouchLight', kind: 'normal', stance: 'crouch',
            durations: [3, 3, 7],
            hits: [{ frames: [1, 1], box: [6, 2, 42, 18], damage: 22, guard: 'low', hitstun: 12, blockstun: 8, push: 8, hitstop: 6, spark: 'light' }],
            chain: ['crouchLight', 'lightB', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        crouchHeavy: {
            name: 'Fouet de l\'élastique', anim: 'crouchHeavy', kind: 'normal', stance: 'crouch',
            durations: [5, 4, 3, 3, 5, 10],
            hits: [{ frames: [3, 4], box: [8, 0, 56, 24], damage: 64, guard: 'low', hitstun: 20, blockstun: 12, push: 14, knockdown: true, launch: [1.2, 2.6], hitstop: 10, spark: 'heavy' }],
            cancelable: true, sfx: 'swing'
        },
        heavy: {
            name: 'Usopp Pound', anim: 'heavy', kind: 'normal', stance: 'stand',
            durations: [4, 4, 4, 3, 4, 5, 6, 6],
            hits: [{ frames: [3, 4], box: [0, 10, 52, 70], damage: 72, guard: 'mid', hitstun: 21, blockstun: 14, push: 20, hitstop: 11, spark: 'heavy', shake: 2 }],
            cancelable: true, sfx: 'swingHeavy'
        },
        heavyFwd: {
            name: 'Usopp Hammer « 5 t »', anim: 'heavyFwd', kind: 'normal', stance: 'stand',
            durations: [5, 4, 4, 4, 3, 4, 4, 5, 6, 7],
            hits: [{ frames: [5, 6], box: [6, 0, 50, 84], damage: 82, guard: 'high', hitstun: 22, blockstun: 14, push: 14, hitstop: 12, spark: 'big', shake: 5 }],
            cancelable: true, sfx: 'swingHeavy'
        },
        heavyBack: {
            name: 'Moulinet de la masse', anim: 'heavyBack', kind: 'normal', stance: 'stand',
            durations: [4, 3, 3, 4, 5, 8],
            hits: [{ frames: [2, 4], box: [0, 14, 52, 56], damage: 62, guard: 'mid', hitstun: 22, blockstun: 12, push: 8, launch: [0.6, 6.4], hitstop: 10, spark: 'heavy' }],
            cancelable: true, sfx: 'swingHeavy'
        },
        airLight: {
            name: 'Culbute au Kabuto', anim: 'airLight', kind: 'normal', stance: 'air',
            durations: [3, 3, 10],
            hits: [{ frames: [2, 2], box: [-4, -6, 46, 44], damage: 32, guard: 'high', hitstun: 14, blockstun: 9, push: 8, hitstop: 7, spark: 'light' }],
            chain: ['airHeavy'], cancelable: true, sfx: 'swing'
        },
        airHeavy: {
            name: 'Usopp Pound aérien', anim: 'airHeavy', kind: 'normal', stance: 'air',
            durations: [3, 3, 3, 4, 4, 6, 8],
            hits: [{ frames: [3, 5], box: [-6, 0, 56, 50], damage: 64, guard: 'high', hitstun: 18, blockstun: 12, push: 12, hitstop: 10, spark: 'heavy' }],
            cancelable: true, landLag: 5, sfx: 'swingHeavy'
        },
        // Fired down and forward from the air: the green pellet.
        airSpecial: {
            name: 'Midori Boshi', anim: 'airSpecial', kind: 'special', stance: 'air',
            durations: [4, 4, 3, 4, 4, 4, 6, 6, 8],
            motion: [[0, 0.4, 0.8], [2, 0.2, -0.3]],
            noGravity: true, landLag: 6,
            hits: [],
            projectile: {
                anim: 'fx_green', atFrame: 2, offset: [40, 30], speed: 3.2, speedY: -3.4, life: 50,
                box: [-12, -12, 24, 24], fps: 12, hits: 1,
                hit: { damage: 66, guard: 'high', hitstun: 20, blockstun: 14, push: 14, hitstop: 10, spark: 'petal', knockdown: true, launch: [1.4, 2.6], sfx: 'flutter' }
            },
            sfx: 'swing'
        },
        specialN: {
            name: 'Hissatsu Namari Boshi', anim: 'specialN', kind: 'special', stance: 'stand',
            durations: [3, 3, 3, 3, 2, 3, 4, 4, 5, 6, 8],
            hits: [],
            projectile: {
                anim: 'fx_lead', atFrame: 5, offset: [44, 42], speed: 5.4, life: 90,
                box: [-30, -12, 40, 24], fps: 12, hits: 1,
                hit: { damage: 72, guard: 'mid', hitstun: 22, blockstun: 16, push: 18, hitstop: 11, spark: 'heavy', shake: 2, sfx: 'swingHeavy' }
            },
            sfx: 'swing'
        },
        specialF: {
            name: 'Hissatsu Kaen Boshi', anim: 'specialF', kind: 'special', stance: 'stand',
            durations: [3, 3, 3, 3, 3, 3, 4, 4, 6, 6, 8],
            hits: [],
            projectile: {
                anim: 'fx_flame', atFrame: 5, offset: [40, 44], speed: 4.2, life: 85,
                box: [-24, -10, 48, 20], fps: 10, hits: 1,
                hit: { damage: 82, guard: 'mid', hitstun: 24, blockstun: 16, push: 16, knockdown: true, launch: [1.8, 3.4], hitstop: 12, spark: 'fire', shake: 3, sfx: 'fire' }
            },
            sfx: 'fire'
        },
        // Kneeling low shot: slower, but the pepper keeps the foe reeling.
        specialD: {
            name: 'Hissatsu Tabasco Boshi', anim: 'specialD', kind: 'special', stance: 'stand',
            durations: [3, 3, 3, 3, 2, 3, 3, 3, 4, 4, 5, 6],
            hits: [],
            projectile: {
                anim: 'fx_pellet', atFrame: 5, offset: [38, 32], speed: 3.4, life: 110,
                box: [-22, -12, 32, 24], fps: 12, hits: 1,
                hit: { damage: 60, guard: 'mid', hitstun: 40, blockstun: 16, push: 10, hitstop: 12, spark: 'fire', shake: 2, sfx: 'fire' }
            },
            sfx: 'swing'
        },
        // Pole-vault on the Kabuto: invulnerable take-off, then shots fired
        // down while upside down.
        specialU: {
            name: 'Kabuto — Usopp Rolling', anim: 'specialU', kind: 'special', stance: 'stand',
            durations: [3, 3, 3, 4, 4, 4, 5, 5, 5, 5, 6, 6, 8],
            motion: [[1, 1.4, 6.4]],
            invuln: [0, 3],
            hits: [
                { frames: [1, 5], box: [-10, 10, 52, 64], damage: 56, guard: 'mid', hitstun: 24, blockstun: 16, push: 8, launch: [0.8, 6.8], hitstop: 10, spark: 'heavy', shake: 3 },
                { frames: [6, 9], box: [0, -40, 64, 60], damage: 48, guard: 'mid', hitstun: 24, blockstun: 16, push: 10, launch: [1.6, 4.0], knockdown: true, hitstop: 10, spark: 'light', shake: 2 }
            ],
            sfx: 'swingHeavy'
        },
        // One bar: the "10 t" hammer lifted, then Usopp rides it down.
        ultimate: {
            name: 'Usopp Hammer « 10 t »', anim: 'ultimate', kind: 'ultimate', stance: 'stand',
            durations: [7, 6, 6, 8, 3, 4, 4, 5, 6, 8, 8, 8, 10],
            superFreeze: 55, cost: 100, invuln: [0, 5],
            hits: [
                { frames: [4, 4], box: [0, 0, 112, 120], damage: 190, guard: 'mid', hitstun: 70, blockstun: 22, push: 2, hitstop: 20, spark: 'big', shake: 10 },
                { frames: [5, 7], box: [-10, 0, 124, 50], damage: 34, guard: 'mid', hitstun: 50, blockstun: 16, push: 1, rehit: 5, hitstop: 4, spark: 'heavy', shake: 4 },
                { frames: [8, 8], box: [-10, 0, 124, 60], damage: 110, guard: 'mid', hitstun: 50, blockstun: 22, push: 30, launch: [4.6, 6.0], knockdown: true, wallBounce: true, hitstop: 18, spark: 'big', shake: 8 }
            ],
            sfx: 'gigant'
        },
        // Two bars: Sogeking's cape, a volley of stars at point blank, then
        // the fire bird that flies across the whole stage.
        ultimate2: {
            name: 'Sogeking — Hi no Tori Boshi', anim: 'ultimate2', kind: 'ultimate', stance: 'stand',
            durations: [6, 6, 6, 6, 4, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 5, 6, 8, 8, 10, 12],
            superFreeze: 70, cost: 200, invuln: [0, 8],
            hits: [
                { frames: [6, 14], box: [10, 14, 150, 44], damage: 50, guard: 'mid', hitstun: 50, blockstun: 16, push: 1, rehit: 6, hitstop: 5, spark: 'light', shake: 2 }
            ],
            projectile: {
                anim: 'fx_phoenix', atFrame: 16, offset: [40, 46], speed: 5.0, life: 120,
                box: [-70, -30, 122, 60], fps: 10, hits: 2,
                hit: { damage: 270, guard: 'mid', hitstun: 50, blockstun: 24, push: 20, launch: [3.2, 4.6], wallBounce: true, knockdown: true, hitstop: 20, spark: 'fire', shake: 10, sfx: 'fire' }
            },
            sfx: 'fire'
        },
        // The Impact Dial pressed against the foe; the recoil hurts Usopp too.
        throw: {
            name: 'Impact Dial', anim: 'throw', kind: 'throw', stance: 'stand',
            durations: [3, 4, 6, 4, 4, 5, 6, 6, 6, 8],
            hits: [{ frames: [0, 1], box: [4, 10, 30, 40], damage: 0, guard: 'unblockable', hitstun: 0, blockstun: 0, push: 0 }],
            throwRelease: { frame: 3, damage: 120, launch: [3.4, 4.6] },
            fx: [[3, 'fx_dial', 36, 34]],
            sfx: 'grab'
        }
    }
};
