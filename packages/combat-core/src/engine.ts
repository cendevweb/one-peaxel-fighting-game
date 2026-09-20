/**
 * The simulation.
 *
 * `stepMatch` is a pure function: same state plus same inputs always gives the
 * same next state, on the server and on both clients. Everything it touches is
 * integer arithmetic, and nothing it reads comes from the wall clock, the DOM
 * or `Math.random`. That is what lets the client predict frames ahead of the
 * server and re-simulate them when the authoritative snapshot disagrees.
 */
import {
    AIR_FRICTION_FP,
    ARENA_CEILING_FP,
    ARENA_WIDTH,
    ARENA_WIDTH_FP,
    COMBO_SCALING,
    COMBO_SCALING_FLOOR,
    GROUND_FRICTION_FP,
    INPUT_BUFFER_FRAMES,
    INTRO_FRAMES,
    KO_FREEZE_FRAMES,
    METER_MAX,
    PUSH_SPEED_FP,
    ROUND_END_FRAMES,
    ROUND_TIME_FRAMES,
    ROUNDS_TO_WIN,
    WAKEUP_INVULN_FRAMES,
    WALL_MARGIN_FP
} from './constants.js';
import { boxesOverlap, overlapCenter, resolveBox } from './collision.js';
import { clamp, FP_ONE, iabs, isign, nextRandom, px, toPx } from './fixed.js';
import { Button, NEUTRAL_INPUT, sanitizeInput } from './input.js';
import type {
    CharacterDefinition,
    CombatEvent,
    FighterState,
    MatchSetup,
    MatchState,
    MoveDefinition,
    ProjectileState,
    StepResult,
    WorldBox
} from './types.js';

export type CharacterRoster = Readonly<Record<string, CharacterDefinition>>;

/** Starting distance between the two fighters, in pixels from the centre. */
const START_OFFSET = 180;

const emptyBuffer = (): number[] => new Array<number>(INPUT_BUFFER_FRAMES).fill(NEUTRAL_INPUT);

const createFighter = (character: CharacterDefinition, slot: 0 | 1): FighterState => ({
    characterId: character.id,
    x: px(ARENA_WIDTH / 2 + (slot === 0 ? -START_OFFSET : START_OFFSET)),
    y: 0,
    vx: 0,
    vy: 0,
    facing: slot === 0 ? 1 : -1,
    health: character.stats.maxHealth,
    meter: 0,
    state: 'intro',
    stateFrame: 0,
    moveId: null,
    hitWindows: 0,
    stunFrames: 0,
    connected: false,
    hitstop: 0,
    invuln: 0,
    guarding: false,
    airborne: false,
    comboHits: 0,
    comboDamage: 0,
    wins: 0,
    buffer: emptyBuffer(),
    lastInput: NEUTRAL_INPUT
});

export const createMatch = (setup: MatchSetup, roster: CharacterRoster): MatchState => {
    const first = roster[setup.characters[0]];
    const second = roster[setup.characters[1]];
    if (!first || !second) {
        throw new Error(`Unknown character in setup: ${setup.characters.join(', ')}`);
    }

    return {
        frame: 0,
        phase: 'intro',
        phaseFrame: 0,
        round: 1,
        timer: ROUND_TIME_FRAMES,
        fighters: [createFighter(first, 0), createFighter(second, 1)],
        projectiles: [],
        nextProjectileId: 1,
        roundWinner: null,
        matchWinner: null,
        freeze: 0,
        stageId: setup.stageId,
        rng: setup.seed >>> 0
    };
};

export const cloneFighter = (fighter: FighterState): FighterState => ({
    ...fighter,
    buffer: fighter.buffer.slice()
});

export const cloneMatchState = (state: MatchState): MatchState => ({
    ...state,
    fighters: [cloneFighter(state.fighters[0]), cloneFighter(state.fighters[1])],
    projectiles: state.projectiles.map((projectile) => ({ ...projectile }))
});

// --------------------------------------------------------------------- helpers

const findMove = (character: CharacterDefinition, moveId: string): MoveDefinition | undefined =>
    character.moves.find((move) => move.id === moveId);

