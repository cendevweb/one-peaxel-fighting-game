import { describe, expect, it } from 'vitest';
import '../characters';
import { createMatch, stepMatch } from '../engine/match';
import { getChar } from '../engine/registry';
import { BTN, PX, type MatchState } from '../engine/types';

/**
 * Kid's combos, checked frame by frame at point-blank against a dummy that
 * does nothing (or only guards). Against Luffy and against Akainu, who is
 * much bigger.
 */

const { up, down, right, light, heavy, special } = BTN;

function fight(p2: string): MatchState {
    const s = createMatch('kid', p2);
    while (s.phase !== 'fight') stepMatch(s, [0, 0]);
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
    describe(`Kid vs ${foe}`, () => {
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

        it('heavy cancels into Repel and the scrap combos', () => {
            const s = fight(foe);
            place(s);
            const log = play(s, [...press(heavy, 9), ...mash(special, 16), ...holdFor(0, 100)]);
            expect(unique(log.hits)).toEqual(['heavy', 'specialN']);
            expect(log.maxCombo).toBeGreaterThanOrEqual(2);
        });

        it('lightA, lightB cancels into Attraction (→S): both hits combo', () => {
            const s = fight(foe);
            place(s);
            const log = play(s, [...press(light, 5), ...press(light, 7), ...mash(special, 16, right), ...holdFor(0, 100)]);
            expect(unique(log.hits)).toEqual(['lightA', 'lightB', 'specialF']);
            expect(log.hits.filter((h) => h === 'specialF').length).toBe(2);
            expect(log.maxCombo).toBeGreaterThanOrEqual(4);
        });

        it('Attraction (→S) pulls a foe in from mid range and punches it', () => {
            const s = fight(foe);
            place(s, 90);
            const before = s.fighters[1].x - s.fighters[0].x;
            const log = play(s, [right | special, ...holdFor(0, 30)]);
            expect(log.hits[0]).toBe('specialF');
            expect(s.fighters[1].x - s.fighters[0].x).toBeLessThan(before);
            play(s, holdFor(0, 60));
            expect(getChar(foe).health - s.fighters[1].health).toBeGreaterThanOrEqual(80);
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

        it('Punk Gibson connects with a full bar and hurts', () => {
            const s = fight(foe);
            place(s);
            s.fighters[0].meter = 100;
            const log = play(s, [heavy | special, ...holdFor(0, 220)]);
            expect(log.hits[0]).toBe('ultimate');
            expect(log.hits.length).toBeGreaterThanOrEqual(2);
            expect(getChar(foe).health - s.fighters[1].health).toBeGreaterThanOrEqual(250);
        });

        it('Punk Gibson reaches from mid range', () => {
            const s = fight(foe);
            place(s, 60);
            s.fighters[0].meter = 100;
            const log = play(s, [heavy | special, ...holdFor(0, 220)]);
            expect(log.hits[0]).toBe('ultimate');
        });

        it('Repel flies across mid range', () => {
            const s = fight(foe);
            place(s, 120);
            const log = play(s, [special, ...holdFor(0, 90)]);
            expect(log.hits.length).toBe(1);
            expect(s.fighters[1].health).toBeLessThan(getChar(foe).health);
        });

        it('the scrap pillar (↓S) hits several times then launches, close or at mid range', () => {
            for (const gap of [4, 40]) {
                const s = fight(foe);
                place(s, gap);
                const log = play(s, [down | special, ...holdFor(0, 70)]);
                expect(log.hits.filter((h) => h === 'specialD').length).toBeGreaterThanOrEqual(3);
                expect(log.maxCombo).toBeGreaterThanOrEqual(3);
            }
        });

        it('the metal uppercut (↑S) catches a jump', () => {
            const s = fight(foe);
            place(s, 10);
            stepMatch(s, [0, up]);
            let t = 0;
            while (s.fighters[1].y < 24 * PX && t++ < 40) stepMatch(s, [0, 0]);
            expect(s.fighters[1].y).toBeGreaterThan(0);
            const log = play(s, [up | special, ...holdFor(0, 50)]);
            expect(log.hits).toContain('specialU');
        });

        it('the metal uppercut (↑S) hits a standing foe twice', () => {
            const s = fight(foe);
            place(s);
            const log = play(s, [up | special, ...holdFor(0, 60)]);
            expect(log.hits.filter((h) => h === 'specialU').length).toBe(2);
        });

        it('the scrap dive (air S) hits then the landing spikes hit again', () => {
            const s = fight(foe);
            place(s, 30);
            const log = play(s, [up, ...holdFor(0, 14), special, ...holdFor(0, 80)]);
            expect(log.hits.filter((h) => h === 'airSpecial').length).toBeGreaterThanOrEqual(1);
            expect(s.fighters[1].health).toBeLessThan(getChar(foe).health);
        });

        it('jump-in airLight → airHeavy chains', () => {
            const s = fight(foe);
            place(s, 50);
            const log = play(s, [up | right, ...holdFor(right, 24), light | right, ...holdFor(right, 6), heavy | right, ...holdFor(0, 60)]);
            expect(unique(log.hits)).toEqual(['airLight', 'airHeavy']);
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

        it('heavyFwd is an overhead: only a standing guard stops it', () => {
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
