/**
 * The computer opponent.
 *
 * It plays the game the way a player does: it reads the same `MatchState`
 * everyone else reads and answers with a 16-bit input mask, one per frame.
 * It has no privileged access to the simulation — it cannot set health, force
 * a hit, or read an input that has not been pressed yet. Turning the bot on is
 * therefore exactly the same thing as plugging in a second pad, which is why
 * the online code, the training room and the arcade ladder all run the one
 * `stepMatch` without knowing who is holding either seat.
 *
 * Two consequences worth stating, because they are what makes this safe:
 *
 * - **It is deterministic.** Every choice comes from a seeded LCG carried in
 *   the controller, never from `Math.random`. The same seed against the same
 *   frames produces the same fight, so a bot match can be replayed, and a
 *   desync can never come from the bot.
 * - **It is driven by the character data.** Reach comes from each move's own
 *   hitbox, the combo comes from the move's declared cancel window, the super
 *   from its meter cost. Adding a sixth character gives the bot a sixth
 *   character to play, with no code here to touch.
 *
 * What it is *not*: it does not read frame data to punish on reaction, it does
 * not condition on your habits, and it does not plan beyond its next move. It
 * is a competent sparring partner, not a strong opponent, and the levels below
 * change how often it commits rather than how well it thinks.
 */

import { ARENA_WIDTH } from './constants.js';
import { iabs, nextRandom, toPx } from './fixed.js';
import { Button } from './input.js';
import type { CharacterRoster } from './engine.js';
import { isActionable } from './engine.js';
import type { CharacterDefinition, MatchState, MoveDefinition, MoveSlot } from './types.js';

/** Tuning for one difficulty. Every chance is out of 100. */
export interface AiLevel {
    id: string;
    /** Shown on the difficulty picker. */
    name: string;
    /** One line telling the player what they are in for. */
    description: string;
    /** Chance of starting an attack once the opponent is in range. */
    aggression: number;
    /** Chance of continuing a light attack into its cancel. */
    comboChance: number;
    /** Chance of guarding a given incoming attack. */
    guardChance: number;
    /** Chance of throwing a projectile when out of melee range. */
    zoningChance: number;
    /** Chance of spending a full meter when the super would reach. */
    ultimateChance: number;
    /** Chance of jumping in rather than walking in. */
    jumpChance: number;
    /** Frames of dithering between decisions. Bigger is slower to act. */
    hesitation: number;
    /** Extra frames of recovery the bot gives away after each attack. */
    slack: number;
}

/**
 * Four levels. The first is meant to be beaten by someone who has just read
 * the controls; the last blocks most of what it sees and takes its combos.
 */
export const AI_LEVELS: readonly AiLevel[] = [
    {
        id: 'recrue',
        name: 'Recrue',
        description: 'Attaque peu, garde rarement, laisse passer les ouvertures.',
        aggression: 24,
        comboChance: 0,
        guardChance: 18,
        zoningChance: 10,
        ultimateChance: 12,
        jumpChance: 6,
        hesitation: 26,
        slack: 22
    },
    {
        id: 'combattant',
        name: 'Combattant',
        description: 'Avance, enchaîne parfois, se garde une fois sur deux.',
        aggression: 46,
        comboChance: 35,
        guardChance: 45,
        zoningChance: 22,
        ultimateChance: 35,
        jumpChance: 12,
        hesitation: 16,
        slack: 12
    },
    {
        id: 'veteran',
        name: 'Vétéran',
        description: 'Garde la plupart des coups et punit les attaques dans le vide.',
        aggression: 66,
        comboChance: 62,
        guardChance: 72,
        zoningChance: 34,
        ultimateChance: 62,
        jumpChance: 16,
        hesitation: 9,
        slack: 6
    },
    {
        id: 'amiral',
        name: 'Amiral',
        description: 'Presse sans relâche, enchaîne, et garde son ultime pour vous.',
        aggression: 84,
        comboChance: 86,
        guardChance: 88,
        zoningChance: 42,
        ultimateChance: 85,
        jumpChance: 20,
        hesitation: 4,
        slack: 2
    }
];

export const DEFAULT_AI_LEVEL = AI_LEVELS[1]!;

export const findAiLevel = (id: string): AiLevel =>
    AI_LEVELS.find((level) => level.id === id) ?? DEFAULT_AI_LEVEL;