const moveForSlot = (
    character: CharacterDefinition,
    slot: MoveDefinition['slot']
): MoveDefinition | undefined => character.moves.find((move) => move.slot === slot);

const risingEdge = (fighter: FighterState, button: number, window: number): boolean => {
    const limit = Math.min(window, fighter.buffer.length - 1);
    for (let index = 0; index < limit; index += 1) {
        const current = fighter.buffer[index] ?? 0;
        const earlier = fighter.buffer[index + 1] ?? 0;
        if ((current & button) !== 0 && (earlier & button) === 0) {
            return true;
        }
    }
    return false;
};

export const isNeutralState = (fighter: FighterState): boolean =>
    fighter.state === 'idle' ||
    fighter.state === 'walk' ||
    fighter.state === 'walkBack' ||
    fighter.state === 'guard';

/** States in which a fighter may start a new action. */
export const isActionable = (fighter: FighterState): boolean =>
    isNeutralState(fighter) ||
    fighter.state === 'jumpRise' ||
    fighter.state === 'jumpFall' ||
    fighter.state === 'wakeup';

const hurtboxOf = (fighter: FighterState, character: CharacterDefinition): WorldBox => {
    const box =
        fighter.state === 'knockdown'
            ? character.hurtbox.down
            : fighter.airborne
              ? character.hurtbox.air
              : character.hurtbox.standing;
    return resolveBox(box, toPx(fighter.x), toPx(fighter.y), fighter.facing);
};

/** Index of the active window the move is currently inside, or -1. */
const activeWindowIndex = (move: MoveDefinition, frame: number): number => {
    for (let index = 0; index < move.active.length; index += 1) {
        const window = move.active[index];
        if (window && frame >= window[0] && frame <= window[1]) {
            return index;
        }
    }
    return -1;
};

const scaledDamage = (damage: number, comboHits: number): number => {
    const scale = COMBO_SCALING[comboHits] ?? COMBO_SCALING_FLOOR;
    return Math.max(1, Math.trunc((damage * scale) / 100));
};

/** Knockback is lighter on a heavy fighter; weight 100 is neutral. */
const applyKnockback = (
    victim: FighterState,
    character: CharacterDefinition,
    x: number,
    y: number,
    direction: 1 | -1
): void => {
    const weight = Math.max(40, character.stats.weight);
    victim.vx = Math.trunc((px(x) * 100) / weight) * direction;
    victim.vy = Math.trunc((px(y) * 100) / weight);
};

const addMeter = (fighter: FighterState, amount: number): void => {
    fighter.meter = clamp(fighter.meter + amount, 0, METER_MAX);
};

// ------------------------------------------------------------------- movement

const startMove = (
    fighter: FighterState,
    move: MoveDefinition,
    events: CombatEvent[],
    slot: 0 | 1,
    state: MatchState
): void => {
    fighter.state = 'attack';
    fighter.stateFrame = 0;
    fighter.moveId = move.id;
    fighter.hitWindows = 0;
    fighter.connected = false;
    fighter.guarding = false;
    fighter.meter -= move.meterCost;
    if (!fighter.airborne) {
        fighter.vx = 0;
    }
    if (move.startupFreeze && move.startupFreeze > 0) {
        state.freeze = Math.max(state.freeze, move.startupFreeze);
        events.push({ type: 'super', fighter: slot, moveId: move.id });
    }
    events.push({ type: 'move', fighter: slot, moveId: move.id, animation: move.animation });
};

/** Picks the move a fighter is asking for this frame, if any is legal. */
const requestedMove = (
    fighter: FighterState,
    character: CharacterDefinition,
    window: number
): MoveDefinition | undefined => {
    const airborne = fighter.airborne;
    const candidates: Array<[number, MoveDefinition['slot']]> = airborne
        ? [
              [Button.Ultimate, 'ultimate'],
              [Button.Special, 'special'],
              [Button.Heavy, 'airHeavy'],
              [Button.Light, 'airLight']
          ]
        : [
              [Button.Ultimate, 'ultimate'],
              [Button.Special, 'special'],
              [Button.Heavy, 'heavy'],
              [Button.Light, 'light']
          ];

    for (const [button, slot] of candidates) {
        if (!risingEdge(fighter, button, window)) {
            continue;
        }
        const move = moveForSlot(character, slot);
        if (!move) {
            continue;
        }
        if (move.meterCost > fighter.meter) {
            continue;
        }
        if (move.airOnly && !airborne) {
            continue;
        }
        if (move.groundOnly && airborne) {
            continue;
        }
        return move;
    }
    return undefined;
};

