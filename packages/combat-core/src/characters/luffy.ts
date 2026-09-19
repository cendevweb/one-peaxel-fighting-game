import type { CharacterDefinition } from '../types.js';
import { hit, move } from './helpers.js';

/**
 * Monkey D. Luffy — the reference kit. His sheet is by far the richest of the
 * four, so he is the only fighter whose every move has its own animation.
 * Rubber reach on the heavy, a multi-hit special that closes distance, and a
 * Gear 3 super that trades a full bar for a round-changing launcher.
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
        walk: 'luffy-run',
        walkBack: 'luffy-run',
        jumpRise: 'luffy-jump',
        jumpFall: 'luffy-jump',
        land: 'luffy-idle',
        hurt: 'luffy-hurt',
        guard: 'luffy-guard',
        knockdown: 'luffy-hurt',
        victory: 'luffy-idle',
        defeat: 'luffy-hurt'
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
            hitbox: { x: 18, y: 62, width: 66, height: 42 },
            hit: hit({ damage: 45, hitstun: 17, blockstun: 11, knockbackX: 2.4, hitstop: 6 }),
            meterCost: 0,
            cancelInto: ['luffy-pistol', 'luffy-gatling', 'luffy-gear3'],
            cancelWindow: [5, 17]
        }),
        move({
            id: 'luffy-pistol',
            name: 'Gum-Gum Pistol',
            slot: 'heavy',
            animation: 'luffy-pistol',
            duration: 38,
            startup: 10,
            active: [[10, 14]],
            hitbox: { x: 22, y: 68, width: 162, height: 38 },
            hit: hit({ damage: 95, hitstun: 24, blockstun: 15, knockbackX: 6.2, hitstop: 11 }),
            meterCost: 0,
            cancelInto: ['luffy-gatling', 'luffy-gear3'],
            cancelWindow: [11, 30],
            cameraShake: 5
        }),
        move({
            id: 'luffy-gatling',
            name: 'Gum-Gum Gatling',
            slot: 'special',
            animation: 'luffy-gatling',
            duration: 52,
            startup: 11,
            active: [
                [11, 12],
                [15, 16],
                [19, 20],
                [23, 24],
                [27, 28],
                [31, 33]
            ],
            hitbox: { x: 20, y: 56, width: 132, height: 56 },
            hit: hit({
                damage: 26,
                hitstun: 14,
                blockstun: 9,
                knockbackX: 1.2,
                hitstop: 4,
                meterGainOnHit: 22
            }),
            meterCost: 0,
            momentum: { frame: 9, x: 2.4, y: 0 },
            cancelInto: ['luffy-gear3'],
            cancelWindow: [12, 40]
        }),
        move({
            id: 'luffy-gear3',
            name: 'Gear 3 — Gigant Pistol',
            slot: 'ultimate',
            animation: 'luffy-gear3',
            duration: 74,
            startup: 26,
            active: [[26, 33]],
            hitbox: { x: 20, y: 40, width: 238, height: 120 },
            hit: hit({
                damage: 320,
                chipDamage: 34,
                hitstun: 40,
                blockstun: 26,
                knockbackX: 9.5,
                knockbackY: 6.5,
                hitstop: 22,
                launcher: true,
                meterGainOnHit: 0,
                meterGainOnTakeHit: 60
            }),
            meterCost: 1000,
            invuln: [1, 27],
            startupFreeze: 42,
            cancelInto: [],
            cancelWindow: [0, 0],
            cameraShake: 22
        }),
        move({
            id: 'luffy-axe',
            name: 'Gum-Gum Axe',
            slot: 'airLight',
            animation: 'luffy-axe',
            duration: 30,
            startup: 6,
            active: [[6, 13]],
            hitbox: { x: 6, y: -10, width: 84, height: 96 },
            hit: hit({ damage: 62, hitstun: 20, blockstun: 12, knockbackX: 3.4, hitstop: 8 }),
            meterCost: 0,
            airOnly: true,
            cancelInto: [],
            cancelWindow: [0, 0]
        }),
        move({
            id: 'luffy-whip',
            name: 'Gum-Gum Whip',
            slot: 'airHeavy',
            animation: 'luffy-whip',
            duration: 34,
            startup: 8,
            active: [[8, 14]],
            hitbox: { x: 16, y: 20, width: 150, height: 52 },
            hit: hit({
                damage: 82,
                hitstun: 22,
                blockstun: 13,
                knockbackX: 5,
                knockbackY: 2.4,
                hitstop: 10
            }),
            meterCost: 0,
            airOnly: true,
            cancelInto: [],
            cancelWindow: [0, 0]
        })
    ],
    spriteNotes: [
        "Le saut réutilise une frame de course : la planche d'origine ne contient pas de cycle de saut."
    ]
};
