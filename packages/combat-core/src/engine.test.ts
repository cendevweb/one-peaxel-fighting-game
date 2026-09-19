import { describe, expect, it } from 'vitest';
import { CHARACTER_LIST, ROSTER } from './characters/index.js';
import { ARENA_WIDTH, METER_MAX, ROUND_TIME_FRAMES, WALL_MARGIN_FP } from './constants.js';
import { createMatch, stepMatch } from './engine.js';
import { toPx } from './fixed.js';
import { Button } from './input.js';
import { checksumMatchState, decodeMatchState, encodeMatchState } from './serialize.js';
import { DEFAULT_STAGE } from './stages.js';
import {
    advance,
    closeTo,
    distance,
    eventsOfType,
    fillMeter,
    placeFighters,
    skipIntro,
    startHarness,
    tick
} from './testing.js';

describe('character data', () => {
    it('declares coherent frame data for every move', () => {
        for (const character of CHARACTER_LIST) {
            for (const move of character.moves) {
                expect(move.startup, `${move.id} startup`).toBe(move.active[0]?.[0]);
                const last = move.active[move.active.length - 1];
                expect(last?.[1], `${move.id} last active`).toBeLessThan(move.duration);
                for (const [from, to] of move.active) {
                    expect(to, `${move.id} window order`).toBeGreaterThanOrEqual(from);
                }
                expect(move.hit.damage, `${move.id} damage`).toBeGreaterThan(0);
            }
        }
    });

    it('only cancels into moves the character actually owns', () => {
        for (const character of CHARACTER_LIST) {
            const ids = new Set(character.moves.map((move) => move.id));
            for (const move of character.moves) {
                for (const target of move.cancelInto) {
                    expect(ids.has(target), `${move.id} cancels into unknown ${target}`).toBe(true);
                }
            }
        }
    });

    it('gives every fighter exactly one move per slot', () => {
        for (const character of CHARACTER_LIST) {
            const slots = character.moves.map((move) => move.slot);
            expect(new Set(slots).size, character.id).toBe(slots.length);
            for (const slot of ['light', 'heavy', 'special', 'ultimate'] as const) {
                expect(slots, `${character.id} misses ${slot}`).toContain(slot);
            }
        }
    });

    it('charges a full bar for every ultimate and nothing for the rest', () => {
        for (const character of CHARACTER_LIST) {
            for (const move of character.moves) {
                expect(move.meterCost, move.id).toBe(move.slot === 'ultimate' ? METER_MAX : 0);
            }
        }
    });
});

describe('match lifecycle', () => {
    it('spends the introduction before accepting inputs', () => {
        const harness = startHarness();
        advance(harness, 30, [Button.Light, 0]);
        expect(harness.state.phase).toBe('intro');
        expect(harness.state.fighters[0].state).toBe('intro');

        skipIntro(harness);
        expect(harness.state.phase).toBe('fight');
        expect(harness.state.fighters[0].state).toBe('idle');
        expect(eventsOfType(harness.events, 'roundStart')).toHaveLength(1);
    });

    it('counts the round clock down and ends on the healthier fighter', () => {
        const harness = skipIntro(startHarness());
        harness.state.fighters[0].health = 500;
        harness.state.fighters[1].health = 300;
        harness.state.timer = 2;
        advance(harness, 3);
        expect(harness.state.phase).toBe('ko');
        expect(harness.state.roundWinner).toBe(0);
    });

    it('awards the match after two rounds', () => {
        const harness = skipIntro(startHarness());
        harness.state.fighters[0].wins = 1;
        harness.state.fighters[1].health = 0;
        advance(harness, 200);
        expect(harness.state.phase).toBe('matchEnd');
        expect(harness.state.matchWinner).toBe(0);
        expect(eventsOfType(harness.events, 'matchEnd')).toHaveLength(1);
    });

    it('resets health and positions between rounds', () => {
        const harness = skipIntro(startHarness());
        harness.state.fighters[1].health = 0;
        advance(harness, 240);
        expect(harness.state.round).toBe(2);
        expect(harness.state.fighters[1].health).toBe(ROSTER.luffy!.stats.maxHealth);
        expect(harness.state.fighters[0].wins).toBe(1);
        expect(harness.state.timer).toBe(ROUND_TIME_FRAMES);
    });
});

