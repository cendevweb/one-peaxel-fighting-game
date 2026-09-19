/**
 * Compact wire form for a match state, plus the checksum the client uses to
 * decide whether a rollback is needed.
 *
 * A JSON snapshot of a match is around 900 bytes; at the snapshot rate that is
 * a lot of bandwidth for data that is almost entirely small integers. The flat
 * `number[]` below is about a fifth of that and, more usefully, it forces every
 * field that matters to the simulation to be listed in one place — anything
 * missing here is a field that would silently survive a rollback.
 */
import type { CharacterDefinition, FighterState, FighterStateId, MatchPhase, MatchState, ProjectileState } from './types.js';
import type { CharacterRoster } from './engine.js';
import { INPUT_BUFFER_FRAMES } from './constants.js';

const STATE_IDS: readonly FighterStateId[] = [
    'idle', 'walk', 'walkBack', 'jumpRise', 'jumpFall', 'land', 'attack',
    'hitstun', 'airHitstun', 'blockstun', 'knockdown', 'wakeup', 'victory',
    'defeat', 'intro'
];

const PHASES: readonly MatchPhase[] = ['intro', 'fight', 'ko', 'roundEnd', 'matchEnd'];

const stateIndex = (id: FighterStateId): number => Math.max(0, STATE_IDS.indexOf(id));
const phaseIndex = (phase: MatchPhase): number => Math.max(0, PHASES.indexOf(phase));

const moveIndex = (character: CharacterDefinition, moveId: string | null): number =>
    moveId === null ? -1 : character.moves.findIndex((move) => move.id === moveId);

const encodeFighter = (fighter: FighterState, character: CharacterDefinition, out: number[]): void => {
    out.push(
        fighter.x, fighter.y, fighter.vx, fighter.vy,
        fighter.facing, fighter.health, fighter.meter,
        stateIndex(fighter.state), fighter.stateFrame,
        moveIndex(character, fighter.moveId),
        fighter.hitWindows, fighter.stunFrames,
        fighter.connected ? 1 : 0, fighter.hitstop, fighter.invuln,
        fighter.guarding ? 1 : 0, fighter.airborne ? 1 : 0,
        fighter.comboHits, fighter.comboDamage, fighter.wins,
        fighter.lastInput
    );
    for (let index = 0; index < INPUT_BUFFER_FRAMES; index += 1) {
        out.push(fighter.buffer[index] ?? 0);
    }
};

const decodeFighter = (
    data: readonly number[],
    cursor: { at: number },
    character: CharacterDefinition
): FighterState => {
    const read = (): number => data[cursor.at++] ?? 0;
    const fighter: FighterState = {
        characterId: character.id,
        x: read(), y: read(), vx: read(), vy: read(),
        facing: read() === -1 ? -1 : 1,
        health: read(), meter: read(),
        state: STATE_IDS[read()] ?? 'idle',
        stateFrame: read(),
        moveId: null,
        hitWindows: 0, stunFrames: 0, connected: false,
        hitstop: 0, invuln: 0, guarding: false, airborne: false,
        comboHits: 0, comboDamage: 0, wins: 0,
        buffer: [], lastInput: 0
    };
    const move = read();
    fighter.moveId = move >= 0 ? (character.moves[move]?.id ?? null) : null;
    fighter.hitWindows = read();
    fighter.stunFrames = read();
    fighter.connected = read() === 1;
    fighter.hitstop = read();
    fighter.invuln = read();
    fighter.guarding = read() === 1;
    fighter.airborne = read() === 1;
    fighter.comboHits = read();
    fighter.comboDamage = read();
    fighter.wins = read();
    fighter.lastInput = read();
    for (let index = 0; index < INPUT_BUFFER_FRAMES; index += 1) {
        fighter.buffer.push(read());
    }
    return fighter;
};

