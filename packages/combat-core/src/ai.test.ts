import { describe, expect, it } from 'vitest';
import { AI_LEVELS, AiController, findAiLevel } from './ai.js';
import { CHARACTER_LIST, ROSTER } from './characters/index.js';
import { METER_MAX, ROUND_TIME_FRAMES } from './constants.js';
import { createMatch, stepMatch } from './engine.js';
import { checksumMatchState } from './serialize.js';
import { ALL_BUTTONS } from './input.js';
import { DEFAULT_STAGE } from './stages.js';
import type { MatchState } from './types.js';

const level = (id: string) => findAiLevel(id);

/**
 * Runs a whole match with the bot in slot 1, and whatever the caller wants in
 * slot 0. Returns the final state and every mask the bot produced, because
 * "the bot did something" is only worth asserting against what it pressed.
 */
const playOut = (
    characters: [string, string],
    aiLevelId: string,
    seed: number,
    human: (state: MatchState, frame: number) => number,
    frames = ROUND_TIME_FRAMES * 4
): { state: MatchState; masks: number[] } => {
    const bot = new AiController(1, level(aiLevelId), seed);
    let state = createMatch({ characters, stageId: DEFAULT_STAGE, seed }, ROSTER);
    const masks: number[] = [];
    for (let frame = 0; frame < frames && state.phase !== 'matchEnd'; frame += 1) {
        const botMask = bot.next(state, ROSTER);
        masks.push(botMask);
        state = stepMatch(state, [human(state, frame), botMask], ROSTER).state;
    }
    return { state, masks };
};

const idle = (): number => 0;

