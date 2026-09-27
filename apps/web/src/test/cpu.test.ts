import { describe, expect, it } from 'vitest';
import { ROSTER } from '../characters';
import { createMatch, stepMatch } from '../engine/match';
import { Cpu, LEVELS } from '../game/ai';

/**
 * Matches played to the end by two computer players. Catches crashes in move
 * data (a frame the engine cannot find, a projectile without an animation)
 * that only show up when the move is actually used, and a CPU that freezes
 * or never uses its specials.
 *
 * Each fighter plays three opponents, twice as player 1 and once as player 2,
 * so every character is covered on both sides without running all n² pairs.
 */
const n = ROSTER.length;
const ids = ROSTER.map((c) => c.id);
const SPECIALS = ['specialN', 'specialF', 'specialU', 'specialD', 'airSpecial', 'ultimate'];

function play(p1: string, p2: string, seed: number) {
    const s = createMatch(p1, p2);
    const cpus = [new Cpu(LEVELS[3], seed), new Cpu(LEVELS[2], seed + 1)];
    const used: [Set<string>, Set<string>] = [new Set(), new Set()];
    let damage = 0;
    let longestStill = 0;
    const still = [0, 0];
    const lastX = [0, 0];
    for (let i = 0; i < 99 * 60 * 6 && s.phase !== 'matchEnd'; i++) {
        const events = stepMatch(s, [cpus[0].next(s, 0), cpus[1].next(s, 1)]);
        for (const e of events) {
            if (e.type === 'hit') damage += e.damage;
            if (e.type === 'move') used[e.side].add(e.slot);
        }
        for (const side of [0, 1] as const) {
            const f = s.fighters[side];
            still[side] = s.phase === 'fight' && f.mode === 'idle' && f.x === lastX[side] ? still[side] + 1 : 0;
            lastX[side] = f.x;
            longestStill = Math.max(longestStill, still[side]);
        }
    }
    return { s, used, damage, longestStill };
}

describe.each(ids.map((id, i) => [id, i] as const))('computer playing %s', (id, i) => {
    const games: [string, string, 0 | 1][] = [
        [id, ids[(i + 1) % n], 0],
        [id, ids[(i + 3) % n], 0],
        [ids[(i + 5) % n], id, 1]
    ];
    const usedBy = new Set<string>();

    it.each(games)('%s vs %s finishes a match', (a, b, side) => {
        const { s, used, damage, longestStill } = play(a, b, i + 1);
        expect(s.phase).toBe('matchEnd');
        expect(damage).toBeGreaterThan(500);
        expect(used[0].size).toBeGreaterThan(5);
        expect(used[1].size).toBeGreaterThan(5);
        // Never frozen in place for five seconds in the middle of a round.
        expect(longestStill).toBeLessThan(300);
        for (const slot of used[side]) usedBy.add(slot);
    });

    it('uses its specials', () => {
        const specials = SPECIALS.filter((slot) => usedBy.has(slot));
        expect(specials.length, `${id} used ${[...usedBy].join(', ')}`).toBeGreaterThanOrEqual(4);
    });
});
