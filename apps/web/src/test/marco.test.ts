import { describe, expect, it } from 'vitest';
import '../characters';
import { createMatch, stepMatch } from '../engine/match';
import { getChar } from '../engine/registry';
import { BTN, PX, type MatchState } from '../engine/types';

/**
 * Marco's combos, checked frame by frame at point-blank against a dummy that
 * does nothing (or only guards). Against Luffy and against Akainu, who is
 * much bigger.
 */

const { up, down, right, light, heavy, special } = BTN;

function fight(p2: string): MatchState {
    const s = createMatch('marco', p2);
    while (s.phase !== 'fight') stepMatch(s, [0, 0]);
    // Round 2: the two-bar ultimate is locked in round 1.
    s.round = 2;
    return s;
}

/** Puts P1 `gap` pixels in front of P2's body (0 = bodies touching). */
function place(s: MatchState, gap = 4) {
    const [a, b] = s.fighters;
    a.x = b.x - (getChar(a.char).width + getChar(b.char).width + gap) * PX;
}

interface Log { hits: string[]; blocks: number; maxCombo: number }

/** Plays P1's inputs one per tick while P2 holds `p2`, logging which of
 *  P1's moves hit. */
function play(s: MatchState, p1: number[], p2 = 0): Log {
    const log: Log = { hits: [], blocks: 0, maxCombo: 0 };
    for (const input of p1) {
        for (const e of stepMatch(s, [input, p2])) {
            if (e.type === 'hit' && e.attacker === 0) log.hits.push(s.fighters[0].move ?? '?');
            if (e.type === 'block' && e.attacker === 0) log.blocks++;
            if (e.type === 'combo' && e.side === 0) log.maxCombo = Math.max(log.maxCombo, e.hits);
        }
    }
    return log;
}

/** `n` ticks of `input`, or an input pressed on one tick and released for the rest. */
const holdFor = (input: number, n: number) => Array<number>(n).fill(input);
const press = (input: number, n: number, held = 0) => [input, ...holdFor(held, n - 1)];
/** Mashes `input` every other tick for `n` ticks. */
const mash = (input: number, n: number, held = 0) => Array.from({ length: n }, (_, i) => (i % 2 ? held : input | held));
const unique = (xs: string[]) => xs.filter((x, i) => xs.indexOf(x) === i);

