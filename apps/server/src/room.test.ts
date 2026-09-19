import { beforeEach, describe, expect, it } from 'vitest';
import {
    Button,
    ROSTER,
    TICK_RATE,
    checksumMatchState,
    decodeMatchState,
    encodeMatchState,
    stepMatch
} from '@opfg/combat-core';
import type { MatchBeginMessage, MatchOverMessage, RoomView, SnapshotMessage } from '@opfg/shared';
import { Room, type Outbound, type RoomTransport } from './room.js';
import { RoomRegistry } from './rooms.js';

/** Records everything the room sends, so a test can assert on the wire rather
 *  than on the room's private fields. */
class RecordingTransport implements RoomTransport {
    readonly toRoomMessages: Array<{ event: keyof Outbound; payload: unknown }> = [];
    readonly toPlayerMessages: Array<{ playerId: string; event: keyof Outbound; payload: unknown }> = [];

    toPlayer<E extends keyof Outbound>(playerId: string, event: E, payload: Outbound[E]): void {
        this.toPlayerMessages.push({ playerId, event, payload });
    }

    toRoom<E extends keyof Outbound>(event: E, payload: Outbound[E]): void {
        this.toRoomMessages.push({ event, payload });
    }

    last<T>(event: keyof Outbound): T | undefined {
        for (let index = this.toRoomMessages.length - 1; index >= 0; index -= 1) {
            const message = this.toRoomMessages[index];
            if (message?.event === event) {
                return message.payload as T;
            }
        }
        return undefined;
    }

    all<T>(event: keyof Outbound): T[] {
        return this.toRoomMessages.filter((message) => message.event === event).map((message) => message.payload as T);
    }

    beginFor(playerId: string): MatchBeginMessage | undefined {
        return this.toPlayerMessages.find(
            (message) => message.playerId === playerId && message.event === 'match:begin'
        )?.payload as MatchBeginMessage | undefined;
    }

    clear(): void {
        this.toRoomMessages.length = 0;
        this.toPlayerMessages.length = 0;
    }
}

const OPTIONS = { inputDelay: 3, snapshotInterval: 3, reconnectGraceMs: 2000 };
const FRAME_MS = 1000 / TICK_RATE;

/** A clock the test owns, so a three-second grace period costs no real time. */
class TestClock {
    constructor(public value = 1_000_000) {}
    now = (): number => this.value;
    advance(ms: number): number {
        this.value += ms;
        return this.value;
    }
}

/** Drives the room forward by `frames` simulated frames. */
const runFrames = (room: Room, clock: TestClock, frames: number): number => {
    for (let index = 0; index < frames; index += 1) {
        room.tick(clock.advance(FRAME_MS));
    }
    return clock.value;
};

describe('room lifecycle', () => {
    let transport: RecordingTransport;
    let room: Room;

    beforeEach(() => {
        transport = new RecordingTransport();
        room = new Room('ABCDE', transport, OPTIONS, 4242, new TestClock().now);
    });

    it('waits in the lobby with a single player', () => {
        room.add('p1', 'Dylan');
        expect(room.phase).toBe('lobby');
        expect(room.isJoinable).toBe(true);
    });

    it('moves to character select once both seats are taken', () => {
        room.add('p1', 'Dylan');
        room.add('p2', 'Zoro');
        expect(room.phase).toBe('select');
        expect(room.isJoinable).toBe(false);

        const view = transport.last<RoomView>('room:state');
        expect(view?.players).toHaveLength(2);
        expect(view?.players.map((player) => player.slot).sort()).toEqual([0, 1]);
    });

    it('refuses a third player', () => {
        room.add('p1', 'Dylan');
        room.add('p2', 'Zoro');
        expect(room.add('p3', 'Nami')).toBe(false);
        expect(room.playerCount).toBe(2);
    });

    it('rejects a character that is not in the roster', () => {
        room.add('p1', 'Dylan');
        room.add('p2', 'Zoro');
        expect(room.selectCharacter('p1', 'zoro-the-unpublished')).toBe(false);
        expect(room.selectCharacter('p1', 'luffy')).toBe(true);
    });

    it('starts the countdown when both players are ready, and not before', () => {
        room.add('p1', 'Dylan');
        room.add('p2', 'Zoro');
        room.selectCharacter('p1', 'luffy');
        room.selectCharacter('p2', 'lucci');

        room.setReady('p1', true);
        expect(room.phase).toBe('select');

        room.setReady('p2', true);
        expect(room.phase).toBe('countdown');

        const begin = transport.beginFor('p1');
        expect(begin?.slot).toBe(0);
        expect(begin?.characters).toEqual(['luffy', 'lucci']);
        expect(transport.beginFor('p2')?.slot).toBe(1);
    });

    it('drops readiness when a player changes character', () => {
        room.add('p1', 'Dylan');
        room.add('p2', 'Zoro');
        room.setReady('p1', true);
        room.selectCharacter('p1', 'enel');
        expect(transport.last<RoomView>('room:state')?.players[0]?.ready).toBe(false);
    });
});

