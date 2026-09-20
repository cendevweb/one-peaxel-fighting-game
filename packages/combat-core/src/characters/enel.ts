import type { CharacterDefinition } from '../types.js';
import { hit, move } from './helpers.js';

/**
 * Enel — the glass cannon. The smallest health pool and the lightest frame,
 * against the highest damage per hit and the fastest projectile in the game.
 * Two clean reads win him a round; two mistakes lose him one.
 *
 * His sheet carries far more than a staff. El Thor comes down as a pillar of
 * its own, the thirty-million-volt bolt is a chain that crosses the arena, and
 * the Raigo has both halves the move needs: the storm closing over him, and the
 * spheres it drops. All three were sitting in the rip unused while every one of
 * his six moves replayed one of two animations.
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
        knockdown: 'enel-knockdown',
        victory: 'enel-idle',
        defeat: 'enel-knockdown'
    },
    hitEffects: {
        light: { animation: 'enel-fx-spark', scale: 1.4 },
        heavy: { animation: 'enel-fx-spark', scale: 2.4 },
        block: { animation: 'enel-fx-spark', scale: 1.1 }
    },
    moves: [
        move({
            id: 'enel-staff',
            name: 'Coup de bâton',
            slot: 'light',
            animation: 'enel-staff',
            duration: 22,
            startup: 6,
            // The swing itself. The sprite reaches 163 px past his own feet on
            // that frame, so the hitbox does too — it used to stop at 110 and
            // the staff passed straight through the opponent.
            active: [[6, 9]],
            impactFrame: 3,
            hitbox: { x: 24, y: 54, width: 138, height: 54 },
            hit: hit({ damage: 50, hitstun: 18, blockstun: 11, knockbackX: 2.8, hitstop: 6 }),
            meterCost: 0,
            cancelInto: ['enel-thunder', 'enel-bolt', 'enel-raigo'],
            cancelWindow: [7, 20]
        }),
        move({
            id: 'enel-thunder',
            name: 'El Thor',
            slot: 'heavy',
            animation: 'enel-elthor',
            duration: 46,
            startup: 15,
            active: [[15, 21]],
            impactFrame: 3,
            // He raises the staff and the bolt comes down in front of him, so
            // the box is a tall column ahead rather than a swing at chest
            // height.
            hitbox: { x: 22, y: 0, width: 126, height: 226 },
            hit: hit({
                damage: 118,
                hitstun: 26,
                blockstun: 17,
                knockbackX: 5.2,
                knockbackY: 4.2,
                hitstop: 13,
                launcher: true
            }),
            effects: [
                { animation: 'enel-fx-pillar', frame: 13, offsetX: 86, offsetY: 210, scale: 1.5 },
                { animation: 'enel-fx-spark', frame: 16, offsetX: 86, offsetY: 30, scale: 2 }
            ],
            impactEffect: { animation: 'enel-fx-pillar', scale: 1.1 },
            meterCost: 0,
            cancelInto: ['enel-raigo'],
            cancelWindow: [16, 38],
            cameraShake: 8
        }),
        move({
            id: 'enel-bolt',
            name: 'Éclair de 30 millions de volts',
            slot: 'special',
            animation: 'enel-bolt',
            duration: 38,
            startup: 11,
            active: [[11, 12]],
            impactFrame: 4,
            hitbox: { x: 20, y: 52, width: 90, height: 50 },
            hit: hit({ damage: 18, hitstun: 10, blockstun: 8, knockbackX: 1, hitstop: 4 }),
            meterCost: 0,
            projectile: {
                spawnFrame: 12,
                offsetX: 104,
                offsetY: 74,
                speed: 15,
                lifetime: 64,
                // The bolt is drawn as one long chain rather than a ball, so the
                // box is long and shallow and matches what the player sees.
                box: { x: -86, y: -26, width: 176, height: 54 },
                hit: hit({ damage: 64, hitstun: 22, blockstun: 12, knockbackX: 4.8, hitstop: 8 }),
                animation: 'enel-fx-bolt',
                hits: 1,
                scale: 1
            },
            cancelInto: ['enel-raigo'],
            cancelWindow: [13, 32]
        }),
        move({
            id: 'enel-raigo',
            name: 'Raigo',
            slot: 'ultimate',
            animation: 'enel-raigo',
            duration: 96,
            startup: 30,
            // Two windows, and they are two different things on screen: the
            // storm closing over him, then the spheres coming down.
            active: [
                [30, 37],
                [50, 60]
            ],
            impactFrame: 5,
            hitbox: { x: -70, y: 0, width: 320, height: 290 },
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
            effects: [
                // The lightning beast first, behind him, then the sky opening,
                // then the spheres the Raigo actually is.
                { animation: 'enel-fx-dragon', frame: 8, offsetX: 40, offsetY: 120, scale: 2, behind: true },
                { animation: 'enel-fx-pillar', frame: 26, offsetX: -40, offsetY: 230, scale: 1.8 },
                { animation: 'enel-fx-pillar', frame: 30, offsetX: 150, offsetY: 230, scale: 1.8 },
                { animation: 'enel-fx-raigo', frame: 48, offsetX: 60, offsetY: 150, scale: 2.4, hold: 10 },
                { animation: 'enel-fx-raigo', frame: 54, offsetX: 170, offsetY: 110, scale: 1.8, hold: 8 }
            ],
            impactEffect: { animation: 'enel-fx-raigo', scale: 1.6 },
            meterCost: 1000,
            invuln: [1, 32],
            startupFreeze: 32,
            cancelInto: [],
            cancelWindow: [0, 0],
            cameraShake: 24
        }),
        move({
            id: 'enel-air-staff',
            name: 'Bâton descendant',
            slot: 'airLight',
            animation: 'enel-air-staff',
            duration: 26,
            startup: 7,
            active: [[7, 13]],
            impactFrame: 2,
            hitbox: { x: 4, y: -8, width: 92, height: 88 },
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
            animation: 'enel-air-swing',
            duration: 38,
            startup: 11,
            active: [[11, 17]],
            impactFrame: 5,
            // The arc sweeps behind him as much as in front, which is why the
            // box opens backwards too.
            hitbox: { x: -34, y: -18, width: 136, height: 126 },
            hit: hit({
                damage: 90,
                hitstun: 24,
                blockstun: 14,
                knockbackX: 4.2,
                hitstop: 10,
                knockdown: true
            }),
            effects: [{ animation: 'enel-fx-spark', frame: 11, offsetX: 50, offsetY: 40, scale: 1.6 }],
            meterCost: 0,
            airOnly: true,
            cancelInto: [],
            cancelWindow: [0, 0]
        })
    ],
    spriteNotes: [
        'Six coups, six animations distinctes : le rip en contenait bien assez.',
        'Le Raigo joue le mode foudre (la tempête se referme sur lui) puis lâche les sphères.'
    ]
};