for (const foe of ['luffy', 'akainu']) {
    describe(`Marco vs ${foe}`, () => {
        it('lightA → lightB → lightC connects all three', () => {
            const s = fight(foe);
            place(s);
            const log = play(s, [...press(light, 2), ...mash(light, 50), ...holdFor(0, 40)]);
            expect(unique(log.hits)).toEqual(['lightA', 'lightB', 'lightC']);
            expect(log.maxCombo).toBeGreaterThanOrEqual(3);
        });

        it('lightA → crouchHeavy combos', () => {
            const s = fight(foe);
            place(s);
            const log = play(s, [...press(light, 3), ...mash(down | heavy, 20, down), ...holdFor(0, 60)]);
            expect(unique(log.hits)).toEqual(['lightA', 'crouchHeavy']);
            expect(log.maxCombo).toBeGreaterThanOrEqual(2);
        });

        it('heavy cancels into the phoenix flight (→S) and it all combos', () => {
            const s = fight(foe);
            place(s);
            const log = play(s, [...press(heavy, 10), ...mash(special, 16, right), ...holdFor(0, 100)]);
            expect(unique(log.hits)).toEqual(['heavy', 'specialF']);
            expect(log.maxCombo).toBeGreaterThanOrEqual(2);
            expect(getChar(foe).health - s.fighters[1].health).toBeGreaterThanOrEqual(120);
        });

        it('lightA → lightB → lightC → blue flame (S) combos', () => {
            const s = fight(foe);
            place(s);
            const log = play(s, [...press(light, 2), ...mash(light, 30), ...mash(special, 30), ...holdFor(0, 60)]);
            expect(unique(log.hits)).toEqual(['lightA', 'lightB', 'lightC', 'specialN']);
            expect(log.maxCombo).toBeGreaterThanOrEqual(4);
        });

        it('the throw lands, pressed together or a tick apart', () => {
            const s = fight(foe);
            place(s);
            play(s, [light | heavy, ...holdFor(0, 60)]);
            expect(s.fighters[1].health).toBeLessThan(getChar(foe).health);

            const s2 = fight(foe);
            place(s2);
            play(s2, [light, light | heavy, ...holdFor(0, 60)]);
            expect(s2.fighters[0].move === null || s2.fighters[0].move === 'throw').toBe(true);
            expect(s2.fighters[1].health).toBeLessThan(getChar(foe).health);
        });

        it('the ultimate connects with a full bar and hurts', () => {
            const s = fight(foe);
            place(s);
            s.fighters[0].meter = 100;
            const log = play(s, [heavy | special, ...holdFor(0, 220)]);
            expect(log.hits[0]).toBe('ultimate');
            expect(log.hits.length).toBeGreaterThanOrEqual(2);
            expect(getChar(foe).health - s.fighters[1].health).toBeGreaterThanOrEqual(250);
        });

        it('the giant phoenix dive (O) with two bars hits hard', () => {
            const s = fight(foe);
            place(s);
            s.fighters[0].meter = 200;
            const log = play(s, [light | heavy | special, ...holdFor(0, 260)]);
            expect(log.hits[0]).toBe('ultimate2');
            expect(log.hits.length).toBeGreaterThanOrEqual(4);
            expect(getChar(foe).health - s.fighters[1].health).toBeGreaterThanOrEqual(380);
        });

        it('the giant phoenix dive (O) reaches mid range', () => {
            const s = fight(foe);
            place(s, 90);
            s.fighters[0].meter = 200;
            const log = play(s, [light | heavy | special, ...holdFor(0, 260)]);
            expect(log.hits[0]).toBe('ultimate2');
            expect(getChar(foe).health - s.fighters[1].health).toBeGreaterThanOrEqual(300);
        });

        it('O with a single bar does nothing and keeps the gauge', () => {
            const s = fight(foe);
            place(s);
            s.fighters[0].meter = 100;
            const log = play(s, [light | heavy | special, ...holdFor(0, 120)]);
            expect(log.hits).not.toContain('ultimate2');
            expect(log.hits).not.toContain('ultimate');
            expect(s.fighters[0].meter).toBeGreaterThanOrEqual(100);
        });

        it('heavy cancels into the giant phoenix dive (O) and it all combos', () => {
            const s = fight(foe);
            place(s);
            s.fighters[0].meter = 200;
            const log = play(s, [...press(heavy, 8), ...mash(light | heavy | special, 10), ...holdFor(0, 260)]);
            expect(unique(log.hits)).toEqual(['heavy', 'ultimate2']);
            expect(log.maxCombo).toBeGreaterThanOrEqual(4);
        });

        it('the blue flame (S) flies across mid range', () => {
            const s = fight(foe);
            place(s, 110);
            const log = play(s, [special, ...holdFor(0, 80)]);
            expect(log.hits.length).toBe(1);
            expect(s.fighters[1].health).toBeLessThan(getChar(foe).health);
        });

        it('the wing charge (↓S) reaches from a distance and launches', () => {
            const s = fight(foe);
            place(s, 30);
            const log = play(s, [down | special, ...holdFor(0, 24)]);
            expect(log.hits).toEqual(['specialD']);
            expect(s.fighters[1].y).toBeGreaterThan(0);
        });

        it('the phoenix flight (→S) reaches from a distance', () => {
            const s = fight(foe);
            place(s, 50);
            const log = play(s, [right | special, ...holdFor(0, 60)]);
            expect(log.hits).toEqual(['specialF']);
        });

        it('Phoenix Brand (air S) dives onto a standing foe', () => {
            const s = fight(foe);
            place(s, 40);
            const log = play(s, [up | right, ...holdFor(0, 14), special, ...holdFor(0, 60)]);
            expect(log.hits).toContain('airSpecial');
            expect(s.fighters[0].y).toBe(0);
        });

        it('jump-in airLight → airHeavy', () => {
            const s = fight(foe);
            place(s, 70);
            // Forward jump; the kicks come out on the way down, head high.
            stepMatch(s, [up | right, 0]);
            let t = 0;
            while ((t < 20 || s.fighters[0].y > 68 * PX) && t++ < 60) stepMatch(s, [0, 0]);
            const log = play(s, [light, ...holdFor(0, 7), heavy, ...holdFor(0, 40)]);
            expect(log.hits).toContain('airLight');
            expect(log.hits).toContain('airHeavy');
        });

        it('the rising kick (↑S) catches a jump', () => {
            const s = fight(foe);
            place(s, 10);
            // P2 jumps straight up; P1 answers when it is well off the ground.
            stepMatch(s, [0, up]);
            let t = 0;
            while (s.fighters[1].y < 24 * PX && t++ < 40) stepMatch(s, [0, 0]);
            expect(s.fighters[1].y).toBeGreaterThan(0);
            const log = play(s, [up | special, ...holdFor(0, 50)]);
            expect(log.hits).toContain('specialU');
        });

        it('crouchLight is low: only a crouching guard stops it', () => {
            const s = fight(foe);
            place(s);
            const hit = play(s, [down, down | light, ...holdFor(down, 25)], right);
            expect(hit.hits).toEqual(['crouchLight']);

            const s2 = fight(foe);
            place(s2);
            const blocked = play(s2, [down, down | light, ...holdFor(down, 25)], right | down);
            expect(blocked.hits).toEqual([]);
            expect(blocked.blocks).toBe(1);
        });

        it('heavyFwd (diving talon) is an overhead: only a standing guard stops it', () => {
            const s = fight(foe);
            place(s);
            const hit = play(s, [right | heavy, ...holdFor(0, 50)], right | down);
            expect(hit.hits).toEqual(['heavyFwd']);

            const s2 = fight(foe);
            place(s2);
            const blocked = play(s2, [right | heavy, ...holdFor(0, 50)], right);
            expect(blocked.hits).toEqual([]);
            expect(blocked.blocks).toBe(1);
        });

        it('heavyBack launches', () => {
            const s = fight(foe);
            place(s);
            const log = play(s, [heavy | BTN.left, ...holdFor(0, 20)]);
            expect(log.hits).toEqual(['heavyBack']);
            expect(s.fighters[1].y).toBeGreaterThan(0);
        });
    });
}
