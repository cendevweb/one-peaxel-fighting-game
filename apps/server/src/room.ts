import {
    CHARACTER_IDS,
    DEFAULT_CHARACTER,
    METER_MAX,
    ROSTER,
    TICK_RATE,
    createMatch,
    encodeMatchState,
    isCharacterId,
    pickStage,
    sanitizeInput,
    stepMatch,
    type MatchState
} from '@opfg/combat-core';
import {
    NETWORK_DEFAULTS,
    type InputPayload,
    type MatchBeginMessage,
    type MatchOverMessage,
    type PlayerView,
    type RoomPhase,
    type RoomView,
    type SnapshotMessage
} from '@opfg/shared';
import { log } from './log.js';

/** Everything the room needs from the outside world, so the whole state
 *  machine can be driven by a test without a socket in sight. */
export interface RoomTransport {
    toPlayer<E extends keyof Outbound>(playerId: string, event: E, payload: Outbound[E]): void;
    toRoom<E extends keyof Outbound>(event: E, payload: Outbound[E]): void;
}

export interface Outbound {
    'room:state': RoomView;
    'room:closed': { reason: string };
    'match:begin': MatchBeginMessage;
    'match:snapshot': SnapshotMessage;
    'match:over': MatchOverMessage;
    'opponent:disconnected': { nickname: string; graceMs: number };
    'opponent:reconnected': { nickname: string };
    'session:token': { token: string };
}

export interface RoomOptions {
    inputDelay: number;
    snapshotInterval: number;
    reconnectGraceMs: number;
}

export const DEFAULT_ROOM_OPTIONS: RoomOptions = {
    inputDelay: NETWORK_DEFAULTS.inputDelay,
    snapshotInterval: NETWORK_DEFAULTS.snapshotInterval,
    reconnectGraceMs: NETWORK_DEFAULTS.reconnectGraceMs
};

/** Milliseconds between "both players are ready" and the first simulated frame. */
const COUNTDOWN_MS = 1500;
/** How long the result screen stays up before the room drops back to select. */
const RESULT_TIMEOUT_MS = 60_000;

interface Player {
    id: string;
    nickname: string;
    slot: 0 | 1;
    characterId: string | null;
    ready: boolean;
    connected: boolean;
    disconnectedAt: number | null;
    wins: number;
    ping: number;
    rematch: boolean;
}

/**
 * One room, one match, one authoritative simulation.
 *
 * The room owns the only copy of the fight that counts. Clients send button
 * masks; the room decides what those masks did. It runs the same
 * `combat-core` build the clients run, which is what makes the clients'
 * predictions agree with it frame for frame.
 */
export class Room {
    readonly code: string;
    private readonly transport: RoomTransport;
    private readonly options: RoomOptions;

    private players = new Map<string, Player>();
    private phaseValue: RoomPhase = 'lobby';
    private stageIdValue: string;
    private seed: number;

    private match: MatchState | null = null;
    /** Kept so a player who reconnects mid-match can be handed the same
     *  parameters the match started with. */
    private characters: [string, string] | null = null;
    private frame = 0;
    private startAt = 0;
    private accumulatorMs = 0;
    private lastTickMs = 0;

    /** Pending inputs per slot, keyed by the frame they apply to. */
    private pending: [Map<number, number>, Map<number, number>] = [new Map(), new Map()];
    private lastMask: [number, number] = [0, 0];
    /** Confirmed masks, for the snapshot tail the clients re-simulate from. */
    private confirmed: Array<[number, number, number]> = [];
    private lateInputs = 0;

    private roundResults: Array<{ round: number; winner: 0 | 1 | null }> = [];
    private resultSince = 0;
    emptySince: number | null = null;

    /**
     * `clock` is injected rather than read from `Date.now` so a test can drive
     * a whole match, a disconnection and a grace period without waiting for
     * real seconds to pass — and so the room never mixes two notions of now.
     */
    constructor(
        code: string,
        transport: RoomTransport,
        options: RoomOptions = DEFAULT_ROOM_OPTIONS,
        seed = Date.now(),
        private readonly clock: () => number = Date.now
    ) {
        this.code = code;
        this.transport = transport;
        this.options = options;
        this.seed = seed >>> 0;
        this.stageIdValue = pickStage(this.seed);
        this.emptySince = this.clock();
    }

    get phase(): RoomPhase {
        return this.phaseValue;
    }

    get stageId(): string {
        return this.stageIdValue;
    }

    get playerCount(): number {
        return this.players.size;
    }

    get isJoinable(): boolean {
        return this.players.size < 2 && this.phaseValue === 'lobby';
    }

    has(playerId: string): boolean {
        return this.players.has(playerId);
    }

