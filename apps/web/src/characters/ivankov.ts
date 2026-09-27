import manifest from '../generated/sprites/ivankov.json';
import type { CharacterDef, SpriteManifest } from '../engine/types';

/**
 * Emporio Ivankov — the Okama queen of Kamabakka (Horu Horu no Mi). Winks
 * that blow people away: the Death Wink gust for mid range, the point-blank
 * Hell Wink throw; the Face-Growth Hormone head that swells into an
 * anti-air; the giant-afro crush; the feet-first flying kick. His kicks in
 * the air and the rising split kick are drawn in his woman form, as on the
 * sheet. Ultimate: the Death Wink barrage; two bars: Galaxy Wink, the
 * spinning tower of Ivankov heads that marches across the stage.
 *
 * Every animation and effect comes from the Gigant Battle sheet
 * (tools/sprites/chars/ivankov.json). Every `durations` array has one entry
 * per animation frame.
 */
export const ivankov: CharacterDef = {
    id: 'ivankov',
    name: 'Ivankov',
    title: 'Reine de Kamabakka',
    health: 1040,
    walk: 1.5,
    back: 1.2,
    dash: 4.4,
    backdash: [3.6, 2.6],
    jump: [2.2, 7.0],
    gravity: 0.37,
    width: 14,
    height: 74,
    crouchHeight: 42,
    color: '#7b4fd6',
    manifest: manifest as unknown as SpriteManifest,
    moves: {
        lightA: {
            name: 'Gifle royale', anim: 'lightA', kind: 'normal', stance: 'stand',
            durations: [3, 2, 3, 7],
            hits: [{ frames: [1, 2], box: [6, 34, 48, 18], damage: 30, guard: 'mid', hitstun: 14, blockstun: 9, push: 6, hitstop: 6, spark: 'light' }],
            chain: ['lightB', 'crouchLight', 'heavy', 'heavyFwd', 'heavyBack', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        lightB: {
            name: 'Revers de cape', anim: 'lightB', kind: 'normal', stance: 'stand',
            durations: [2, 3, 3, 4, 6],
            hits: [{ frames: [1, 2], box: [4, 28, 44, 32], damage: 34, guard: 'mid', hitstun: 16, blockstun: 10, push: 7, hitstop: 7, spark: 'light' }],
            chain: ['lightC', 'heavy', 'heavyFwd', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        lightC: {
            name: 'Wink', anim: 'lightC', kind: 'normal', stance: 'stand',
            durations: [4, 3, 3, 3, 4, 8],
            hits: [{ frames: [2, 3], box: [16, 34, 46, 34], damage: 52, guard: 'mid', hitstun: 18, blockstun: 12, push: 20, hitstop: 9, spark: 'love', shake: 2 }],
            cancelable: true, sfx: 'love'
        },
        crouchLight: {
            name: 'Wink accroupi', anim: 'crouchLight', kind: 'normal', stance: 'crouch',
            durations: [3, 3, 3, 6],
            hits: [{ frames: [1, 2], box: [8, 12, 26, 22], damage: 24, guard: 'mid', hitstun: 12, blockstun: 8, push: 8, hitstop: 6, spark: 'love' }],
            chain: ['crouchLight', 'lightB', 'crouchHeavy'], cancelable: true, sfx: 'love'
        },
        crouchHeavy: {
            name: 'Balayage en éventail', anim: 'crouchHeavy', kind: 'normal', stance: 'crouch',
            durations: [4, 3, 3, 3, 3, 4, 4, 6, 9],
            hits: [{ frames: [3, 6], box: [4, 0, 56, 22], damage: 68, guard: 'low', hitstun: 20, blockstun: 12, push: 14, knockdown: true, launch: [1.2, 2.6], hitstop: 10, spark: 'heavy' }],
            cancelable: true, sfx: 'swingHeavy'
        },
        heavy: {
            name: 'Ivankov Kick', anim: 'heavy', kind: 'normal', stance: 'stand',
            durations: [5, 3, 3, 3, 3, 3, 4, 4, 5, 6, 6],
            hits: [{ frames: [1, 5], box: [0, 14, 56, 90], damage: 76, guard: 'mid', hitstun: 21, blockstun: 14, push: 18, hitstop: 11, spark: 'heavy', shake: 2 }],
            cancelable: true, sfx: 'swingHeavy'
        },
        heavyFwd: {
            name: 'Tête plongeante', anim: 'heavyFwd', kind: 'normal', stance: 'stand',
            durations: [5, 5, 4, 4, 4, 5, 5, 5, 6, 7],
            motion: [[1, 2.2, 0], [3, 0, 0]],
            hits: [{ frames: [2, 3], box: [6, 0, 46, 48], damage: 80, guard: 'high', hitstun: 22, blockstun: 14, push: 14, hitstop: 12, spark: 'heavy', shake: 4 }],
            cancelable: true, sfx: 'swingHeavy'
        },
        heavyBack: {
            name: 'Coup de pied vertical', anim: 'heavyBack', kind: 'normal', stance: 'stand',
            durations: [4, 3, 3, 4, 4, 5, 6, 7],
            hits: [{ frames: [2, 3], box: [-4, 24, 46, 104], damage: 64, guard: 'mid', hitstun: 22, blockstun: 12, push: 8, launch: [0.6, 6.4], hitstop: 10, spark: 'heavy' }],
            invuln: [1, 2],
            cancelable: true, sfx: 'swing'
        },
        airLight: {
            name: 'Coup de talon', anim: 'airLight', kind: 'normal', stance: 'air',
            durations: [2, 2, 2, 4, 8],
            hits: [{ frames: [3, 4], box: [0, 0, 52, 34], damage: 34, guard: 'high', hitstun: 14, blockstun: 9, push: 8, hitstop: 7, spark: 'light' }],
            chain: ['airHeavy'], cancelable: true, sfx: 'swing'
        },
        airHeavy: {
            name: 'Éventail aérien', anim: 'airHeavy', kind: 'normal', stance: 'air',
            durations: [2, 2, 2, 2, 3, 3, 4, 4, 5, 6],
            hits: [{ frames: [4, 6], box: [0, -6, 60, 64], damage: 66, guard: 'high', hitstun: 18, blockstun: 12, push: 12, hitstop: 10, spark: 'heavy' }],
            cancelable: true, landLag: 5, sfx: 'swingHeavy'
        },
        airSpecial: {
            name: 'Ivankov Kick plongeant', anim: 'airSpecial', kind: 'special', stance: 'air',
            durations: [3, 3, 3, 3, 3, 3, 3, 4, 24, 6, 8],
            motion: [[3, 2.4, -5.6]],
            noGravity: true, landFrame: 9,
            hits: [{ frames: [3, 8], box: [-8, -8, 58, 60], damage: 80, guard: 'high', hitstun: 20, blockstun: 14, push: 16, knockdown: true, launch: [1.6, 3.6], hitstop: 12, spark: 'big', shake: 4 }],
            sfx: 'swingHeavy'
        },
        specialN: {
            name: 'Death Wink', anim: 'specialN', kind: 'special', stance: 'stand',
            durations: [4, 3, 4, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 5],
            hits: [],
            projectile: {
                anim: 'fx_wink', atFrame: 4, offset: [44, 42], speed: 4.8, life: 80,
                box: [-22, -12, 44, 24], fps: 12, hits: 1,
                hit: { damage: 76, guard: 'mid', hitstun: 22, blockstun: 16, push: 18, hitstop: 11, spark: 'love', shake: 2, sfx: 'bazooka' }
            },
            sfx: 'love'
        },
        specialF: {
            name: 'Emporio Drill Kick', anim: 'specialF', kind: 'special', stance: 'stand',
            durations: [4, 4, 3, 5, 5, 5, 6, 6, 6],
            motion: [[2, 6.6, 0], [5, 0, 0]],
            hits: [{ frames: [2, 4], box: [0, 8, 78, 40], damage: 92, guard: 'mid', hitstun: 24, blockstun: 14, push: 22, launch: [3.0, 3.6], hitstop: 14, spark: 'big', shake: 4 }],
            sfx: 'bazooka'
        },
        specialU: {
            name: 'Emporio Face-Growth Hormone', anim: 'specialU', kind: 'special', stance: 'stand',
            durations: [3, 3, 3, 3, 3, 4, 4, 4, 5, 6, 6, 8],
            invuln: [0, 6],
            hits: [
                { frames: [4, 5], box: [-12, 20, 50, 90], damage: 50, guard: 'mid', hitstun: 24, blockstun: 16, push: 6, launch: [0.6, 6.4], hitstop: 10, spark: 'heavy', shake: 3 },
                { frames: [6, 8], box: [-14, 56, 54, 64], damage: 52, guard: 'mid', hitstun: 24, blockstun: 16, push: 10, launch: [1.2, 7.2], hitstop: 12, spark: 'big', shake: 5 }
            ],
            sfx: 'gigant'
        },
        specialD: {
            name: 'Hormone de la tête géante', anim: 'specialD', kind: 'special', stance: 'stand',
            durations: [4, 4, 5, 4, 4, 4, 4, 5, 6, 7, 8],
            hits: [
                { frames: [2, 6], box: [-26, 0, 64, 84], damage: 22, guard: 'mid', hitstun: 22, blockstun: 10, push: 2, rehit: 5, hitstop: 4, spark: 'heavy' },
                { frames: [7, 8], box: [-26, 0, 70, 60], damage: 58, guard: 'mid', hitstun: 26, blockstun: 16, push: 12, knockdown: true, launch: [1.4, 4.0], hitstop: 12, spark: 'big', shake: 5 }
            ],
            sfx: 'gigant'
        },
        ultimate: {
            name: 'Hell Wink', anim: 'ultimate', kind: 'ultimate', stance: 'stand',
            durations: [8, 8, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 6, 8, 10, 12],
            superFreeze: 55, cost: 100, invuln: [0, 5],
            hits: [
                { frames: [2, 14], box: [8, 16, 110, 64], damage: 40, guard: 'mid', hitstun: 30, blockstun: 16, push: 1, rehit: 8, hitstop: 3, spark: 'love', shake: 2 },
                { frames: [15, 15], box: [8, 16, 120, 64], damage: 380, guard: 'mid', hitstun: 50, blockstun: 22, push: 30, launch: [5.6, 5.8], wallBounce: true, hitstop: 22, spark: 'big', shake: 10, sfx: 'bazooka' }
            ],
            fx: [[15, 'fx_smoke', 60, 40]],
            sfx: 'love'
        },
        // Two bars: Ivankov splits into a tower of winking heads spinning on
        // a tornado (the Galaxy Wink rows), which marches across the stage,
        // grinding the victim, before the final burst.
        ultimate2: {
            name: 'Galaxy Wink', anim: 'ultimate2', kind: 'ultimate', stance: 'stand',
            durations: [6, 5, 5, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 6, 8, 10, 12],
            superFreeze: 70, cost: 200, invuln: [0, 5],
            motion: [[3, 3.4, 0], [22, 0, 0]],
            hits: [
                { frames: [3, 21], box: [-30, 0, 100, 136], damage: 60, guard: 'mid', hitstun: 40, blockstun: 16, push: 1, rehit: 17, hitstop: 3, spark: 'love', shake: 3 },
                { frames: [22, 22], box: [-30, 0, 110, 136], damage: 400, guard: 'mid', hitstun: 50, blockstun: 24, push: 30, launch: [5.8, 6.2], wallBounce: true, knockdown: true, hitstop: 26, spark: 'big', shake: 12, sfx: 'bazooka' }
            ],
            fx: [[22, 'fx_smoke', 50, 50]],
            sfx: 'gigant'
        },
        throw: {
            name: 'Wink à bout portant', anim: 'throw', kind: 'throw', stance: 'stand',
            durations: [3, 4, 4, 6, 8, 8],
            hits: [{ frames: [0, 1], box: [4, 10, 30, 50], damage: 0, guard: 'unblockable', hitstun: 0, blockstun: 0, push: 0 }],
            throwRelease: { frame: 3, damage: 110, launch: [3.0, 5.0] },
            fx: [[3, 'fx_puff', 50, 50]],
            sfx: 'grab'
        }
    }
};
