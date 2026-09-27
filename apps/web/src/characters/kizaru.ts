import manifest from '../generated/sprites/kizaru.json';
import type { CharacterDef, SpriteManifest } from '../engine/types';

/**
 * Kizaru (Borsalino), Pika Pika no Mi — the man of light. Fast kicks that
 * flare on impact, the finger laser as a very quick projectile, Ama no
 * Murakumo (the sword of light) as a long lunging thrust and as his rising
 * reversal, Yata no Kagami to cross the screen as a streak of light, and
 * Yasakani no Magatama — a rain of light bullets fired from the air — as the
 * ultimate. Two bars (O): a giant beam of light led by a roaring beast of
 * light that crosses the whole screen, then bursts.
 *
 * Every animation and effect comes from the Gigant Battle sheet
 * (tools/sprites/chars/kizaru.json). Every `durations` array has one entry
 * per animation frame.
 */
export const kizaru: CharacterDef = {
    id: 'kizaru',
    name: 'Kizaru',
    title: 'Amiral de lumière',
    health: 1000,
    walk: 1.5,
    back: 1.3,
    dash: 5.2,
    backdash: [4.0, 2.6],
    jump: [2.4, 7.2],
    gravity: 0.37,
    width: 13,
    height: 74,
    crouchHeight: 48,
    color: '#f2c230',
    manifest: manifest as unknown as SpriteManifest,
    moves: {
        lightA: {
            name: 'Coup de genou', anim: 'lightA', kind: 'normal', stance: 'stand',
            durations: [3, 3, 3, 4, 6],
            hits: [{ frames: [1, 2], box: [4, 26, 34, 22], damage: 30, guard: 'mid', hitstun: 14, blockstun: 9, push: 6, hitstop: 6, spark: 'light' }],
            chain: ['lightB', 'crouchLight', 'heavy', 'heavyFwd', 'heavyBack', 'crouchHeavy'], cancelable: true, sfx: 'swing'
        },
        lightB: {
            name: 'Coup de pied éclair', anim: 'lightB', kind: 'normal', stance: 'stand',
            durations: [3, 3, 3, 3, 5, 6],
            hits: [{ frames: [1, 3], box: [4, 22, 42, 34], damage: 34, guard: 'mid', hitstun: 16, blockstun: 10, push: 7, hitstop: 7, spark: 'laser' }],
            chain: ['lightC', 'heavy', 'heavyFwd', 'crouchHeavy'], cancelable: true, sfx: 'laser'
        },
        lightC: {
            name: 'Croissant de lumière', anim: 'lightC', kind: 'normal', stance: 'stand',
            durations: [4, 3, 3, 3, 4, 4, 6, 8],
            hits: [
                { frames: [1, 2], box: [4, 34, 46, 24], damage: 28, guard: 'mid', hitstun: 18, blockstun: 10, push: 4, hitstop: 7, spark: 'light' },
                { frames: [3, 5], box: [0, 14, 44, 76], damage: 40, guard: 'mid', hitstun: 20, blockstun: 12, push: 14, launch: [1.2, 5.4], hitstop: 10, spark: 'laser', shake: 2 }
            ],
            cancelable: true, sfx: 'swingHeavy'
        },
        crouchLight: {
            name: 'Éclat accroupi', anim: 'crouchLight', kind: 'normal', stance: 'crouch',
            durations: [3, 3, 3, 6],
            hits: [{ frames: [1, 2], box: [4, 4, 32, 26], damage: 24, guard: 'low', hitstun: 12, blockstun: 8, push: 8, hitstop: 6, spark: 'laser' }],
            chain: ['crouchLight', 'lightB', 'crouchHeavy'], cancelable: true, sfx: 'laser'
        },
        crouchHeavy: {
            name: 'Ama no Murakumo — fauchage', anim: 'crouchHeavy', kind: 'normal', stance: 'crouch',
            durations: [5, 4, 4, 5, 10],
            hits: [{ frames: [1, 3], box: [6, 0, 70, 24], damage: 66, guard: 'low', hitstun: 20, blockstun: 12, push: 14, knockdown: true, launch: [1.2, 2.6], hitstop: 10, spark: 'laser' }],
            cancelable: true, sfx: 'slash'
        },
        heavy: {
            name: 'Pika Pika — rafale de coups de pied', anim: 'heavy', kind: 'normal', stance: 'stand',
            durations: [4, 3, 3, 3, 3, 3, 3, 4, 4, 5, 6, 8],
            hits: [
                { frames: [3, 6], box: [4, 18, 46, 46], damage: 16, guard: 'mid', hitstun: 22, blockstun: 10, push: 1, rehit: 4, hitstop: 4, spark: 'laser' },
                { frames: [7, 8], box: [4, 36, 58, 30], damage: 50, guard: 'mid', hitstun: 22, blockstun: 14, push: 18, hitstop: 11, spark: 'big', shake: 2 }
            ],
            fx: [[3, 'fx_ring', 40, 40]],
            cancelable: true, sfx: 'laser'
        },
        heavyFwd: {
            name: 'Coup de pied à la vitesse de la lumière', anim: 'heavyFwd', kind: 'normal', stance: 'stand',
            durations: [4, 3, 3, 3, 3, 3, 4, 5, 6, 6],
            motion: [[1, 3.6, 0], [5, 0, 0]],
            hits: [{ frames: [2, 6], box: [4, 34, 66, 26], damage: 76, guard: 'mid', hitstun: 22, blockstun: 14, push: 16, hitstop: 12, spark: 'laser', shake: 3 }],
            cancelable: true, sfx: 'laser'
        },
        heavyBack: {
            name: 'Coup de pied au zénith', anim: 'heavyBack', kind: 'normal', stance: 'stand',
            durations: [4, 3, 3, 3, 4, 4, 5, 5, 6],
            hits: [{ frames: [2, 5], box: [-6, 24, 40, 80], damage: 62, guard: 'mid', hitstun: 22, blockstun: 12, push: 8, launch: [0.6, 6.6], hitstop: 10, spark: 'laser' }],
            invuln: [1, 2],
            cancelable: true, sfx: 'swingHeavy'
        },
        airLight: {
            name: 'Rayon de la paume', anim: 'airLight', kind: 'normal', stance: 'air',
            durations: [3, 5, 9],
            hits: [{ frames: [1, 1], box: [0, 14, 48, 44], damage: 34, guard: 'high', hitstun: 14, blockstun: 9, push: 8, hitstop: 7, spark: 'laser' }],
            chain: ['airHeavy'], cancelable: true, sfx: 'laser'
        },
        airHeavy: {
            name: 'Ama no Murakumo — taille aérienne', anim: 'airHeavy', kind: 'normal', stance: 'air',
            durations: [4, 3, 4, 4, 8],
            hits: [{ frames: [2, 3], box: [0, 0, 64, 64], damage: 66, guard: 'high', hitstun: 18, blockstun: 12, push: 12, hitstop: 10, spark: 'laser' }],
            cancelable: true, landLag: 5, sfx: 'slash'
        },
        airSpecial: {
            name: 'Plongée de lumière', anim: 'airSpecial', kind: 'special', stance: 'air',
            durations: [4, 3, 30, 4, 6, 8],
            motion: [[2, 3.4, -6.4]],
            noGravity: true, landFrame: 4,
            hits: [{ frames: [2, 3], box: [-4, -6, 46, 44], damage: 80, guard: 'high', hitstun: 20, blockstun: 14, push: 16, knockdown: true, launch: [1.6, 3.6], hitstop: 12, spark: 'laser', shake: 4 }],
            fx: [[4, 'fx_ring', 20, 20]],
            sfx: 'laser'
        },
        specialN: {
            name: 'Laser du doigt', anim: 'specialN', kind: 'special', stance: 'stand',
            durations: [6, 4, 5, 10, 10],
            hits: [],
            fx: [[2, 'fx_flash', 34, 55]],
            projectile: {
                anim: 'fx_laser', atFrame: 2, offset: [40, 54], speed: 7.5, life: 60,
                box: [-26, -7, 52, 14], fps: 12, hits: 1,
                hit: { damage: 72, guard: 'mid', hitstun: 22, blockstun: 14, push: 16, hitstop: 10, spark: 'laser', shake: 2, sfx: 'laser' }
            },
            sfx: 'laser'
        },
        specialF: {
            name: 'Ama no Murakumo', anim: 'specialF', kind: 'special', stance: 'stand',
            durations: [3, 2, 3, 3, 3, 3, 3, 4, 5, 12],
            motion: [[6, 5.6, 0], [8, 0, 0]],
            hits: [
                { frames: [3, 5], box: [8, 26, 68, 22], damage: 45, guard: 'mid', hitstun: 26, blockstun: 12, push: 2, hitstop: 8, spark: 'laser' },
                { frames: [6, 8], box: [8, 24, 98, 26], damage: 80, guard: 'mid', hitstun: 24, blockstun: 14, push: 22, launch: [3.0, 3.8], hitstop: 14, spark: 'big', shake: 4 }
            ],
            sfx: 'slashHeavy'
        },
        specialU: {
            name: 'Ama no Murakumo — ascension', anim: 'specialU', kind: 'special', stance: 'stand',
            durations: [2, 2, 3, 3, 5, 7, 10],
            motion: [[2, 1.2, 6.6]],
            invuln: [0, 3],
            hits: [
                { frames: [2, 3], box: [-8, 10, 46, 70], damage: 58, guard: 'mid', hitstun: 24, blockstun: 16, push: 8, launch: [0.8, 6.8], hitstop: 10, spark: 'laser', shake: 3 },
                { frames: [4, 5], box: [-10, 30, 50, 90], damage: 46, guard: 'mid', hitstun: 24, blockstun: 16, push: 10, launch: [1.2, 7.4], hitstop: 10, spark: 'big', shake: 4 }
            ],
            fx: [[1, 'fx_star', 0, 40]],
            sfx: 'slashHeavy'
        },
        specialD: {
            name: 'Yata no Kagami', anim: 'specialD', kind: 'special', stance: 'stand',
            durations: [4, 3, 3, 3, 3, 3, 4, 5, 10],
            motion: [[3, 7.0, 0], [7, 0, 0]],
            invuln: [3, 6],
            hits: [{ frames: [3, 6], box: [-12, 0, 56, 70], damage: 84, guard: 'mid', hitstun: 26, blockstun: 14, push: 14, knockdown: true, launch: [1.8, 5.0], hitstop: 12, spark: 'laser', shake: 3 }],
            fx: [[2, 'fx_flash', 0, 40], [7, 'fx_star', 0, 40]],
            sfx: 'beam'
        },
        ultimate: {
            name: 'Yasakani no Magatama', anim: 'ultimate', kind: 'ultimate', stance: 'stand',
            durations: [6, 5, 5, 6, 5, 5, 5, 5, 5, 8, 14],
            superFreeze: 55, cost: 100, invuln: [0, 5],
            hits: [
                { frames: [4, 8], box: [0, 0, 150, 96], damage: 42, guard: 'mid', hitstun: 60, blockstun: 20, push: 1, rehit: 7, hitstop: 3, spark: 'laser', shake: 3, sfx: 'laser' },
                { frames: [9, 9], box: [0, 0, 150, 96], damage: 300, guard: 'mid', hitstun: 50, blockstun: 22, push: 30, launch: [5.4, 5.6], wallBounce: true, hitstop: 22, spark: 'big', shake: 10 }
            ],
            fx: [
                [3, 'fx_star', 0, 50],
                [4, 'fx_bullets', 50, 50], [5, 'fx_bullets', 80, 30], [6, 'fx_bullets', 60, 60],
                [7, 'fx_bullets', 90, 40], [8, 'fx_bullets', 70, 24],
                [9, 'fx_boom', 70, 36]
            ],
            sfx: 'beam'
        },
        ultimate2: {
            name: 'Yata no Kagami — Kōsen', anim: 'ultimate2', kind: 'ultimate', stance: 'stand',
            durations: [7, 7, 5, 5, 6, 6, 6, 6, 6, 24, 8, 8, 16],
            superFreeze: 70, cost: 200, invuln: [0, 5],
            hits: [
                { frames: [5, 9], box: [0, 0, 330, 104], damage: 56, guard: 'mid', hitstun: 40, blockstun: 24, push: 1, rehit: 8, hitstop: 3, spark: 'laser', shake: 3, sfx: 'laser' },
                { frames: [10, 10], box: [0, 0, 330, 104], damage: 440, guard: 'mid', hitstun: 60, blockstun: 24, push: 34, knockdown: true, launch: [6.0, 5.8], wallBounce: true, hitstop: 26, spark: 'big', shake: 12 }
            ],
            fx: [
                [0, 'fx_star', 0, 50],
                [4, 'fx_flash', 34, 52],
                [5, 'fx_pillar', 36, 50], [5, 'fx_beam', 44, 50], [5, 'fx_beam', 76, 50], [5, 'fx_beast', 108, 50],
                [6, 'fx_beam', 108, 50], [6, 'fx_beam', 140, 50], [6, 'fx_beast', 172, 50],
                [7, 'fx_beam', 172, 50], [7, 'fx_beam', 204, 50], [7, 'fx_beast', 236, 50],
                [8, 'fx_beam', 236, 50], [8, 'fx_beam', 268, 50], [8, 'fx_beast', 300, 50],
                [9, 'fx_pillar', 36, 50],
                [9, 'fx_beam', 44, 50], [9, 'fx_beam', 76, 50], [9, 'fx_beam', 108, 50], [9, 'fx_beam', 140, 50], [9, 'fx_beam', 172, 50],
                [9, 'fx_beam', 204, 50], [9, 'fx_beam', 236, 50], [9, 'fx_beam', 268, 50], [9, 'fx_beam', 300, 50], [9, 'fx_beam', 332, 50],
                [10, 'fx_bigboom', 96, 48],
                [10, 'fx_beamfade', 44, 50], [10, 'fx_beamfade', 108, 50], [10, 'fx_beamfade', 172, 50], [10, 'fx_beamfade', 236, 50], [10, 'fx_beamfade', 300, 50],
                [10, 'fx_beamfade', 76, 50], [10, 'fx_beamfade', 140, 50], [10, 'fx_beamfade', 204, 50], [10, 'fx_beamfade', 268, 50], [10, 'fx_beamfade', 332, 50]
            ],
            sfx: 'beam'
        },
        throw: {
            name: 'Rafale lumineuse', anim: 'throw', kind: 'throw', stance: 'stand',
            durations: [3, 4, 3, 3, 3, 3, 3, 3, 3, 5, 6, 10],
            hits: [{ frames: [0, 1], box: [4, 10, 30, 40], damage: 0, guard: 'unblockable', hitstun: 0, blockstun: 0, push: 0 }],
            throwRelease: { frame: 9, damage: 115, launch: [3.0, 4.6] },
            fx: [[9, 'fx_orb', 40, 50]],
            sfx: 'grab'
        }
    }
};
