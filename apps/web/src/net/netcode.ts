'use client';

import {
    FRAME_MS,
    ROSTER,
    checksumMatchState,
    createMatch,
    decodeMatchState,
    stepMatch,
    type CombatEvent,
    type MatchState
} from '@opfg/combat-core';
import { INPUT_REDUNDANCY, type InputPayload, type SnapshotMessage } from '@opfg/shared';

/**
 * Client-side prediction with rollback reconciliation.
 *
 * The client runs the same simulation as the server, a few frames ahead of it,
 * guessing the opponent's buttons by repeating their last known ones. When a
 * snapshot arrives it carries the server's state at frame F plus the inputs
 * the server actually used up to F. The client restores that state and
 * re-simulates every frame from F up to where it had got to, this time with
 * the confirmed inputs. Frames where the guess was right cost nothing; frames
 * where it was wrong are corrected before the player sees them.
 *
 * This is only possible because `combat-core` is deterministic and integer:
 * re-simulating the same frames with the same inputs has to give the same
 * result down to the checksum, or the correction would itself be a desync.
 *
 * What this is *not*: rollback netcode as a fighting-game player means it,
 * where each client is authoritative over its own inputs and the two peers
 * reconcile directly. Here the server owns the fight and the client's
 * re-simulation is a correction, not a negotiation. It buys the same
 * responsiveness on a good connection; it does not buy the same behaviour at
 * 150 ms of ping, and it is not presented as if it did.
 */

/** Frames of history kept for re-simulation. At 60 Hz this is a second. */
const HISTORY_FRAMES = 64;

export interface NetcodeOptions {
    characters: [string, string];
    stageId: string;
    seed: number;
    slot: 0 | 1;
    inputDelay: number;
    readInput: () => number;
    send: (payload: InputPayload) => void;
}

export interface NetcodeDiagnostics {
    localFrame: number;
    serverFrame: number;
    rollbacks: number;
    resimulatedFrames: number;
    mispredictions: number;
    drift: number;
}

export class NetcodeClient {
    private readonly options: NetcodeOptions;
    private current: MatchState;
    private history = new Map<number, MatchState>();
    private localInputs = new Map<number, number>();
    private confirmed = new Map<number, [number, number]>();

    private serverState: MatchState | null = null;
    private serverStateFrame = -1;
    private needsReconcile = false;

    private lastRemoteMask = 0;
    private accumulator = 0;

    localFrame = 0;
    serverFrame = 0;
    events: CombatEvent[] = [];

    private rollbacks = 0;
    private resimulatedFrames = 0;
    private mispredictions = 0;

    constructor(options: NetcodeOptions) {
        this.options = options;
        this.current = createMatch(
            { characters: options.characters, stageId: options.stageId, seed: options.seed },
            ROSTER
        );
        this.history.set(0, this.current);
    }

    get state(): MatchState {
        return this.current;
    }

    get diagnostics(): NetcodeDiagnostics {
        return {
            localFrame: this.localFrame,
            serverFrame: this.serverFrame,
            rollbacks: this.rollbacks,
            resimulatedFrames: this.resimulatedFrames,
            mispredictions: this.mispredictions,
            drift: this.localFrame - (this.serverFrame + this.options.inputDelay)
        };
    }

    onSnapshot(snapshot: SnapshotMessage): void {
        for (const [frame, maskA, maskB] of snapshot.inputs) {
            this.confirmed.set(frame, [maskA, maskB]);
            const remote = this.options.slot === 0 ? maskB : maskA;
            if (frame >= this.serverStateFrame) {
                this.lastRemoteMask = remote;
            }
        }
        this.serverState = decodeMatchState(
            snapshot.state,
            this.options.characters,
            this.options.stageId,
            ROSTER
        );
        this.serverStateFrame = snapshot.frame;
        this.serverFrame = snapshot.frame;
        this.needsReconcile = true;
    }

    /** Drives the simulation from the render loop. */
    update(deltaMs: number): void {
        if (this.needsReconcile) {
            this.reconcile();
            this.needsReconcile = false;
        }

        this.accumulator += Math.min(deltaMs, 250);
        let steps = 0;
        while (this.accumulator >= FRAME_MS && steps < 8) {
            this.accumulator -= FRAME_MS;
            steps += 1;
            this.advance();
        }

        // Hold station a fixed number of frames ahead of the server. Rather
        // than jumping, the clock is nudged by at most one frame per update,
        // which the player reads as the game running very slightly fast or
        // slow instead of as a stutter.
        const target = this.serverFrame + this.options.inputDelay;
        const drift = target - this.localFrame;
        if (drift >= 2 && steps < 8) {
            this.advance();
        } else if (drift <= -2) {
            this.accumulator = Math.max(0, this.accumulator - FRAME_MS);
        }
    }

