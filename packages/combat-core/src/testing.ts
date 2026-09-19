/**
 * Test harness. Kept in `src` rather than in the test file so the same helpers
 * drive the unit tests, the server's integration tests and any future
 * balance tooling.
 */
import { ROSTER } from './characters/index.js';
import { INTRO_FRAMES } from './constants.js';
import { createMatch, stepMatch, type CharacterRoster } from './engine.js';
import { Button } from './input.js';
import { toPx } from './fixed.js';
import { DEFAULT_STAGE } from './stages.js';
import type { CombatEvent, MatchState } from './types.js';

export interface Harness {
    state: MatchState;
    events: CombatEvent[];
    roster: CharacterRoster;
}

export const startHarness = (
    first = 'luffy',
    second = 'luffy',
    roster: CharacterRoster = ROSTER
): Harness => ({
    state: createMatch({ characters: [first, second], stageId: DEFAULT_STAGE, seed: 12345 }, roster),
    events: [],
    roster
});

/** Advances `frames` steps with a constant input pair. */
export const advance = (
    harness: Harness,
    frames: number,
    inputs: readonly [number, number] = [0, 0]
): Harness => {
    for (let index = 0; index < frames; index += 1) {
        const result = stepMatch(harness.state, inputs, harness.roster);
        harness.state = result.state;
        harness.events.push(...result.events);
    }
    return harness;
};

/** One frame with the given inputs, clearing the event log first. */
export const tick = (harness: Harness, inputs: readonly [number, number]): CombatEvent[] => {
    const result = stepMatch(harness.state, inputs, harness.roster);
    harness.state = result.state;
    harness.events = result.events;
    return result.events;
};

/** Skips the round introduction so a test starts on a live frame. */
export const skipIntro = (harness: Harness): Harness => advance(harness, INTRO_FRAMES + 1);

export const distance = (harness: Harness): number =>
    Math.abs(toPx(harness.state.fighters[0].x) - toPx(harness.state.fighters[1].x));

/** Walks the two fighters towards each other until they are `target` pixels
 *  apart, so a test can reason about reach without hard-coding positions. */
export const closeTo = (harness: Harness, target: number, limit = 400): Harness => {
    for (let index = 0; index < limit && distance(harness) > target; index += 1) {
        advance(harness, 1, [Button.Right, Button.Left]);
    }
    return harness;
};

/** Puts a fighter exactly where a test needs them, bypassing the walk. */
export const placeFighters = (harness: Harness, leftX: number, rightX: number): Harness => {
    harness.state.fighters[0].x = leftX << 6;
    harness.state.fighters[1].x = rightX << 6;
    return harness;
};

export const fillMeter = (harness: Harness, slot: 0 | 1, amount: number): Harness => {
    harness.state.fighters[slot].meter = amount;
    return harness;
};

export const eventsOfType = <T extends CombatEvent['type']>(
    events: readonly CombatEvent[],
    type: T
): Extract<CombatEvent, { type: T }>[] =>
    events.filter((event): event is Extract<CombatEvent, { type: T }> => event.type === type);

export { Button };
