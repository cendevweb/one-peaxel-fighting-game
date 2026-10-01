import { describe, expect, it } from 'vitest';
import '../characters';
import { createMatch, stepMatch } from '../engine/match';
import { getChar } from '../engine/registry';
import { BTN, PX, type MatchState } from '../engine/types';

/**
 * Drake's combos, checked frame by frame at point-blank against a dummy that
 * does nothing (or only guards). Against Luffy and against Akainu, who is
 * much bigger.
 */

const { up, down, right, light, heavy, special } = BTN;

function fight(p2: string): MatchState {
    const s = createMatch('drake', p2);
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
    describe(`Drake vs ${foe}`, () => {
        it('lightA → lightB → lightC connects all three', () => {
            const s = fight(foe);
            place(s);
            const log = play(s, [...press(light, 2), ...mash(light, 50), ...holdFor(0, 40)]);
            expect(unique(log.hits)).toEqual(['lightA', 'lightB', 'lightC']);
            expect(log.maxCombo).toBeGreaterThanOrEqual(4);
        });

        it('lightA → crouchHeavy (tail sweep) combos', () => {
            const s = fight(foe);
            place(s);
            const log = play(s, [...press(light, 3), ...mash(down | heavy, 20, down), ...holdFor(0, 60)]);
            expect(unique(log.hits)).toEqual(['lightA', 'crouchHeavy']);
            expect(log.maxCombo).toBeGreaterThanOrEqual(2);
        });

        it('heavy cancels into the dash thrust (→S) and it all combos', () => {
            const s = fight(foe);
            place(s);
            const log = play(s, [...press(heavy, 8), ...mash(special, 16, right), ...holdFor(0, 100)]);
            expect(unique(log.hits)).toEqual(['heavy', 'specialF']);
            expect(log.maxCombo).toBeGreaterThanOrEqual(2);
            expect(getChar(foe).health - s.fighters[1].health).toBeGreaterThanOrEqual(120);
        });

        it('heavy cancels into the rapid thrusts (S) and it all combos', () => {
            const s = fight(foe);
            place(s);
            const log = play(s, [...press(heavy, 8), ...mash(special, 16), ...holdFor(0, 100)]);
            expect(unique(log.hits)).toEqual(['heavy', 'specialN']);
            expect(log.maxCombo).toBeGreaterThanOrEqual(4);
        });

        it('the throw lands, pressed together or a tick apart', () => {
            const s = fight(foe);
            place(s);
            play(s, [light | heavy, ...holdFor(0, 80)]);
            expect(s.fighters[1].health).toBeLessThan(getChar(foe).health);

            const s2 = fight(foe);
            place(s2);
            play(s2, [light, light | heavy, ...holdFor(0, 80)]);
            expect(s2.fighters[0].move === null || s2.fighters[0].move === 'throw').toBe(true);
            expect(s2.fighters[1].health).toBeLessThan(getChar(foe).health);
        });

        it('the ultimate connects with a full bar and hurts', () => {
            const s = fight(foe);
            place(s);
            s.fighters[0].meter = 100;
            const log = play(s, [heavy | special, ...holdFor(0, 220)]);
            expect(log.hits[0]).toBe('ultimate');
            expect(log.hits.length).toBeGreaterThanOrEqual(3);
            expect(getChar(foe).health - s.fighters[1].health).toBeGreaterThanOrEqual(250);
        });

        it('O with two bars fires the Allosaurus charge and it hits hard', () => {
            const s = fight(foe);
            place(s);
            s.fighters[0].meter = 200;
            stepMatch(s, [light | heavy | special, 0]);
            expect(s.fighters[0].move).toBe('ultimate2');
            expect(s.fighters[0].meter).toBe(0);
            const log = play(s, holdFor(0, 300));
            expect(log.hits[0]).toBe('ultimate2');
            expect(log.hits.length).toBeGreaterThanOrEqual(5);
            const dmg = getChar(foe).health - s.fighters[1].health;
            expect(dmg).toBeGreaterThanOrEqual(400);
            expect(dmg).toBeLessThanOrEqual(480);
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
            const log = play(s, [...press(heavy, 8), ...mash(light | heavy | special, 16), ...holdFor(0, 300)]);
            expect(unique(log.hits)).toEqual(['heavy', 'ultimate2']);
            expect(log.maxCombo).toBeGreaterThanOrEqual(6);
        });

        it('the Allosaurus charge crosses the stage', () => {
            const s = fight(foe);
            place(s, 120);
            s.fighters[0].meter = 200;
            stepMatch(s, [light | heavy | special, 0]);
            const log = play(s, holdFor(0, 300));
            expect(log.hits.length).toBeGreaterThanOrEqual(3);
            expect(getChar(foe).health - s.fighters[1].health).toBeGreaterThanOrEqual(300);
        });

        it('the rapid thrusts (S) hit several times then launch', () => {
            const s = fight(foe);
            place(s);
            const log = play(s, [special, ...holdFor(0, 80)]);
            expect(log.hits.filter((h) => h === 'specialN').length).toBeGreaterThanOrEqual(4);
            expect(s.fighters[1].y).toBeGreaterThan(0);
        });

        it('the dash thrust (→S) reaches from a distance', () => {
            const s = fight(foe);
            place(s, 60);
            const log = play(s, [right | special, ...holdFor(0, 60)]);
            expect(unique(log.hits)).toEqual(['specialF']);
        });

        it('the red-flag cross (↓S) is an overhead that lands', () => {
            const s = fight(foe);
            place(s, 10);
            const hit = play(s, [down | special, ...holdFor(0, 80)], right | down);
            expect(hit.hits).toEqual(['specialD']);

            const s2 = fight(foe);
            place(s2, 10);
            const blocked = play(s2, [down | special, ...holdFor(0, 80)], right);
            expect(blocked.hits).toEqual([]);
            expect(blocked.blocks).toBe(1);
        });

        it('the rising slash (↑S) catches a jump', () => {
            const s = fight(foe);
            place(s, 10);
            stepMatch(s, [0, up]);
            let t = 0;
            while (s.fighters[1].y < 24 * PX && t++ < 40) stepMatch(s, [0, 0]);
            expect(s.fighters[1].y).toBeGreaterThan(0);
            const log = play(s, [up | special, ...holdFor(0, 50)]);
            expect(log.hits).toContain('specialU');
        });

        it('the falling axe (airSpecial) hits from a jump', () => {
            const s = fight(foe);
            place(s, 30);
            const log = play(s, [up | right, ...holdFor(0, 12), special, ...holdFor(0, 60)]);
            expect(log.hits).toContain('airSpecial');
        });

        it('air normals hit a standing foe', () => {
            const s = fight(foe);
            place(s, 50);
            const a = play(s, [up | right, ...holdFor(0, 24), light, ...holdFor(0, 40)]);
            expect(a.hits).toEqual(['airLight']);

            const s2 = fight(foe);
            place(s2, 50);
            const b = play(s2, [up | right, ...holdFor(0, 18), heavy, ...holdFor(0, 40)]);
            expect(b.hits).toEqual(['airHeavy']);
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

        it('heavyFwd (claw rake) is an overhead: only a standing guard stops it', () => {
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

        it('heavyBack (rising claw) launches', () => {
            const s = fight(foe);
            place(s);
            const log = play(s, [heavy | BTN.left, ...holdFor(0, 20)]);
            expect(log.hits).toEqual(['heavyBack']);
            expect(s.fighters[1].y).toBeGreaterThan(0);
        });
    });
}
