import { describe, expect, it } from 'vitest';
import { ROSTER } from '../characters';
import { createMatch, stepMatch } from '../engine/match';
import { getChar } from '../engine/registry';
import { BTN, PX } from '../engine/types';

/**
 * Combo scaling. Bug reported with Vivi: special → full ultimate dealt less
 * in total than the same ultimate on its own, because the ultimate's hits
 * were scaled by the hits that led into it.
 */

const { right, light, heavy, special } = BTN;
const ULT = { ultimate: heavy | special, ultimate2: light | heavy | special } as const;

const hold = (x: number, n: number) => Array<number>(n).fill(x);
const mash = (x: number, n: number) => Array.from({ length: n }, (_, i) => (i % 2 ? 0 : x));

interface Result { total: number; ult: number[]; before: number }

/** P1 plays `inputs` point-blank against an idle Luffy, with two full bars. */
function run(char: string, inputs: number[]): Result {
    const s = createMatch(char, 'luffy');
    while (s.phase !== 'fight') stepMatch(s, [0, 0]);
    const [a, b] = s.fighters;
    a.x = b.x - (getChar(a.char).width + getChar(b.char).width + 4) * PX;
    a.meter = 200;
    const r: Result = { total: 0, ult: [], before: 0 };
    let ultStarted = false;
    for (const input of inputs) {
        for (const e of stepMatch(s, [input, 0])) {
            if (e.type !== 'hit' || e.attacker !== 0 || !e.damage) continue;
            if (a.move === 'ultimate' || a.move === 'ultimate2' || ultStarted) {
                ultStarted = true;
                r.ult.push(e.damage);
            } else {
                r.before += e.damage;
            }
        }
    }
    r.total = getChar('luffy').health - b.health;
    return r;
}

describe('combo scaling', () => {
    it('Vivi: Peacock Slasher (→S) into the full ultimate beats the ultimate alone', () => {
        const alone = run('vivi', [ULT.ultimate, ...hold(0, 300)]);
        for (const gap of [4, 20, 28, 40]) {
            const combo = run('vivi', [right | special, ...hold(0, gap), ...mash(ULT.ultimate, 20), ...hold(0, 300)]);
            expect(combo.before).toBeGreaterThan(0);
            expect(combo.ult).toEqual(alone.ult);
            expect(combo.total).toBeGreaterThan(alone.total);
        }
    });

    it('scaling still applies: the ultimate\'s own later hits deal less than their base damage', () => {
        const alone = run('vivi', [ULT.ultimate, ...hold(0, 300)]);
        const base = getChar('vivi').moves.ultimate!.hits.map((h) => h.damage);
        expect(alone.ult.at(-1)).toBeLessThan(base.at(-1)!);
        expect(alone.total).toBeLessThan(alone.ult.length * Math.max(...base));
    });

    for (const def of ROSTER) {
        for (const slot of ['ultimate', 'ultimate2'] as const) {
            it(`${def.id}: a combo ending in the full ${slot} never deals less than the ${slot} alone`, () => {
                const alone = run(def.id, [ULT[slot], ...hold(0, 360)]);
                expect(alone.ult.length).toBeGreaterThan(0);
                let checked = 0;
                const starters = [heavy, special, right | special, light];
                for (const starter of starters) {
                    for (const gap of [3, 6, 12, 20]) {
                        const combo = run(def.id, [starter, ...hold(0, gap), ...mash(ULT[slot], 24), ...hold(0, 360)]);
                        if (!combo.before || combo.ult.length !== alone.ult.length) continue;
                        checked++;
                        expect(combo.total).toBeGreaterThanOrEqual(alone.total);
                    }
                }
                expect(checked).toBeGreaterThan(0);
            });
        }
    }
});
