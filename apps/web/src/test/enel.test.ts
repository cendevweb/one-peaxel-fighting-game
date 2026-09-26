import { describe, expect, it } from 'vitest';
import '../characters';
import { getChar } from '../engine/registry';
import { createMatch, stepMatch } from '../engine/match';
import { BTN, PX, type GameEvent, type MatchState, type MoveSlot } from '../engine/types';

const { up, down, right, light, heavy, special } = BTN;

/** Enel's combos, at point-blank against an idle dummy (small and big). */

function fight(p2: string): MatchState {
    const s = createMatch('enel', p2);
    while (s.phase !== 'fight') stepMatch(s, [0, 0]);
    return s;
}

/** Puts Enel right against the dummy (bodies a few pixels apart). */
function pointBlank(s: MatchState, gap = 4) {
    const w = getChar('enel').width + getChar(s.fighters[1].char).width;
    s.fighters[0].x = s.fighters[1].x - (w + gap) * PX;
}

interface Log { hits: string[]; blocks: number; maxCombo: number; events: GameEvent[] }

/** Steps once, noting which of Enel's moves (or projectile) touched. */
function step(s: MatchState, a: number, b: number, log: Log) {
    // Hits landed while no melee move is live come from the projectile.
    const slot = s.fighters[0].move;
    const move = slot && getChar('enel').moves[slot as MoveSlot].hits.length ? slot : 'projectile';
    const ev = stepMatch(s, [a, b]);
    for (const e of ev) {
        if (e.type === 'hit' && e.attacker === 0) log.hits.push(move);
        if (e.type === 'block' && e.attacker === 0) log.blocks++;
        if (e.type === 'combo' && e.side === 0) log.maxCombo = Math.max(log.maxCombo, e.hits);
    }
    log.events.push(...ev);
}

const newLog = (): Log => ({ hits: [], blocks: 0, maxCombo: 0, events: [] });

function hold(s: MatchState, a: number, b: number, ticks: number, log: Log) {
    for (let i = 0; i < ticks; i++) step(s, a, b, log);
}

/** Presses `first`, then presses `next` as soon as the current move has hit. */
function link(s: MatchState, first: number, next: number[], log: Log, dir = 0) {
    step(s, first, 0, log);
    step(s, dir, 0, log);
    for (const n of next) {
        let guard = 0;
        const before = log.hits.length;
        // Wait for the current move to touch…
        while (log.hits.length === before && guard++ < 60) step(s, dir, 0, log);
        // …and for the hit freeze to end (a press made during hitstop is
        // not buffered by the engine)…
        while (s.fighters[0].hitstop > 0 && guard++ < 90) step(s, dir, 0, log);
        // …then press the next input (twice, like a player would).
        const d = n & (up | down | BTN.left | right);
        step(s, n, 0, log);
        step(s, d, 0, log);
        step(s, n, 0, log);
        step(s, d, 0, log);
    }
    hold(s, 0, 0, 90, log);
}

const unique = (xs: string[]) => [...new Set(xs)];