    // ------------------------------------------------------------- membership

    add(playerId: string, nickname: string): boolean {
        if (this.players.size >= 2 || this.players.has(playerId)) {
            return false;
        }
        const taken = new Set([...this.players.values()].map((player) => player.slot));
        const slot: 0 | 1 = taken.has(0) ? 1 : 0;

        this.players.set(playerId, {
            id: playerId,
            nickname,
            slot,
            characterId: null,
            ready: false,
            connected: true,
            disconnectedAt: null,
            wins: 0,
            ping: 0,
            rematch: false
        });
        this.emptySince = null;

        if (this.players.size === 2 && this.phaseValue === 'lobby') {
            this.phaseValue = 'select';
        }
        log('info', 'player joined', { room: this.code, player: playerId, slot, players: this.players.size });
        this.publish();
        return true;
    }

    /** A socket dropped. During a fight the seat is held open for a while
     *  rather than ending the match on the first hiccup. */
    markDisconnected(playerId: string, now = this.clock()): void {
        const player = this.players.get(playerId);
        if (!player) {
            return;
        }
        if (this.phaseValue === 'fight' || this.phaseValue === 'countdown') {
            player.connected = false;
            player.disconnectedAt = now;
            this.lastMask[player.slot] = 0;
            const other = this.opponentOf(player);
            if (other) {
                this.transport.toPlayer(other.id, 'opponent:disconnected', {
                    nickname: player.nickname,
                    graceMs: this.options.reconnectGraceMs
                });
            }
            log('warn', 'player dropped mid-match', { room: this.code, player: playerId });
            this.publish();
            return;
        }
        this.remove(playerId);
    }

    remove(playerId: string): void {
        const player = this.players.get(playerId);
        if (!player) {
            return;
        }
        this.players.delete(playerId);
        log('info', 'player left', { room: this.code, player: playerId, players: this.players.size });

        if (this.players.size === 0) {
            this.emptySince = this.clock();
            this.reset('lobby');
            return;
        }

        // The remaining player goes back to waiting rather than being left
        // staring at a frozen arena.
        this.reset('lobby');
        this.transport.toRoom('room:closed', { reason: 'Ton adversaire a quitté la partie.' });
        this.publish();
    }

    setPing(playerId: string, ping: number): void {
        const player = this.players.get(playerId);
        if (player) {
            player.ping = Math.max(0, Math.round(ping));
        }
    }

    // ------------------------------------------------------------- selection

    selectCharacter(playerId: string, characterId: string): boolean {
        const player = this.players.get(playerId);
        if (!player || this.phaseValue !== 'select' || !isCharacterId(characterId)) {
            return false;
        }
        player.characterId = characterId;
        player.ready = false;
        this.publish();
        return true;
    }

    setReady(playerId: string, ready: boolean): boolean {
        const player = this.players.get(playerId);
        if (!player || this.phaseValue !== 'select') {
            return false;
        }
        if (ready && !player.characterId) {
            player.characterId = DEFAULT_CHARACTER;
        }
        player.ready = ready;
        this.publish();

        if (this.players.size === 2 && [...this.players.values()].every((entry) => entry.ready && entry.connected)) {
            this.beginCountdown();
        }
        return true;
    }

    requestRematch(playerId: string): boolean {
        const player = this.players.get(playerId);
        if (!player || this.phaseValue !== 'result') {
            return false;
        }
        player.rematch = true;
        this.publish();

        if ([...this.players.values()].every((entry) => entry.rematch && entry.connected) && this.players.size === 2) {
            this.reset('select');
            this.publish();
        }
        return true;
    }

    // ----------------------------------------------------------------- inputs

    /**
     * Inputs arrive with a tail of previous frames, so one lost packet costs
     * nothing. A mask for a frame the server has already simulated cannot be
     * un-simulated: it is applied to the next open frame instead of dropped,
     * which turns a late packet into a frame of lag rather than a lost button.
     */
    applyInput(playerId: string, payload: InputPayload): void {
        const player = this.players.get(playerId);
        if (!player || this.phaseValue !== 'fight') {
            return;
        }
        const slot = player.slot;
        const queue = this.pending[slot];

        payload.masks.forEach((mask, offset) => {
            const frame = payload.frame - offset;
            if (frame < this.frame) {
                if (offset === 0) {
                    this.lateInputs += 1;
                    queue.set(this.frame, sanitizeInput(mask));
                }
                return;
            }
            if (frame > this.frame + TICK_RATE) {
                return; // A client a full second ahead is not one to trust.
            }
            queue.set(frame, sanitizeInput(mask));
        });
    }

    // ------------------------------------------------------------------ match

