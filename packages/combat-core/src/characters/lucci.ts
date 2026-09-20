import type { CharacterDefinition } from '../types.js';
import { hit, move } from './helpers.js';

/**
 * Rob Lucci — the rushdown. The fastest walk and the shortest startups in the
 * roster, paid for with a thin health bar and almost no range: every one of his
 * moves wants him already inside.
 *
 * His Rokuōgan used to play a row of a leopard *running*. The real one is five
 * rows further down — the beast form, the discharge, and the rings it sends
 * out — and it is what the ultimate plays now.
 */
export const lucci: CharacterDefinition = {
    id: 'lucci',
    name: 'Rob Lucci',
    tagline: 'Vitesse, pressions courtes, Rokuōgan en finisseur.',
    texture: 'lucci',
    portraitFrame: 'idle-1',
    color: '#8e6bd6',
    stats: {
        maxHealth: 940,
        walkSpeed: 3.2,
        backSpeed: 2.8,
        jumpVelocity: 13,
        jumpForward: 5,
        gravity: 0.66,
        weight: 92,
        landingLag: 2,
        spriteScale: 2.2
    },
    hurtbox: {
        standing: { x: -24, y: 0, width: 48, height: 146 },
        air: { x: -24, y: 8, width: 48, height: 118 },
        down: { x: -44, y: 0, width: 88, height: 50 }
    },
    pushbox: { x: -26, y: 0, width: 52, height: 130 },
    animations: {
        idle: 'lucci-idle',
        walk: 'lucci-walk',
        walkBack: 'lucci-walk',
        jumpRise: 'lucci-jump',
        jumpFall: 'lucci-jump',
        land: 'lucci-idle',
        hurt: 'lucci-hurt',
        guard: 'lucci-guard',
        knockdown: 'lucci-knockdown',
        victory: 'lucci-idle',
        defeat: 'lucci-knockdown'
    },
    hitEffects: {
        light: { animation: 'lucci-fx-spikes', scale: 0.8 },
        heavy: { animation: 'lucci-fx-rings', scale: 1.6 },
        block: { animation: 'lucci-fx-spiral', scale: 0.9 }
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
            impactFrame: 2,
            hitbox: { x: 18, y: 62, width: 60, height: 36 },
            hit: hit({ damage: 42, hitstun: 16, blockstun: 10, knockbackX: 2, hitstop: 5 }),
            meterCost: 0,
            cancelInto: ['lucci-rankyaku', 'lucci-leopard', 'lucci-sai-dai'],
            cancelWindow: [4, 14]
        }),
        move({
            id: 'lucci-rankyaku',
            name: 'Rankyaku',
            slot: 'heavy',
            animation: 'lucci-rankyaku',
            duration: 44,
            startup: 12,
            active: [[12, 18]],
            impactFrame: 3,
            // The blade goes up rather than out: the kick covers 180 px of
            // height and barely 60 of reach.
            hitbox: { x: 14, y: 30, width: 76, height: 150 },
            hit: hit({
                damage: 104,
                hitstun: 25,
                blockstun: 15,
                knockbackX: 4,
                knockbackY: 3.6,
                hitstop: 12,
                launcher: true
            }),
            effects: [{ animation: 'lucci-fx-spiral', frame: 12, offsetX: 56, offsetY: 120, scale: 1.4 }],
            impactEffect: { animation: 'lucci-fx-spiral', scale: 1.5 },
            meterCost: 0,
            cancelInto: ['lucci-sai-dai'],
            cancelWindow: [13, 36],
            cameraShake: 6
        }),
        move({
            id: 'lucci-leopard',
            name: 'Shigan Madara',
            slot: 'special',
            animation: 'lucci-madara',
            duration: 46,
            // Four thrusts, each one an arrow leaving his hand.
            startup: 9,
            active: [
                [9, 11],
                [15, 17],
                [21, 23],
                [28, 32]
            ],
            impactFrame: 3,
            hitbox: { x: 20, y: 44, width: 112, height: 62 },
            hit: hit({ damage: 27, hitstun: 14, blockstun: 9, knockbackX: 1.2, hitstop: 5 }),
            effects: [
                { animation: 'lucci-fx-spikes', frame: 9, offsetX: 96, offsetY: 72, scale: 0.9 },
                { animation: 'lucci-fx-spikes', frame: 21, offsetX: 118, offsetY: 68, scale: 1 },
                { animation: 'lucci-fx-rings', frame: 28, offsetX: 130, offsetY: 70, scale: 1.4 }
            ],
            meterCost: 0,
            cancelInto: ['lucci-sai-dai'],
            cancelWindow: [24, 40]
        }),
        move({
            id: 'lucci-sai-dai',
            name: 'Rokuōgan',
            slot: 'ultimate',
            animation: 'lucci-rokuogan',
            duration: 86,
            startup: 26,
            active: [
                [26, 34],
                [44, 54]
            ],
            impactFrame: 2,
            hitbox: { x: -40, y: 0, width: 250, height: 210 },
            hit: hit({
                damage: 172,
                chipDamage: 24,
                hitstun: 32,
                blockstun: 24,
                knockbackX: 6.6,
                hitstop: 18,
                knockdown: true,
                meterGainOnHit: 0,
                meterGainOnTakeHit: 40
            }),
            effects: [
                { animation: 'lucci-fx-spikes', frame: 22, offsetX: 90, offsetY: 80, scale: 1.6 },
                { animation: 'lucci-fx-rings', frame: 26, offsetX: 140, offsetY: 80, scale: 2.6, hold: 10 },
                { animation: 'lucci-fx-rings', frame: 44, offsetX: 210, offsetY: 80, scale: 3, hold: 12 },
                { animation: 'lucci-fx-spiral', frame: 48, offsetX: 170, offsetY: 90, scale: 2 }
            ],
            impactEffect: { animation: 'lucci-fx-rings', scale: 2.4 },
            meterCost: 1000,
            invuln: [1, 28],
            startupFreeze: 32,
            cancelInto: [],
            cancelWindow: [0, 0],
            cameraShake: 22
        }),
        move({
            id: 'lucci-air-shigan',
            name: 'Coup de pied aérien',
            slot: 'airLight',
            animation: 'lucci-air-kick',
            duration: 24,
            startup: 5,
            active: [[5, 11]],
            impactFrame: 2,
            hitbox: { x: 12, y: -6, width: 82, height: 78 },
            hit: hit({ damage: 48, hitstun: 18, blockstun: 11, knockbackX: 2.6, hitstop: 6 }),
            meterCost: 0,
            airOnly: true,
            cancelInto: [],
            cancelWindow: [0, 0]
        }),
        move({
            id: 'lucci-air-leopard',
            name: 'Rankyaku aérien',
            slot: 'airHeavy',
            animation: 'lucci-air-rankyaku',
            duration: 36,
            startup: 9,
            active: [[9, 16]],
            impactFrame: 3,
            hitbox: { x: 6, y: -24, width: 104, height: 118 },
            hit: hit({
                damage: 92,
                hitstun: 24,
                blockstun: 14,
                knockbackX: 3.8,
                hitstop: 10,
                knockdown: true
            }),
            effects: [{ animation: 'lucci-fx-spiral', frame: 9, offsetX: 60, offsetY: 20, scale: 1.2 }],
            meterCost: 0,
            airOnly: true,
            cancelInto: [],
            cancelWindow: [0, 0]
        })
    ],
    spriteNotes: [
        'Le Rokuōgan joue enfin la forme léopard et ses ondes de choc.',
        'Shigan Madara est un vrai enchaînement : quatre passages sur un seul geste.'
    ]
};
