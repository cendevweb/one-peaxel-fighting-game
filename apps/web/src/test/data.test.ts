import { describe, expect, it } from 'vitest';
import { ROSTER } from '../characters';

/**
 * Character data and sprite manifests are written separately (one by hand,
 * one by tools/sprites/build_atlas.py). These checks bind them together, so
 * a re-extraction that drops a frame fails here instead of on screen.
 */
const REQUIRED_ANIMS = [
    'idle', 'walk', 'dash', 'backdash', 'crouch', 'jump', 'guard', 'guardLow', 'hit', 'hitHeavy',
    'launched', 'down', 'getup', 'dizzy', 'win'
];

describe.each(ROSTER.map((c) => [c.id, c] as const))('%s', (_id, def) => {
    it('has every animation the engine plays by name', () => {
        for (const anim of REQUIRED_ANIMS) expect(def.manifest.anims[anim], anim).toBeDefined();
        expect(def.manifest.anims.jump.frames.length).toBe(4);
        expect(def.manifest.anims.launched.frames.length).toBe(3);
    });

    it('gives one duration per animation frame for every move', () => {
        for (const [slot, move] of Object.entries(def.moves)) {
            const anim = def.manifest.anims[move.anim];
            expect(anim, `${slot} → ${move.anim}`).toBeDefined();
            expect(move.durations.length, `${slot} durations`).toBe(anim.frames.length);
            for (const hit of move.hits) {
                expect(hit.frames[0], `${slot} hit start`).toBeGreaterThanOrEqual(0);
                expect(hit.frames[1], `${slot} hit end`).toBeLessThan(anim.frames.length);
            }
            for (const [frame, fx] of move.fx ?? []) {
                expect(frame).toBeLessThan(anim.frames.length);
                expect(fx.length).toBeGreaterThan(0);
            }
            if (move.projectile) {
                expect(def.manifest.anims[move.projectile.anim], `${slot} projectile`).toBeDefined();
                expect(move.projectile.atFrame).toBeLessThan(anim.frames.length);
            }
            if (move.landFrame !== undefined) expect(move.landFrame).toBeLessThan(anim.frames.length);
            if (move.throwRelease) expect(move.throwRelease.frame).toBeLessThan(anim.frames.length);
        }
    });

    it('has portraits for the menus', () => {
        for (const img of ['portrait', 'face', 'art', 'cutin']) expect(def.manifest.images[img], img).toBeDefined();
    });
});