describe('movement', () => {
    it('walks forward and backward at the character speed', () => {
        const harness = skipIntro(startHarness());
        const before = toPx(harness.state.fighters[0].x);
        advance(harness, 10, [Button.Right, 0]);
        expect(toPx(harness.state.fighters[0].x)).toBeGreaterThan(before);

        const middle = toPx(harness.state.fighters[0].x);
        advance(harness, 10, [Button.Left, 0]);
        expect(toPx(harness.state.fighters[0].x)).toBeLessThan(middle);
    });

    it('brings a jump back to the floor on its own', () => {
        const harness = skipIntro(startHarness());
        tick(harness, [Button.Up, 0]);
        expect(harness.state.fighters[0].airborne).toBe(true);

        advance(harness, 90);
        expect(harness.state.fighters[0].airborne).toBe(false);
        expect(harness.state.fighters[0].y).toBe(0);
        expect(eventsOfType(harness.events, 'jump')).toHaveLength(1);
    });

    it('never lets a fighter leave the arena', () => {
        const harness = skipIntro(startHarness());
        advance(harness, 600, [Button.Left, Button.Right]);
        expect(toPx(harness.state.fighters[0].x)).toBeGreaterThanOrEqual(toPx(WALL_MARGIN_FP));
        expect(toPx(harness.state.fighters[1].x)).toBeLessThanOrEqual(ARENA_WIDTH - toPx(WALL_MARGIN_FP));
    });

    it('keeps the two bodies from overlapping', () => {
        const harness = skipIntro(startHarness());
        closeTo(harness, 40);
        advance(harness, 30, [Button.Right, Button.Left]);
        expect(distance(harness)).toBeGreaterThan(30);
    });

    it('turns a fighter to face the opponent', () => {
        const harness = skipIntro(startHarness());
        placeFighters(harness, 800, 400);
        advance(harness, 2);
        expect(harness.state.fighters[0].facing).toBe(-1);
        expect(harness.state.fighters[1].facing).toBe(1);
    });
});

describe('attacks and damage', () => {
    const inRange = (): ReturnType<typeof startHarness> => {
        const harness = skipIntro(startHarness());
        placeFighters(harness, 600, 660);
        advance(harness, 1);
        return harness;
    };

    it('deals exactly the declared damage on a clean first hit', () => {
        const harness = inRange();
        const jab = ROSTER.luffy!.moves.find((move) => move.slot === 'light')!;
        const before = harness.state.fighters[1].health;

        tick(harness, [Button.Light, 0]);
        advance(harness, 10);

        expect(harness.state.fighters[1].health).toBe(before - jab.hit.damage);
        expect(eventsOfType(harness.events, 'hit')).not.toHaveLength(0);
    });

    it('misses when the opponent is out of reach', () => {
        const harness = skipIntro(startHarness());
        placeFighters(harness, 300, 900);
        advance(harness, 1);
        const before = harness.state.fighters[1].health;

        tick(harness, [Button.Light, 0]);
        advance(harness, 24);

        expect(harness.state.fighters[1].health).toBe(before);
        expect(eventsOfType(harness.events, 'whiff')).not.toHaveLength(0);
    });

    it('puts the victim in hitstun and stops their action', () => {
        const harness = inRange();
        tick(harness, [Button.Light, 0]);
        advance(harness, 8);
        expect(harness.state.fighters[1].state).toBe('hitstun');
    });

    it('never hits twice with a single active window', () => {
        const harness = inRange();
        tick(harness, [Button.Light, 0]);
        advance(harness, 20);
        expect(eventsOfType(harness.events, 'hit')).toHaveLength(1);
    });

    it('lands every window of a multi-hit special', () => {
        const harness = inRange();
        const gatling = ROSTER.luffy!.moves.find((move) => move.id === 'luffy-gatling')!;
        tick(harness, [Button.Special, 0]);
        advance(harness, gatling.duration + 10);
        expect(eventsOfType(harness.events, 'hit').length).toBeGreaterThan(2);
    });

    it('scales damage down as a combo goes on', () => {
        const harness = inRange();
        const hits: number[] = [];
        tick(harness, [Button.Special, 0]);
        advance(harness, 60);
        for (const event of eventsOfType(harness.events, 'hit')) {
            hits.push(event.damage);
        }
        expect(hits.length).toBeGreaterThan(2);
        expect(hits[hits.length - 1]!).toBeLessThan(hits[0]!);
    });
});

