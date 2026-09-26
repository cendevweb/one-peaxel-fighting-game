import { describe, expect, it } from 'vitest';
import { ROSTER } from '../characters';
import { createMatch, stepMatch } from '../engine/match';
import { Cpu, LEVELS } from '../game/ai';

/**
 * Every pairing, played to the end by two computer players. Catches crashes
 * in move data (a frame the engine cannot find, a projectile without an
 * animation) that only show up when the move is actually used.
 */
const pairs = ROSTER.flatMap((a) => ROSTER.map((b) => [a.id, b.id] as const));

describe('computer vs computer', () => {
    it.each(pairs)('%s vs %s finishes a match', (a, b) => {
        const s = createMatch(a, b);
        const cpus = [new Cpu(LEVELS[3], 1), new Cpu(LEVELS[2], 2)];
        const used = new Set<string>();
        let damage = 0;
        for (let i = 0; i < 99 * 60 * 6 && s.phase !== 'matchEnd'; i++) {
            const events = stepMatch(s, [cpus[0].next(s, 0), cpus[1].next(s, 1)]);
            for (const e of events) {
                if (e.type === 'hit') damage += e.damage;
                if (e.type === 'move') used.add(e.slot);
            }
        }
        expect(s.phase).toBe('matchEnd');
        expect(damage).toBeGreaterThan(500);
        expect(used.size).toBeGreaterThan(5);
    });
});
