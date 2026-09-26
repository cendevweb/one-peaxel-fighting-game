import { describe, expect, it } from 'vitest';
import '../characters';
import { createMatch, stepMatch } from '../engine/match';
import { getChar } from '../engine/registry';
import { BTN, PX, type MatchState } from '../engine/types';

/**
 * Akainu's combos, checked frame by frame at point-blank against a dummy that
 * does nothing (or only guards). Against Luffy, the smallest body, and
 * against Akainu himself.
 */

const { up, down, right, light, heavy, special } = BTN;

function fight(p2: string): MatchState {
    const s = createMatch('akainu', p2);
    while (s.phase !== 'fight') stepMatch(s, [0, 0]);
    return s;
}

/** Puts P1 `gap` pixels in front of P2's body (0 = bodies touching). */
function place(s: MatchState, gap = 4) {
    const [a, b] = s.fighters;
    a.x = b.x - (getChar(a.char).width + getChar(b.char).width + gap) * PX;
}

interface Log { hits: string[]; blocks: number; maxCombo: number }

/** Plays P1's inputs one per tick while P2 holds `p2` (a number, or one
 *  input per tick), logging which of P1's moves hit. */
function play(s: MatchState, p1: number[], p2: number | number[] = 0): Log {
    const log: Log = { hits: [], blocks: 0, maxCombo: 0 };
    p1.forEach((input, i) => {
        const b = typeof p2 === 'number' ? p2 : (p2[i] ?? 0);
        for (const e of stepMatch(s, [input, b])) {
            if (e.type === 'hit' && e.attacker === 0) log.hits.push(s.fighters[0].move ?? 'projectile');
            if (e.type === 'block' && e.attacker === 0) log.blocks++;
            if (e.type === 'combo' && e.side === 0) log.maxCombo = Math.max(log.maxCombo, e.hits);
        }
    });
    return log;
}

const holdFor = (input: number, n: number) => Array<number>(n).fill(input);
const press = (input: number, n: number, held = 0) => [input, ...holdFor(held, n - 1)];
/** Mashes `input` every other tick for `n` ticks. */
const mash = (input: number, n: number, held = 0) => Array.from({ length: n }, (_, i) => (i % 2 ? held : input | held));
const unique = (xs: string[]) => xs.filter((x, i) => xs.indexOf(x) === i);
const lost = (s: MatchState) => getChar(s.fighters[1].char).health - s.fighters[1].health;

for (const foe of ['luffy', 'akainu']) {
    describe(`Akainu vs ${foe}`, () => {
        it('lightA → lightB → lightC connects all three', () => {
            const s = fight(foe);
            place(s);
            const log = play(s, [...press(light, 2), ...mash(light, 60), ...holdFor(0, 40)]);
            expect(unique(log.hits)).toEqual(['lightA', 'lightB', 'lightC']);
            expect(log.maxCombo).toBeGreaterThanOrEqual(3);
        });

        it('lightA → crouchHeavy combos', () => {
            const s = fight(foe);
            place(s);
            const log = play(s, [...press(light, 4), ...mash(down | heavy, 20, down), ...holdFor(0, 60)]);
            expect(unique(log.hits)).toEqual(['lightA', 'crouchHeavy']);
            expect(log.maxCombo).toBeGreaterThanOrEqual(2);
        });

        it('heavy cancels into Meigo (→S) and it all combos', () => {
            const s = fight(foe);
            place(s);
            const log = play(s, [...press(heavy, 12), ...mash(special, 20, right), ...holdFor(0, 100)]);
            expect(unique(log.hits)).toEqual(['heavy', 'specialF']);
            expect(log.maxCombo).toBeGreaterThanOrEqual(2);
            expect(lost(s)).toBeGreaterThanOrEqual(180);
        });

        it('heavy cancels into the neutral special (Dai Funka) and it combos', () => {
            const s = fight(foe);
            place(s);
            const log = play(s, [...press(heavy, 12), ...mash(special, 24), ...holdFor(0, 100)]);
            expect(log.hits[0]).toBe('heavy');
            expect(log.maxCombo).toBeGreaterThanOrEqual(2);
        });

        it('the throw lands, pressed together or a tick apart', () => {
            const s = fight(foe);
            place(s);
            play(s, [light | heavy, ...holdFor(0, 60)]);
            expect(lost(s)).toBeGreaterThanOrEqual(100);

            const s2 = fight(foe);
            place(s2);
            play(s2, [light, light | heavy, ...holdFor(0, 60)]);
            expect(lost(s2)).toBeGreaterThanOrEqual(100);
        });

        it('the ultimate with a full bar connects for big damage', () => {
            const s = fight(foe);
            place(s);
            s.fighters[0].meter = 100;
            const log = play(s, [heavy | special, ...holdFor(0, 260)]);
            expect(unique(log.hits)).toEqual(['ultimate']);
            expect(lost(s)).toBeGreaterThanOrEqual(300);
        });

        it('Dai Funka hits at mid range', () => {
            const s = fight(foe);
            place(s, 110);
            const log = play(s, [special, ...holdFor(0, 120)]);
            expect(log.hits.length).toBeGreaterThan(0);
            expect(lost(s)).toBeGreaterThanOrEqual(60);
        });

        it('the eruption column (↑S) swats a jumping opponent', () => {
            const s = fight(foe);
            place(s, 10);
            // P2 jumps straight up; Akainu answers on the way up.
            const p2 = [...holdFor(up, 3), ...holdFor(0, 80)];
            const log = play(s, [...holdFor(0, 8), up | special, ...holdFor(up, 4), ...holdFor(0, 70)], p2);
            expect(log.hits).toContain('specialU');
        });

        it('the low jab is only blocked crouching, the overhead only standing', () => {
            const low = (guard: number) => {
                const s = fight(foe);
                place(s);
                play(s, [down, down | light, ...holdFor(down, 30)], guard);
                return lost(s);
            };
            expect(low(right)).toBeGreaterThan(0);
            expect(low(right | down)).toBe(0);

            const over = (guard: number) => {
                const s = fight(foe);
                place(s);
                play(s, [right, right | heavy, ...holdFor(right, 50)], guard);
                return lost(s);
            };
            expect(over(right | down)).toBeGreaterThan(0);
            expect(over(right)).toBe(0);
        });
    });
}