    private beginCountdown(): void {
        const [first, second] = this.orderedPlayers();
        if (!first || !second) {
            return;
        }

        this.phaseValue = 'countdown';
        this.startAt = this.clock() + COUNTDOWN_MS;
        this.seed = (this.seed * 1664525 + 1013904223) >>> 0;
        this.stageIdValue = pickStage(this.seed);

        const characters: [string, string] = [
            first.characterId ?? DEFAULT_CHARACTER,
            second.characterId ?? DEFAULT_CHARACTER
        ];
        this.match = createMatch({ characters, stageId: this.stageIdValue, seed: this.seed }, ROSTER);
        this.frame = 0;
        this.accumulatorMs = 0;
        this.lastTickMs = 0;
        this.pending = [new Map(), new Map()];
        this.lastMask = [0, 0];
        this.confirmed = [];
        this.lateInputs = 0;
        this.roundResults = [];

        this.characters = characters;
        for (const player of this.players.values()) {
            this.transport.toPlayer(player.id, 'match:begin', this.beginMessage(player.slot));
        }
        log('info', 'match starting', { room: this.code, characters: characters.join(' vs '), stage: this.stageIdValue });
        this.publish();
    }

    /** Called by the server loop. `now` is injected so tests drive the clock. */
    tick(now: number = this.clock()): void {
        if (this.phaseValue === 'countdown') {
            if (now >= this.startAt) {
                this.phaseValue = 'fight';
                this.lastTickMs = now;
                this.publish();
            }
            return;
        }

        if (this.phaseValue === 'result' && now - this.resultSince > RESULT_TIMEOUT_MS) {
            this.reset('select');
            this.publish();
            return;
        }

        if (this.phaseValue !== 'fight' || !this.match) {
            return;
        }

        this.enforceReconnectGrace(now);

        const stepMs = 1000 / TICK_RATE;
        this.accumulatorMs += Math.min(now - this.lastTickMs, 250);
        this.lastTickMs = now;

        // A fixed step, always: the simulation never sees a variable delta, so
        // a server that stalls for 80 ms catches up by running five frames
        // rather than by running one longer frame.
        let steps = 0;
        while (this.accumulatorMs >= stepMs && steps < 8) {
            this.accumulatorMs -= stepMs;
            steps += 1;
            this.advanceFrame();
            if (this.phaseValue !== 'fight') {
                return;
            }
        }
        if (steps === 8) {
            this.accumulatorMs = 0; // Give up on catching up rather than spiral.
        }
    }

    private advanceFrame(): void {
        if (!this.match) {
            return;
        }

        const masks: [number, number] = [
            this.pending[0].get(this.frame) ?? this.lastMask[0],
            this.pending[1].get(this.frame) ?? this.lastMask[1]
        ];
        for (const slot of [0, 1] as const) {
            const player = this.playerInSlot(slot);
            if (player && !player.connected) {
                masks[slot] = 0;
            }
            this.lastMask[slot] = masks[slot];
            this.pending[slot].delete(this.frame);
        }

        this.confirmed.push([this.frame, masks[0], masks[1]]);
        if (this.confirmed.length > NETWORK_DEFAULTS.inputHistory) {
            this.confirmed.splice(0, this.confirmed.length - NETWORK_DEFAULTS.inputHistory);
        }

        const result = stepMatch(this.match, masks, ROSTER);
        this.match = result.state;
        this.frame += 1;

        for (const event of result.events) {
            if (event.type === 'roundEnd') {
                this.roundResults.push({ round: this.match.round, winner: event.winner });
            }
        }

        if (this.frame % this.options.snapshotInterval === 0) {
            this.broadcastSnapshot();
        }

        if (this.match.phase === 'matchEnd') {
            this.finishMatch();
        }
    }

    private broadcastSnapshot(): void {
        if (!this.match) {
            return;
        }
        const payload: SnapshotMessage = {
            frame: this.frame,
            state: encodeMatchState(this.match, ROSTER),
            inputs: this.confirmed.slice(),
            time: this.clock()
        };
        this.transport.toRoom('match:snapshot', payload);
    }

    private finishMatch(): void {
        if (!this.match) {
            return;
        }
        const winner = this.match.matchWinner;
        if (winner !== null) {
            const player = this.playerInSlot(winner);
            if (player) {
                player.wins += 1;
            }
        }

        const message: MatchOverMessage = {
            winner,
            rounds: this.roundResults.slice(),
            health: [this.match.fighters[0].health, this.match.fighters[1].health]
        };
        this.transport.toRoom('match:over', message);
        this.broadcastSnapshot();

        this.phaseValue = 'result';
        this.resultSince = this.clock();
        for (const player of this.players.values()) {
            player.ready = false;
            player.rematch = false;
        }
        log('info', 'match over', {
            room: this.code,
            winner: winner === null ? 'draw' : String(winner),
            frames: this.frame,
            lateInputs: this.lateInputs
        });
        this.publish();
    }

