import type { CharacterDefinition } from '../types.js';
import { hit, move } from './helpers.js';

/**
 * Rob Lucci — the rushdown. Fastest walk of the roster, the shortest jab in
 * the game and the longest cancel windows, so he lives on pressure and wins
 * by chaining rather than by any single hit.
 *
 * His sheet only holds two attack animations (Shigan and the Leopard kick).
 * Rather than invent frames, the four attack slots reuse those two with
 * genuinely different frame data, reach and purpose. That limitation is listed
 * in `spriteNotes` and surfaced on the character select screen.
 */
export const lucci: CharacterDefinition = {
    id: 'lucci',
    name: 'Rob Lucci',
    tagline: 'Pression constante, enchaînements longs, dégâts par accumulation.',
    texture: 'lucci',
    portraitFrame: 'idle-1',
    color: '#2f6fe2',
    stats: {
        maxHealth: 940,
        walkSpeed: 3.3,
        backSpeed: 2.8,
        jumpVelocity: 12.9,
        jumpForward: 5,
        gravity: 0.66,
        weight: 92,
        landingLag: 2,
        spriteScale: 2.2
    },
    hurtbox: {
        standing: { x: -24, y: 0, width: 48, height: 150 },
        air: { x: -24, y: 8, width: 48, height: 122 },
        down: { x: -44, y: 0, width: 88, height: 50 }
    },
    pushbox: { x: -26, y: 0, width: 52, height: 132 },
    animations: {
        idle: 'lucci-idle',
        walk: 'lucci-walk',
        walkBack: 'lucci-walk',
        jumpRise: 'lucci-jump',
        jumpFall: 'lucci-jump',
        land: 'lucci-idle',
        hurt: 'lucci-hurt',
        guard: 'lucci-guard',
        knockdown: 'lucci-hurt',
        victory: 'lucci-idle',
        defeat: 'lucci-hurt'
    },
    moves: [
        move({
            id: 'lucci-shigan',
            name: 'Shigan',
            slot: 'light',
            animation: 'lucci-shigan',
            duration: 16,
            startup: 3,
            active: [[3, 5]],
            hitbox: { x: 16, y: 66, width: 58, height: 36 },
            hit: hit({ damage: 38, hitstun: 18, blockstun: 11, knockbackX: 1.8, hitstop: 5 }),
            meterCost: 0,
            cancelInto: ['lucci-leopard', 'lucci-rankyaku', 'lucci-sai-dai'],
            cancelWindow: [4, 15]
        }),
        move({
            id: 'lucci-leopard',
            name: 'Coup de griffe léopard',
            slot: 'heavy',
            animation: 'lucci-leopard',
            duration: 34,
            startup: 9,
            active: [[9, 13]],
            hitbox: { x: 20, y: 54, width: 108, height: 62 },
            hit: hit({ damage: 84, hitstun: 22, blockstun: 14, knockbackX: 5.4, hitstop: 10 }),
            meterCost: 0,
            momentum: { frame: 8, x: 3.2, y: 0 },
            cancelInto: ['lucci-rankyaku', 'lucci-sai-dai'],
            cancelWindow: [10, 28],
            cameraShake: 4
        }),
        move({
            id: 'lucci-rankyaku',
            name: 'Rankyaku — lame d’air',
            slot: 'special',
            animation: 'lucci-leopard',
            duration: 44,
            startup: 12,
            active: [[12, 14]],
            hitbox: { x: 14, y: 50, width: 60, height: 70 },
            hit: hit({ damage: 30, hitstun: 16, blockstun: 10, knockbackX: 2, hitstop: 6 }),
            meterCost: 0,
            projectile: {
                spawnFrame: 14,
                offsetX: 60,
                offsetY: 60,
                speed: 9,
                lifetime: 70,
                box: { x: -20, y: -26, width: 52, height: 62 },
                hit: hit({ damage: 52, hitstun: 20, blockstun: 12, knockbackX: 4, hitstop: 8 }),
                animation: 'fx-slash',
                hits: 1,
                scale: 2
            },
            cancelInto: ['lucci-sai-dai'],
            cancelWindow: [15, 34]
        }),
        move({
            id: 'lucci-sai-dai',
            name: 'Rokuogan',
            slot: 'ultimate',
            animation: 'lucci-shigan',
            duration: 70,
            startup: 20,
            active: [
                [20, 22],
                [26, 28],
                [32, 34],
                [38, 42]
            ],
            hitbox: { x: 16, y: 40, width: 186, height: 110 },
            hit: hit({
                damage: 92,
                chipDamage: 12,
                hitstun: 26,
                blockstun: 20,
                knockbackX: 3,
                hitstop: 12,
                meterGainOnHit: 0,
                meterGainOnTakeHit: 18
            }),
            meterCost: 1000,
            invuln: [1, 21],
            startupFreeze: 40,
            cancelInto: [],
            cancelWindow: [0, 0],
            cameraShake: 18
        }),
        move({
            id: 'lucci-air-shigan',
            name: 'Shigan aérien',
            slot: 'airLight',
            animation: 'lucci-shigan',
            duration: 26,
            startup: 5,
            active: [[5, 10]],
            hitbox: { x: 10, y: 6, width: 68, height: 74 },
            hit: hit({ damage: 52, hitstun: 19, blockstun: 11, knockbackX: 2.8, hitstop: 7 }),
            meterCost: 0,
            airOnly: true,
            cancelInto: [],
            cancelWindow: [0, 0]
        }),
        move({
            id: 'lucci-air-leopard',
            name: 'Plongeon léopard',
            slot: 'airHeavy',
            animation: 'lucci-leopard',
            duration: 32,
            startup: 8,
            active: [[8, 16]],
            hitbox: { x: 6, y: -16, width: 92, height: 104 },
            hit: hit({
                damage: 76,
                hitstun: 24,
                blockstun: 13,
                knockbackX: 4,
                hitstop: 9,
                knockdown: true
            }),
            meterCost: 0,
            airOnly: true,
            momentum: { frame: 7, x: 4, y: -4 },
            cancelInto: [],
            cancelWindow: [0, 0]
        })
    ],
    spriteNotes: [
        'La planche ne contient que deux animations d’attaque : les six coups les réutilisent avec des données de frames distinctes.',
        'Le Rokuogan rejoue le Shigan, faute d’animation dédiée dans le rip.'
    ]
};