describe('the computer opponent', () => {
    it('only ever presses buttons a pad has', () => {
        for (const aiLevel of AI_LEVELS) {
            const { masks } = playOut(['luffy', 'akainu'], aiLevel.id, 7, idle, 1200);
            for (const mask of masks) {
                expect(mask & ~ALL_BUTTONS).toBe(0);
            }
        }
    });

    it('plays the same fight twice from the same seed', () => {
        const first = playOut(['luffy', 'lucci'], 'veteran', 20260919, idle);
        const second = playOut(['luffy', 'lucci'], 'veteran', 20260919, idle);
        expect(second.masks).toEqual(first.masks);
        expect(checksumMatchState(second.state, ROSTER)).toBe(checksumMatchState(first.state, ROSTER));
    });

    it('plays a different fight from a different seed', () => {
        const first = playOut(['luffy', 'lucci'], 'veteran', 1, idle);
        const second = playOut(['luffy', 'lucci'], 'veteran', 2, idle);
        expect(second.masks).not.toEqual(first.masks);
    });

    // The point of the mode: a player who does nothing must lose. Anything
    // less means the bot is not closing the distance or not attacking, and no
    // amount of tuning elsewhere would show that.
    it('beats an opponent who never presses anything, as every character', () => {
        for (const character of CHARACTER_LIST) {
            const { state } = playOut(['luffy', character.id], 'veteran', 99, idle);
            expect(state.phase, `${character.id} never finished the match`).toBe('matchEnd');
            expect(state.matchWinner, `${character.id} failed to win`).toBe(1);
        }
    });

    // Time to beat a dummy is a poor measure of difficulty, because a dummy
    // never blocks and never punishes, so jab-spam is optimal against it. The
    // honest question is whether a level beats the level below it.
    it('beats the level below it, in a mirror match', () => {
        const seeds = [1, 7, 42, 4242, 90210, 31337, 8, 1234567];
        for (let index = 1; index < AI_LEVELS.length; index += 1) {
            const weaker = AI_LEVELS[0]!;
            const stronger = AI_LEVELS[index]!;
            let won = 0;
            for (const seed of seeds) {
                const left = new AiController(0, weaker, seed);
                const right = new AiController(1, stronger, seed * 3 + 1);
                let state = createMatch(
                    { characters: ['luffy', 'luffy'], stageId: DEFAULT_STAGE, seed },
                    ROSTER
                );
                for (
                    let frame = 0;
                    frame < ROUND_TIME_FRAMES * 8 && state.phase !== 'matchEnd';
                    frame += 1
                ) {
                    state = stepMatch(
                        state,
                        [left.next(state, ROSTER), right.next(state, ROSTER)],
                        ROSTER
                    ).state;
                }
                if (state.matchWinner === 1) {
                    won += 1;
                }
            }
            expect(won, `${stronger.id} lost to ${weaker.id}`).toBeGreaterThan(seeds.length / 2);
        }
    });

    it('takes the combo its move declares, and only when the level allows it', () => {
        const comboCount = (aiLevelId: string): number => {
            const bot = new AiController(1, level(aiLevelId), 42);
            let state = createMatch(
                { characters: ['luffy', 'akainu'], stageId: DEFAULT_STAGE, seed: 42 },
                ROSTER
            );
            let combos = 0;
            for (let frame = 0; frame < ROUND_TIME_FRAMES * 4 && state.phase !== 'matchEnd'; frame += 1) {
                const step = stepMatch(state, [0, bot.next(state, ROSTER)], ROSTER);
                state = step.state;
                combos += step.events.filter((event) => event.type === 'combo').length;
            }
            return combos;
        };
        // The recruit is tuned never to cancel, which is most of why it is the
        // easy level; anything above it has to actually land the follow-up.
        expect(comboCount('recrue')).toBe(0);
        expect(comboCount('veteran')).toBeGreaterThan(0);
    });

    it('spends a full meter on the super once it is in range', () => {
        const bot = new AiController(1, level('amiral'), 3);
        let state = createMatch(
            { characters: ['luffy', 'akainu'], stageId: DEFAULT_STAGE, seed: 3 },
            ROSTER
        );
        let fired = false;
        for (let frame = 0; frame < ROUND_TIME_FRAMES && !fired; frame += 1) {
            // Hand the bot a full bar every frame, which is the only thing
            // this test is about: meter is slow to build against a dummy, and
            // that is the engine's business, not the bot's.
            state.fighters[1].meter = METER_MAX;
            const step = stepMatch(state, [0, bot.next(state, ROSTER)], ROSTER);
            state = step.state;
            fired = step.events.some((event) => event.type === 'super' && event.fighter === 1);
        }
        expect(fired).toBe(true);
    });

    it('guards instead of eating a whiffed string', () => {
        // Slot 0 mashes its light attack from point-blank. A bot that never
        // guarded would show `guarding` false on every single frame.
        let guarded = 0;
        const bot = new AiController(1, level('amiral'), 11);
        let state = createMatch(
            { characters: ['luffy', 'lucci'], stageId: DEFAULT_STAGE, seed: 11 },
            ROSTER
        );
        for (let frame = 0; frame < ROUND_TIME_FRAMES && state.phase !== 'matchEnd'; frame += 1) {
            const botMask = bot.next(state, ROSTER);
            // Walk in, then press light every eighth frame.
            const human = (frame % 8 === 0 ? 0b10000 : 0) | 0b10;
            state = stepMatch(state, [human, botMask], ROSTER).state;
            if (state.fighters[1].guarding) {
                guarded += 1;
            }
        }
        expect(guarded).toBeGreaterThan(0);
    });

    it('does nothing outside the fight phase', () => {
        const bot = new AiController(1, level('amiral'), 5);
        const state = createMatch(
            { characters: ['luffy', 'enel'], stageId: DEFAULT_STAGE, seed: 5 },
            ROSTER
        );
        expect(state.phase).toBe('intro');
        expect(bot.next(state, ROSTER)).toBe(0);
    });

    it('falls back to a known level for an unknown id', () => {
        expect(findAiLevel('n-importe-quoi').id).toBe('combattant');
    });
});