const moveForSlot = (character: CharacterDefinition, slot: MoveSlot): MoveDefinition | undefined =>
    character.moves.find((move) => move.slot === slot);

/** How far a move reaches in front of the origin, in whole pixels. */
const reachOf = (move: MoveDefinition): number => move.hitbox.x + move.hitbox.width;

/**
 * The bot walks into range rather than standing at the exact tip of its own
 * jab, which would make every attack a trade. This is the slack it keeps.
 */
const SPACING_MARGIN = 12;

/** Beyond this, walking in is the only sensible answer to anything. */
const FAR = Math.round(ARENA_WIDTH / 3);

/** Shortest stretch the bot will keep walking in one direction. */
const MIN_DRIFT_FRAMES = 8;

/** Closer than this, a projectile is not worth the frames it costs. */
const ZONING_RANGE = Math.round(ARENA_WIDTH / 6);

/** Hard stop on the length of a queued cancel attempt, in frames. */
const CANCEL_SCRIPT_CAP = 48;

/** Frames the bot waits after a projectile before considering another. */
const PROJECTILE_PAUSE = 40;

export class AiController {
    private readonly slot: 0 | 1;
    private readonly level: AiLevel;
    private seed: number;

    /** Masks queued for the next frames, consumed one per frame. */
    private script: number[] = [];
    /** Frames the bot waits *after* a move has fully recovered. The engine
     *  already holds it in the attack state for the move's real duration, so
     *  this is only the extra breath the level chooses to give away — adding
     *  the duration here again would leave the bot idle for twice as long as
     *  the move actually costs. */
    private cooldown = 0;
    /** Frames left holding guard, once the bot has decided to block. */
    private guardFor = 0;
    /** Frames until the bot is allowed to weigh its options again. Without
     *  this, every chance below would be rolled sixty times a second, and a
     *  "42% chance to throw a projectile" would mean "always". */
    private think = 0;
    /** Movement the bot keeps doing until it decides otherwise. */
    private drift = 0;
    private driftFrames = 0;
    /** The opponent move the bot has already reacted to, so one attack draws
     *  one decision instead of one per frame. */
    private seenMoveId: string | null = null;
    /** This frame's meter, refreshed at the top of `next`, so the decision
     *  helpers can ask what the bot can afford without passing it around. */
    private meter = 0;

    constructor(slot: 0 | 1, level: AiLevel, seed: number) {
        this.slot = slot;
        this.level = level;
        // Never start on zero: an LCG seeded at zero still advances, but the
        // first few values are poor, and a bot that opens the same way every
        // match is noticeable.
        this.seed = (seed ^ 0x9e3779b9) >>> 0;
    }

    /** A percentage in [0, 99], advancing the controller's own generator. */
    private roll(): number {
        this.seed = nextRandom(this.seed);
        return this.seed % 100;
    }

    /** Two frames held then one released, so the next press is a fresh edge. */
    private static press(button: number, alongside = 0): number[] {
        return [button | alongside, button | alongside, alongside];
    }