const updateFighter = (
    state: MatchState,
    slot: 0 | 1,
    character: CharacterDefinition,
    input: number,
    events: CombatEvent[],
    frozen: boolean
): void => {
    const fighter = state.fighters[slot];
    const stats = character.stats;

    if (fighter.hitstop > 0) {
        // Hitstop freezes the input buffer rather than ageing it. Without
        // this, the freeze of the hit you just landed eats the cancel you
        // buffered during it, and every confirm has to be re-timed around
        // how much hitstop the previous move happened to have.
        fighter.buffer[0] = (fighter.buffer[0] ?? 0) | input;
        fighter.hitstop -= 1;
        fighter.lastInput = input;
        return;
    }

    fighter.buffer.unshift(input);
    if (fighter.buffer.length > INPUT_BUFFER_FRAMES) {
        fighter.buffer.length = INPUT_BUFFER_FRAMES;
    }
    if (frozen) {
        fighter.lastInput = input;
        return;
    }

    if (fighter.invuln > 0) {
        fighter.invuln -= 1;
    }

    const opponent = state.fighters[slot === 0 ? 1 : 0];
    const towardsOpponent: 1 | -1 = opponent.x >= fighter.x ? 1 : -1;
    const backButton = towardsOpponent === 1 ? Button.Left : Button.Right;
    const forwardButton = towardsOpponent === 1 ? Button.Right : Button.Left;

    fighter.guarding = false;
    fighter.stateFrame += 1;

    switch (fighter.state) {
        case 'blockstun': {
            // Holding guard keeps it up, so a multi-hit string is blocked as
            // one string instead of opening up after hit one.
            fighter.guarding = (input & Button.Guard) !== 0;
            if (fighter.stateFrame >= fighter.stunFrames) {
                fighter.state = fighter.airborne ? 'jumpFall' : 'idle';
                fighter.stateFrame = 0;
            }
            break;
        }
        case 'hitstun': {
            if (fighter.stateFrame >= fighter.stunFrames) {
                fighter.state = fighter.airborne ? 'jumpFall' : 'idle';
                fighter.stateFrame = 0;
                fighter.comboHits = 0;
                fighter.comboDamage = 0;
            }
            break;
        }
        case 'airHitstun': {
            if (!fighter.airborne) {
                fighter.state = 'knockdown';
                fighter.stateFrame = 0;
            }
            break;
        }
        case 'knockdown': {
            if (fighter.stateFrame >= 34) {
                fighter.state = 'wakeup';
                fighter.stateFrame = 0;
                fighter.invuln = WAKEUP_INVULN_FRAMES;
                fighter.comboHits = 0;
                fighter.comboDamage = 0;
            }
            break;
        }
        case 'land': {
            if (fighter.stateFrame >= stats.landingLag) {
                fighter.state = 'idle';
                fighter.stateFrame = 0;
            }
            break;
        }
        case 'attack': {
            const move = fighter.moveId ? findMove(character, fighter.moveId) : undefined;
            if (!move) {
                fighter.state = fighter.airborne ? 'jumpFall' : 'idle';
                fighter.moveId = null;
                break;
            }

            if (move.momentum && fighter.stateFrame === move.momentum.frame) {
                fighter.vx = px(move.momentum.x) * fighter.facing;
                if (move.momentum.y !== 0) {
                    fighter.vy = px(move.momentum.y);
                    fighter.airborne = true;
                }
            }
            if (move.invuln && fighter.stateFrame >= move.invuln[0] && fighter.stateFrame <= move.invuln[1]) {
                fighter.invuln = Math.max(fighter.invuln, 1);
            }

            // A move that has connected can be cancelled into the moves it
            // lists, which is the whole combo system: no combo is hard-coded.
            if (
                fighter.connected &&
                fighter.stateFrame >= move.cancelWindow[0] &&
                fighter.stateFrame <= move.cancelWindow[1] &&
                move.cancelInto.length > 0
            ) {
                const next = requestedMove(fighter, character, 4);
                if (next && move.cancelInto.includes(next.id)) {
                    startMove(fighter, next, events, slot, state);
                    break;
                }
            }

            if (fighter.stateFrame >= move.duration) {
                fighter.state = fighter.airborne ? 'jumpFall' : 'idle';
                fighter.stateFrame = 0;
                fighter.moveId = null;
                if (!fighter.connected) {
                    events.push({ type: 'whiff', attacker: slot, moveId: move.id });
                }
            }
            break;
        }
        case 'intro':
        case 'victory':
        case 'defeat':
            break;
        default: {
            // Neutral, walking, airborne or waking up: the fighter acts.
            if (fighter.state === 'wakeup' && fighter.stateFrame < 6) {
                break;
            }

            const move = requestedMove(fighter, character, 3);
            if (move) {
                startMove(fighter, move, events, slot, state);
                break;
            }

            if (fighter.airborne) {
                break; // No air control: the jump arc is committed, as in GB2.
            }

            const holdingBack = (input & backButton) !== 0;
            const holdingForward = (input & forwardButton) !== 0;

            // The guard is a button of its own, and it wins over everything a
            // direction could ask for: a player holding it is asking to stand
            // still and take the hit, whatever else their other hand is doing.
            // Walking back is therefore only walking back, and a guard can be
            // held while running away is no longer an option.
            if ((input & Button.Guard) !== 0) {
                fighter.guarding = true;
                fighter.vx = 0;
                if (fighter.state !== 'guard') {
                    fighter.state = 'guard';
                    fighter.stateFrame = 0;
                }
                break;
            }

            if ((input & Button.Up) !== 0 && (fighter.lastInput & Button.Up) === 0) {
                fighter.airborne = true;
                fighter.state = 'jumpRise';
                fighter.stateFrame = 0;
                fighter.vy = px(stats.jumpVelocity);
                fighter.vx = holdingForward
                    ? px(stats.jumpForward) * towardsOpponent
                    : holdingBack
                      ? -px(stats.jumpForward) * towardsOpponent
                      : 0;
                events.push({ type: 'jump', fighter: slot });
                break;
            }

            if (holdingBack) {
                fighter.vx = -px(stats.backSpeed) * towardsOpponent;
                if (fighter.state !== 'walkBack') {
                    fighter.state = 'walkBack';
                    fighter.stateFrame = 0;
                }
            } else if (holdingForward) {
                fighter.vx = px(stats.walkSpeed) * towardsOpponent;
                if (fighter.state !== 'walk') {
                    fighter.state = 'walk';
                    fighter.stateFrame = 0;
                }
            } else {
                fighter.vx = 0;
                if (fighter.state !== 'idle') {
                    fighter.state = 'idle';
                    fighter.stateFrame = 0;
                }
            }
            break;
        }
    }

    // Fighters always look at each other while they are free to turn around.
    if (isNeutralState(fighter) && !fighter.airborne) {
        fighter.facing = towardsOpponent;
    }

    fighter.lastInput = input;
};