describe.each(['luffy', 'akainu'])('Enel vs %s', (foe) => {
    it('L → L → L: lightA, lightB and lightC all connect in one combo', () => {
        const s = fight(foe);
        pointBlank(s);
        const log = newLog();
        link(s, light, [light, light], log);
        expect(unique(log.hits).slice(0, 3)).toEqual(['lightA', 'lightB', 'lightC']);
        expect(log.maxCombo).toBeGreaterThanOrEqual(3);
        expect(log.blocks).toBe(0);
    });

    it('lightA → crouchHeavy connects', () => {
        const s = fight(foe);
        pointBlank(s);
        const log = newLog();
        link(s, light, [down | heavy], log);
        expect(log.hits).toContain('lightA');
        expect(log.hits).toContain('crouchHeavy');
        expect(log.maxCombo).toBeGreaterThanOrEqual(2);
    });

    it('heavy → specialF (→S) connects as a special cancel', () => {
        const s = fight(foe);
        pointBlank(s);
        const log = newLog();
        link(s, heavy, [right | special], log);
        expect(log.hits[0]).toBe('heavy');
        expect(log.hits).toContain('specialF');
        expect(log.maxCombo).toBeGreaterThanOrEqual(3);
    });

    it('lightA → lightB → specialN cancels and the Sango hits', () => {
        const s = fight(foe);
        pointBlank(s);
        const log = newLog();
        link(s, light, [light, special], log);
        expect(log.hits).toContain('lightB');
        expect(log.hits).toContain('projectile');
        expect(log.maxCombo).toBeGreaterThanOrEqual(3);
    });

    it('throw: L+H on the same tick damages', () => {
        const s = fight(foe);
        pointBlank(s);
        const hp = s.fighters[1].health;
        const log = newLog();
        step(s, light | heavy, 0, log);
        expect(s.fighters[0].move).toBe('throw');
        hold(s, 0, 0, 60, log);
        expect(s.fighters[1].health).toBeLessThan(hp - 80);
    });

    it('throw: L then L+H one tick later still throws', () => {
        const s = fight(foe);
        pointBlank(s);
        const hp = s.fighters[1].health;
        const log = newLog();
        step(s, light, 0, log);
        step(s, light | heavy, 0, log);
        expect(s.fighters[0].move).toBe('throw');
        hold(s, 0, 0, 60, log);
        expect(s.fighters[1].health).toBeLessThan(hp - 80);
    });

    it('Mamaragan with a full bar connects for big damage', () => {
        const s = fight(foe);
        pointBlank(s);
        s.fighters[0].meter = 100;
        const hp = s.fighters[1].health;
        const log = newLog();
        step(s, heavy | special, 0, log);
        step(s, 0, 0, log);
        expect(s.fighters[0].move).toBe('ultimate');
        hold(s, 0, 0, 260, log);
        expect(log.hits.filter((m) => m === 'ultimate').length).toBeGreaterThanOrEqual(4);
        expect(hp - s.fighters[1].health).toBeGreaterThanOrEqual(300);
    });

    it('the Sango (specialN) hits at mid range', () => {
        const s = fight(foe);
        s.fighters[0].x = s.fighters[1].x - 130 * PX;
        const hp = s.fighters[1].health;
        const log = newLog();
        step(s, special, 0, log);
        step(s, 0, 0, log);
        expect(s.fighters[0].move).toBe('specialN');
        hold(s, 0, 0, 100, log);
        expect(log.hits).toContain('projectile');
        expect(s.fighters[1].health).toBeLessThan(hp);
    });

    it('the anti-air (specialU) hits a jumping opponent', () => {
        const s = fight(foe);
        pointBlank(s, 10);
        const log = newLog();
        // The dummy jumps straight up; Enel answers on the way up.
        for (let i = 0; i < 20 && s.fighters[1].y === 0; i++) step(s, 0, up, log);
        hold(s, 0, 0, 2, log);
        expect(s.fighters[1].y).toBeGreaterThan(0);
        step(s, up | special, 0, log);
        expect(s.fighters[0].move).toBe('specialU');
        hold(s, 0, 0, 60, log);
        expect(log.hits).toContain('specialU');
    });

    it('crouchLight is blocked by a crouching guard only', () => {
        const hp = (guard: number) => {
            const s = fight(foe);
            pointBlank(s);
            const before = s.fighters[1].health;
            const log = newLog();
            hold(s, down, guard, 2, log);
            step(s, down | light, guard, log);
            hold(s, down, guard, 30, log);
            return { lost: before - s.fighters[1].health, log };
        };
        const standing = hp(right);
        expect(standing.lost).toBeGreaterThan(0);
        expect(standing.log.hits).toContain('crouchLight');
        const crouching = hp(right | down);
        expect(crouching.lost).toBe(0);
        expect(crouching.log.blocks).toBeGreaterThan(0);
    });

    it('heavyFwd is an overhead: blocked standing, hits a crouching guard', () => {
        const run = (guard: number) => {
            const s = fight(foe);
            pointBlank(s);
            const before = s.fighters[1].health;
            const log = newLog();
            hold(s, 0, guard, 2, log);
            step(s, right | heavy, guard, log);
            hold(s, 0, guard, 70, log);
            return { lost: before - s.fighters[1].health, log };
        };
        const crouching = run(right | down);
        expect(crouching.log.hits).toContain('heavyFwd');
        expect(crouching.lost).toBeGreaterThan(0);
        const standing = run(right);
        expect(standing.lost).toBe(0);
        expect(standing.log.blocks).toBeGreaterThan(0);
    });
});