    /** Produces this frame's input mask. Call once per simulated frame. */
    next(state: MatchState, roster: CharacterRoster): number {
        const me = state.fighters[this.slot];
        const foe = state.fighters[this.slot === 0 ? 1 : 0];
        const character = roster[me.characterId];
        this.meter = me.meter;

        if (state.phase !== 'fight' || !character) {
            this.script.length = 0;
            this.guardFor = 0;
            return 0;
        }

        // Same rule the engine uses, so the bot's idea of forward is the
        // engine's idea of forward even in the frame they cross over.
        const towards: 1 | -1 = foe.x >= me.x ? 1 : -1;
        const forward = towards === 1 ? Button.Right : Button.Left;
        const back = towards === 1 ? Button.Left : Button.Right;
        const distance = toPx(iabs(foe.x - me.x));

        // Being hit is not a decision. Holding back through the stun means the
        // guard is already up if the next hit of the string is blockable.
        if (me.state === 'hitstun' || me.state === 'airHitstun' || me.state === 'blockstun') {
            this.script.length = 0;
            return back;
        }

        // One roll per opponent attack, on the frame it starts.
        if (foe.state === 'attack' && foe.moveId !== null) {
            if (foe.moveId !== this.seenMoveId) {
                this.seenMoveId = foe.moveId;
                const threatening = distance <= this.threatRange(roster[foe.characterId]);
                if (threatening && this.roll() < this.level.guardChance) {
                    this.script.length = 0;
                    this.cooldown = 0;
                    this.guardFor = this.guardRunFrames(roster[foe.characterId], foe.moveId);
                }
            }
        } else if (foe.state !== 'attack') {
            this.seenMoveId = null;
        }

        if (this.guardFor > 0) {
            this.guardFor -= 1;
            return back;
        }

        if (this.script.length > 0) {
            return this.script.shift() ?? 0;
        }

        if (!isActionable(me)) {
            return 0;
        }

        if (me.airborne) {
            // The jump arc is already committed, so the only choice left is
            // whether to swing on the way down.
            const air = moveForSlot(character, 'airLight');
            if (air && distance <= reachOf(air) && this.roll() < this.level.aggression) {
                this.script = AiController.press(Button.Light);
                return this.script.shift() ?? 0;
            }
            return 0;
        }

        if (this.cooldown > 0) {
            this.cooldown -= 1;
            return this.drifting();
        }

        // A knocked-down opponent cannot be hit, so walking in beats swinging
        // at the floor and being recovered when they get up.
        if (foe.state === 'knockdown' || foe.invuln > 0) {
            return this.approach(forward, back, distance, character);
        }

        if (this.think > 0) {
            this.think -= 1;
            return this.approach(forward, back, distance, character);
        }
        this.think = Math.max(2, this.level.hesitation);

        const decision = this.decide(state, character, distance, forward);
        if (decision !== null) {
            return decision;
        }
        return this.approach(forward, back, distance, character);
    }

    /** Range within which an opponent's attack is worth guarding. */
    private threatRange(foeCharacter: CharacterDefinition | undefined): number {
        if (!foeCharacter) {
            return 120;
        }
        return Math.max(...foeCharacter.moves.map(reachOf)) + SPACING_MARGIN;
    }

    /** Frames to hold the guard: the rest of the move, plus a little. */
    private guardRunFrames(foeCharacter: CharacterDefinition | undefined, moveId: string): number {
        const move = foeCharacter?.moves.find((candidate) => candidate.id === moveId);
        return (move ? move.duration : 30) + 4;
    }

    /**
     * Picks an attack, or returns null to leave the decision to footsies.
     * The order is the order of opportunity: a super that reaches, then a
     * combo starter, then a heavy, then a projectile.
     */
    private decide(
        state: MatchState,
        character: CharacterDefinition,
        distance: number,
        forward: number
    ): number | null {
        const ultimate = moveForSlot(character, 'ultimate');
        const light = moveForSlot(character, 'light');
        const heavy = moveForSlot(character, 'heavy');
        const special = moveForSlot(character, 'special');
        const meter = this.meter;

        if (
            ultimate &&
            meter >= ultimate.meterCost &&
            distance <= reachOf(ultimate) &&
            this.roll() < this.level.ultimateChance
        ) {
            this.cooldown = this.level.slack;
            this.script = AiController.press(Button.Ultimate);
            return this.script.shift() ?? 0;
        }

        if (light && distance <= reachOf(light) + SPACING_MARGIN && this.roll() < this.level.aggression) {
            this.script = AiController.press(Button.Light);
            // The follow-up is not a hard-coded combo: it presses the next
            // button inside the window the move itself declares, and the
            // engine decides whether the cancel is legal.
            const follow = this.cancelFollowUp(character, light);
            if (follow) {
                this.appendCancelPresses(follow, light);
            }
            this.cooldown = this.level.slack;
            return this.script.shift() ?? 0;
        }

        if (heavy && distance <= reachOf(heavy) && this.roll() < this.level.aggression / 2) {
            this.cooldown = this.level.slack;
            this.script = AiController.press(Button.Heavy);
            return this.script.shift() ?? 0;
        }

        // Zoning is for when walking in would cost more than the shot: a
        // projectile thrown from just outside jab range is worse than the jab
        // it replaces, because the bot stands still while it travels.
        const shotInFlight = state.projectiles.some((projectile) => projectile.owner === this.slot);
        if (
            special &&
            special.projectile &&
            !shotInFlight &&
            distance > ZONING_RANGE &&
            this.roll() < this.level.zoningChance
        ) {
            // One shot at a time. A bot that throws a second before the first
            // has landed is not zoning, it is standing still behind a wall of
            // its own projectiles, and it never shows you the character.
            this.cooldown = this.level.slack + PROJECTILE_PAUSE;
            this.script = AiController.press(Button.Special);
            return this.script.shift() ?? 0;
        }

        if (distance > FAR && this.roll() < this.level.jumpChance) {
            this.script = AiController.press(Button.Up, forward);
            this.drift = forward;
            this.driftFrames = 24;
            return this.script.shift() ?? 0;
        }

        return null;
    }

