import { describe, expect, it } from 'vitest';
import '../characters';
import { createMatch, stepMatch } from '../engine/match';
import { getChar } from '../engine/registry';
import { BTN, PX, type MatchState } from '../engine/types';

/**
 * Vivi's combos, checked frame by frame at point-blank against a dummy that
 * does nothing (or only guards). Against Luffy and against Akainu, who is
 * much bigger.
 */

const { up, down, right, light, heavy, special } = BTN;

function fight(p2: string): MatchState {
    const s = createMatch('vivi', p2);
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
/** Distinct moves that hit, in order ('?' is a wall bounce after the move ended). */
const unique = (xs: string[]) => xs.filter((x, i) => x !== '?' && xs.indexOf(x) === i);

for (const foe of ['luffy', 'akainu']) {
    describe(`Vivi vs ${foe}`, () => {
        const lost = (s: MatchState) => getChar(foe).health - s.fighters[1].health;

        it('lightA → lightB → lightC connects all three', () => {
            const s = fight(foe);
            place(s);
            const log = play(s, [...press(light, 2), ...mash(light, 50), ...holdFor(0, 50)]);
            expect(unique(log.hits)).toEqual(['lightA', 'lightB', 'lightC']);
            expect(log.maxCombo).toBeGreaterThanOrEqual(4);
        });

        it('lightA → crouchHeavy combos', () => {
            const s = fight(foe);
            place(s);
            const log = play(s, [...press(light, 3), ...mash(down | heavy, 20, down), ...holdFor(0, 60)]);
            expect(unique(log.hits)).toEqual(['lightA', 'crouchHeavy']);
            expect(log.maxCombo).toBeGreaterThanOrEqual(2);
        });

        it('lightA → lightB → heavy (string spiral) combos', () => {
            const s = fight(foe);
            place(s);
            const log = play(s, [...press(light, 8), ...press(light, 8), ...mash(heavy, 12), ...holdFor(0, 60)]);
            expect(unique(log.hits)).toEqual(['lightA', 'lightB', 'heavy']);
            expect(log.maxCombo).toBeGreaterThanOrEqual(4);
        });

        it('heavy cancels into the Karoo ride (→S) and it all combos', () => {
            const s = fight(foe);
            place(s);
            const log = play(s, [...press(heavy, 8), ...mash(special, 16, right), ...holdFor(0, 100)]);
            expect(unique(log.hits)).toEqual(['heavy', 'specialF']);
            expect(log.maxCombo).toBeGreaterThanOrEqual(4);
            expect(lost(s)).toBeGreaterThanOrEqual(120);
        });

        it('lightC cancels into Karoo, fonce ! (S) and it combos', () => {
            const s = fight(foe);
            place(s);
            const log = play(s, [...press(light, 8), ...press(light, 8), ...press(light, 14), ...mash(special, 10), ...holdFor(0, 80)]);
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
            const log = play(s, [heavy | special, ...holdFor(0, 240)]);
            expect(log.hits[0]).toBe('ultimate');
            expect(log.hits.length).toBeGreaterThanOrEqual(6);
            expect(lost(s)).toBeGreaterThanOrEqual(280);
        });

        it('heavy cancels into the ultimate and it combos', () => {
            const s = fight(foe);
            place(s);
            s.fighters[0].meter = 100;
            const log = play(s, [...press(heavy, 8), ...mash(heavy | special, 16), ...holdFor(0, 240)]);
            expect(unique(log.hits)).toEqual(['heavy', 'ultimate']);
            expect(log.maxCombo).toBeGreaterThanOrEqual(6);
        });

        it('O with two bars sends the Super Spot-Billed Duck Squad and it hits hard', () => {
            const s = fight(foe);
            place(s);
            s.fighters[0].meter = 200;
            stepMatch(s, [light | heavy | special, 0]);
            expect(s.fighters[0].move).toBe('ultimate2');
            expect(s.fighters[0].meter).toBe(0);
            const log = play(s, holdFor(0, 280));
            expect(log.hits[0]).toBe('ultimate2');
            expect(log.hits.length).toBeGreaterThanOrEqual(5);
            expect(lost(s)).toBeGreaterThanOrEqual(380);
        });

        it('the stampede crosses the stage from mid range', () => {
            const s = fight(foe);
            place(s, 150);
            s.fighters[0].meter = 200;
            const log = play(s, [light | heavy | special, ...holdFor(0, 280)]);
            expect(log.hits.length).toBeGreaterThanOrEqual(4);
            expect(lost(s)).toBeGreaterThanOrEqual(300);
        });

        it('O with a single bar does nothing and keeps the gauge', () => {
            const s = fight(foe);
            place(s);
            s.fighters[0].meter = 100;
            stepMatch(s, [light | heavy | special, 0]);
            expect(s.fighters[0].move).not.toBe('ultimate2');
            const log = play(s, holdFor(0, 120));
            expect(log.hits).not.toContain('ultimate2');
            expect(s.fighters[0].meter).toBeGreaterThanOrEqual(100);
        });

        it('heavy cancels into the two-bar ultimate and it combos', () => {
            const s = fight(foe);
            place(s);
            s.fighters[0].meter = 200;
            const log = play(s, [...press(heavy, 8), ...mash(light | heavy | special, 16), ...holdFor(0, 280)]);
            expect(unique(log.hits)).toEqual(['heavy', 'ultimate2']);
            expect(log.maxCombo).toBeGreaterThanOrEqual(5);
        });

        it('Karoo, fonce ! (S) charges across mid range', () => {
            const s = fight(foe);
            place(s, 120);
            const log = play(s, [special, ...holdFor(0, 80)]);
            expect(log.hits).toEqual(['specialN']);
        });

        it('the Karoo ride (→S) reaches from a distance and hits several times', () => {
            const s = fight(foe);
            place(s, 50);
            const log = play(s, [right | special, ...holdFor(0, 90)]);
            expect(unique(log.hits)).toEqual(['specialF']);
            expect(log.hits.length).toBeGreaterThanOrEqual(3);
        });

        it('the perfume dance (↓S) hits several times then knocks down', () => {
            const s = fight(foe);
            place(s);
            const log = play(s, [down | special, ...holdFor(0, 90)]);
            expect(log.hits.filter((h) => h === 'specialD').length).toBeGreaterThanOrEqual(3);
            expect(log.maxCombo).toBeGreaterThanOrEqual(3);
        });

        it('the rising whirl (↑S) catches a jump', () => {
            const s = fight(foe);
            place(s, 10);
            stepMatch(s, [0, up]);
            let t = 0;
            while (s.fighters[1].y < 24 * PX && t++ < 40) stepMatch(s, [0, 0]);
            expect(s.fighters[1].y).toBeGreaterThan(0);
            const log = play(s, [up | special, ...holdFor(0, 50)]);
            expect(log.hits).toContain('specialU');
        });

        it('the string rain (air S) hits a standing foe below', () => {
            const s = fight(foe);
            place(s, 4);
            const log = play(s, [up, ...holdFor(0, 14), special, ...holdFor(0, 80)]);
            expect(log.hits).toContain('airSpecial');
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

        it('heavyFwd (Peacock String Slasher) reaches far', () => {
            const s = fight(foe);
            place(s, 60);
            const log = play(s, [right | heavy, ...holdFor(0, 50)]);
            expect(log.hits).toEqual(['heavyFwd']);
        });

        it('heavyBack launches', () => {
            const s = fight(foe);
            place(s);
            const log = play(s, [heavy | BTN.left, ...holdFor(0, 20)]);
            expect(log.hits).toEqual(['heavyBack']);
            expect(s.fighters[1].y).toBeGreaterThan(0);
        });

        it('jump-in airHeavy → crouchHeavy combos', () => {
            const s = fight(foe);
            place(s, 40);
            const log = play(s, [up | right, ...holdFor(right, 22), heavy, ...holdFor(0, 30), ...mash(down | heavy, 20, down), ...holdFor(0, 40)]);
            expect(log.hits).toContain('airHeavy');
        });
    });
}