const encodeProjectile = (projectile: ProjectileState, characters: readonly CharacterDefinition[], out: number[]): void => {
    const owner = characters[projectile.owner];
    out.push(
        projectile.id,
        projectile.owner,
        owner ? owner.moves.findIndex((move) => move.id === projectile.specId) : -1,
        projectile.x, projectile.y, projectile.vx, projectile.vy,
        projectile.gravity, projectile.facing, projectile.life,
        projectile.hitsLeft, projectile.hitMask
    );
};

export type EncodedMatchState = number[];

export const encodeMatchState = (state: MatchState, roster: CharacterRoster): EncodedMatchState => {
    const first = roster[state.fighters[0].characterId];
    const second = roster[state.fighters[1].characterId];
    if (!first || !second) {
        throw new Error('Cannot encode a match whose characters are not in the roster.');
    }

    const out: number[] = [
        state.frame,
        phaseIndex(state.phase),
        state.phaseFrame,
        state.round,
        state.timer,
        state.nextProjectileId,
        state.roundWinner === null ? -1 : state.roundWinner,
        state.matchWinner === null ? -1 : state.matchWinner,
        state.freeze,
        state.rng
    ];
    encodeFighter(state.fighters[0], first, out);
    encodeFighter(state.fighters[1], second, out);
    out.push(state.projectiles.length);
    for (const projectile of state.projectiles) {
        encodeProjectile(projectile, [first, second], out);
    }
    return out;
};

export const decodeMatchState = (
    data: readonly number[],
    characterIds: readonly [string, string],
    stageId: string,
    roster: CharacterRoster
): MatchState => {
    const first = roster[characterIds[0]];
    const second = roster[characterIds[1]];
    if (!first || !second) {
        throw new Error('Cannot decode a match whose characters are not in the roster.');
    }

    const cursor = { at: 0 };
    const read = (): number => data[cursor.at++] ?? 0;

    const frame = read();
    const phase = PHASES[read()] ?? 'fight';
    const phaseFrame = read();
    const round = read();
    const timer = read();
    const nextProjectileId = read();
    const roundWinnerRaw = read();
    const matchWinnerRaw = read();
    const freeze = read();
    const rng = read();

    const fighterA = decodeFighter(data, cursor, first);
    const fighterB = decodeFighter(data, cursor, second);

    const projectiles: ProjectileState[] = [];
    const count = read();
    const owners = [first, second] as const;
    for (let index = 0; index < count; index += 1) {
        const id = read();
        const owner = read() === 1 ? 1 : 0;
        const specIndex = read();
        const ownerCharacter = owners[owner];
        projectiles.push({
            id,
            owner,
            specId: ownerCharacter.moves[specIndex]?.id ?? '',
            x: read(), y: read(), vx: read(), vy: read(),
            gravity: read(),
            facing: read() === -1 ? -1 : 1,
            life: read(),
            hitsLeft: read(),
            hitMask: read()
        });
    }

    return {
        frame, phase, phaseFrame, round, timer,
        fighters: [fighterA, fighterB],
        projectiles,
        nextProjectileId,
        roundWinner: roundWinnerRaw < 0 ? null : roundWinnerRaw === 1 ? 1 : 0,
        matchWinner: matchWinnerRaw < 0 ? null : matchWinnerRaw === 1 ? 1 : 0,
        freeze,
        stageId,
        rng
    };
};

/**
 * FNV-1a over the encoded state. Two peers whose checksums agree on a frame
 * agree on everything that decides the fight, which is exactly the question a
 * client asks before deciding to roll back.
 */
export const checksumMatchState = (state: MatchState, roster: CharacterRoster): number => {
    const data = encodeMatchState(state, roster);
    let hash = 0x811c9dc5;
    for (const value of data) {
        let word = value | 0;
        for (let byte = 0; byte < 4; byte += 1) {
            hash ^= word & 0xff;
            hash = Math.imul(hash, 0x01000193);
            word >>>= 8;
        }
    }
    return hash >>> 0;
};