    /**
     * Presses the follow-up button repeatedly across the cancel window.
     *
     * A single press timed at the window's first frame does not work, and the
     * reason is worth writing down: when the first hit connects, both fighters
     * enter hitstop, and hitstop deliberately freezes `stateFrame` while real
     * frames keep passing. The script advances, the move does not, and the
     * press lands before the window opens — then ages out of the four-frame
     * lookback before the window ever arrives. Pressing every third frame from
     * just before the window until well past it costs nothing and cannot miss.
     */
    private appendCancelPresses(button: number, from: MoveDefinition): void {
        const start = Math.max(this.script.length, from.cancelWindow[0] - 1);
        const until = Math.min(CANCEL_SCRIPT_CAP, from.cancelWindow[1] + from.hit.hitstop);
        while (this.script.length < start) {
            this.script.push(0);
        }
        while (this.script.length < until) {
            this.script.push(...AiController.press(button));
        }
    }

    /**
     * The button that fires the cheapest move this one may cancel into. The
     * move list is the source of truth: if a character declares no cancels,
     * the bot simply has no combo with it.
     */
    private cancelFollowUp(character: CharacterDefinition, from: MoveDefinition): number | null {
        if (from.cancelInto.length === 0 || this.roll() >= this.level.comboChance) {
            return null;
        }
        const candidates = from.cancelInto
            .map((id) => character.moves.find((move) => move.id === id))
            .filter((move): move is MoveDefinition => move !== undefined)
            .filter((move) => move.meterCost <= this.meter);
        // Prefer the biggest hit that is affordable, which for every character
        // in the roster means the heavy unless the meter is full.
        const best = candidates.sort((a, b) => b.hit.damage - a.hit.damage)[0];
        if (!best) {
            return null;
        }
        switch (best.slot) {
            case 'ultimate':
                return Button.Ultimate;
            case 'special':
                return Button.Special;
            case 'heavy':
            case 'airHeavy':
                return Button.Heavy;
            default:
                return Button.Light;
        }
    }

    /** Footsies: close the gap, or fidget just outside the opponent's reach. */
    private approach(
        forward: number,
        back: number,
        distance: number,
        character: CharacterDefinition
    ): number {
        const light = moveForSlot(character, 'light');
        const wanted = (light ? reachOf(light) : 90) - SPACING_MARGIN;

        if (this.driftFrames > 0) {
            this.driftFrames -= 1;
            return this.drift;
        }

        // Movement is committed for a stretch rather than chosen afresh every
        // frame. A bot that re-decides constantly does not walk, it vibrates,
        // and on screen that reads as a bug rather than as spacing.
        const run = Math.max(MIN_DRIFT_FRAMES, this.level.hesitation);

        if (distance > wanted) {
            this.drift = forward;
            this.driftFrames = run;
        } else if (distance < wanted - SPACING_MARGIN * 2 && this.roll() < this.retreatChance()) {
            // Backing off from point-blank keeps the bot from gluing itself to
            // the opponent and turning every round into a mash-off. The more
            // aggressive the level, the less often it gives the ground back.
            this.drift = back;
            this.driftFrames = run;
        } else {
            this.drift = 0;
            this.driftFrames = MIN_DRIFT_FRAMES;
        }
        return this.drift;
    }

    /** How willing this level is to give ground once it is already in range. */
    private retreatChance(): number {
        return Math.max(6, 45 - (this.level.aggression >> 1));
    }

    private drifting(): number {
        if (this.driftFrames > 0) {
            this.driftFrames -= 1;
            return this.drift;
        }
        return 0;
    }

}

/** A bot as a plain per-frame function, which is all a driver needs. */
export const createAiReader = (
    slot: 0 | 1,
    level: AiLevel,
    seed: number,
    roster: CharacterRoster
): ((state: MatchState) => number) => {
    const controller = new AiController(slot, level, seed);
    return (state: MatchState): number => controller.next(state, roster);
};
