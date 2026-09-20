import type { CharacterDefinition } from '../types.js';
import { hit, move } from './helpers.js';

/**
 * Sir Crocodile — the zoner. He wants the fight at arm's length and has the
 * sand to keep it there: a hook that covers the ground in front of him, a
 * stream he can hold an opponent in, and a tornado that ends the round.
 *
 * The sand is what the sheet is full of and what the game never drew. Desert
 * Spada ends in a blast 198 px long and used to stop at 84; the ranged combo
 * that scatters sand as it goes had its whole row sitting unused.
 */
export const crocodile: CharacterDefinition = {
    id: 'crocodile',
    name: 'Crocodile',
    tagline: 'Sable à distance, portée longue, punition sèche.',
    texture: 'crocodile',
    portraitFrame: 'idle-1',
    color: '#c9a227',
    stats: {
        maxHealth: 1020,
        walkSpeed: 2.5,
        backSpeed: 2.3,
        jumpVelocity: 12.2,
        jumpForward: 3.8,
        gravity: 0.64,
        weight: 104,
        landingLag: 4,
        spriteScale: 2.2
    },
    hurtbox: {
        standing: { x: -27, y: 0, width: 54, height: 150 },
        air: { x: -27, y: 10, width: 54, height: 122 },
        down: { x: -48, y: 0, width: 96, height: 52 }
    },
    pushbox: { x: -29, y: 0, width: 58, height: 134 },
    animations: {
        idle: 'crocodile-idle',
        walk: 'crocodile-walk',
        walkBack: 'crocodile-walk',
        jumpRise: 'crocodile-jump',
        jumpFall: 'crocodile-jump',
        land: 'crocodile-idle',
        hurt: 'crocodile-hurt',
        guard: 'crocodile-guard',
        knockdown: 'crocodile-knockdown',
        victory: 'crocodile-idle',
        defeat: 'crocodile-knockdown'
    },
    hitEffects: {
        light: { animation: 'crocodile-fx-sand', scale: 1.2 },
        heavy: { animation: 'crocodile-fx-serpent', scale: 1.6 },
        block: { animation: 'crocodile-fx-sand', scale: 1 }
    },
    moves: [
        move({
            id: 'crocodile-slash',
            name: 'Crochet',
            slot: 'light',
            animation: 'crocodile-slash',
            duration: 24,
            startup: 6,
            active: [[6, 9]],
            impactFrame: 4,
            hitbox: { x: 22, y: 48, width: 92, height: 60 },
            hit: hit({ damage: 52, hitstun: 18, blockstun: 11, knockbackX: 2.6, hitstop: 6 }),
            effects: [{ animation: 'crocodile-fx-sand', frame: 6, offsetX: 84, offsetY: 66, scale: 1.6 }],
            meterCost: 0,
            cancelInto: ['crocodile-spada', 'crocodile-sables', 'crocodile-desert'],
            cancelWindow: [7, 21]
        }),
        move({
            id: 'crocodile-spada',
            name: 'Desert Spada',
            slot: 'heavy',
            animation: 'crocodile-spada',
            duration: 48,
            startup: 16,
            // The blade of sand keeps travelling after the thrust, so the move
            // stays live while it does.
            active: [[16, 26]],
            impactFrame: 8,
            hitbox: { x: 26, y: 20, width: 176, height: 96 },
            hit: hit({
                damage: 116,
                hitstun: 25,
                blockstun: 16,
                knockbackX: 5,
                hitstop: 12,
                knockdown: true
            }),
            effects: [
                { animation: 'crocodile-fx-serpent', frame: 16, offsetX: 120, offsetY: 56, scale: 2.2 },
                { animation: 'crocodile-fx-sand', frame: 21, offsetX: 190, offsetY: 46, scale: 2 }
            ],
            impactEffect: { animation: 'crocodile-fx-serpent', scale: 1.8 },
            meterCost: 0,
            cancelInto: ['crocodile-desert'],
            cancelWindow: [17, 40],
            cameraShake: 7
        }),
        move({
            id: 'crocodile-sables',
            name: 'Sables',
            slot: 'special',
            animation: 'crocodile-sables',
            duration: 54,
            // Three hits out of one held stream: the arm stays out and the
            // sand keeps coming, which is what its row in the rip draws.
            startup: 12,
            active: [
                [12, 14],
                [20, 22],
                [28, 31]
            ],
            impactFrame: 4,
            hitbox: { x: 24, y: 38, width: 150, height: 68 },
            hit: hit({ damage: 26, hitstun: 14, blockstun: 9, knockbackX: 1.2, hitstop: 5 }),
            effects: [
                { animation: 'crocodile-fx-sand', frame: 12, offsetX: 110, offsetY: 60, scale: 2 },
                { animation: 'crocodile-fx-sand', frame: 20, offsetX: 150, offsetY: 56, scale: 2.2 },
                { animation: 'crocodile-fx-burst', frame: 28, offsetX: 180, offsetY: 10, scale: 2.4 }
            ],
            meterCost: 0,
            // The sand leaves his hook in the middle of the combo and carries
            // on down the arena while he keeps hitting — the zoner's pattern,
            // and what the row draws.
            projectile: {
                spawnFrame: 15,
                offsetX: 120,
                offsetY: 54,
                speed: 8,
                lifetime: 110,
                box: { x: -36, y: -42, width: 76, height: 88 },
                hit: hit({ damage: 58, hitstun: 22, blockstun: 14, knockbackX: 4.4, hitstop: 8 }),
                animation: 'crocodile-fx-serpent',
                hits: 1,
                scale: 2.6
            },
            cancelInto: ['crocodile-desert'],
            cancelWindow: [30, 48]
        }),
        move({
            id: 'crocodile-desert',
            name: 'Desert Girasole',
            slot: 'ultimate',
            animation: 'crocodile-girasole',
            duration: 98,
            startup: 30,
            active: [
                [30, 38],
                [50, 64]
            ],
            impactFrame: 9,
            hitbox: { x: -60, y: 0, width: 290, height: 250 },
            hit: hit({
                damage: 166,
                chipDamage: 22,
                hitstun: 32,
                blockstun: 24,
                knockbackX: 5.6,
                knockbackY: 4.8,
                hitstop: 18,
                launcher: true,
                meterGainOnHit: 0,
                meterGainOnTakeHit: 40
            }),
            effects: [
                // The ground goes first and the sand comes up behind him, then
                // two funnels walk down the arena. Scaled to fill the screen:
                // at the size the first cut used, the finisher of the zoner
                // read as a puff of dust.
                { animation: 'crocodile-fx-burst', frame: 22, offsetX: 30, offsetY: 0, scale: 2.8, behind: true },
                { animation: 'crocodile-fx-serpent', frame: 30, offsetX: 110, offsetY: 70, scale: 2.8 },
                { animation: 'crocodile-fx-tornado', frame: 44, offsetX: 140, offsetY: 20, scale: 3.6, hold: 16 },
                { animation: 'crocodile-fx-tornado', frame: 54, offsetX: 240, offsetY: 10, scale: 3, hold: 12 },
                { animation: 'crocodile-fx-sand', frame: 62, offsetX: 190, offsetY: 90, scale: 2.4 }
            ],
            impactEffect: { animation: 'crocodile-fx-tornado', scale: 1.8 },
            meterCost: 1000,
            invuln: [1, 32],
            startupFreeze: 32,
            cancelInto: [],
            cancelWindow: [0, 0],
            cameraShake: 24
        }),
        move({
            id: 'crocodile-air-slash',
            name: 'Crochet ascendant',
            slot: 'airLight',
            animation: 'crocodile-air-hook',
            duration: 30,
            startup: 8,
            active: [[8, 14]],
            impactFrame: 5,
            hitbox: { x: 16, y: -4, width: 106, height: 92 },
            hit: hit({ damage: 56, hitstun: 19, blockstun: 11, knockbackX: 2.8, hitstop: 7 }),
            effects: [{ animation: 'crocodile-fx-sand', frame: 8, offsetX: 84, offsetY: 40, scale: 1 }],
            meterCost: 0,
            airOnly: true,
            cancelInto: [],
            cancelWindow: [0, 0]
        }),
        move({
            id: 'crocodile-air-spada',
            name: 'Desert Grave',
            slot: 'airHeavy',
            animation: 'crocodile-grave',
            duration: 42,
            startup: 12,
            active: [[12, 20]],
            impactFrame: 7,
            // He dives forward and the claw of sand trails behind him, so the
            // box sits on his body rather than on the trail.
            hitbox: { x: -8, y: -28, width: 112, height: 128 },
            hit: hit({
                damage: 98,
                hitstun: 25,
                blockstun: 14,
                knockbackX: 4,
                hitstop: 11,
                knockdown: true
            }),
            effects: [{ animation: 'crocodile-fx-burst', frame: 12, offsetX: -20, offsetY: 0, scale: 1.5 }],
            meterCost: 0,
            airOnly: true,
            cancelInto: [],
            cancelWindow: [0, 0],
            cameraShake: 6
        })
    ],
    spriteNotes: [
        'Sables est un vrai combo à distance : trois passages, puis le sable part seul.',
        'Le sable vient des rangées d’effets de la planche, jamais publiées avant.'
    ]
};
