import { describe, expect, it } from 'vitest';
import '../characters';
import { createMatch, stepMatch } from '../engine/match';
import { getChar } from '../engine/registry';
import { BTN, PX, type MatchState } from '../engine/types';

/**
 * Robin's combos and ranged moves, checked frame by frame against a dummy
 * that does nothing (or only guards). Against Luffy and against Akainu, who
 * is much bigger.
 */

const { up, down, right, left, light, heavy, special } = BTN;

function fight(p2: string): MatchState {
    const s = createMatch('robin', p2);
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
const lost = (s: MatchState, foe: string) => getChar(foe).health - s.fighters[1].health;

for (const foe of ['luffy', 'akainu']) {
    describe(`Robin vs ${foe}`, () => {
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

        it('lightA → heavy (Seis Fleurs Slap) combos', () => {
            const s = fight(foe);
            place(s);
            const log = play(s, [...press(light, 3), ...mash(heavy, 16), ...holdFor(0, 50)]);
            expect(unique(log.hits)).toEqual(['lightA', 'heavy']);
            expect(log.maxCombo).toBeGreaterThanOrEqual(2);
        });

        it('lightC cancels into Gigante Fleur (↓S) and it all combos', () => {
            const s = fight(foe);
            place(s);
            const log = play(s, [...press(light, 2), ...mash(light, 26), ...mash(down | special, 20, down), ...holdFor(0, 90)]);
            expect(unique(log.hits)).toEqual(['lightA', 'lightB', 'lightC', 'specialD']);
            expect(log.maxCombo).toBeGreaterThanOrEqual(5);
        });

        it('the throw (Clutch) lands, pressed together or a tick apart', () => {
            const s = fight(foe);
            place(s);
            play(s, [light | heavy, ...holdFor(0, 70)]);
            expect(s.fighters[1].health).toBeLessThan(getChar(foe).health);

            const s2 = fight(foe);
            place(s2);
            play(s2, [light, light | heavy, ...holdFor(0, 70)]);
            expect(s2.fighters[0].move === null || s2.fighters[0].move === 'throw').toBe(true);
            expect(s2.fighters[1].health).toBeLessThan(getChar(foe).health);
        });

        it('the ultimate (Gigantesco Mano) connects with a full bar and hurts', () => {
            const s = fight(foe);
            place(s);
            s.fighters[0].meter = 100;
            const log = play(s, [heavy | special, ...holdFor(0, 240)]);
            expect(log.hits[0]).toBe('ultimate');
            expect(log.hits.length).toBeGreaterThanOrEqual(2);
            expect(lost(s, foe)).toBeGreaterThanOrEqual(250);
        });

        it('the ultimate also reaches across the screen', () => {
            const s = fight(foe);
            place(s, 120);
            s.fighters[0].meter = 100;
            const log = play(s, [heavy | special, ...holdFor(0, 240)]);
            expect(log.hits).toContain('ultimate');
        });

        it('O with two bars: Cien Fleurs Delphinium connects point blank and hurts', () => {
            const s = fight(foe);
            place(s);
            s.fighters[0].meter = 200;
            play(s, [light | heavy | special]);
            expect(s.fighters[0].meter).toBe(0);
            const log = play(s, holdFor(0, 260));
            expect(log.hits[0]).toBe('ultimate2');
            expect(log.hits.length).toBeGreaterThanOrEqual(5);
            expect(lost(s, foe)).toBeGreaterThanOrEqual(380);
            expect(lost(s, foe)).toBeLessThanOrEqual(500);
        });

        it('Delphinium also reaches far across the screen', () => {
            const s = fight(foe);
            place(s, 110);
            s.fighters[0].meter = 200;
            const log = play(s, [light | heavy | special, ...holdFor(0, 260)]);
            expect(log.hits).toContain('ultimate2');
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

        it('heavy (Seis Fleurs Slap) cancels into Delphinium and it combos', () => {
            const s = fight(foe);
            place(s);
            s.fighters[0].meter = 200;
            const log = play(s, [heavy, ...holdFor(0, 13), ...mash(light | heavy | special, 10), ...holdFor(0, 260)]);
            expect(log.hits[0]).toBe('heavy');
            expect(log.hits).toContain('ultimate2');
            expect(log.maxCombo).toBeGreaterThanOrEqual(5);
        });

        it('Seis Fleurs (S) sprouts at mid range and hits several times', () => {
            const s = fight(foe);
            place(s, 70);
            const log = play(s, [special, ...holdFor(0, 90)]);
            expect(log.hits.length).toBeGreaterThanOrEqual(2);
            expect(lost(s, foe)).toBeGreaterThanOrEqual(60);
        });

        it('Seis Fleurs also hits point blank', () => {
            const s = fight(foe);
            place(s);
            const log = play(s, [special, ...holdFor(0, 90)]);
            expect(log.hits.length).toBeGreaterThanOrEqual(1);
        });

        it('Cien Fleurs (→S) grows a tree of arms far away: several hits then a launch', () => {
            const s = fight(foe);
            place(s, 60);
            const log = play(s, [right | special, ...holdFor(0, 70)]);
            expect(log.hits.filter((h) => h === 'specialF').length).toBeGreaterThanOrEqual(3);
            expect(s.fighters[1].y).toBeGreaterThan(0);
        });

        it('Gigante Fleur (↓S) pops up then slams', () => {
            const s = fight(foe);
            place(s, 20);
            const log = play(s, [down | special, ...holdFor(0, 80)]);
            expect(log.hits.filter((h) => h === 'specialD').length).toBe(2);
        });

        it('Cien Fleurs Wing (↑S) catches a jump', () => {
            const s = fight(foe);
            place(s, 10);
            stepMatch(s, [0, up]);
            let t = 0;
            while (s.fighters[1].y < 24 * PX && t++ < 40) stepMatch(s, [0, 0]);
            expect(s.fighters[1].y).toBeGreaterThan(0);
            const log = play(s, [up | special, ...holdFor(0, 50)]);
            expect(log.hits).toContain('specialU');
        });

        it('the air dive (air S) hits from a jump', () => {
            const s = fight(foe);
            place(s, 30);
            const log = play(s, [up | right, ...holdFor(0, 14), special, ...holdFor(0, 80)]);
            expect(log.hits).toContain('airSpecial');
        });

        it('jump-in airHeavy → lightA combos on landing', () => {
            const s = fight(foe);
            place(s, 80);
            const log = play(s, [up | right, ...holdFor(0, 33), heavy, ...holdFor(0, 13), ...mash(light, 16), ...holdFor(0, 30)]);
            expect(log.hits).toContain('airHeavy');
            expect(log.hits).toContain('lightA');
            expect(log.maxCombo).toBeGreaterThanOrEqual(2);
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

        it('heavyFwd (the whip) is an overhead: only a standing guard stops it', () => {
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

        it('heavyBack (the vine) launches', () => {
            const s = fight(foe);
            place(s);
            const log = play(s, [heavy | left, ...holdFor(0, 24)]);
            expect(log.hits).toEqual(['heavyBack']);
            expect(s.fighters[1].y).toBeGreaterThan(0);
        });
    });
}