const applyPhysics = (fighter: FighterState, character: CharacterDefinition, events: CombatEvent[], slot: 0 | 1): void => {
    if (fighter.hitstop > 0) {
        return;
    }

    fighter.x += fighter.vx;
    fighter.y += fighter.vy;

    if (fighter.airborne) {
        fighter.vy -= px(character.stats.gravity);
        if (fighter.vy < -px(18)) {
            fighter.vy = -px(18);
        }
        if (fighter.y > ARENA_CEILING_FP) {
            fighter.y = ARENA_CEILING_FP;
            fighter.vy = Math.min(fighter.vy, 0);
        }
        if (fighter.state === 'jumpRise' && fighter.vy <= 0) {
            fighter.state = 'jumpFall';
            fighter.stateFrame = 0;
        }
        if (fighter.y <= 0) {
            fighter.y = 0;
            fighter.vy = 0;
            fighter.airborne = false;
            events.push({ type: 'land', fighter: slot });
            if (fighter.state === 'airHitstun') {
                fighter.state = 'knockdown';
                fighter.stateFrame = 0;
                fighter.vx = Math.trunc(fighter.vx / 3);
            } else if (fighter.state !== 'hitstun' && fighter.state !== 'knockdown') {
                fighter.state = character.stats.landingLag > 0 ? 'land' : 'idle';
                fighter.stateFrame = 0;
                fighter.moveId = null;
                fighter.vx = 0;
            }
        }
        // Air drag, so knockback bleeds off instead of carrying forever.
        if (fighter.vx > 0) {
            fighter.vx = Math.max(0, fighter.vx - AIR_FRICTION_FP);
        } else if (fighter.vx < 0) {
            fighter.vx = Math.min(0, fighter.vx + AIR_FRICTION_FP);
        }
    } else if (fighter.state === 'hitstun' || fighter.state === 'knockdown' || fighter.state === 'blockstun') {
        if (fighter.vx > 0) {
            fighter.vx = Math.max(0, fighter.vx - GROUND_FRICTION_FP);
        } else if (fighter.vx < 0) {
            fighter.vx = Math.min(0, fighter.vx + GROUND_FRICTION_FP);
        }
    }

    fighter.x = clamp(fighter.x, WALL_MARGIN_FP, ARENA_WIDTH_FP - WALL_MARGIN_FP);
};