describe('guarding', () => {
    it('blocks when holding away and only takes chip damage', () => {
        const harness = skipIntro(startHarness());
        placeFighters(harness, 600, 660);
        advance(harness, 1);
        const jab = ROSTER.luffy!.moves.find((move) => move.slot === 'light')!;
        const before = harness.state.fighters[1].health;

        // Fighter 1 stands to the right, so holding Right is holding away.
        tick(harness, [Button.Light, Button.Right]);
        advance(harness, 10, [0, Button.Right]);

        expect(harness.state.fighters[1].health).toBe(before - jab.hit.chipDamage);
        expect(eventsOfType(harness.events, 'block')).not.toHaveLength(0);
    });

    it('cannot block in the air', () => {
        const harness = skipIntro(startHarness());
        placeFighters(harness, 600, 660);
        advance(harness, 1);
        harness.state.fighters[1].airborne = true;
        harness.state.fighters[1].state = 'jumpFall';
        harness.state.fighters[1].y = 70 << 6;
        const before = harness.state.fighters[1].health;

        tick(harness, [Button.Light, Button.Right]);
        advance(harness, 10, [0, Button.Right]);
        expect(harness.state.fighters[1].health).toBeLessThan(before - 10);
    });
});

describe('combos', () => {
    it('cancels a connected jab into the heavy', () => {
        const harness = skipIntro(startHarness());
        placeFighters(harness, 600, 655);
        advance(harness, 1);

        tick(harness, [Button.Light, 0]);
        advance(harness, 5);
        expect(harness.state.fighters[0].connected).toBe(true);

        // The heavy is pressed while the hit's freeze is still running; the
        // buffer has to carry it across the freeze for the cancel to come out.
        tick(harness, [Button.Heavy, 0]);
        advance(harness, 8);
        expect(harness.state.fighters[0].moveId).toBe('luffy-pistol');
    });

    it('refuses a cancel the move does not list', () => {
        const harness = skipIntro(startHarness());
        placeFighters(harness, 600, 655);
        advance(harness, 1);

        tick(harness, [Button.Heavy, 0]);
        advance(harness, 12);
        expect(harness.state.fighters[0].moveId).toBe('luffy-pistol');
        tick(harness, [Button.Light, 0]);
        advance(harness, 8);
        // The pistol does not list the jab as a cancel, so it runs its course.
        expect(harness.state.fighters[0].moveId).toBe('luffy-pistol');
    });

    it('counts a combo and resets it when the victim recovers', () => {
        const harness = skipIntro(startHarness());
        placeFighters(harness, 600, 660);
        advance(harness, 1);
        tick(harness, [Button.Special, 0]);
        advance(harness, 40);
        expect(harness.state.fighters[1].comboHits).toBeGreaterThan(1);

        advance(harness, 120);
        expect(harness.state.fighters[1].comboHits).toBe(0);
    });
});

describe('meter and ultimates', () => {
    it('fills the bar by hitting and by being hit', () => {
        const harness = skipIntro(startHarness());
        placeFighters(harness, 600, 660);
        advance(harness, 1);
        tick(harness, [Button.Light, 0]);
        advance(harness, 12);
        expect(harness.state.fighters[0].meter).toBeGreaterThan(0);
        expect(harness.state.fighters[1].meter).toBeGreaterThan(0);
    });

    it('refuses the ultimate without a full bar', () => {
        const harness = skipIntro(startHarness());
        fillMeter(harness, 0, METER_MAX - 1);
        tick(harness, [Button.Ultimate, 0]);
        expect(harness.state.fighters[0].moveId).toBeNull();
    });

    it('spends the whole bar and freezes the screen on a super', () => {
        const harness = skipIntro(startHarness());
        fillMeter(harness, 0, METER_MAX);
        tick(harness, [Button.Ultimate, 0]);
        expect(harness.state.fighters[0].moveId).toBe('luffy-gear3');
        expect(harness.state.fighters[0].meter).toBe(0);
        expect(harness.state.freeze).toBeGreaterThan(0);
        expect(eventsOfType(harness.events, 'super')).toHaveLength(1);
    });

    it('caps the bar at its maximum', () => {
        const harness = skipIntro(startHarness());
        fillMeter(harness, 0, METER_MAX);
        placeFighters(harness, 600, 660);
        advance(harness, 1);
        tick(harness, [Button.Light, 0]);
        advance(harness, 12);
        expect(harness.state.fighters[0].meter).toBe(METER_MAX);
    });
});

describe('projectiles', () => {
    it('spawns a projectile that travels and hits at range', () => {
        const harness = skipIntro(startHarness('crocodile', 'luffy'));
        placeFighters(harness, 420, 800);
        advance(harness, 1);
        const before = harness.state.fighters[1].health;

        tick(harness, [Button.Special, 0]);
        advance(harness, 20);
        expect(harness.state.projectiles.length).toBeGreaterThan(0);

        advance(harness, 90);
        expect(harness.state.fighters[1].health).toBeLessThan(before);
    });

    it('cleans up a projectile that leaves the arena', () => {
        const harness = skipIntro(startHarness('crocodile', 'luffy'));
        placeFighters(harness, 200, 1200);
        advance(harness, 1);
        tick(harness, [Button.Special, 0]);
        advance(harness, 200);
        expect(harness.state.projectiles).toHaveLength(0);
    });
});

