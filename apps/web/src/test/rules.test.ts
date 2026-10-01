import { describe, expect, it } from 'vitest';
import { ROSTER } from '../characters';
import { createMatch, stepMatch, ULTIMATE2_COST } from '../engine/match';
import { getChar } from '../engine/registry';
import { BTN, PX, type MatchState } from '../engine/types';
import { Cpu, LEVELS } from '../game/ai';

const { right, down, light, heavy, special } = BTN;
const ULT = heavy | special;
const ULT2 = light | heavy | special;

function fight(p1 = 'vivi', p2 = 'luffy', training = false): MatchState {
    const s = createMatch(p1, p2, { training });
    while (s.phase !== 'fight') stepMatch(s, [0, 0]);
    return s;
}

function place(s: MatchState, gap = 4) {
    const [a, b] = s.fighters;
    a.x = b.x - (getChar(a.char).width + getChar(b.char).width + gap) * PX;
}

/** Presses `input` for P1, then waits until P1 is free again. Returns the move that came out. */
function tryMove(s: MatchState, input: number, p2 = 0): string | null {
    stepMatch(s, [input, p2]);
    const move = s.fighters[0].move;
    for (let t = 0; t < 400 && s.fighters[0].mode !== 'idle'; t++) stepMatch(s, [0, p2]);
    for (let t = 0; t < 80; t++) stepMatch(s, [0, p2]);
    return move;
}

describe('ultimate rules', () => {
    it('one ultimate per round, whatever the meter', () => {
        const s = fight();
        s.round = 2;
        place(s, 120);
        s.fighters[0].meter = 200;
        expect(tryMove(s, ULT)).toBe('ultimate');
        s.fighters[0].meter = 200;
        expect(tryMove(s, ULT)).not.toBe('ultimate');
        expect(tryMove(s, ULT2)).not.toBe('ultimate2');
        expect(s.fighters[0].meter).toBe(200);
    });

    it('the max ultimate is locked in round 1 and keeps the bars', () => {
        const s = fight();
        place(s, 120);
        s.fighters[0].meter = ULTIMATE2_COST;
        expect(tryMove(s, ULT2)).not.toBe('ultimate2');
        expect(s.fighters[0].meter).toBe(ULTIMATE2_COST);
        // The one-bar ultimate is still there.
        expect(tryMove(s, ULT)).toBe('ultimate');
    });

    it('the max ultimate opens in round 2, and the allowance comes back each round', () => {
        const s = fight();
        place(s, 120);
        s.fighters[0].meter = 100;
        expect(tryMove(s, ULT)).toBe('ultimate');
        // Time over ends round 1; the meter carries over.
        s.clock = 1;
        s.fighters[0].meter = ULTIMATE2_COST;
        for (let t = 0; t < 1200 && !(s.round === 2 && s.phase === 'fight'); t++) stepMatch(s, [0, 0]);
        expect(s.round).toBe(2);
        expect(s.fighters[0].ultUsed).toBe(false);
        place(s, 120);
        expect(tryMove(s, ULT2)).toBe('ultimate2');
    });

    it('training has no limit', () => {
        const s = fight('vivi', 'luffy', true);
        place(s, 120);
        expect(tryMove(s, ULT)).toBe('ultimate');
        expect(tryMove(s, ULT)).toBe('ultimate');
        expect(tryMove(s, ULT2)).toBe('ultimate2');
    });

    it('the meter fills at about one bar per player per round', () => {
        const ids = ROSTER.map((c) => c.id);
        let rounds = 0;
        let gained = 0;
        for (let i = 0; i < ids.length; i += 3) {
            const s = createMatch(ids[i], ids[(i + 5) % ids.length]);
            const cpus = [new Cpu(LEVELS[3], i), new Cpu(LEVELS[3], i + 100)];
            const prev = [0, 0];
            for (let t = 0; t < 99 * 60 * 6 && s.phase !== 'matchEnd'; t++) {
                const phase = s.phase;
                stepMatch(s, [cpus[0].next(s, 0), cpus[1].next(s, 1)]);
                s.fighters.forEach((f, k) => {
                    if (f.meter > prev[k]) gained += f.meter - prev[k];
                    prev[k] = f.meter;
                });
                if (phase !== 'intro' && s.phase === 'intro') rounds++;
            }
            rounds++;
        }
        const perRound = gained / rounds / 2;
        expect(perRound).toBeGreaterThan(80);
        expect(perRound).toBeLessThan(180);
    }, 60000);
});

describe('guard', () => {
    // Point-blank, a projectile can spawn past the target's centre: it used to
    // read as coming from behind and went through the guard.
    for (const def of ROSTER) {
        const p = def.moves.specialN?.projectile;
        if (!p || def.moves.specialN!.stance !== 'stand' || p.hit.guard !== 'mid') continue;
        for (const crouch of [false, true]) {
            it(`${def.id}: the point-blank projectile is blocked ${crouch ? 'crouching' : 'standing'}`, () => {
                const s = fight(def.id);
                place(s);
                const hold = right | (crouch ? down : 0);
                for (let t = 0; t < 6; t++) stepMatch(s, [0, hold]);
                let hits = 0;
                for (let t = 0; t < 120; t++) {
                    for (const e of stepMatch(s, [t === 0 ? special : 0, hold])) {
                        if (e.type === 'hit' && e.attacker === 0 && e.damage > 0) hits++;
                    }
                }
                // It is blocked, or flies over a crouching guard: never a hit.
                expect(hits).toBe(0);
            });
        }
    }

    it('every blocked hit drains the guard gauge', () => {
        const s = fight();
        place(s);
        for (let t = 0; t < 6; t++) stepMatch(s, [0, right]);
        let blocks = 0;
        for (let t = 0; t < 120; t++) {
            const before = s.fighters[1].guard;
            for (const e of stepMatch(s, [t % 20 === 0 ? light : 0, right])) {
                if (e.type !== 'block') continue;
                blocks++;
                expect(s.fighters[1].guard).toBeLessThan(before);
            }
        }
        expect(blocks).toBeGreaterThan(2);
    });
});

describe('rushing specials in the corner', () => {
    for (const char of ['hody', 'vivi']) {
        it(`${char}: →S against a cornered foe sticks to them instead of bouncing back`, () => {
            const run = (wall: boolean) => {
                const s = fight(char);
                const [a, b] = s.fighters;
                if (wall) b.x = s.stageWidth - 40 * PX;
                place(s);
                let hits = 0;
                let furthest = a.x;
                let backed = 0;
                for (let t = 0; t < 90; t++) {
                    for (const e of stepMatch(s, [t === 0 ? right | special : 0, 0])) if (e.type === 'hit' && e.attacker === 0) hits++;
                    if (a.mode !== 'move') break;
                    furthest = Math.max(furthest, a.x);
                    backed = Math.max(backed, furthest - a.x);
                }
                return { hits, damage: getChar('luffy').health - b.health, backed };
            };
            const mid = run(false);
            const wall = run(true);
            expect(wall.backed).toBeLessThanOrEqual(2 * PX);
            expect(wall.hits).toBe(mid.hits);
            expect(wall.damage).toBe(mid.damage);
        });
    }
});