/** Keeps the two bodies from occupying the same space. */
const separate = (state: MatchState, roster: CharacterRoster): void => {
    const [a, b] = state.fighters;
    const charA = roster[a.characterId];
    const charB = roster[b.characterId];
    if (!charA || !charB) {
        return;
    }

    const boxA = resolveBox(charA.pushbox, toPx(a.x), toPx(a.y), 1);
    const boxB = resolveBox(charB.pushbox, toPx(b.x), toPx(b.y), 1);
    if (!boxesOverlap(boxA, boxB)) {
        return;
    }

    const direction = isign(a.x - b.x) || 1;
    const push = Math.min(PUSH_SPEED_FP, px(2));
    a.x = clamp(a.x + push * direction, WALL_MARGIN_FP, ARENA_WIDTH_FP - WALL_MARGIN_FP);
    b.x = clamp(b.x - push * direction, WALL_MARGIN_FP, ARENA_WIDTH_FP - WALL_MARGIN_FP);
};

// ----------------------------------------------------------------- hit solving

interface PendingHit {
    attacker: 0 | 1;
    victim: 0 | 1;
    move: MoveDefinition;
    windowIndex: number;
    point: { x: number; y: number };
    projectileId?: number;
}

const collectFighterHits = (
    state: MatchState,
    roster: CharacterRoster,
    hits: PendingHit[]
): void => {
    for (const slot of [0, 1] as const) {
        const attacker = state.fighters[slot];
        const victimSlot: 0 | 1 = slot === 0 ? 1 : 0;
        const victim = state.fighters[victimSlot];
        if (attacker.state !== 'attack' || !attacker.moveId || attacker.hitstop > 0) {
            continue;
        }
        const character = roster[attacker.characterId];
        const victimCharacter = roster[victim.characterId];
        if (!character || !victimCharacter) {
            continue;
        }
        const move = findMove(character, attacker.moveId);
        if (!move) {
            continue;
        }
        const windowIndex = activeWindowIndex(move, attacker.stateFrame);
        if (windowIndex < 0 || (attacker.hitWindows & (1 << windowIndex)) !== 0) {
            continue;
        }
        if (victim.invuln > 0 || victim.state === 'knockdown') {
            continue;
        }

        const hitbox = resolveBox(move.hitbox, toPx(attacker.x), toPx(attacker.y), attacker.facing);
        const hurtbox = hurtboxOf(victim, victimCharacter);
        if (!boxesOverlap(hitbox, hurtbox)) {
            continue;
        }

        hits.push({
            attacker: slot,
            victim: victimSlot,
            move,
            windowIndex,
            point: overlapCenter(hitbox, hurtbox)
        });
    }
};

