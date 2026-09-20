import type { CharacterDefinition } from '../types.js';
import { hit, move } from './helpers.js';

/**
 * Monkey D. Luffy — the reference kit. Rubber reach on the heavy, a multi-hit
 * special that closes distance, and a Gear 3 super that trades a full bar for a
 * round-changing launcher.
 *
 * His sheet is the richest of the five and also the messiest: half a dozen rows
 * carry a katakana sound effect drawn at sprite size, the Gear 3 row is buried
 * under two full-page cut-scene panels, and the Gum-Gum Pistol is drawn facing
 * the opposite way to the rest of him. All three are handled in the asset
 * pipeline rather than here.
 */
export const luffy: CharacterDefinition = {
    id: 'luffy',
    name: 'Luffy',
    tagline: 'Portée élastique, combos souples, Gear 3 dévastateur.',
    texture: 'luffy',
    portraitFrame: 'idle-1',
    color: '#e23c2f',
    stats: {
        maxHealth: 1000,
        walkSpeed: 2.7,
        backSpeed: 2.2,
        jumpVelocity: 12.6,
        jumpForward: 4.4,
        gravity: 0.62,
        weight: 100,
        landingLag: 3,
        spriteScale: 2.2
    },
    hurtbox: {
        standing: { x: -26, y: 0, width: 52, height: 148 },
        air: { x: -26, y: 10, width: 52, height: 120 },
        down: { x: -46, y: 0, width: 92, height: 52 }
    },
    pushbox: { x: -28, y: 0, width: 56, height: 130 },
    animations: {
        idle: 'luffy-idle',
        walk: 'luffy-walk',
        walkBack: 'luffy-walk',
        jumpRise: 'luffy-jump',
        jumpFall: 'luffy-jump',
        land: 'luffy-idle',
        hurt: 'luffy-hurt',
        guard: 'luffy-guard',
        knockdown: 'luffy-knockdown',
        victory: 'luffy-idle',
        defeat: 'luffy-knockdown'
    },
    hitEffects: {
        light: { animation: 'luffy-fx-spark', scale: 1.8 },
        heavy: { animation: 'luffy-fx-ring', scale: 2.4 },
        block: { animation: 'luffy-fx-spark', scale: 1.3 }
    },
    moves: [
        move({
            id: 'luffy-jab',
            name: 'Direct',
            slot: 'light',
            animation: 'luffy-jab',
            duration: 20,
            startup: 4,
            active: [[4, 6]],
            impactFrame: 2,
            hitbox: { x: 18, y: 58, width: 72, height: 46 },
            hit: hit({ damage: 45, hitstun: 17, blockstun: 11, knockbackX: 2.4, hitstop: 6 }),
            meterCost: 0,
            cancelInto: ['luffy-pistol', 'luffy-gatling', 'luffy-gear3'],
            cancelWindow: [5, 17]
        }),
        move({
            id: 'luffy-gatling',
            name: 'Gomu Gomu no Gatling',
            slot: 'special',
            animation: 'luffy-gatling',
            duration: 54,
            startup: 11,
            // A rush of five, which is what the row draws: the arms blur, then
            // the last one lands with the burst.
            active: [
                [11, 13],
                [17, 19],
                [23, 25],
                [29, 31],
                [36, 40]
            ],
            impactFrame: 3,
            hitbox: { x: 20, y: 46, width: 150, height: 70 },
            hit: hit({ damage: 24, hitstun: 14, blockstun: 9, knockbackX: 1, hitstop: 5 }),
            effects: [
                { animation: 'luffy-fx-spark', frame: 11, offsetX: 110, offsetY: 76, scale: 1.4 },
                { animation: 'luffy-fx-spark', frame: 23, offsetX: 140, offsetY: 70, scale: 1.4 },
                { animation: 'luffy-fx-ring', frame: 36, offsetX: 170, offsetY: 72, scale: 2 }
            ],
            meterCost: 0,
            cancelInto: ['luffy-gear3'],
            cancelWindow: [30, 48],
            cameraShake: 6
        }),
        move({
            id: 'luffy-pistol',
            name: 'Gomu Gomu no Pistolet',
            slot: 'heavy',
            animation: 'luffy-pistol',
            duration: 40,
            startup: 12,
            active: [[12, 18]],
            impactFrame: 4,
            // The arm is drawn 235 px past his feet. It is the longest normal
            // reach in the game and the box finally says so.
            hitbox: { x: 30, y: 54, width: 206, height: 52 },
            hit: hit({
                damage: 88,
                hitstun: 24,
                blockstun: 15,
                knockbackX: 5.2,
                hitstop: 11
            }),
            effects: [{ animation: 'luffy-fx-ring', frame: 14, offsetX: 220, offsetY: 78, scale: 1.8 }],
            impactEffect: { animation: 'luffy-fx-ring', scale: 2.2 },
            meterCost: 0,
            cancelInto: ['luffy-gear3'],
            cancelWindow: [13, 34],
            cameraShake: 5
        }),
        move({
            id: 'luffy-gear3',
            name: 'Gigant Stamp (Gear 3)',
            slot: 'ultimate',
            animation: 'luffy-gigant',
            duration: 78,
            // The animation opens on the landing itself, so the wind-up is the
            // super freeze and the flash rather than frames of him gathering:
            // the foot is already coming down when the screen comes back.
            startup: 8,
            active: [[8, 24]],
            impactFrame: 0,
            // A stamp, not a swing: the box is the column the foot falls
            // through, wide enough to catch someone trying to walk under it.
            hitbox: { x: -40, y: 0, width: 200, height: 260 },
            hit: hit({
                damage: 200,
                chipDamage: 26,
                hitstun: 34,
                blockstun: 26,
                knockbackX: 5,
                knockbackY: 5.6,
                hitstop: 22,
                launcher: true,
                meterGainOnHit: 0,
                meterGainOnTakeHit: 40
            }),
            effects: [
                { animation: 'luffy-fx-burst', frame: 8, offsetX: 40, offsetY: 20, scale: 3 },
                { animation: 'luffy-fx-fire', frame: 10, offsetX: 60, offsetY: 0, scale: 2.4, hold: 12 },
                { animation: 'luffy-fx-ring', frame: 14, offsetX: 50, offsetY: 50, scale: 2.8 }
            ],
            impactEffect: { animation: 'luffy-fx-burst', scale: 3 },
            meterCost: 1000,
            invuln: [1, 26],
            startupFreeze: 32,
            cancelInto: [],
            cancelWindow: [0, 0],
            cameraShake: 26
        }),
        move({
            id: 'luffy-whip',
            name: 'Gomu Gomu no Fouet',
            slot: 'airLight',
            animation: 'luffy-whip',
            duration: 30,
            startup: 8,
            active: [[8, 14]],
            impactFrame: 3,
            // A full spin: the leg sweeps behind him as far as in front.
            hitbox: { x: -50, y: -10, width: 190, height: 88 },
            hit: hit({ damage: 58, hitstun: 20, blockstun: 12, knockbackX: 3.2, hitstop: 8 }),
            meterCost: 0,
            airOnly: true,
            cancelInto: [],
            cancelWindow: [0, 0]
        }),
        move({
            id: 'luffy-axe',
            name: 'Gomu Gomu no Hache',
            slot: 'airHeavy',
            animation: 'luffy-axe',
            duration: 40,
            startup: 11,
            active: [[11, 18]],
            impactFrame: 5,
            hitbox: { x: -14, y: -30, width: 104, height: 170 },
            hit: hit({
                damage: 100,
                hitstun: 26,
                blockstun: 15,
                knockbackX: 3.4,
                hitstop: 13,
                knockdown: true
            }),
            effects: [{ animation: 'luffy-fx-fire', frame: 14, offsetX: 34, offsetY: 0, scale: 2 }],
            meterCost: 0,
            airOnly: true,
            cancelInto: [],
            cancelWindow: [0, 0],
            cameraShake: 8
        })
    ],
    spriteNotes: [
        'Le Pistolet est dessiné à l’envers dans le rip ; le pipeline le remet à l’endroit.',
        'Le Gear 3 joue le pied géant qui s’abat, pas un simple gonflage de bras.'
    ]
};
