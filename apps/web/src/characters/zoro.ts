import manifest from '../generated/sprites/zoro.json';
import type { CharacterDef, SpriteManifest } from '../engine/types';

/**
 * Roronoa Zoro (après l'ellipse) — the swordsman. Santōryū: long sword
 * normals, a flying slash (Sanjūroku Pound Hō) for mid range, the Oni Giri
 * dash that crosses half the screen, the Tatsumaki tornado and the rising
 * Ō Tatsumaki as his reversal; Rokudō no Tsuji is the ultimate.
 *
 * Every animation and effect comes from the Gigant Battle 2 sheet
 * (tools/sprites/chars/zoro.json): the blue crescents, the Oni Giri trail,
 * the ice spikes of the dive and the six-petal burst are the sheet's own
 * effect rows. Every `durations` array has one entry per animation frame.
 */
export const zoro: CharacterDef = {
    id: 'zoro',
    name: 'Zoro',
    title: 'Chasseur de pirates',
    health: 1020,
    walk: 1.6,
    back: 1.3,
    dash: 4.8,
    backdash: [3.8, 2.6],
    jump: [2.3, 7.2],
    gravity: 0.37,
    width: 12,
    height: 64,
    crouchHeight: 44,
    color: '#3f9a4a',
    manifest: manifest as unknown as SpriteManifest,
    moves: {
        lightA: {
            name: 'Estoc', anim: 'lightA', kind: 'normal', stance: 'stand',
            durations: [3, 2, 3, 7],
            hits: [{ frames: [1, 2], box: [6, 30, 44, 12], damage: 30, guard: 'mid', hitstun: 14, blockstun: 9, push: 6, hitstop: 6, spark: 'cut' }],
            chain: ['lightB', 'crouchLight', 'heavy', 'heavyFwd', 'heavyBack', 'crouchHeavy'], cancelable: true, sfx: 'slash'
        },
        lightB: {
            name: 'Revers de sabre', anim: 'lightB', kind: 'normal', stance: 'stand',
            durations: [3, 3, 3, 7],
            hits: [{ frames: [1, 2], box: [4, 18, 36, 34], damage: 34, guard: 'mid', hitstun: 16, blockstun: 10, push: 7, hitstop: 7, spark: 'cut' }],
            chain: ['lightC', 'heavy', 'heavyFwd', 'crouchHeavy'], cancelable: true, sfx: 'slash'
        },
        lightC: {
            name: 'Santōryū — taille croisée', anim: 'lightC', kind: 'normal', stance: 'stand',
            durations: [4, 3, 3, 4, 6, 8],
            hits: [{ frames: [1, 3], box: [2, 4, 44, 50], damage: 52, guard: 'mid', hitstun: 18, blockstun: 12, push: 20, hitstop: 9, spark: 'cut', shake: 2 }],
            cancelable: true, sfx: 'slash'
        },
        crouchLight: {
            name: 'Taille basse', anim: 'crouchLight', kind: 'normal', stance: 'crouch',
            durations: [3, 3, 6],
            hits: [{ frames: [1, 1], box: [6, 2, 28, 18], damage: 24, guard: 'low', hitstun: 12, blockstun: 8, push: 8, hitstop: 6, spark: 'cut' }],
            chain: ['crouchLight', 'lightB', 'crouchHeavy'], cancelable: true, sfx: 'slash'
        },
        crouchHeavy: {
            name: 'Fauchage des trois sabres', anim: 'crouchHeavy', kind: 'normal', stance: 'crouch',
            durations: [5, 3, 3, 4, 5, 10],
            hits: [{ frames: [2, 4], box: [6, 0, 50, 24], damage: 68, guard: 'low', hitstun: 20, blockstun: 12, push: 14, knockdown: true, launch: [1.2, 2.6], hitstop: 10, spark: 'blade' }],
            cancelable: true, sfx: 'slash'
        },
        heavy: {
            name: 'Ittōryū — taille descendante', anim: 'heavy', kind: 'normal', stance: 'stand',
            durations: [4, 4, 3, 4, 6, 8],
            hits: [{ frames: [2, 3], box: [2, 6, 46, 72], damage: 74, guard: 'mid', hitstun: 21, blockstun: 14, push: 20, hitstop: 11, spark: 'blade', shake: 2 }],
            cancelable: true, sfx: 'slashHeavy'
        },
        heavyFwd: {
            name: 'Tora Gari', anim: 'heavyFwd', kind: 'normal', stance: 'stand',
            durations: [4, 4, 4, 3, 3, 5, 6, 6],
            hits: [{ frames: [3, 4], box: [6, 0, 44, 70], damage: 80, guard: 'high', hitstun: 22, blockstun: 14, push: 14, hitstop: 12, spark: 'blade', shake: 4 }],
            cancelable: true, sfx: 'slashHeavy'
        },
        heavyBack: {
            name: 'Taille ascendante', anim: 'heavyBack', kind: 'normal', stance: 'stand',
            durations: [4, 3, 3, 4, 6, 7],
            hits: [{ frames: [1, 3], box: [0, 18, 44, 64], damage: 64, guard: 'mid', hitstun: 22, blockstun: 12, push: 8, launch: [0.6, 6.4], hitstop: 10, spark: 'blade' }],
            invuln: [1, 2],
            cancelable: true, sfx: 'slash'
        },
        airLight: {
            name: 'Taille aérienne', anim: 'airLight', kind: 'normal', stance: 'air',
            durations: [4, 10],
            hits: [{ frames: [1, 1], box: [-2, 4, 44, 30], damage: 34, guard: 'high', hitstun: 14, blockstun: 9, push: 8, hitstop: 7, spark: 'cut' }],
            chain: ['airHeavy'], cancelable: true, sfx: 'slash'
        },
        airHeavy: {
            name: 'Croissant aérien', anim: 'airHeavy', kind: 'normal', stance: 'air',
            durations: [3, 4, 4, 6, 8],
            hits: [{ frames: [1, 2], box: [0, 8, 52, 46], damage: 66, guard: 'high', hitstun: 18, blockstun: 12, push: 12, hitstop: 10, spark: 'blade' }],
            cancelable: true, landLag: 5, sfx: 'slash'
        },
        airSpecial: {
            name: 'Santōryū — plongée des trois sabres', anim: 'airSpecial', kind: 'special', stance: 'air',
            durations: [4, 3, 3, 30, 4, 6, 8],
            motion: [[1, 2.2, -6.0]],
            noGravity: true, landFrame: 5,
            hits: [{ frames: [1, 4], box: [-6, -6, 40, 44], damage: 82, guard: 'high', hitstun: 20, blockstun: 14, push: 16, knockdown: true, launch: [1.6, 3.6], hitstop: 12, spark: 'blade', shake: 4 }],
            fx: [[5, 'fx_spikes', 14, 0]],
            sfx: 'slashHeavy'
        },
        specialN: {
            name: 'Sanjūroku Pound Hō', anim: 'specialN', kind: 'special', stance: 'stand',
            durations: [4, 3, 4, 3, 3, 4, 6, 6, 6],
            hits: [],
            projectile: {
                anim: 'fx_pound', atFrame: 3, offset: [34, 34], speed: 4.4, life: 80,
                box: [-14, -24, 28, 48], fps: 12, hits: 1,
                hit: { damage: 80, guard: 'mid', hitstun: 22, blockstun: 16, push: 18, hitstop: 11, spark: 'blade', shake: 2, sfx: 'slashHeavy' }
            },
            sfx: 'slashHeavy'
        },
        specialF: {
            name: 'Oni Giri', anim: 'specialF', kind: 'special', stance: 'stand',
            durations: [4, 5, 4, 3, 3, 6, 8, 8, 6],
            motion: [[3, 6.4, 0], [5, 0, 0]],
            hits: [{ frames: [3, 5], box: [-6, 6, 52, 46], damage: 96, guard: 'mid', hitstun: 24, blockstun: 14, push: 22, launch: [3.0, 3.6], hitstop: 14, spark: 'blade', shake: 4 }],
            fx: [[5, 'fx_beam', -6, 26]],
            sfx: 'slashHeavy'
        },
        specialU: {
            name: 'Ō Tatsumaki', anim: 'specialU', kind: 'special', stance: 'stand',
            durations: [3, 3, 4, 4, 4, 5, 7, 7, 6, 8],
            motion: [[1, 1.2, 6.4]],
            invuln: [0, 3],
            hits: [
                { frames: [1, 3], box: [-10, 14, 48, 64], damage: 62, guard: 'mid', hitstun: 24, blockstun: 16, push: 8, launch: [0.8, 6.8], hitstop: 10, spark: 'blade', shake: 3 },
                { frames: [4, 5], box: [-10, 14, 48, 64], damage: 46, guard: 'mid', hitstun: 24, blockstun: 16, push: 10, launch: [1.2, 7.4], hitstop: 10, spark: 'big', shake: 4 }
            ],
            fx: [[2, 'fx_rise', 14, 44]],
            sfx: 'slashHeavy'
        },
        specialD: {
            name: 'Tatsumaki', anim: 'specialD', kind: 'special', stance: 'stand',
            durations: [6, 5, 6, 6, 5, 6, 8, 8],
            hits: [
                { frames: [2, 3], box: [-16, 0, 60, 80], damage: 22, guard: 'mid', hitstun: 22, blockstun: 10, push: 2, rehit: 4, hitstop: 4, spark: 'blade' },
                { frames: [4, 4], box: [-10, 0, 56, 70], damage: 56, guard: 'mid', hitstun: 26, blockstun: 16, push: 12, launch: [1.4, 6.6], hitstop: 12, spark: 'big', shake: 4 }
            ],
            fx: [[2, 'fx_cut', 22, 36]],
            sfx: 'slashHeavy'
        },
        ultimate: {
            name: 'Santōryū Ōgi — Rokudō no Tsuji', anim: 'ultimate', kind: 'ultimate', stance: 'stand',
            durations: [8, 8, 6, 6, 3, 3, 5, 6, 6, 6, 8, 10, 12],
            superFreeze: 55, cost: 100, invuln: [0, 7],
            motion: [[4, 7.2, 0], [6, 0, 0]],
            hits: [
                { frames: [4, 6], box: [-8, 0, 64, 60], damage: 30, guard: 'mid', hitstun: 60, blockstun: 20, push: 1, rehit: 3, hitstop: 4, spark: 'blade', shake: 3 },
                { frames: [7, 9], box: [-10, 0, 90, 90], damage: 250, guard: 'mid', hitstun: 50, blockstun: 22, push: 30, launch: [5.8, 5.6], wallBounce: true, hitstop: 24, spark: 'big', shake: 10 }
            ],
            fx: [[5, 'fx_lineA', -40, 22], [7, 'fx_rokudo', 34, 36]],
            sfx: 'slashHeavy'
        },
        // Two bars: the Sanzen Sekai spin (the green whirl row) bores in,
        // the pass-through slash, then the arms wind up and let the giant
        // blue serpent wave of the 360 Pound Hō fly across the whole stage.
        ultimate2: {
            name: 'Sanbyakurokujū Pound Hō', anim: 'ultimate2', kind: 'ultimate', stance: 'stand',
            durations: [5, 5, 3, 4, 4, 4, 4, 3, 5, 6, 6, 5, 4, 4, 4, 5, 6, 6, 8, 10, 12],
            superFreeze: 70, cost: 200, invuln: [0, 8],
            motion: [[2, 5.6, 0], [8, 0, 0]],
            hits: [
                { frames: [2, 7], box: [-10, 0, 62, 66], damage: 50, guard: 'mid', hitstun: 50, blockstun: 18, push: 1, rehit: 6, hitstop: 5, spark: 'blade', shake: 3 },
                { frames: [8, 8], box: [-8, 0, 66, 72], damage: 110, guard: 'mid', hitstun: 60, blockstun: 20, push: 2, hitstop: 12, spark: 'big', shake: 5 },
                { frames: [14, 14], box: [0, 4, 70, 70], damage: 150, guard: 'mid', hitstun: 40, blockstun: 20, push: 1, hitstop: 8, spark: 'blade', shake: 4 }
            ],
            projectile: {
                anim: 'fx_wave', atFrame: 14, offset: [70, 32], speed: 5.2, life: 110,
                box: [-80, -26, 160, 52], fps: 10, hits: 1,
                hit: { damage: 360, guard: 'mid', hitstun: 50, blockstun: 24, push: 30, launch: [5.6, 6.0], wallBounce: true, knockdown: true, hitstop: 24, spark: 'big', shake: 10, sfx: 'slashHeavy' }
            },
            fx: [[3, 'fx_cut', 20, 34], [8, 'fx_diag', 30, 36], [14, 'fx_waveburst', 34, 34]],
            sfx: 'slashHeavy'
        },
        throw: {
            name: 'Shishi Sonson', anim: 'throw', kind: 'throw', stance: 'stand',
            durations: [3, 4, 4, 3, 3, 6, 6, 6, 6, 8],
            hits: [{ frames: [0, 1], box: [4, 10, 30, 40], damage: 0, guard: 'unblockable', hitstun: 0, blockstun: 0, push: 0 }],
            throwRelease: { frame: 5, damage: 110, launch: [2.6, 5.0] },
            fx: [[5, 'fx_diag', 26, 34]],
            sfx: 'grab'
        }
    }
};