const collectProjectileHits = (
    state: MatchState,
    roster: CharacterRoster,
    specs: Map<string, MoveDefinition>,
    hits: PendingHit[]
): void => {
    for (const projectile of state.projectiles) {
        const victimSlot: 0 | 1 = projectile.owner === 0 ? 1 : 0;
        if ((projectile.hitMask & (1 << victimSlot)) !== 0 || projectile.hitsLeft <= 0) {
            continue;
        }
        const victim = state.fighters[victimSlot];
        const victimCharacter = roster[victim.characterId];
        const move = specs.get(projectile.specId);
        if (!victimCharacter || !move?.projectile || victim.invuln > 0 || victim.state === 'knockdown') {
            continue;
        }
        const box = resolveBox(
            move.projectile.box,
            toPx(projectile.x),
            toPx(projectile.y),
            projectile.facing
        );
        const hurtbox = hurtboxOf(victim, victimCharacter);
        if (!boxesOverlap(box, hurtbox)) {
            continue;
        }
        hits.push({
            attacker: projectile.owner,
            victim: victimSlot,
            move,
            windowIndex: -1,
            point: overlapCenter(box, hurtbox),
            projectileId: projectile.id
        });
    }
};

const applyHit = (
    state: MatchState,
    roster: CharacterRoster,
    hit: PendingHit,
    events: CombatEvent[]
): void => {
    const attacker = state.fighters[hit.attacker];
    const victim = state.fighters[hit.victim];
    const victimCharacter = roster[victim.characterId];
    if (!victimCharacter) {
        return;
    }
    const properties = hit.move.hit;

    if (hit.windowIndex >= 0) {
        attacker.hitWindows |= 1 << hit.windowIndex;
    }
    attacker.connected = true;

    const attackerSide: 1 | -1 = attacker.x <= victim.x ? 1 : -1;
    // A guard only works on the ground, only against blockable hits, and only
    // while the victim is holding the guard button.
    const blocking = victim.guarding && !properties.unblockable && !victim.airborne;

    if (blocking) {
        const chip = Math.max(0, properties.chipDamage);
        victim.health = Math.max(0, victim.health - chip);
        victim.state = 'blockstun';
        victim.stateFrame = 0;
        victim.stunFrames = properties.blockstun;
        victim.hitstop = Math.max(2, properties.hitstop - 2);
        attacker.hitstop = Math.max(2, properties.hitstop - 2);
        applyKnockback(victim, victimCharacter, Math.trunc(properties.knockbackX / 2), 0, attackerSide);
        addMeter(attacker, Math.trunc(properties.meterGainOnHit / 3));
        addMeter(victim, Math.trunc(properties.meterGainOnTakeHit / 2));
        events.push({ type: 'block', victim: hit.victim, x: hit.point.x, y: hit.point.y });
        return;
    }

    const damage = scaledDamage(properties.damage, victim.comboHits);
    victim.health = Math.max(0, victim.health - damage);
    victim.comboHits += 1;
    victim.comboDamage += damage;
    victim.hitstop = properties.hitstop;
    victim.invuln = 0;
    victim.moveId = null;
    victim.guarding = false;
    attacker.hitstop = properties.hitstop;

    applyKnockback(victim, victimCharacter, properties.knockbackX, properties.knockbackY, attackerSide);

    if (properties.launcher || properties.knockbackY > 0) {
        victim.airborne = true;
        victim.state = 'airHitstun';
        victim.stateFrame = 0;
    } else if (properties.knockdown) {
        victim.state = 'knockdown';
        victim.stateFrame = 0;
    } else {
        victim.state = 'hitstun';
        victim.stateFrame = 0;
        victim.stunFrames = properties.hitstun;
    }
    victim.facing = attackerSide === 1 ? -1 : 1;

    addMeter(attacker, properties.meterGainOnHit);
    addMeter(victim, properties.meterGainOnTakeHit);

    events.push({
        type: 'hit',
        attacker: hit.attacker,
        victim: hit.victim,
        x: hit.point.x,
        y: hit.point.y,
        damage,
        moveId: hit.move.id,
        heavy: properties.hitstop >= 10
    });
    if (hit.move.cameraShake) {
        events.push({ type: 'shake', strength: hit.move.cameraShake });
    }
    if (victim.comboHits >= 2) {
        events.push({
            type: 'combo',
            fighter: hit.attacker,
            hits: victim.comboHits,
            damage: victim.comboDamage
        });
    }

    if (hit.projectileId !== undefined) {
        const projectile = state.projectiles.find((item) => item.id === hit.projectileId);
        if (projectile) {
            projectile.hitMask |= 1 << hit.victim;
            projectile.hitsLeft -= 1;
        }
    }
};

