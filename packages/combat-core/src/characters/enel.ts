import type { CharacterDefinition } from '../types.js';
import { hit, move } from './helpers.js';

/**
 * Enel — the glass cannon. The smallest health pool and the lightest frame,
 * against the highest damage per hit and the fastest projectile in the game.
 * Two clean reads win him a round; two mistakes lose him one.
 */
export const enel: CharacterDefinition = {
    id: 'enel',
    name: 'Enel',
    tagline: 'Dégâts bruts, foudre instantanée, très peu de points de vie.',
    texture: 'enel',
    portraitFrame: 'idle-1',
    color: '#f0c419',
    stats: {
        maxHealth: 860,
        walkSpeed: 2.9,
        backSpeed: 2.6,
        jumpVelocity: 13.4,
        jumpForward: 4.6,
        gravity: 0.58,
        weight: 86,
        landingLag: 3,
        spriteScale: 2.2
    },
    hurtbox: {
        standing: { x: -25, y: 0, width: 50, height: 152 },
        air: { x: -25, y: 8, width: 50, height: 124 },
        down: { x: -46, y: 0, width: 92, height: 52 }
    },
    pushbox: { x: -27, y: 0, width: 54, height: 134 },
    animations: {
        idle: 'enel-idle',
        walk: 'enel-walk',
        walkBack: 'enel-walk',
        jumpRise: 'enel-jump',
        jumpFall: 'enel-jump',
        land: 'enel-idle',
        hurt: 'enel-hurt',
        guard: 'enel-guard',
        knockdown: 'enel-hurt',
        victory: 'enel-idle',
        defeat: 'enel-hurt'
    },
    moves: [
        move({
            id: 'enel-staff',
            name: 'Coup de bâton',
            slot: 'light',
            animation: 'enel-staff',
            duration: 21,
            startup: 5,
            active: [[5, 8]],
            hitbox: { x: 18, y: 58, width: 92, height: 44 },
            hit: hit({ damage: 50, hitstun: 18, blockstun: 11, knockbackX: 2.8, hitstop: 6 }),
            meterCost: 0,
            cancelInto: ['enel-thunder', 'enel-bolt', 'enel-raigo'],
            cancelWindow: [6, 19]
        }),
        move({
            id: 'enel-thunder',
            name: 'El Thor',
            slot: 'heavy',
            animation: 'enel-thunder',
            duration: 42,
            startup: 12,
            active: [[12, 17]],
            hitbox: { x: 16, y: 30, width: 104, height: 160 },
            hit: hit({
                damage: 118,
                hitstun: 26,
                blockstun: 17,
                knockbackX: 5.2,
                knockbackY: 4.2,
                hitstop: 13,
                launcher: true
            }),
            meterCost: 0,
            cancelInto: ['enel-raigo'],
            cancelWindow: [13, 34],
            cameraShake: 8
        }),
        move({
            id: 'enel-bolt',
            name: 'Éclair de 30 millions de volts',
            slot: 'special',
            animation: 'enel-staff',
            duration: 36,
            startup: 10,
            active: [[10, 11]],
            hitbox: { x: 16, y: 56, width: 44, height: 46 },
            hit: hit({ damage: 18, hitstun: 10, blockstun: 8, knockbackX: 1, hitstop: 4 }),
            meterCost: 0,
            projectile: {
                spawnFrame: 11,
                offsetX: 54,
                offsetY: 62,
                speed: 13,
                lifetime: 70,
                box: { x: -22, y: -24, width: 48, height: 52 },
                hit: hit({ damage: 64, hitstun: 22, blockstun: 12, knockbackX: 4.8, hitstop: 8 }),
                animation: 'fx-bolt',
                hits: 1,
                scale: 2
            },
            cancelInto: ['enel-raigo'],
            cancelWindow: [12, 30]
        }),
        move({
            id: 'enel-raigo',
            name: 'Raigo',
            slot: 'ultimate',
            animation: 'enel-thunder',
            duration: 78,
            startup: 24,
            active: [
                [24, 27],
                [34, 38]
            ],
            hitbox: { x: -40, y: 20, width: 220, height: 190 },
            hit: hit({
                damage: 170,
                chipDamage: 22,
                hitstun: 32,
                blockstun: 24,
                knockbackX: 6,
                knockbackY: 5,
                hitstop: 18,
                launcher: true,
                meterGainOnHit: 0,
                meterGainOnTakeHit: 40
            }),
            meterCost: 1000,
            invuln: [1, 25],
            startupFreeze: 46,
            cancelInto: [],
            cancelWindow: [0, 0],
            cameraShake: 24
        }),
        move({
            id: 'enel-air-staff',
            name: 'Bâton descendant',
            slot: 'airLight',
            animation: 'enel-staff',
            duration: 26,
            startup: 6,
            active: [[6, 12]],
            hitbox: { x: 10, y: -4, width: 86, height: 84 },
            hit: hit({ damage: 54, hitstun: 19, blockstun: 11, knockbackX: 2.8, hitstop: 7 }),
            meterCost: 0,
            airOnly: true,
            cancelInto: [],
            cancelWindow: [0, 0]
        }),
        move({
            id: 'enel-air-thunder',
            name: 'Foudre aérienne',
            slot: 'airHeavy',
            animation: 'enel-thunder',
            duration: 36,
            startup: 10,
            active: [[10, 16]],
            hitbox: { x: 4, y: -20, width: 98, height: 118 },
            hit: hit({
                damage: 90,
                hitstun: 24,
                blockstun: 14,
                knockbackX: 4.2,
                hitstop: 10,
                knockdown: true
            }),
            meterCost: 0,
            airOnly: true,
            cancelInto: [],
            cancelWindow: [0, 0]
        })
    ],
    spriteNotes: [
        'Deux animations d’attaque dans le rip (bâton et foudre) réparties sur les six coups.',
        'Le Raigo rejoue El Thor avec une fenêtre active double et un effet plein écran.'
    ]
};
