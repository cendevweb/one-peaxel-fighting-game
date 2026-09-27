import manifest from '../generated/sprites/marco.json';
import type { CharacterDef, SpriteManifest } from '../engine/types';

/**
 * Marco le Phénix (Tori Tori no Mi, modèle Phénix) — the flying kicker.
 * Long-legged kick normals trailing flame, talons (serres) for the heavies,
 * a blue flame shot, the phoenix flight that skims the ground, a rising
 * kick as his reversal and the Phoenix Brand dive from the air. The
 * ultimate ends with Marco turned into the full blue phoenix, charging.
 *
 * Every animation comes from the Gigant Battle 2 sheet
 * (tools/sprites/chars/marco.json); the blue flames are the sheet's own
 * effect rows (`fx_…`). Every `durations` array has one entry per
 * animation frame.
 */
export const marco: CharacterDef = {
    id: 'marco',
    name: 'Marco',
    title: 'Le Phénix',
    health: 980,
    walk: 1.7,
    back: 1.4,
    dash: 5.0,
    backdash: [4.0, 2.8],
    jump: [2.4, 7.3],
    gravity: 0.36,
    width: 12,
    height: 56,
    crouchHeight: 38,
    color: '#3fc6e8',
    manifest: manifest as unknown as SpriteManifest,
    moves: {
        lightA: {
            name: 'Coup de pied tournant', anim: 'lightA', kind: 'normal', stance: 'stand',
            durations: [3, 3, 3, 3, 6],
            hits: [{ frames: [1, 2], box: [4, 16, 40, 28], damage: 30, guard: 'mid', hitstun: 14, blockstun: 9, push: 6, hitstop: 6, spark: 'light' }],
            chain: ['lightB', 'crouchLight', 'heavy', 'heavyFwd', 'heavyBack', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        lightB: {
            name: 'Balayage enflammé', anim: 'lightB', kind: 'normal', stance: 'stand',
            durations: [3, 3, 3, 4, 7],
            hits: [{ frames: [1, 3], box: [0, 10, 46, 38], damage: 34, guard: 'mid', hitstun: 16, blockstun: 10, push: 7, hitstop: 7, spark: 'bluefire' }],
            chain: ['lightC', 'heavy', 'heavyFwd', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        lightC: {
            name: 'Coup de pied direct', anim: 'lightC', kind: 'normal', stance: 'stand',
            durations: [4, 3, 3, 4, 4, 8],
            hits: [{ frames: [2, 4], box: [4, 22, 44, 24], damage: 52, guard: 'mid', hitstun: 18, blockstun: 12, push: 20, hitstop: 9, spark: 'bluefire', shake: 2 }],
            fx: [[2, 'fx_puff', 40, 32]],
            cancelable: true, sfx: 'fire'
        },
        crouchLight: {
            name: 'Coup de pied rasant', anim: 'crouchLight', kind: 'normal', stance: 'crouch',
            durations: [3, 3, 6],
            hits: [{ frames: [1, 1], box: [6, 0, 34, 18], damage: 24, guard: 'low', hitstun: 12, blockstun: 8, push: 8, hitstop: 6, spark: 'light' }],
            chain: ['crouchLight', 'lightB', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        crouchHeavy: {
            name: 'Glissade du phénix', anim: 'crouchHeavy', kind: 'normal', stance: 'crouch',
            durations: [5, 4, 4, 5, 6, 8],
            motion: [[1, 2.4, 0], [3, 0, 0]],
            hits: [{ frames: [1, 2], box: [6, 0, 42, 20], damage: 66, guard: 'low', hitstun: 20, blockstun: 12, push: 14, knockdown: true, launch: [1.2, 2.6], hitstop: 10, spark: 'bluefire' }],
            cancelable: true, sfx: 'swingHeavy'
        },
        heavy: {
            name: 'Serres', anim: 'heavy', kind: 'normal', stance: 'stand',
            durations: [6, 4, 5, 6, 10],
            hits: [{ frames: [1, 2], box: [4, 4, 46, 30], damage: 72, guard: 'mid', hitstun: 21, blockstun: 14, push: 18, hitstop: 11, spark: 'bluefire', shake: 2 }],
            cancelable: true, sfx: 'swingHeavy'
        },
        heavyFwd: {
            name: 'Serre plongeante', anim: 'heavyFwd', kind: 'normal', stance: 'stand',
            durations: [5, 4, 4, 3, 5, 12],
            hits: [{ frames: [3, 4], box: [4, 0, 46, 72], damage: 78, guard: 'high', hitstun: 22, blockstun: 14, push: 14, hitstop: 12, spark: 'bluefire', shake: 4 }],
            fx: [[4, 'fx_puff', 36, 8]],
            cancelable: true, sfx: 'fire'
        },
        heavyBack: {
            name: 'Aile ascendante', anim: 'heavyBack', kind: 'normal', stance: 'stand',
            durations: [4, 3, 4, 4, 6, 8],
            hits: [{ frames: [2, 3], box: [-4, 24, 40, 56], damage: 62, guard: 'mid', hitstun: 22, blockstun: 12, push: 8, launch: [0.6, 6.4], hitstop: 10, spark: 'bluefire' }],
            invuln: [1, 2],
            cancelable: true, sfx: 'flutter'
        },
        airLight: {
            name: 'Genou sauté', anim: 'airLight', kind: 'normal', stance: 'air',
            durations: [4, 5, 8],
            hits: [{ frames: [1, 2], box: [0, 4, 36, 32], damage: 34, guard: 'high', hitstun: 14, blockstun: 9, push: 8, hitstop: 7, spark: 'light' }],
            chain: ['airHeavy'], cancelable: true, sfx: 'swing'
        },
        airHeavy: {
            name: 'Croissant de flammes', anim: 'airHeavy', kind: 'normal', stance: 'air',
            durations: [3, 3, 3, 4, 5, 8],
            hits: [{ frames: [1, 3], box: [0, -4, 52, 44], damage: 64, guard: 'high', hitstun: 18, blockstun: 12, push: 12, hitstop: 10, spark: 'bluefire' }],
            cancelable: true, landLag: 5, sfx: 'fire'
        },
        airSpecial: {
            name: 'Phoenix Brand', anim: 'airSpecial', kind: 'special', stance: 'air',
            durations: [3, 3, 3, 30, 4, 6, 8],
            motion: [[2, 3.0, -5.6]],
            noGravity: true, landFrame: 4,
            hits: [{ frames: [2, 3], box: [0, -8, 42, 44], damage: 84, guard: 'high', hitstun: 20, blockstun: 14, push: 16, knockdown: true, launch: [1.8, 3.6], hitstop: 12, spark: 'bluefire', shake: 4 }],
            fx: [[4, 'fx_dive', 16, 18]],
            sfx: 'fire'
        },
        specialN: {
            name: 'Flamme bleue', anim: 'specialN', kind: 'special', stance: 'stand',
            durations: [4, 4, 4, 6, 5, 6, 8],
            hits: [],
            projectile: {
                anim: 'fx_wave', atFrame: 3, offset: [40, 20], speed: 4.2, life: 80,
                box: [-28, -14, 56, 30], fps: 10, hits: 1,
                hit: { damage: 76, guard: 'mid', hitstun: 22, blockstun: 16, push: 18, hitstop: 11, spark: 'bluefire', shake: 2, sfx: 'fire' }
            },
            sfx: 'fire'
        },
        specialF: {
            name: 'Vol du phénix', anim: 'specialF', kind: 'special', stance: 'stand',
            durations: [4, 4, 3, 4, 4, 5, 5, 6, 8],
            motion: [[2, 6.6, 0], [6, 0, 0]],
            hits: [{ frames: [2, 5], box: [-6, 0, 48, 28], damage: 92, guard: 'mid', hitstun: 24, blockstun: 14, push: 22, launch: [3.0, 3.8], hitstop: 14, spark: 'bluefire', shake: 4 }],
            fx: [[2, 'fx_puff', -6, 14], [4, 'fx_puff', -10, 14]],
            sfx: 'flutter'
        },
        specialU: {
            name: 'Envol du phénix', anim: 'specialU', kind: 'special', stance: 'stand',
            durations: [3, 3, 5, 6, 6, 8],
            motion: [[2, 1.2, 6.6]],
            invuln: [0, 2],
            hits: [{ frames: [2, 3], box: [-8, 14, 44, 56], damage: 96, guard: 'mid', hitstun: 24, blockstun: 16, push: 8, launch: [1.0, 7.2], hitstop: 12, spark: 'bluefire', shake: 3 }],
            fx: [[2, 'fx_rise', 8, 40]],
            sfx: 'fire'
        },
        specialD: {
            name: 'Charge des ailes', anim: 'specialD', kind: 'special', stance: 'stand',
            durations: [4, 4, 4, 4, 4, 5, 6, 10],
            motion: [[3, 5.2, 0], [6, 0, 0]],
            hits: [{ frames: [4, 6], box: [0, 6, 50, 36], damage: 88, guard: 'mid', hitstun: 24, blockstun: 14, push: 20, launch: [2.4, 4.8], hitstop: 12, spark: 'bluefire', shake: 3 }],
            fx: [[4, 'fx_charge', 26, 22]],
            sfx: 'flutter'
        },
        ultimate: {
            name: 'Phénix — flammes régénératrices', anim: 'ultimate', kind: 'ultimate', stance: 'stand',
            durations: [8, 6, 5, 4, 4, 6, 5, 10, 6, 6, 6, 10],
            superFreeze: 55, cost: 100, invuln: [0, 7],
            motion: [[6, 7.4, 0], [8, 0, 0]],
            hits: [
                { frames: [2, 4], box: [-6, 0, 62, 72], damage: 32, guard: 'mid', hitstun: 60, blockstun: 20, push: 1, rehit: 5, hitstop: 4, spark: 'bluefire', shake: 3 },
                { frames: [6, 7], box: [-10, 0, 72, 64], damage: 260, guard: 'mid', hitstun: 50, blockstun: 22, push: 30, launch: [5.8, 5.6], wallBounce: true, hitstop: 24, spark: 'big', shake: 10 }
            ],
            fx: [[2, 'fx_burst', 30, 34], [6, 'fx_phoenix', 56, 34]],
            sfx: 'fire'
        },
        throw: {
            name: 'Serres renversées', anim: 'throw', kind: 'throw', stance: 'stand',
            durations: [3, 4, 4, 3, 3, 6, 6, 6, 6, 8],
            hits: [{ frames: [0, 1], box: [4, 10, 30, 40], damage: 0, guard: 'unblockable', hitstun: 0, blockstun: 0, push: 0 }],
            throwRelease: { frame: 6, damage: 110, launch: [2.6, 5.2] },
            fx: [[6, 'fx_burst', 20, 40]],
            sfx: 'grab'
        }
    }
};
