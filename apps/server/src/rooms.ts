import { ROOM_CODE_ALPHABET, ROOM_CODE_LENGTH } from '@opfg/shared';
import { Room, type RoomOptions, type RoomTransport } from './room.js';
import { log } from './log.js';

/**
 * The set of live rooms, plus the matchmaking queue.
 *
 * Matchmaking here is deliberately the simplest thing that works for two
 * players: a quick match drops into the oldest room that still has a seat, and
 * opens one if there is none. There is no rating to respect yet, and inventing
 * a bracket for a game nobody has played would be guessing.
 */
export class RoomRegistry {
    private rooms = new Map<string, Room>();
    private byPlayer = new Map<string, string>();

    constructor(
        private readonly makeTransport: (code: string) => RoomTransport,
        private readonly options: RoomOptions,
        private readonly emptyRoomTtlMs: number,
        private readonly random: () => number = Math.random,
        private readonly clock: () => number = Date.now
    ) {}

    get size(): number {
        return this.rooms.size;
    }

    get(code: string): Room | undefined {
        return this.rooms.get(code);
    }

    roomOfPlayer(playerId: string): Room | undefined {
        const code = this.byPlayer.get(playerId);
        return code ? this.rooms.get(code) : undefined;
    }

    private generateCode(): string {
        for (let attempt = 0; attempt < 200; attempt += 1) {
            let code = '';
            for (let index = 0; index < ROOM_CODE_LENGTH; index += 1) {
                code += ROOM_CODE_ALPHABET[Math.floor(this.random() * ROOM_CODE_ALPHABET.length)] ?? 'A';
            }
            if (!this.rooms.has(code)) {
                return code;
            }
        }
        throw new Error('Impossible de generer un code de partie libre.');
    }

    create(playerId: string, nickname: string): Room {
        this.leave(playerId);
        const code = this.generateCode();
        const room = new Room(
            code,
            this.makeTransport(code),
            this.options,
            Math.floor(this.random() * 0xffffffff),
            this.clock
        );
        this.rooms.set(code, room);
        room.add(playerId, nickname);
        this.byPlayer.set(playerId, code);
        log('info', 'room created', { room: code, rooms: this.rooms.size });
        return room;
    }

    join(playerId: string, nickname: string, code: string): { room?: Room; error?: 'room-not-found' | 'room-full' } {
        const room = this.rooms.get(code);
        if (!room) {
            return { error: 'room-not-found' };
        }
        if (!room.isJoinable) {
            return { error: 'room-full' };
        }
        this.leave(playerId);
        room.add(playerId, nickname);
        this.byPlayer.set(playerId, code);
        return { room };
    }

    quickMatch(playerId: string, nickname: string): Room {
        for (const room of this.rooms.values()) {
            if (room.isJoinable && !room.has(playerId)) {
                this.leave(playerId);
                room.add(playerId, nickname);
                this.byPlayer.set(playerId, room.code);
                log('info', 'quick match joined', { room: room.code });
                return room;
            }
        }
        return this.create(playerId, nickname);
    }

    leave(playerId: string): void {
        const code = this.byPlayer.get(playerId);
        if (!code) {
            return;
        }
        this.byPlayer.delete(playerId);
        this.rooms.get(code)?.remove(playerId);
    }

    disconnect(playerId: string, now = this.clock()): void {
        const code = this.byPlayer.get(playerId);
        if (!code) {
            return;
        }
        const room = this.rooms.get(code);
        room?.markDisconnected(playerId, now);
        if (room && !room.has(playerId)) {
            this.byPlayer.delete(playerId);
        }
    }

    tick(now = this.clock()): void {
        for (const [code, room] of this.rooms) {
            room.tick(now);
            if (room.playerCount === 0 && room.emptySince !== null && now - room.emptySince > this.emptyRoomTtlMs) {
                this.rooms.delete(code);
                log('info', 'room collected', { room: code, rooms: this.rooms.size });
            }
        }
    }
}
