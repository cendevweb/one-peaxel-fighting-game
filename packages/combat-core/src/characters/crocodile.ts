import type { CharacterDefinition } from '../types.js';
import { hit, move } from './helpers.js';

/**
 * Crocodile — the zoner. Slowest walk, heaviest frame, and the only fighter
 * whose neutral game is a projectile: Sables sends a sand blade across the
 * arena and his super fills the screen with three of them. He loses the
 * scramble and wins the spacing war.
 */
export const crocodile: CharacterDefinition = {
    id: 'crocodile',
    name: 'Crocodile',
    tagline: 'Contrôle de l’espace, projectiles de sable, punition lourde.',
    texture: 'crocodile',
    portraitFrame: 'idle-1',
    color: '#c9a227',
    stats: {
        maxHealth: 1040,
        walkSpeed: 2.1,
        backSpeed: 1.8,
        jumpVelocity: 11.8,
        jumpForward: 3.4,
        gravity: 0.6,
        weight: 118,
        landingLag: 5,
        spriteScale: 2.2
    },
    hurtbox: {
        standing: { x: -28, y: 0, width: 56, height: 156 },
        air: { x: -28, y: 10, width: 56, height: 126 },
        down: { x: -50, y: 0, width: 100, height: 54 }
    },
    pushbox: { x: -31, y: 0, width: 62, height: 138 },
    animations: {
        idle: 'crocodile-idle',
        walk: 'crocodile-walk',
        walkBack: 'crocodile-walk',
        jumpRise: 'crocodile-jump',
        jumpFall: 'crocodile-jump',
        land: 'crocodile-idle',
        hurt: 'crocodile-hurt',
        guard: 'crocodile-guard',
        knockdown: 'crocodile-hurt',
        victory: 'crocodile-idle',
        defeat: 'crocodile-hurt'
    },
    moves: [
        move({
            id: 'crocodile-slash',
            name: 'Crochet',
            slot: 'light',
            animation: 'crocodile-slash',
            duration: 22,
            startup: 5,
            active: [[5, 8]],
            hitbox: { x: 20, y: 60, width: 82, height: 46 },
            hit: hit({ damage: 52, hitstun: 18, blockstun: 12, knockbackX: 2.6, hitstop: 7 }),
            meterCost: 0,
            cancelInto: ['crocodile-spada', 'crocodile-sables', 'crocodile-desert'],
            cancelWindow: [6, 20]
        }),
        move({
            id: 'crocodile-spada',
            name: 'Desert Spada',
            slot: 'heavy',
            animation: 'crocodile-spada',
            duration: 44,
            startup: 13,
            active: [[13, 19]],
            hitbox: { x: 24, y: 40, width: 150, height: 108 },
            hit: hit({
                damage: 108,
                hitstun: 26,
                blockstun: 16,
                knockbackX: 6,
                knockbackY: 3.6,
                hitstop: 12,
                launcher: true
            }),
            meterCost: 0,
            cancelInto: ['crocodile-desert'],
            cancelWindow: [14, 36],
            cameraShake: 7
        }),
        move({
            id: 'crocodile-sables',
            name: 'Sables — lame de sable',
            slot: 'special',
            animation: 'crocodile-slash',
            duration: 40,
            startup: 12,
            active: [[12, 13]],
            hitbox: { x: 18, y: 58, width: 46, height: 44 },
            hit: hit({ damage: 22, hitstun: 12, blockstun: 9, knockbackX: 1.4, hitstop: 5 }),
            meterCost: 0,
            projectile: {
                spawnFrame: 13,
                offsetX: 58,
                offsetY: 46,
                speed: 7,
                lifetime: 110,
                box: { x: -24, y: -30, width: 56, height: 64 },
                hit: hit({ damage: 58, hitstun: 22, blockstun: 14, knockbackX: 4.4, hitstop: 8 }),
                animation: 'fx-sand',
                hits: 1,
                scale: 2.2
            },
            cancelInto: ['crocodile-desert'],
            cancelWindow: [14, 32]
        }),
        move({
            id: 'crocodile-desert',
            name: 'Desert Girasole',
            slot: 'ultimate',
            animation: 'crocodile-spada',
            duration: 80,
            startup: 22,
            active: [[22, 24]],
            hitbox: { x: 14, y: 30, width: 120, height: 130 },
            hit: hit({
                damage: 90,
                chipDamage: 14,
                hitstun: 30,
                blockstun: 22,
                knockbackX: 3,
                hitstop: 14,
                meterGainOnHit: 0,
                meterGainOnTakeHit: 30
            }),
            meterCost: 1000,
            invuln: [1, 23],
            startupFreeze: 44,
            projectile: {
                spawnFrame: 24,
                offsetX: 46,
                offsetY: 54,
                speed: 6,
                lifetime: 150,
                box: { x: -34, y: -44, width: 76, height: 96 },
                hit: hit({
                    damage: 78,
                    chipDamage: 10,
                    hitstun: 26,
                    blockstun: 18,
                    knockbackX: 5,
                    knockbackY: 4,
                    hitstop: 12,
                    launcher: true,
                    meterGainOnHit: 0
                }),
                animation: 'fx-sand',
                hits: 3,
                scale: 3.2
            },
            cancelInto: [],
            cancelWindow: [0, 0],
            cameraShake: 20
        }),
        move({
            id: 'crocodile-air-slash',
            name: 'Crochet plongeant',
            slot: 'airLight',
            animation: 'crocodile-slash',
            duration: 28,
            startup: 7,
            active: [[7, 13]],
            hitbox: { x: 10, y: -6, width: 80, height: 88 },
            hit: hit({ damage: 58, hitstun: 20, blockstun: 12, knockbackX: 3, hitstop: 8 }),
            meterCost: 0,
            airOnly: true,
            cancelInto: [],
            cancelWindow: [0, 0]
        }),
        move({
            id: 'crocodile-air-spada',
            name: 'Spada aérienne',
            slot: 'airHeavy',
            animation: 'crocodile-spada',
            duration: 38,
            startup: 11,
            active: [[11, 18]],
            hitbox: { x: 8, y: -18, width: 104, height: 106 },
            hit: hit({
                damage: 86,
                hitstun: 24,
                blockstun: 14,
                knockbackX: 4.6,
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
        'Deux animations d’attaque dans le rip (Spada et le crochet) : elles portent les six coups.',
        'Les lames de sable sont un effet généré par le pipeline, pas une frame de la planche.'
    ]
};
