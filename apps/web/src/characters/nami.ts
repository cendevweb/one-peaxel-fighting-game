import manifest from '../generated/sprites/nami.json';
import type { CharacterDef, SpriteManifest } from '../engine/types';

/**
 * Nami — the navigator and her Clima-Tact. Light and quick, she keeps the
 * foe at a distance with the weather: Thunderbolt Tempo drops a thundercloud
 * a screen-length ahead and a lightning bolt falls from it, Mirage Tempo
 * melts her into a heat haze and she reappears lunging through the foe,
 * Cyclone Tempo knocks the cool and heat balls together into a gust, and the
 * rising water arc of the Swing Arm is her reversal. Fata Morgana (one bar)
 * fills the screen with mirages; Thunder Lance Tempo (two bars) raises a
 * storm over the stage and fires a spear of lightning across it.
 *
 * Every animation and effect comes from the Gigant Battle DS sheet
 * (tools/sprites/chars/nami.json). Every `durations` array has one entry
 * per animation frame.
 */
export const nami: CharacterDef = {
    id: 'nami',
    name: 'Nami',
    title: 'Chatte voleuse',
    health: 940,
    walk: 1.7,
    back: 1.4,
    dash: 5.0,
    backdash: [4.0, 2.8],
    jump: [2.4, 7.3],
    gravity: 0.37,
    width: 11,
    height: 60,
    crouchHeight: 40,
    color: '#ff8c1a',
    manifest: manifest as unknown as SpriteManifest,
    moves: {
        lightA: {
            name: 'Estoc du Clima-Tact', anim: 'lightA', kind: 'normal', stance: 'stand',
            durations: [3, 2, 3, 7],
            hits: [{ frames: [1, 2], box: [6, 24, 30, 14], damage: 26, guard: 'mid', hitstun: 14, blockstun: 9, push: 6, hitstop: 6, spark: 'light' }],
            chain: ['lightB', 'crouchLight', 'heavy', 'heavyFwd', 'heavyBack', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        lightB: {
            name: 'Revers ascendant', anim: 'lightB', kind: 'normal', stance: 'stand',
            durations: [3, 3, 3, 4, 7],
            hits: [{ frames: [1, 3], box: [4, 26, 36, 30], damage: 30, guard: 'mid', hitstun: 17, blockstun: 10, push: 7, hitstop: 7, spark: 'light' }],
            chain: ['lightC', 'heavy', 'heavyFwd', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        lightC: {
            name: 'Moulinet', anim: 'lightC', kind: 'normal', stance: 'stand',
            durations: [3, 3, 4, 4, 6, 9],
            hits: [
                { frames: [2, 2], box: [0, 0, 50, 26], damage: 24, guard: 'mid', hitstun: 18, blockstun: 10, push: 4, hitstop: 6, spark: 'light' },
                { frames: [3, 3], box: [0, 14, 60, 48], damage: 34, guard: 'mid', hitstun: 20, blockstun: 12, push: 18, hitstop: 9, spark: 'heavy', shake: 2 }
            ],
            cancelable: true, sfx: 'swingHeavy'
        },
        crouchLight: {
            name: 'Estoc accroupi', anim: 'crouchLight', kind: 'normal', stance: 'crouch',
            durations: [3, 4, 6],
            hits: [{ frames: [1, 1], box: [8, 12, 34, 20], damage: 22, guard: 'mid', hitstun: 12, blockstun: 8, push: 8, hitstop: 6, spark: 'light' }],
            chain: ['crouchLight', 'lightB', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        crouchHeavy: {
            name: 'Balayage', anim: 'crouchHeavy', kind: 'normal', stance: 'crouch',
            durations: [5, 4, 5, 12],
            hits: [{ frames: [1, 2], box: [0, 0, 46, 22], damage: 60, guard: 'low', hitstun: 20, blockstun: 12, push: 14, knockdown: true, launch: [1.2, 2.6], hitstop: 10, spark: 'heavy' }],
            cancelable: true, sfx: 'swingHeavy'
        },
        heavy: {
            name: 'Coup de massue', anim: 'heavy', kind: 'normal', stance: 'stand',
            durations: [4, 4, 3, 4, 6, 10],
            hits: [{ frames: [2, 3], box: [0, 4, 48, 60], damage: 70, guard: 'mid', hitstun: 22, blockstun: 14, push: 18, hitstop: 11, spark: 'heavy', shake: 2 }],
            cancelable: true, sfx: 'swingHeavy'
        },
        heavyFwd: {
            name: 'Frappe plongeante', anim: 'heavyFwd', kind: 'normal', stance: 'stand',
            durations: [4, 4, 4, 3, 4, 6, 8],
            motion: [[2, 1.6, 0], [4, 0, 0]],
            hits: [{ frames: [3, 4], box: [0, 16, 46, 54], damage: 74, guard: 'high', hitstun: 22, blockstun: 14, push: 14, hitstop: 12, spark: 'heavy', shake: 3 }],
            cancelable: true, sfx: 'swingHeavy'
        },
        heavyBack: {
            name: 'Salto de la vague', anim: 'heavyBack', kind: 'normal', stance: 'stand',
            durations: [4, 3, 4, 5, 6, 8],
            hits: [{ frames: [1, 2], box: [-2, 18, 44, 52], damage: 60, guard: 'mid', hitstun: 22, blockstun: 12, push: 8, launch: [0.6, 6.4], hitstop: 10, spark: 'heavy' }],
            invuln: [1, 2],
            cancelable: true, sfx: 'swing'
        },
        airLight: {
            name: 'Revers aérien', anim: 'airLight', kind: 'normal', stance: 'air',
            durations: [3, 3, 3, 8],
            hits: [{ frames: [1, 2], box: [0, 2, 44, 42], damage: 32, guard: 'high', hitstun: 14, blockstun: 9, push: 8, hitstop: 7, spark: 'light' }],
            chain: ['airHeavy'], cancelable: true, sfx: 'swing'
        },
        airHeavy: {
            name: 'Arc aérien', anim: 'airHeavy', kind: 'normal', stance: 'air',
            durations: [4, 4, 4, 6, 8],
            hits: [{ frames: [1, 3], box: [-4, 0, 52, 62], damage: 60, guard: 'high', hitstun: 18, blockstun: 12, push: 12, hitstop: 10, spark: 'heavy' }],
            cancelable: true, landLag: 5, sfx: 'swingHeavy'
        },
        // The cool and heat balls meet in the air: a whirl bores down
        // diagonally in front of her.
        airSpecial: {
            name: 'Cyclone Tempo aérien', anim: 'airSpecial', kind: 'special', stance: 'air',
            durations: [4, 4, 4, 5, 5, 6, 10],
            motion: [[0, 0.4, 0.6], [3, 1.6, -2.6]],
            noGravity: true, landLag: 8,
            hits: [
                { frames: [3, 4], box: [0, -6, 56, 60], damage: 26, guard: 'high', hitstun: 22, blockstun: 12, push: 4, rehit: 5, hitstop: 5, spark: 'heavy' },
                { frames: [5, 5], box: [0, -6, 56, 60], damage: 44, guard: 'high', hitstun: 22, blockstun: 14, push: 14, knockdown: true, launch: [2.2, 3.4], hitstop: 10, spark: 'heavy', shake: 3 }
            ],
            fx: [[3, 'fx_cyclone', 42, 30]],
            sfx: 'swingHeavy'
        },
        // She tosses a thunderball in an arc; a thundercloud gathers ahead
        // of her and a bolt falls from it.
        specialN: {
            name: 'Thunderbolt Tempo', anim: 'specialN', kind: 'special', stance: 'stand',
            durations: [3, 3, 2, 2, 3, 3, 3, 3, 3, 5, 14],
            hits: [],
            fx: [[5, 'fx_cloud', 104, 86]],
            projectile: {
                anim: 'fx_bolt', atFrame: 9, offset: [104, 40], speed: 0.5, life: 24,
                box: [-16, -40, 32, 84], fps: 15, hits: 1,
                hit: { damage: 84, guard: 'mid', hitstun: 26, blockstun: 16, push: 10, knockdown: true, launch: [1.2, 4.2], hitstop: 12, spark: 'electric', shake: 3, sfx: 'electric' }
            },
            sfx: 'electric'
        },
        // Melts into a heat haze (invulnerable), crosses the gap and
        // reappears lunging with the Clima-Tact.
        specialF: {
            name: 'Mirage Tempo', anim: 'specialF', kind: 'special', stance: 'stand',
            durations: [3, 3, 3, 5, 3, 4, 4, 5, 14],
            motion: [[3, 7.0, 0], [6, 0, 0]],
            invuln: [1, 4],
            hits: [{ frames: [5, 7], box: [-4, 22, 60, 24], damage: 88, guard: 'mid', hitstun: 24, blockstun: 14, push: 20, launch: [3.0, 3.4], hitstop: 13, spark: 'heavy', shake: 3 }],
            sfx: 'swingHeavy'
        },
        specialU: {
            name: 'Swing Arm', anim: 'specialU', kind: 'special', stance: 'stand',
            durations: [3, 3, 4, 5, 5, 6, 12],
            invuln: [0, 2],
            hits: [
                { frames: [1, 2], box: [-4, 10, 48, 70], damage: 50, guard: 'mid', hitstun: 24, blockstun: 16, push: 6, launch: [0.8, 6.8], hitstop: 10, spark: 'heavy', shake: 2 },
                { frames: [3, 3], box: [-30, 30, 70, 60], damage: 36, guard: 'mid', hitstun: 24, blockstun: 16, push: 8, launch: [1.2, 7.2], hitstop: 10, spark: 'big', shake: 3 }
            ],
            sfx: 'swingHeavy'
        },
        // Cool ball and heat ball meet: the gust whirls in front of her
        // then blows the foe away.
        specialD: {
            name: 'Cyclone Tempo', anim: 'specialD', kind: 'special', stance: 'stand',
            durations: [4, 4, 4, 5, 5, 5, 6, 12],
            hits: [
                { frames: [3, 4], box: [0, 0, 56, 66], damage: 20, guard: 'mid', hitstun: 22, blockstun: 10, push: 2, rehit: 4, hitstop: 4, spark: 'heavy' },
                { frames: [5, 5], box: [0, 0, 56, 66], damage: 58, guard: 'mid', hitstun: 26, blockstun: 16, push: 18, launch: [4.2, 5.0], wallBounce: true, hitstop: 12, spark: 'big', shake: 4 }
            ],
            fx: [[4, 'fx_cyclone', 44, 34]],
            sfx: 'swingHeavy'
        },
        // One bar: the heat haze, then the crowd of mirage Namis that
        // surround the foe and hit it with their whirls.
        ultimate: {
            name: 'Mirage Tempo — Fata Morgana', anim: 'ultimate', kind: 'ultimate', stance: 'stand',
            durations: [6, 6, 6, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 8, 16],
            superFreeze: 55, cost: 100, invuln: [0, 8],
            hits: [
                { frames: [3, 4], box: [-10, 0, 72, 80], damage: 60, guard: 'mid', hitstun: 70, blockstun: 20, push: 1, hitstop: 8, spark: 'heavy', shake: 2 },
                { frames: [9, 12], box: [-10, 0, 80, 90], damage: 70, guard: 'mid', hitstun: 50, blockstun: 20, push: 1, rehit: 8, hitstop: 5, spark: 'heavy', shake: 3 },
                { frames: [13, 13], box: [-10, 0, 84, 90], damage: 190, guard: 'mid', hitstun: 50, blockstun: 22, push: 28, launch: [5.6, 5.8], wallBounce: true, hitstop: 22, spark: 'big', shake: 8 }
            ],
            fx: [[13, 'fx_orbs', 50, 36], [13, 'fx_spark', 56, 36]],
            sfx: 'swingHeavy'
        },
        // Two bars: a storm cloud spreads over the stage, the thunderball
        // swells at the tip of the Clima-Tact and the lightning spear
        // crosses nearly the whole screen.
        ultimate2: {
            name: 'Thunder Lance Tempo', anim: 'ultimate2', kind: 'ultimate', stance: 'stand',
            durations: [6, 6, 18, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 20],
            superFreeze: 70, cost: 200, invuln: [0, 5],
            hits: [
                { frames: [3, 5], box: [20, 4, 56, 44], damage: 100, guard: 'mid', hitstun: 60, blockstun: 20, push: 1, hitstop: 10, spark: 'electric', shake: 4 },
                { frames: [6, 11], box: [20, 2, 160, 46], damage: 100, guard: 'mid', hitstun: 50, blockstun: 16, push: 1, rehit: 12, hitstop: 6, spark: 'electric', shake: 4 },
                { frames: [12, 12], box: [20, 2, 160, 46], damage: 150, guard: 'mid', hitstun: 50, blockstun: 22, push: 30, launch: [5.8, 6.0], wallBounce: true, knockdown: true, hitstop: 24, spark: 'big', shake: 10, sfx: 'electric' }
            ],
            fx: [[0, 'fx_storm', 96, 104], [2, 'fx_ball', 42, 28], [3, 'fx_lance', 40, 26],
                [7, 'fx_bolt', 70, 40], [9, 'fx_bolt', 136, 40], [11, 'fx_bolt', 100, 40], [12, 'fx_spark', 110, 30]],
            sfx: 'electric'
        },
        // Picks the foe's pocket, a double slap, and she admires the loot.
        throw: {
            name: 'Vol à la tire', anim: 'throw', kind: 'throw', stance: 'stand',
            durations: [3, 4, 5, 5, 5, 5, 8, 8, 10],
            hits: [{ frames: [0, 1], box: [4, 10, 30, 40], damage: 0, guard: 'unblockable', hitstun: 0, blockstun: 0, push: 0 }],
            throwRelease: { frame: 5, damage: 105, launch: [2.6, 4.6] },
            sfx: 'grab'
        }
    }
};
