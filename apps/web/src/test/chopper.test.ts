import { describe, expect, it } from 'vitest';
import '../characters';
import { createMatch, stepMatch } from '../engine/match';
import { getChar } from '../engine/registry';
import { BTN, PX, type MatchState } from '../engine/types';

/**
 * Chopper's combos, checked frame by frame at point-blank against a dummy
 * that does nothing (or only guards). Against Luffy and against Akainu, who
 * is much bigger.
 */

const { up, down, right, light, heavy, special } = BTN;

function fight(p2: string): MatchState {
    const s = createMatch('chopper', p2);
    while (s.phase !== 'fight') stepMatch(s, [0, 0]);
    return s;
}

/** Puts P1 `gap` pixels in front of P2's body (0 = bodies touching). */
function place(s: MatchState, gap = 4) {
    const [a, b] = s.fighters;
    a.x = b.x - (getChar(a.char).width + getChar(b.char).width + gap) * PX;
}

interface Log { hits: string[]; blocks: number; maxCombo: number }

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

const holdFor = (input: number, n: number) => Array<number>(n).fill(input);
const press = (input: number, n: number, held = 0) => [input, ...holdFor(held, n - 1)];
const mash = (input: number, n: number, held = 0) => Array.from({ length: n }, (_, i) => (i % 2 ? held : input | held));
const unique = (xs: string[]) => xs.filter((x, i) => xs.indexOf(x) === i);
const dealt = (s: MatchState, foe: string) => getChar(foe).health - s.fighters[1].health;

for (const foe of ['luffy', 'akainu']) {
    describe(`Chopper vs ${foe}`, () => {
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

        it('heavy cancels into Heavy Gong (→S) and it all combos', () => {
            const s = fight(foe);
            place(s);
            const log = play(s, [...press(heavy, 8), ...mash(special, 16, right), ...holdFor(0, 100)]);
            expect(unique(log.hits)).toEqual(['heavy', 'specialF']);
            expect(log.maxCombo).toBeGreaterThanOrEqual(2);
            expect(dealt(s, foe)).toBeGreaterThanOrEqual(120);
        });

        it('heavy cancels into Kokutei (S) and the hoof mark combos', () => {
            const s = fight(foe);
            place(s);
            const log = play(s, [...press(heavy, 8), ...mash(special, 16), ...holdFor(0, 100)]);
            expect(unique(log.hits)).toEqual(['heavy', 'specialN']);
            expect(log.maxCombo).toBeGreaterThanOrEqual(2);
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

        it('the ultimate (Kokutei Roseo) connects with a full bar and hurts', () => {
            const s = fight(foe);
            place(s);
            s.fighters[0].meter = 100;
            const log = play(s, [heavy | special, ...holdFor(0, 220)]);
            expect(log.hits[0]).toBe('ultimate');
            expect(log.hits.length).toBeGreaterThanOrEqual(3);
            expect(dealt(s, foe)).toBeGreaterThanOrEqual(250);
        });

        it('O with two bars turns him into the Monster Point and it hits hard', () => {
            const s = fight(foe);
            place(s);
            s.fighters[0].meter = 200;
            stepMatch(s, [light | heavy | special, 0]);
            expect(s.fighters[0].move).toBe('ultimate2');
            expect(s.fighters[0].meter).toBe(0);
            const log = play(s, holdFor(0, 320));
            expect(log.hits[0]).toBe('ultimate2');
            expect(log.hits.length).toBeGreaterThanOrEqual(5);
            expect(dealt(s, foe)).toBeGreaterThanOrEqual(380);
            expect(dealt(s, foe)).toBeLessThanOrEqual(500);
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
            const log = play(s, [...press(heavy, 8), ...mash(light | heavy | special, 16), ...holdFor(0, 320)]);
            expect(unique(log.hits)).toEqual(['heavy', 'ultimate2']);
            expect(log.maxCombo).toBeGreaterThanOrEqual(5);
        });

        it('the Monster Point reaches much farther than the one-bar ultimate', () => {
            const s = fight(foe);
            place(s, 90);
            s.fighters[0].meter = 200;
            const log = play(s, [light | heavy | special, ...holdFor(0, 320)]);
            expect(log.hits).toContain('ultimate2');
        });

        it('Kokutei (S) flies across mid range', () => {
            const s = fight(foe);
            place(s, 110);
            const log = play(s, [special, ...holdFor(0, 80)]);
            expect(log.hits.length).toBe(1);
            expect(s.fighters[1].health).toBeLessThan(getChar(foe).health);
        });

        it('the ground slam (↓S) hits and knocks down', () => {
            const s = fight(foe);
            place(s);
            const log = play(s, [down | special, ...holdFor(0, 70)]);
            expect(log.hits).toEqual(['specialD']);
        });

        it('Heavy Gong (→S) reaches from a distance', () => {
            const s = fight(foe);
            place(s, 50);
            const log = play(s, [right | special, ...holdFor(0, 60)]);
            expect(log.hits).toEqual(['specialF']);
        });

        it('the uppercut (↑S) catches a jump', () => {
            const s = fight(foe);
            place(s, 10);
            stepMatch(s, [0, up]);
            let t = 0;
            while (s.fighters[1].y < 24 * PX && t++ < 40) stepMatch(s, [0, 0]);
            expect(s.fighters[1].y).toBeGreaterThan(0);
            const log = play(s, [up | special, ...holdFor(0, 50)]);
            expect(log.hits).toContain('specialU');
        });

        it('Kokutei Cross (air S) dives onto a standing foe', () => {
            const s = fight(foe);
            place(s, 30);
            play(s, [up, ...holdFor(0, 12)]);
            const log = play(s, [special, ...holdFor(0, 60)]);
            expect(log.hits).toContain('airSpecial');
        });

        it('jump-in airLight → airHeavy both hit', () => {
            const s = fight(foe);
            place(s, 80);
            stepMatch(s, [up | right, 0]);
            // Takes off, then presses L low on the way down, just in front.
            let t = 0;
            while (s.fighters[0].y === 0 && t++ < 10) stepMatch(s, [0, 0]);
            while ((s.fighters[0].vy > 0 || s.fighters[0].y > 62 * PX) && t++ < 80) stepMatch(s, [0, 0]);
            const log = play(s, [light, ...holdFor(0, 3), ...mash(heavy, 14), ...holdFor(0, 40)]);
            expect(log.hits).toContain('airLight');
            expect(log.hits).toContain('airHeavy');
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

        it('Kung Fu Point (→H) hits twice', () => {
            const s = fight(foe);
            place(s);
            const log = play(s, [right | heavy, ...holdFor(0, 50)]);
            expect(log.hits).toEqual(['heavyFwd', 'heavyFwd']);
        });

        it('Horn Point (←H) launches', () => {
            const s = fight(foe);
            place(s);
            const log = play(s, [heavy | BTN.left, ...holdFor(0, 20)]);
            expect(log.hits).toEqual(['heavyBack']);
            expect(s.fighters[1].y).toBeGreaterThan(0);
        });
    });
}