    /** A player who never comes back forfeits, rather than freezing the room. */
    private enforceReconnectGrace(now: number): void {
        for (const player of this.players.values()) {
            if (player.connected || player.disconnectedAt === null) {
                continue;
            }
            if (now - player.disconnectedAt < this.options.reconnectGraceMs) {
                continue;
            }
            const other = this.opponentOf(player);
            log('info', 'forfeit on timeout', { room: this.code, player: player.id });
            if (other && this.match) {
                this.match.matchWinner = other.slot;
                this.match.phase = 'matchEnd';
                this.finishMatch();
            }
            this.players.delete(player.id);
            if (this.players.size === 0) {
                this.emptySince = now;
            }
            this.publish();
        }
    }

    private beginMessage(slot: 0 | 1): MatchBeginMessage {
        return {
            slot,
            characters: this.characters ?? [DEFAULT_CHARACTER, DEFAULT_CHARACTER],
            stageId: this.stageIdValue,
            seed: this.seed,
            inputDelay: this.options.inputDelay,
            startFrame: this.frame,
            round: this.match?.round ?? 1
        };
    }

    /**
     * Moves a held seat onto a new socket.
     *
     * A browser that drops gets a new socket id, so the seat cannot be found
     * by identity alone — the registry matches it by token and calls this. The
     * player keeps their slot, their character and their rounds; only the id
     * changes. If a match is running they are handed the same parameters it
     * started with, and the next snapshot pulls their simulation back in line.
     */
    rebind(oldPlayerId: string, newPlayerId: string): boolean {
        const player = this.players.get(oldPlayerId);
        if (!player || (oldPlayerId !== newPlayerId && this.players.has(newPlayerId))) {
            return false;
        }

        this.players.delete(oldPlayerId);
        player.id = newPlayerId;
        player.connected = true;
        player.disconnectedAt = null;
        this.players.set(newPlayerId, player);

        const other = this.opponentOf(player);
        if (other) {
            this.transport.toPlayer(other.id, 'opponent:reconnected', { nickname: player.nickname });
        }
        if (this.match && (this.phaseValue === 'fight' || this.phaseValue === 'countdown')) {
            this.transport.toPlayer(newPlayerId, 'match:begin', this.beginMessage(player.slot));
        }
        log('info', 'player reconnected', { room: this.code, player: newPlayerId });
        this.publish();
        return true;
    }

    // ------------------------------------------------------------------ views

    private reset(phase: RoomPhase): void {
        this.phaseValue = phase;
        this.match = null;
        this.characters = null;
        this.frame = 0;
        this.pending = [new Map(), new Map()];
        this.lastMask = [0, 0];
        this.confirmed = [];
        this.roundResults = [];
        for (const player of this.players.values()) {
            player.ready = false;
            player.rematch = false;
        }
    }

    private opponentOf(player: Player): Player | undefined {
        return [...this.players.values()].find((entry) => entry.id !== player.id);
    }

    private playerInSlot(slot: 0 | 1): Player | undefined {
        return [...this.players.values()].find((entry) => entry.slot === slot);
    }

    private orderedPlayers(): [Player | undefined, Player | undefined] {
        return [this.playerInSlot(0), this.playerInSlot(1)];
    }

    view(now = this.clock()): RoomView {
        const players: PlayerView[] = [...this.players.values()]
            .sort((a, b) => a.slot - b.slot)
            .map((player) => ({
                id: player.id,
                nickname: player.nickname,
                slot: player.slot,
                characterId: player.characterId,
                ready: player.ready,
                connected: player.connected,
                wins: player.wins,
                ping: player.ping
            }));

        return {
            code: this.code,
            phase: this.phaseValue,
            players,
            stageId: this.stageIdValue,
            rematchVotes: [...this.players.values()].filter((player) => player.rematch).map((player) => player.id),
            startsIn: this.phaseValue === 'countdown' ? Math.max(0, this.startAt - now) : null
        };
    }

    publish(): void {
        this.transport.toRoom('room:state', this.view());
    }

    /** Test and diagnostics hook: the authoritative state, read-only. */
    get state(): MatchState | null {
        return this.match;
    }

    get currentFrame(): number {
        return this.frame;
    }

    get diagnostics(): { lateInputs: number; frame: number; meterMax: number; roster: readonly string[] } {
        return { lateInputs: this.lateInputs, frame: this.frame, meterMax: METER_MAX, roster: CHARACTER_IDS };
    }
}