describe('knockouts', () => {
    it('ends the round the frame health reaches zero', () => {
        const harness = skipIntro(startHarness());
        placeFighters(harness, 600, 660);
        advance(harness, 1);
        harness.state.fighters[1].health = 10;

        tick(harness, [Button.Light, 0]);
        advance(harness, 12);
        expect(harness.state.fighters[1].health).toBe(0);
        expect(harness.state.phase).toBe('ko');
        expect(eventsOfType(harness.events, 'ko')).toHaveLength(1);
    });

    it('scores a double knockout as a draw', () => {
        const harness = skipIntro(startHarness());
        harness.state.fighters[0].health = 0;
        harness.state.fighters[1].health = 0;
        advance(harness, 2);
        expect(harness.state.roundWinner).toBeNull();
    });
});

describe('determinism', () => {
    const scriptedInputs = (frames: number): Array<readonly [number, number]> => {
        const script: Array<readonly [number, number]> = [];
        let seed = 7;
        for (let frame = 0; frame < frames; frame += 1) {
            seed = (Math.imul(seed, 1103515245) + 12345) >>> 0;
            script.push([(seed >>> 3) & 0xff, (seed >>> 11) & 0xff]);
        }
        return script;
    };

    it('produces identical results from identical inputs', () => {
        const script = scriptedInputs(600);
        const runA = createMatch({ characters: ['luffy', 'lucci'], stageId: DEFAULT_STAGE, seed: 99 }, ROSTER);
        const runB = createMatch({ characters: ['luffy', 'lucci'], stageId: DEFAULT_STAGE, seed: 99 }, ROSTER);

        let stateA = runA;
        let stateB = runB;
        for (const inputs of script) {
            stateA = stepMatch(stateA, inputs, ROSTER).state;
            stateB = stepMatch(stateB, inputs, ROSTER).state;
        }
        expect(checksumMatchState(stateA, ROSTER)).toBe(checksumMatchState(stateB, ROSTER));
    });

    it('survives an encode / decode round trip without drifting', () => {
        const script = scriptedInputs(400);
        let state = createMatch({ characters: ['enel', 'crocodile'], stageId: DEFAULT_STAGE, seed: 4242 }, ROSTER);
        for (const inputs of script) {
            state = stepMatch(state, inputs, ROSTER).state;
        }

        const restored = decodeMatchState(
            encodeMatchState(state, ROSTER),
            ['enel', 'crocodile'],
            state.stageId,
            ROSTER
        );
        expect(checksumMatchState(restored, ROSTER)).toBe(checksumMatchState(state, ROSTER));

        // And it keeps agreeing once both are stepped further.
        const more = scriptedInputs(120);
        let a = state;
        let b = restored;
        for (const inputs of more) {
            a = stepMatch(a, inputs, ROSTER).state;
            b = stepMatch(b, inputs, ROSTER).state;
        }
        expect(checksumMatchState(b, ROSTER)).toBe(checksumMatchState(a, ROSTER));
    });

    it('re-simulates a rolled-back frame to the same state', () => {
        const script = scriptedInputs(300);
        let state = createMatch({ characters: ['lucci', 'luffy'], stageId: DEFAULT_STAGE, seed: 31337 }, ROSTER);
        const history: typeof state[] = [state];
        for (const inputs of script) {
            state = stepMatch(state, inputs, ROSTER).state;
            history.push(state);
        }

        const rollbackTo = 150;
        let replayed = history[rollbackTo]!;
        for (let frame = rollbackTo; frame < script.length; frame += 1) {
            replayed = stepMatch(replayed, script[frame]!, ROSTER).state;
        }
        expect(checksumMatchState(replayed, ROSTER)).toBe(checksumMatchState(state, ROSTER));
    });

    it('never produces a fractional coordinate', () => {
        const script = scriptedInputs(400);
        let state = createMatch({ characters: ['luffy', 'enel'], stageId: DEFAULT_STAGE, seed: 8 }, ROSTER);
        for (const inputs of script) {
            state = stepMatch(state, inputs, ROSTER).state;
            for (const fighter of state.fighters) {
                expect(Number.isInteger(fighter.x)).toBe(true);
                expect(Number.isInteger(fighter.y)).toBe(true);
                expect(Number.isInteger(fighter.vx)).toBe(true);
                expect(Number.isInteger(fighter.vy)).toBe(true);
            }
        }
    });
});
