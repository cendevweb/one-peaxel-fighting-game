import { describe, expect, it } from 'vitest';
import '../characters';
import { createMatch, stepMatch } from '../engine/match';
import { BTN, PX, type MatchState } from '../engine/types';

const { right, left, down, light, heavy, special } = BTN;

function fight(p1 = 'luffy', p2 = 'luffy'): MatchState {
    const s = createMatch(p1, p2);
    while (s.phase !== 'fight') stepMatch(s, [0, 0]);
    return s;
}

/** Runs `ticks` ticks holding the given inputs. */
function hold(s: MatchState, a: number, b: number, ticks: number) {
    const events = [];
    for (let i = 0; i < ticks; i++) events.push(...stepMatch(s, [a, b]));
    return events;
}

/** Press (one tick down, one up). */
function tap(s: MatchState, a: number, b = 0, dirA = 0) {
    return [...stepMatch(s, [a | dirA, b]), ...stepMatch(s, [dirA, b])];
}

function closeIn(s: MatchState) {
    s.fighters[0].x = s.fighters[1].x - 34 * PX;
}

describe('engine', () => {
    it('starts with both fighters facing each other', () => {
        const s = fight();
        expect(s.fighters[0].facing).toBe(1);
        expect(s.fighters[1].facing).toBe(-1);
    });

    it('walks forward and back', () => {
        const s = fight();
        const x0 = s.fighters[0].x;
        hold(s, right, 0, 30);
        expect(s.fighters[0].x).toBeGreaterThan(x0);
        const x1 = s.fighters[0].x;
        hold(s, left, 0, 30);
        expect(s.fighters[0].x).toBeLessThan(x1);
    });

    it('a jab hits an idle opponent and a blocked jab does not hurt', () => {
        const s = fight();
        closeIn(s);
        const ev = [...tap(s, light), ...hold(s, 0, 0, 20)];
        expect(ev.some((e) => e.type === 'hit')).toBe(true);
        expect(s.fighters[1].health).toBeLessThan(1000);

        const s2 = fight();
        closeIn(s2);
        const ev2 = [...stepMatch(s2, [light, right]), ...hold(s2, 0, right, 20)];
        expect(ev2.some((e) => e.type === 'block')).toBe(true);
        expect(s2.fighters[1].health).toBe(1000);
    });

    it('a low attack beats a standing guard, a crouching guard stops it', () => {
        const s = fight();
        closeIn(s);
        stepMatch(s, [down, right]);
        stepMatch(s, [down | light, right]);
        hold(s, down, right, 20);
        expect(s.fighters[1].health).toBeLessThan(1000);

        const s2 = fight();
        closeIn(s2);
        stepMatch(s2, [down, right | down]);
        stepMatch(s2, [down | light, right | down]);
        hold(s2, down, right | down, 20);
        expect(s2.fighters[1].health).toBe(1000);
    });

    it('chains light → light → light into a combo', () => {
        const s = fight();
        closeIn(s);
        let events = tap(s, light);
        for (let i = 0; i < 40; i++) {
            events.push(...stepMatch(s, [i % 4 === 0 ? light : 0, 0]));
        }
        const combo = events.filter((e) => e.type === 'combo');
        expect(combo.length).toBeGreaterThan(0);
        expect(Math.max(...combo.map((e) => (e.type === 'combo' ? e.hits : 0)))).toBeGreaterThanOrEqual(3);
    });

    it('throws a close opponent, and the throw can be teched', () => {
        const s = fight();
        closeIn(s);
        hold(s, light | heavy, 0, 1);
        hold(s, 0, 0, 40);
        expect(s.fighters[1].health).toBeLessThan(1000);

        const s2 = fight();
        closeIn(s2);
        stepMatch(s2, [light | heavy, 0]);
        stepMatch(s2, [0, 0]);
        stepMatch(s2, [0, light | heavy]);
        hold(s2, 0, 0, 40);
        expect(s2.fighters[1].health).toBe(1000);
    });

    it('the ultimate needs a full bar', () => {
        const s = fight();
        closeIn(s);
        tap(s, heavy | special);
        expect(s.fighters[0].move).not.toBe('ultimate');
        const s2 = fight();
        closeIn(s2);
        s2.fighters[0].meter = 100;
        const ev = tap(s2, heavy | special);
        expect(ev.some((e) => e.type === 'superFreeze')).toBe(true);
        hold(s2, 0, 0, 200);
        expect(s2.fighters[1].health).toBeLessThan(700);
        expect(s2.fighters[0].meter).toBeLessThan(100);
    });

    it('a quarter circle + S comes out as the neutral special', () => {
        const s = fight();
        stepMatch(s, [down, 0]);
        stepMatch(s, [down | right, 0]);
        stepMatch(s, [right, 0]);
        stepMatch(s, [right | special, 0]);
        expect(s.fighters[0].move).toBe('specialN');
    });

    it('replays identically from the same inputs', () => {
        const run = () => {
            const s = fight();
            let seed = 7;
            for (let i = 0; i < 1500; i++) {
                seed = (seed * 1103515245 + 12345) & 0x7fffffff;
                const a = (seed >> 8) & 0x7f;
                const b = (seed >> 16) & 0x7f;
                stepMatch(s, [a, b]);
            }
            return JSON.stringify(s);
        };
        expect(run()).toBe(run());
    });

    it('a KO ends the round and the match ends after two', () => {
        const s = fight();
        for (let round = 0; round < 2; round++) {
            while (s.phase !== 'fight') stepMatch(s, [0, 0]);
            s.fighters[1].health = 1;
            closeIn(s);
            tap(s, light);
            let guard = 0;
            while (!['intro', 'matchEnd'].includes(s.phase as string) && guard++ < 2000) stepMatch(s, [0, 0]);
        }
        expect(s.phase).toBe('matchEnd');
        expect(s.winner).toBe(0);
    });
});
