import type { CharacterDefinition } from '../types.js';
import { hit, move } from './helpers.js';

/**
 * Sakazuki — the wall. The largest health pool, the slowest walk, and the
 * hardest single hits in the game. He loses every exchange of jabs and wins
 * the one exchange he reads correctly, which is the opposite question from
 * the other four: not "can you keep up" but "can you afford to be wrong".
 *
 * His sheet is the richest of the five, so unlike Lucci, Crocodile and Enel
 * every one of his ground moves has its own animation.
 */
export const akainu: CharacterDefinition = {
    id: 'akainu',
    name: 'Akainu',
    tagline: 'Lent, massif, punitions dévastatrices au corps à corps.',
    texture: 'akainu',
    portraitFrame: 'idle-1',
    color: '#c0392b',
    stats: {
        maxHealth: 1120,
        walkSpeed: 2.1,
        backSpeed: 1.7,
        jumpVelocity: 11.6,
        jumpForward: 3.4,
        gravity: 0.68,
        weight: 128,
        landingLag: 5,
        spriteScale: 2.2
    },
    hurtbox: {
        standing: { x: -30, y: 0, width: 60, height: 158 },
        air: { x: -30, y: 10, width: 60, height: 128 },
        down: { x: -52, y: 0, width: 104, height: 54 }
    },
    pushbox: { x: -32, y: 0, width: 64, height: 140 },
    animations: {
        idle: 'akainu-idle',
        walk: 'akainu-walk',
        walkBack: 'akainu-walk',
        jumpRise: 'akainu-jump',
        jumpFall: 'akainu-jump',
        land: 'akainu-idle',
        hurt: 'akainu-hurt',
        guard: 'akainu-guard',
        knockdown: 'akainu-knockdown',
        victory: 'akainu-idle',
        defeat: 'akainu-knockdown'
    },
    moves: [
        move({
            id: 'akainu-jab',
            name: 'Poing de magma',
            slot: 'light',
            animation: 'akainu-jab',
            // Six frames of startup on a light attack is slow enough to be
            // beaten by everyone else's, which is the trade for the damage.
            duration: 26,
            startup: 6,
            active: [[6, 9]],
            hitbox: { x: 20, y: 60, width: 88, height: 46 },
            hit: hit({ damage: 58, hitstun: 19, blockstun: 12, knockbackX: 3, hitstop: 8 }),
            meterCost: 0,
            cancelInto: ['akainu-smash', 'akainu-meteor', 'akainu-hound'],
            cancelWindow: [7, 22]
        }),
        move({
            id: 'akainu-smash',
            name: 'Grande Éruption',
            slot: 'heavy',
            animation: 'akainu-smash',
            duration: 48,
            startup: 14,
            active: [[14, 19]],
            hitbox: { x: 10, y: 24, width: 118, height: 150 },
            hit: hit({
                damage: 132,
                hitstun: 28,
                blockstun: 19,
                knockbackX: 5.6,
                knockbackY: 3.6,
                hitstop: 15,
                launcher: true
            }),
            meterCost: 0,
            cancelInto: ['akainu-hound'],
            cancelWindow: [15, 40],
            cameraShake: 10
        }),
        move({
            id: 'akainu-meteor',
            name: 'Météore',
            slot: 'special',
            animation: 'akainu-meteor',
            // A slow, heavy projectile: it is a wall to walk into rather than a
            // bullet to dodge, which is what a zoning move should be for a
            // character who cannot chase anybody down.
            duration: 44,
            startup: 13,
            active: [[13, 14]],
            hitbox: { x: 18, y: 54, width: 50, height: 52 },
            hit: hit({ damage: 22, hitstun: 12, blockstun: 9, knockbackX: 1.2, hitstop: 5 }),
            meterCost: 0,
            projectile: {
                spawnFrame: 14,
                offsetX: 58,
                offsetY: 64,
                speed: 8,
                lifetime: 86,
                box: { x: -26, y: -28, width: 56, height: 60 },
                hit: hit({ damage: 78, hitstun: 24, blockstun: 14, knockbackX: 4.4, hitstop: 10 }),
                animation: 'akainu-fx-magma',
                hits: 1,
                scale: 2
            },
            cancelInto: ['akainu-hound'],
            cancelWindow: [15, 38]
        }),
        move({
            id: 'akainu-hound',
            name: 'Chien Volcanique',
            slot: 'ultimate',
            animation: 'akainu-hound',
            duration: 82,
            startup: 26,
            active: [
                [26, 30],
                [38, 43]
            ],
            hitbox: { x: -20, y: 18, width: 236, height: 176 },
            hit: hit({
                damage: 178,
                chipDamage: 26,
                hitstun: 34,
                blockstun: 26,
                knockbackX: 6.4,
                knockbackY: 4.4,
                hitstop: 20,
                launcher: true,
                meterGainOnHit: 0,
                meterGainOnTakeHit: 40
            }),
            meterCost: 1000,
            invuln: [1, 27],
            startupFreeze: 48,
            cancelInto: [],
            cancelWindow: [0, 0],
            cameraShake: 26
        }),
        move({
            id: 'akainu-air-jab',
            name: 'Poing plongeant',
            slot: 'airLight',
            animation: 'akainu-jab',
            duration: 30,
            startup: 8,
            active: [[8, 14]],
            hitbox: { x: 12, y: -8, width: 92, height: 88 },
            hit: hit({ damage: 62, hitstun: 20, blockstun: 12, knockbackX: 3, hitstop: 8 }),
            meterCost: 0,
            airOnly: true,
            cancelInto: [],
            cancelWindow: [0, 0]
        }),
        move({
            id: 'akainu-air-smash',
            name: 'Éruption aérienne',
            slot: 'airHeavy',
            animation: 'akainu-smash',
            duration: 42,
            startup: 13,
            active: [[13, 19]],
            hitbox: { x: 4, y: -24, width: 110, height: 126 },
            hit: hit({
                damage: 104,
                hitstun: 26,
                blockstun: 15,
                knockbackX: 4.6,
                hitstop: 12,
                knockdown: true
            }),
            meterCost: 0,
            airOnly: true,
            cancelInto: [],
            cancelWindow: [0, 0]
        })
    ],
    spriteNotes: [
        'Seul personnage dont chaque coup au sol a sa propre animation, avec Luffy.',
        'La garde réutilise la pose accroupie de la planche, faute de garde dédiée dans le rip.',
        'Les deux coups aériens rejouent les animations au sol : la planche n’a pas d’attaque en l’air exploitable.'
    ]
};