// ----------------------------------------------------------------- projectiles

const spawnProjectiles = (
    state: MatchState,
    roster: CharacterRoster,
    events: CombatEvent[]
): void => {
    for (const slot of [0, 1] as const) {
        const fighter = state.fighters[slot];
        if (fighter.state !== 'attack' || !fighter.moveId || fighter.hitstop > 0) {
            continue;
        }
        const character = roster[fighter.characterId];
        const move = character ? findMove(character, fighter.moveId) : undefined;
        const spec = move?.projectile;
        if (!spec || fighter.stateFrame !== spec.spawnFrame) {
            continue;
        }
        const projectile: ProjectileState = {
            id: state.nextProjectileId,
            owner: slot,
            specId: move.id,
            x: fighter.x + px(spec.offsetX) * fighter.facing,
            y: fighter.y + px(spec.offsetY),
            vx: px(spec.speed) * fighter.facing,
            vy: px(spec.speedY ?? 0),
            gravity: px(spec.gravity ?? 0),
            facing: fighter.facing,
            life: spec.lifetime,
            hitsLeft: spec.hits,
            hitMask: 0
        };
        state.nextProjectileId += 1;
        state.projectiles.push(projectile);
        events.push({ type: 'projectile', id: projectile.id, owner: slot, animation: spec.animation });
    }
};

const updateProjectiles = (state: MatchState, events: CombatEvent[]): void => {
    const survivors: ProjectileState[] = [];
    for (const projectile of state.projectiles) {
        projectile.x += projectile.vx;
        projectile.y += projectile.vy;
        projectile.vy -= projectile.gravity;
        projectile.life -= 1;

        const outOfBounds = projectile.x < 0 || projectile.x > ARENA_WIDTH_FP || projectile.y < -px(40);
        if (projectile.life <= 0 || projectile.hitsLeft <= 0 || outOfBounds) {
            events.push({ type: 'projectileGone', id: projectile.id });
            continue;
        }
        survivors.push(projectile);
    }
    state.projectiles = survivors;
};

// ----------------------------------------------------------------- round logic

const startRound = (state: MatchState, roster: CharacterRoster): void => {
    for (const slot of [0, 1] as const) {
        const fighter = state.fighters[slot];
        const character = roster[fighter.characterId];
        const wins = fighter.wins;
        const fresh = character ? createFighter(character, slot) : fighter;
        state.fighters[slot] = { ...fresh, wins };
    }
    state.projectiles = [];
    state.timer = ROUND_TIME_FRAMES;
    state.phase = 'intro';
    state.phaseFrame = 0;
    state.roundWinner = null;
};

const concludeRound = (state: MatchState, winner: 0 | 1 | null, events: CombatEvent[]): void => {
    state.phase = 'ko';
    state.phaseFrame = 0;
    state.roundWinner = winner;
    state.freeze = 0;
    if (winner === null) {
        events.push({ type: 'timeout' });
    } else {
        events.push({ type: 'ko', loser: winner === 0 ? 1 : 0 });
        events.push({ type: 'shake', strength: 14 });
    }
};

// ------------------------------------------------------------------- the step

