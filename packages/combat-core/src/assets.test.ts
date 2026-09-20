import { readFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { CHARACTER_LIST } from './characters/index.js';
import { STAGES } from './stages.js';

/**
 * The bridge between gameplay data and published assets.
 *
 * A move whose animation key does not exist renders as a frozen sprite and
 * nothing in the type system notices — the key is just a string. These tests
 * are what turns that into a failing build.
 */
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const atlasDir = join(repoRoot, 'apps/web/public/atlases');
const manifestPath = join(atlasDir, 'manifest.json');

interface Manifest {
    characters: Array<{
        id: string;
        texture: string;
        frameWidth: number;
        frameHeight: number;
        animations: Array<{ key: string; frames: string[]; frameRate: number; repeat: number; flip?: boolean }>;
        warnings: string[];
    }>;
    stages: Array<{ id: string; image: string; width: number; height: number }>;
}

const manifest: Manifest | null = existsSync(manifestPath)
    ? (JSON.parse(readFileSync(manifestPath, 'utf8')) as Manifest)
    : null;

describe.skipIf(manifest === null)('published assets', () => {
    const published = manifest as Manifest;

    it('publishes an atlas for every playable character', () => {
        for (const character of CHARACTER_LIST) {
            const entry = published.characters.find((item) => item.id === character.id);
            expect(entry, `aucun atlas pour ${character.id}`).toBeDefined();
            expect(existsSync(join(atlasDir, `${character.texture}.png`))).toBe(true);
            expect(existsSync(join(atlasDir, `${character.texture}.json`))).toBe(true);
        }
    });

    it('resolves every animation a character refers to', () => {
        const keys = new Set(
            published.characters.flatMap((character) =>
                character.animations.filter((animation) => animation.frames.length > 0).map((animation) => animation.key)
            )
        );

        for (const character of CHARACTER_LIST) {
            for (const key of Object.values(character.animations)) {
                expect(keys.has(key), `${character.id} : animation manquante ${key}`).toBe(true);
            }
            for (const move of character.moves) {
                expect(keys.has(move.animation), `${move.id} : animation manquante ${move.animation}`).toBe(true);
                if (move.projectile) {
                    expect(
                        keys.has(move.projectile.animation),
                        `${move.id} : effet manquant ${move.projectile.animation}`
                    ).toBe(true);
                }
            }
        }
    });

    it('resolves every effect a move puts on screen', () => {
        const keys = new Set(
            published.characters.flatMap((character) =>
                character.animations.filter((animation) => animation.frames.length > 0).map((animation) => animation.key)
            )
        );

        for (const character of CHARACTER_LIST) {
            for (const spark of Object.values(character.hitEffects ?? {})) {
                expect(keys.has(spark.animation), `${character.id} : etincelle manquante ${spark.animation}`).toBe(true);
            }
            for (const move of character.moves) {
                for (const effect of move.effects ?? []) {
                    expect(keys.has(effect.animation), `${move.id} : effet manquant ${effect.animation}`).toBe(true);
                }
                if (move.impactEffect) {
                    expect(
                        keys.has(move.impactEffect.animation),
                        `${move.id} : etincelle manquante ${move.impactEffect.animation}`
                    ).toBe(true);
                }
            }
        }
    });

    /**
     * The whole point of `impactFrame` is that the frame it names is the one on
     * screen when the hitbox opens. A frame index past the end of the animation
     * silently clamps to the last frame, which looks like the move simply has
     * no wind-up — so it is checked rather than clamped and forgotten.
     */
    it('points every impact frame at a frame the animation has', () => {
        const byKey = new Map(
            published.characters.flatMap((character) => character.animations.map((animation) => [animation.key, animation]))
        );

        for (const character of CHARACTER_LIST) {
            for (const move of character.moves) {
                const animation = byKey.get(move.animation);
                if (!animation || move.impactFrame === undefined) {
                    continue;
                }
                expect(
                    move.impactFrame,
                    `${move.id} : frame d'impact ${move.impactFrame} hors de ${move.animation} (${animation.frames.length} frames)`
                ).toBeLessThan(animation.frames.length);
                expect(move.impactFrame, `${move.id} : frame d'impact negative`).toBeGreaterThanOrEqual(0);
            }
        }
    });

    /**
     * An effect that fires after the move is over is an effect nobody sees.
     */
    it('spawns every effect within the move that owns it', () => {
        for (const character of CHARACTER_LIST) {
            for (const move of character.moves) {
                for (const effect of move.effects ?? []) {
                    expect(effect.frame, `${move.id} : effet ${effect.animation} hors du move`).toBeLessThan(
                        move.duration
                    );
                    expect(effect.frame, `${move.id} : effet ${effect.animation} avant le move`).toBeGreaterThanOrEqual(0);
                }
            }
        }
    });

    it('publishes a backdrop for every stage', () => {
        for (const stage of STAGES) {
            const entry = published.stages.find((item) => item.id === stage.id);
            expect(entry, `aucun decor pour ${stage.id}`).toBeDefined();
            expect(existsSync(join(atlasDir, '..', 'stages', entry!.image))).toBe(true);
            // Wide enough for the viewport plus the parallax travel.
            expect(entry!.width).toBeGreaterThanOrEqual(1200);
        }
    });

    it('extracted every sheet without a warning', () => {
        for (const character of published.characters) {
            expect(character.warnings, character.id).toEqual([]);
        }
    });

    it('gives each animation enough frames to read as motion', () => {
        for (const character of published.characters) {
            for (const animation of character.animations) {
                expect(animation.frames.length, `${animation.key} est vide`).toBeGreaterThan(0);
            }
        }
    });
});