describe('an authoritative match', () => {
    let transport: RecordingTransport;
    let room: Room;
    let clock: TestClock;

    const start = (first = 'luffy', second = 'lucci'): void => {
        room.add('p1', 'Dylan');
        room.add('p2', 'Zoro');
        room.selectCharacter('p1', first);
        room.selectCharacter('p2', second);
        room.setReady('p1', true);
        room.setReady('p2', true);
        room.tick(clock.advance(2000));
        transport.clear();
    };

    beforeEach(() => {
        transport = new RecordingTransport();
        clock = new TestClock();
        room = new Room('ABCDE', transport, OPTIONS, 4242, clock.now);
    });

    it('enters the fight after the countdown and advances at the tick rate', () => {
        start();
        expect(room.phase).toBe('fight');
        runFrames(room, clock, 60);
        // Timers are not exact, so allow a frame of slack either way.
        expect(room.currentFrame).toBeGreaterThan(55);
        expect(room.currentFrame).toBeLessThanOrEqual(61);
    });

    it('sends snapshots at the configured interval', () => {
        start();
        runFrames(room, clock, 30);
        const snapshots = transport.all<SnapshotMessage>('match:snapshot');
        expect(snapshots.length).toBeGreaterThanOrEqual(8);
        expect(snapshots.length).toBeLessThanOrEqual(12);
        for (const snapshot of snapshots) {
            expect(snapshot.frame % OPTIONS.snapshotInterval).toBe(0);
        }
    });

    it('sends a snapshot a client can decode without losing a field', () => {
        start();
        runFrames(room, clock, 30);
        const snapshot = transport.all<SnapshotMessage>('match:snapshot').at(-1);
        expect(snapshot).toBeDefined();

        // Re-encoding what the client decoded has to give back the same wire
        // bytes: anything the codec drops would silently survive a rollback.
        const decoded = decodeMatchState(snapshot!.state, ['luffy', 'lucci'], room.state!.stageId, ROSTER);
        expect(encodeMatchState(decoded, ROSTER)).toEqual(snapshot!.state);
        expect(decoded.frame).toBe(snapshot!.frame);
    });

    it('carries the confirmed inputs a client needs to re-simulate', () => {
        start();
        room.applyInput('p1', { frame: room.currentFrame + 3, masks: [Button.Right] });
        runFrames(room, clock, 12);

        const snapshot = transport.all<SnapshotMessage>('match:snapshot').at(-1);
        expect(snapshot?.inputs.length).toBeGreaterThan(0);
        const applied = snapshot!.inputs.some(([, maskA]) => (maskA & Button.Right) !== 0);
        expect(applied).toBe(true);
    });

    it('applies the inputs a client sends and moves the fighter', () => {
        start();
        const before = room.state!.fighters[0].x;
        for (let index = 0; index < 200; index += 1) {
            room.applyInput('p1', { frame: room.currentFrame + 3, masks: [Button.Right] });
            runFrames(room, clock, 1);
        }
        expect(room.state!.fighters[0].x).toBeGreaterThan(before);
    });

    it('ignores an input from someone who is not in the room', () => {
        start();
        const before = room.state!.fighters[0].x;
        room.applyInput('ghost', { frame: room.currentFrame + 3, masks: [Button.Right] });
        runFrames(room, clock, 30);
        expect(room.state!.fighters[0].x).toBe(before);
    });

    it('never lets a client set its own health, because it cannot say so', () => {
        start();
        // The only shape a client can send is a mask; there is no field for
        // health, position or damage anywhere in the protocol. The closest a
        // malicious client can get is an out-of-range mask, which is clamped.
        room.applyInput('p1', { frame: room.currentFrame + 3, masks: [0xffff] });
        runFrames(room, clock, 10);
        expect(room.state!.fighters[0].health).toBe(ROSTER.luffy!.stats.maxHealth);
        expect(room.state!.fighters[1].health).toBe(ROSTER.lucci!.stats.maxHealth);
    });

    it('ignores an input aimed at a frame far in the future', () => {
        start();
        const before = room.state!.fighters[0].x;
        room.applyInput('p1', { frame: room.currentFrame + 600, masks: [Button.Right] });
        runFrames(room, clock, 60);
        expect(room.state!.fighters[0].x).toBe(before);
    });

    it('applies a late input on the next open frame instead of dropping it', () => {
        start();
        runFrames(room, clock, 120);
        const before = room.state!.fighters[0].x;
        for (let index = 0; index < 60; index += 1) {
            room.applyInput('p1', { frame: 1, masks: [Button.Right] });
            runFrames(room, clock, 1);
        }
        expect(room.state!.fighters[0].x).toBeGreaterThan(before);
        expect(room.diagnostics.lateInputs).toBeGreaterThan(0);
    });

    it('ends the match and reports the winner', () => {
        start();
        runFrames(room, clock, 200);
        // Hand slot 0 the first round, then knock the second one out, rather
        // than playing six real minutes of fight.
        room.state!.fighters[0].wins = 1;
        room.state!.fighters[1].health = 0;
        runFrames(room, clock, 400);

        expect(room.phase).toBe('result');
        const over = transport.last<MatchOverMessage>('match:over');
        expect(over?.winner).toBe(0);
        expect(over?.rounds.length).toBeGreaterThan(0);
    });

    it('runs a rematch back through character select', () => {
        start();
        runFrames(room, clock, 200);
        room.state!.fighters[0].wins = 1;
        room.state!.fighters[1].health = 0;
        runFrames(room, clock, 400);
        expect(room.phase).toBe('result');

        expect(room.requestRematch('p1')).toBe(true);
        expect(room.phase).toBe('result');
        expect(room.requestRematch('p2')).toBe(true);
        expect(room.phase).toBe('select');
    });
});