    private advance(): void {
        const mask = this.options.readInput();
        this.localInputs.set(this.localFrame, mask);
        this.sendInputs();

        const masks = this.masksFor(this.localFrame, mask, this.lastRemoteMask);
        const result = stepMatch(this.current, masks, ROSTER);
        this.current = result.state;
        this.events.push(...result.events);
        this.localFrame += 1;
        this.history.set(this.localFrame, this.current);
        this.prune();
    }

    private masksFor(frame: number, localMask: number, remoteMask: number): [number, number] {
        const confirmed = this.confirmed.get(frame);
        if (confirmed) {
            return [confirmed[0], confirmed[1]];
        }
        return this.options.slot === 0 ? [localMask, remoteMask] : [remoteMask, localMask];
    }

    /**
     * Replays from the last authoritative state. Events produced here are
     * thrown away: their sparks and sounds already played on the mispredicted
     * frames, and playing them twice is worse than not correcting at all.
     */
    private reconcile(): void {
        if (!this.serverState) {
            return;
        }
        const from = this.serverStateFrame;

        if (from >= this.localFrame) {
            this.current = this.serverState;
            this.localFrame = from;
            this.history.clear();
            this.history.set(from, this.current);
            return;
        }

        const predicted = this.history.get(from);
        if (predicted && checksumMatchState(predicted, ROSTER) === checksumMatchState(this.serverState, ROSTER)) {
            return; // The prediction held; nothing to redo.
        }
        this.mispredictions += 1;
        this.rollbacks += 1;

        let state = this.serverState;
        let remote = this.lastRemoteMask;
        for (let frame = from; frame < this.localFrame; frame += 1) {
            const confirmed = this.confirmed.get(frame);
            if (confirmed) {
                remote = this.options.slot === 0 ? confirmed[1] : confirmed[0];
            }
            const local = this.localInputs.get(frame) ?? 0;
            state = stepMatch(state, this.masksFor(frame, local, remote), ROSTER).state;
            this.history.set(frame + 1, state);
            this.resimulatedFrames += 1;
        }
        this.current = state;
    }

    private sendInputs(): void {
        const masks: number[] = [];
        for (let offset = 0; offset < INPUT_REDUNDANCY; offset += 1) {
            const frame = this.localFrame - offset;
            if (frame < 0) {
                break;
            }
            masks.push(this.localInputs.get(frame) ?? 0);
        }
        this.options.send({ frame: this.localFrame, masks });
    }

    private prune(): void {
        const cutoff = this.localFrame - HISTORY_FRAMES;
        if (cutoff <= 0) {
            return;
        }
        for (const frame of this.history.keys()) {
            if (frame < cutoff) {
                this.history.delete(frame);
            }
        }
        for (const frame of this.localInputs.keys()) {
            if (frame < cutoff) {
                this.localInputs.delete(frame);
            }
        }
        for (const frame of this.confirmed.keys()) {
            if (frame < cutoff) {
                this.confirmed.delete(frame);
            }
        }
    }

    /** Hands the accumulated events to the renderer and clears the queue. */
    drainEvents(): CombatEvent[] {
        const events = this.events;
        this.events = [];
        return events;
    }
}

/**
 * Offline driver for the training room and the arcade ladder. Same simulation,
 * both seats read from this machine, no socket involved — which also makes it
 * the quickest way to check that a change to the engine feels right before
 * taking it online.
 *
 * The reader is handed the state it is about to be stepped from, because a
 * computer opponent needs to see the fight to answer it, and a keyboard reader
 * is free to ignore the argument.
 */
export class LocalDriver {
    private current: MatchState;
    private accumulator = 0;
    events: CombatEvent[] = [];
    frame = 0;

    constructor(
        private readonly characters: [string, string],
        stageId: string,
        seed: number,
        private readonly readInputs: (state: MatchState) => [number, number]
    ) {
        this.current = createMatch({ characters, stageId, seed }, ROSTER);
    }

    get state(): MatchState {
        return this.current;
    }

    get roster(): [string, string] {
        return this.characters;
    }

    update(deltaMs: number): void {
        this.accumulator += Math.min(deltaMs, 250);
        let steps = 0;
        while (this.accumulator >= FRAME_MS && steps < 8) {
            this.accumulator -= FRAME_MS;
            steps += 1;
            const result = stepMatch(this.current, this.readInputs(this.current), ROSTER);
            this.current = result.state;
            this.events.push(...result.events);
            this.frame += 1;
        }
    }

    drainEvents(): CombatEvent[] {
        const events = this.events;
        this.events = [];
        return events;
    }
}
