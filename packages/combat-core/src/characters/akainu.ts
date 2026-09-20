import type { CharacterDefinition } from '../types.js';
import { hit, move } from './helpers.js';

/**
 * Sakazuki "Akainu" — the wall. The deepest health pool, the heaviest frame and
 * the slowest walk, against a kit that hurts more than anyone's once it lands.
 *
 * Magma is the whole point of the character and none of it used to reach the
 * screen: eight rows of it sit beside him in the rip — the fist he throws, the
 * geysers that come up through the floor, the burst a blow leaves behind — and
 * the game drew Luffy's rubber smoke on every hit instead.
 */
export const akainu: CharacterDefinition = {
    id: 'akainu',
    name: 'Akainu',
    tagline: 'Lent, lourd, et chaque coup de magma coûte cher.',
    texture: 'akainu',
    portraitFrame: 'idle-1',
    color: '#d63b28',
    stats: {
        maxHealth: 1180,
        walkSpeed: 2.2,
        backSpeed: 1.8,
        jumpVelocity: 11.8,
        jumpForward: 3.4,
        gravity: 0.7,
        weight: 128,
        landingLag: 6,
        spriteScale: 2.2
    },
    hurtbox: {
        standing: { x: -30, y: 0, width: 60, height: 158 },
        air: { x: -30, y: 10, width: 60, height: 128 },
        down: { x: -52, y: 0, width: 104, height: 54 }
    },
    pushbox: { x: -32, y: 0, width: 64, height: 142 },
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
    hitEffects: {
        light: { animation: 'akainu-fx-magma', scale: 1.6 },
        heavy: { animation: 'akainu-fx-burst', scale: 2.2 },
        block: { animation: 'akainu-fx-magma', scale: 1.1 }
    },
    moves: [
        move({
            id: 'akainu-jab',
            name: 'Poing de magma',
            slot: 'light',
            animation: 'akainu-punch',
            duration: 26,
            startup: 6,
            active: [[6, 10]],
            impactFrame: 5,
            hitbox: { x: 22, y: 52, width: 76, height: 58 },
            hit: hit({ damage: 58, hitstun: 18, blockstun: 12, knockbackX: 2.6, hitstop: 7 }),
            effects: [{ animation: 'akainu-fx-magma', frame: 6, offsetX: 76, offsetY: 88, scale: 1.4 }],
            meterCost: 0,
            cancelInto: ['akainu-hound', 'akainu-meteor', 'akainu-funka'],
            cancelWindow: [7, 23]
        }),
        move({
            id: 'akainu-hound',
            name: 'Inugami Guren',
            slot: 'heavy',
            animation: 'akainu-hound',
            duration: 52,
            startup: 14,
            active: [[14, 22]],
            impactFrame: 4,
            // The magma hound is drawn 205 px past his feet on the frame it
            // lands. That is the move's real range and now the box's too.
            hitbox: { x: 28, y: 12, width: 180, height: 132 },
            hit: hit({
                damage: 126,
                hitstun: 26,
                blockstun: 16,
                knockbackX: 5.4,
                hitstop: 14,
                knockdown: true
            }),
            effects: [
                { animation: 'akainu-fx-spikes', frame: 13, offsetX: 140, offsetY: 30, scale: 1.6 },
                { animation: 'akainu-fx-magma', frame: 18, offsetX: 176, offsetY: 70, scale: 1.8 }
            ],
            impactEffect: { animation: 'akainu-fx-spikes', scale: 2 },
            meterCost: 0,
            cancelInto: ['akainu-funka'],
            cancelWindow: [15, 44],
            cameraShake: 9
        }),
        move({
            id: 'akainu-meteor',
            name: 'Meigō',
            slot: 'special',
            animation: 'akainu-meigo',
            duration: 50,
            startup: 16,
            active: [[16, 19]],
            // `akainu-meigo` runs from the stance to the arm at full stretch,
            // and the magma leaves the fist on the seventh drawing. Naming the
            // last drawing as the impact left nothing to play afterwards, so
            // the move stopped dead on that pose for the whole recovery —
            // thirty-four frames of a frozen lunge.
            impactFrame: 6,
            hitbox: { x: 30, y: 40, width: 120, height: 76 },
            hit: hit({ damage: 30, hitstun: 12, blockstun: 9, knockbackX: 1.4, hitstop: 5 }),
            meterCost: 0,
            projectile: {
                spawnFrame: 19,
                offsetX: 150,
                offsetY: 88,
                speed: 9,
                lifetime: 80,
                box: { x: -40, y: -40, width: 84, height: 82 },
                hit: hit({
                    damage: 86,
                    hitstun: 24,
                    blockstun: 14,
                    knockbackX: 5,
                    hitstop: 11,
                    knockdown: true
                }),
                animation: 'akainu-fx-comet',
                hits: 1,
                scale: 1.6
            },
            cancelInto: ['akainu-funka'],
            cancelWindow: [20, 42]
        }),
        move({
            id: 'akainu-funka',
            name: 'Dai Funka',
            slot: 'ultimate',
            animation: 'akainu-funka',
            duration: 96,
            startup: 32,
            active: [
                [32, 40],
                [52, 62]
            ],
            // Same as the Meigō: the fist lands well before the last drawing
            // of `akainu-funka`, and pinning the impact on frame eleven of
            // twelve froze the ultimate for its second half.
            impactFrame: 8,
            hitbox: { x: -50, y: 0, width: 300, height: 260 },
            hit: hit({
                damage: 178,
                chipDamage: 24,
                hitstun: 32,
                blockstun: 24,
                knockbackX: 6.4,
                knockbackY: 4.6,
                hitstop: 20,
                launcher: true,
                meterGainOnHit: 0,
                meterGainOnTakeHit: 40
            }),
            effects: [
                // The floor goes first, then the fist, then everything that was
                // thrown up comes back down.
                { animation: 'akainu-fx-eruption', frame: 24, offsetX: 60, offsetY: 0, scale: 1.7 },
                { animation: 'akainu-fx-eruption', frame: 30, offsetX: 190, offsetY: 0, scale: 1.7 },
                { animation: 'akainu-fx-burst', frame: 34, offsetX: 130, offsetY: 110, scale: 2.6 },
                { animation: 'akainu-fx-spikes', frame: 52, offsetX: 100, offsetY: 60, scale: 2.4 },
                { animation: 'akainu-fx-rain', frame: 58, offsetX: 120, offsetY: 200, scale: 2 }
            ],
            impactEffect: { animation: 'akainu-fx-burst', scale: 2.8 },
            meterCost: 1000,
            invuln: [1, 34],
            startupFreeze: 32,
            cancelInto: [],
            cancelWindow: [0, 0],
            cameraShake: 26
        }),
        move({
            id: 'akainu-air-jab',
            name: 'Bras de magma',
            slot: 'airLight',
            animation: 'akainu-reach',
            duration: 32,
            startup: 9,
            active: [[9, 15]],
            impactFrame: 5,
            // The arm stretches out in front rather than dropping, so the box
            // is long and flat.
            hitbox: { x: 24, y: -6, width: 140, height: 72 },
            hit: hit({ damage: 62, hitstun: 20, blockstun: 12, knockbackX: 3.2, hitstop: 8 }),
            effects: [{ animation: 'akainu-fx-magma', frame: 10, offsetX: 136, offsetY: 30, scale: 1.4 }],
            meterCost: 0,
            airOnly: true,
            cancelInto: [],
            cancelWindow: [0, 0]
        }),
        move({
            id: 'akainu-air-smash',
            name: 'Écrasement volcanique',
            slot: 'airHeavy',
            animation: 'akainu-smash',
            duration: 44,
            startup: 13,
            active: [[13, 20]],
            impactFrame: 6,
            hitbox: { x: -20, y: -24, width: 130, height: 140 },
            hit: hit({
                damage: 104,
                hitstun: 26,
                blockstun: 15,
                knockbackX: 4,
                hitstop: 12,
                knockdown: true
            }),
            effects: [{ animation: 'akainu-fx-spikes', frame: 13, offsetX: 50, offsetY: 0, scale: 1.8 }],
            meterCost: 0,
            airOnly: true,
            cancelInto: [],
            cancelWindow: [0, 0],
            cameraShake: 7
        })
    ],
    spriteNotes: [
        'Six coups, six animations : le rip en contient soixante-quinze rangées.',
        'Le magma est enfin branché — geysers, comète, éclats et retombées.'
    ]
};