describe('disconnections', () => {
    let transport: RecordingTransport;
    let room: Room;
    let clock: TestClock;

    const start = (): void => {
        room.add('p1', 'Dylan');
        room.add('p2', 'Zoro');
        room.selectCharacter('p1', 'luffy');
        room.selectCharacter('p2', 'enel');
        room.setReady('p1', true);
        room.setReady('p2', true);
        room.tick(clock.advance(2000));
        transport.clear();
    };

    beforeEach(() => {
        transport = new RecordingTransport();
        clock = new TestClock();
        room = new Room('ABCDE', transport, OPTIONS, 7, clock.now);
    });

    it('holds the seat and warns the opponent', () => {
        start();
        room.markDisconnected('p1', clock.value);
        expect(room.playerCount).toBe(2);
        expect(
            transport.toPlayerMessages.some(
                (message) => message.playerId === 'p2' && message.event === 'opponent:disconnected'
            )
        ).toBe(true);
    });

    it('lets a player come back inside the grace period', () => {
        start();
        room.markDisconnected('p1', clock.value);
        runFrames(room, clock, 30);
        expect(room.reconnect('p1', 'socket-2')).toBe(true);
        expect(transport.last<RoomView>('room:state')?.players[0]?.connected).toBe(true);
        expect(room.phase).toBe('fight');
    });

    it('awards the match once the grace period runs out', () => {
        start();
        room.markDisconnected('p1', clock.value);
        runFrames(room, clock, TICK_RATE * 3);
        const over = transport.last<MatchOverMessage>('match:over');
        expect(over?.winner).toBe(1);
        expect(room.playerCount).toBe(1);
    });

    it('sends the remaining player back to the lobby when the other quits outright', () => {
        room.add('p1', 'Dylan');
        room.add('p2', 'Zoro');
        room.remove('p2');
        expect(room.phase).toBe('lobby');
        expect(transport.last<{ reason: string }>('room:closed')?.reason).toContain('quitté');
    });
});