export const stepMatch = (
    previous: MatchState,
    inputs: readonly [number, number],
    roster: CharacterRoster
): StepResult => {
    const state = cloneMatchState(previous);
    const events: CombatEvent[] = [];
    state.frame += 1;
    state.rng = nextRandom(state.rng);

    const masks: [number, number] = [sanitizeInput(inputs[0]), sanitizeInput(inputs[1])];
    const characters: [CharacterDefinition | undefined, CharacterDefinition | undefined] = [
        roster[state.fighters[0].characterId],
        roster[state.fighters[1].characterId]
    ];
    if (!characters[0] || !characters[1]) {
        return { state, events };
    }
    const first = characters[0];
    const second = characters[1];

    if (state.freeze > 0) {
        state.freeze -= 1;
        return { state, events };
    }

    switch (state.phase) {
        case 'intro': {
            state.phaseFrame += 1;
            if (state.phaseFrame >= INTRO_FRAMES) {
                state.phase = 'fight';
                state.phaseFrame = 0;
                state.fighters[0].state = 'idle';
                state.fighters[1].state = 'idle';
                state.fighters[0].stateFrame = 0;
                state.fighters[1].stateFrame = 0;
                events.push({ type: 'roundStart', round: state.round });
            }
            return { state, events };
        }
        case 'roundEnd': {
            state.phaseFrame += 1;
            if (state.phaseFrame >= ROUND_END_FRAMES) {
                state.round += 1;
                startRound(state, roster);
            }
            return { state, events };
        }
        case 'matchEnd':
            state.phaseFrame += 1;
            return { state, events };
        default:
            break;
    }

    const frozen = state.phase === 'ko';

    updateFighter(state, 0, first, masks[0], events, frozen);
    updateFighter(state, 1, second, masks[1], events, frozen);

    applyPhysics(state.fighters[0], first, events, 0);
    applyPhysics(state.fighters[1], second, events, 1);
    separate(state, roster);

    if (!frozen) {
        spawnProjectiles(state, roster, events);
    }
    updateProjectiles(state, events);

    if (!frozen) {
        const specs = new Map<string, MoveDefinition>();
        for (const character of [first, second]) {
            for (const move of character.moves) {
                if (move.projectile) {
                    specs.set(move.id, move);
                }
            }
        }

        const hits: PendingHit[] = [];
        collectFighterHits(state, roster, hits);
        collectProjectileHits(state, roster, specs, hits);
        // Both hits of a trade land: neither player is arbitrarily favoured.
        for (const hit of hits) {
            applyHit(state, roster, hit, events);
        }

        for (const slot of [0, 1] as const) {
            const fighter = state.fighters[slot];
            if (fighter.comboHits > 0 && isNeutralState(fighter) && fighter.hitstop === 0) {
                fighter.comboHits = 0;
                fighter.comboDamage = 0;
            }
        }

        state.timer = Math.max(0, state.timer - 1);

        const downA = state.fighters[0].health <= 0;
        const downB = state.fighters[1].health <= 0;
        if (downA || downB) {
            concludeRound(state, downA && downB ? null : downA ? 1 : 0, events);
        } else if (state.timer === 0) {
            const healthA = (state.fighters[0].health * 1000) / first.stats.maxHealth;
            const healthB = (state.fighters[1].health * 1000) / second.stats.maxHealth;
            concludeRound(state, healthA === healthB ? null : healthA > healthB ? 0 : 1, events);
        }
        return { state, events };
    }

    // KO freeze: bodies keep falling, then the round is scored.
    state.phaseFrame += 1;
    if (state.phaseFrame >= KO_FREEZE_FRAMES) {
        const winner = state.roundWinner;
        if (winner !== null) {
            state.fighters[winner].wins += 1;
            state.fighters[winner].state = 'victory';
            state.fighters[winner === 0 ? 1 : 0].state = 'defeat';
        }
        events.push({ type: 'roundEnd', winner });

        const winsA = state.fighters[0].wins;
        const winsB = state.fighters[1].wins;
        if (winsA >= ROUNDS_TO_WIN || winsB >= ROUNDS_TO_WIN || state.round >= 3) {
            state.matchWinner = winsA === winsB ? null : winsA > winsB ? 0 : 1;
            state.phase = 'matchEnd';
            state.phaseFrame = 0;
            events.push({ type: 'matchEnd', winner: state.matchWinner });
        } else {
            state.phase = 'roundEnd';
            state.phaseFrame = 0;
        }
    }
    return { state, events };
};

/** Convenience: advances several frames at once, collecting every event. */
export const stepMany = (
    state: MatchState,
    frames: readonly (readonly [number, number])[],
    roster: CharacterRoster
): StepResult => {
    let current = state;
    const events: CombatEvent[] = [];
    for (const inputs of frames) {
        const result = stepMatch(current, inputs, roster);
        current = result.state;
        events.push(...result.events);
    }
    return { state: current, events };
};

export { iabs, toPx, px, FP_ONE };