describe('matchmaking', () => {
    const makeRegistry = (): RoomRegistry => {
        let seed = 1;
        const random = (): number => {
            seed = (seed * 1103515245 + 12345) % 2147483648;
            return seed / 2147483648;
        };
        return new RoomRegistry(() => new RecordingTransport(), OPTIONS, 60_000, random);
    };

    it('creates a room with a readable code', () => {
        const registry = makeRegistry();
        const room = registry.create('p1', 'Dylan');
        expect(room.code).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{5}$/);
        expect(registry.roomOfPlayer('p1')).toBe(room);
    });

    it('joins by code and refuses a full or unknown room', () => {
        const registry = makeRegistry();
        const room = registry.create('p1', 'Dylan');
        expect(registry.join('p2', 'Zoro', room.code).room).toBe(room);
        expect(registry.join('p3', 'Nami', room.code).error).toBe('room-full');
        expect(registry.join('p4', 'Usopp', 'ZZZZZ').error).toBe('room-not-found');
    });

    it('pairs two quick-match players into the same room', () => {
        const registry = makeRegistry();
        const first = registry.quickMatch('p1', 'Dylan');
        const second = registry.quickMatch('p2', 'Zoro');
        expect(second.code).toBe(first.code);
        expect(first.phase).toBe('select');
        expect(registry.size).toBe(1);
    });

    it('opens a new room when every other one is busy', () => {
        const registry = makeRegistry();
        registry.quickMatch('p1', 'Dylan');
        registry.quickMatch('p2', 'Zoro');
        const third = registry.quickMatch('p3', 'Nami');
        expect(registry.size).toBe(2);
        expect(third.playerCount).toBe(1);
    });

    it('collects a room once it has been empty long enough', () => {
        const registry = makeRegistry();
        const room = registry.create('p1', 'Dylan');
        registry.leave('p1');
        expect(registry.get(room.code)).toBeDefined();
        registry.tick(Date.now() + 120_000);
        expect(registry.get(room.code)).toBeUndefined();
    });
});

describe('the server and a client agree', () => {
    it('reaches the same state from the same inputs', () => {
        const transport = new RecordingTransport();
        const clock = new TestClock(2_000_000);
        const room = new Room('ABCDE', transport, OPTIONS, 31337, clock.now);
        room.add('p1', 'Dylan');
        room.add('p2', 'Zoro');
        room.selectCharacter('p1', 'crocodile');
        room.selectCharacter('p2', 'enel');
        room.setReady('p1', true);
        room.setReady('p2', true);

        room.tick(clock.advance(2000));
        transport.clear();

        // Feed a scripted fight, then replay the server's own confirmed inputs
        // through a fresh simulation the way a client would after a rollback.
        let seed = 99;
        for (let index = 0; index < 240; index += 1) {
            seed = (Math.imul(seed, 1103515245) + 12345) >>> 0;
            room.applyInput('p1', { frame: room.currentFrame + 3, masks: [(seed >>> 5) & 0xff] });
            room.applyInput('p2', { frame: room.currentFrame + 3, masks: [(seed >>> 13) & 0xff] });
            runFrames(room, clock, 1);
        }

        const snapshots = transport.all<SnapshotMessage>('match:snapshot');
        const earlier = snapshots.at(-4);
        const latest = snapshots.at(-1);
        expect(earlier).toBeDefined();
        expect(latest).toBeDefined();

        let replayed = decodeMatchState(earlier!.state, ['crocodile', 'enel'], room.state!.stageId, ROSTER);
        const inputs = new Map(latest!.inputs.map(([frame, a, b]) => [frame, [a, b] as const]));
        for (let frame = earlier!.frame; frame < latest!.frame; frame += 1) {
            const masks = inputs.get(frame);
            expect(masks, `input for frame ${frame} missing from the snapshot tail`).toBeDefined();
            replayed = stepMatch(replayed, masks!, ROSTER).state;
        }

        const authoritative = decodeMatchState(latest!.state, ['crocodile', 'enel'], room.state!.stageId, ROSTER);
        expect(checksumMatchState(replayed, ROSTER)).toBe(checksumMatchState(authoritative, ROSTER));
    });
});
