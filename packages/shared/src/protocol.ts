import { z } from 'zod';

/**
 * The wire protocol.
 *
 * Everything a client may send is validated against a schema here before it
 * reaches any game code. The rule the protocol enforces is narrow on purpose:
 * a client sends who it wants to be and which buttons it is holding, and
 * nothing else. It never sends a position, a health value, a damage number or
 * a match result, so there is nothing for a modified client to lie about.
 */

export const PROTOCOL_VERSION = 1;

/** Room codes are typed by humans, so the alphabet excludes 0/O and 1/I. */
export const ROOM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const ROOM_CODE_LENGTH = 5;

export const roomCodeSchema = z
    .string()
    .trim()
    .toUpperCase()
    .length(ROOM_CODE_LENGTH)
    .regex(new RegExp(`^[${ROOM_CODE_ALPHABET}]+$`), 'Code de partie invalide');

export const nicknameSchema = z
    .string()
    .trim()
    .min(1)
    .max(16)
    // Control characters and anything that could be mistaken for markup are
    // stripped at the door rather than escaped in a dozen render paths.
    .regex(/^[\p{L}\p{N} _.\-]+$/u, 'Pseudo invalide');

export type RoomPhase = 'lobby' | 'select' | 'countdown' | 'fight' | 'result';

export interface PlayerView {
    id: string;
    nickname: string;
    slot: 0 | 1;
    characterId: string | null;
    ready: boolean;
    connected: boolean;
    wins: number;
    /** Round-trip time in milliseconds, as measured by the server. */
    ping: number;
}

export interface RoomView {
    code: string;
    phase: RoomPhase;
    players: PlayerView[];
    stageId: string;
    /** Set while the room waits for both players to accept a rematch. */
    rematchVotes: string[];
    /** Countdown to the start of the match, in milliseconds. */
    startsIn: number | null;
}

export interface MatchBeginMessage {
    /** Slot the receiving client controls. */
    slot: 0 | 1;
    characters: [string, string];
    stageId: string;
    seed: number;
    /** Frames of input delay the client should run ahead of the server. */
    inputDelay: number;
    /** Server frame at which the match starts. */
    startFrame: number;
    round: number;
}

export interface SnapshotMessage {
    /** Server frame this snapshot describes. */
    frame: number;
    /** `encodeMatchState` output. */
    state: number[];
    /** Confirmed inputs, newest last, as [frame, maskA, maskB]. */
    inputs: Array<[number, number, number]>;
    /** Server time in milliseconds, for clock estimation. */
    time: number;
}

export interface MatchOverMessage {
    winner: 0 | 1 | null;
    rounds: Array<{ round: number; winner: 0 | 1 | null }>;
    /** Final health per slot, for the result screen. */
    health: [number, number];
}

export const createRoomSchema = z.object({ nickname: nicknameSchema });
export const joinRoomSchema = z.object({ nickname: nicknameSchema, code: roomCodeSchema });
export const quickMatchSchema = z.object({ nickname: nicknameSchema });
export const selectCharacterSchema = z.object({ characterId: z.string().min(1).max(32) });
export const readySchema = z.object({ ready: z.boolean() });

/**
 * Inputs are sent with a short tail of previous frames. A dropped packet then
 * costs nothing: the next one carries the frames the lost one held.
 */
export const INPUT_REDUNDANCY = 6;
export const inputSchema = z.object({
    /** Frame of the newest mask in `masks`. */
    frame: z.number().int().min(0).max(2_000_000),
    /** Newest first, one mask per frame going backwards. */
    masks: z.array(z.number().int().min(0).max(0xffff)).min(1).max(INPUT_REDUNDANCY)
});

export const pingSchema = z.object({ sentAt: z.number().int().min(0) });

export type CreateRoomPayload = z.infer<typeof createRoomSchema>;
export type JoinRoomPayload = z.infer<typeof joinRoomSchema>;
export type QuickMatchPayload = z.infer<typeof quickMatchSchema>;
export type SelectCharacterPayload = z.infer<typeof selectCharacterSchema>;
export type ReadyPayload = z.infer<typeof readySchema>;
export type InputPayload = z.infer<typeof inputSchema>;
export type PingPayload = z.infer<typeof pingSchema>;

export type Ack<T> = { ok: true; data: T } | { ok: false; error: string; code: ErrorCode };

export type ErrorCode =
    | 'invalid-payload'
    | 'room-not-found'
    | 'room-full'
    | 'already-in-room'
    | 'not-in-room'
    | 'wrong-phase'
    | 'unknown-character'
    | 'rate-limited'
    | 'server-error';

export interface ClientToServerEvents {
    'room:create': (payload: CreateRoomPayload, ack: (result: Ack<{ room: RoomView }>) => void) => void;
    'room:join': (payload: JoinRoomPayload, ack: (result: Ack<{ room: RoomView }>) => void) => void;
    'room:quick': (payload: QuickMatchPayload, ack: (result: Ack<{ room: RoomView }>) => void) => void;
    'room:leave': (ack: (result: Ack<Record<string, never>>) => void) => void;
    'select:character': (payload: SelectCharacterPayload, ack: (result: Ack<Record<string, never>>) => void) => void;
    'select:ready': (payload: ReadyPayload, ack: (result: Ack<Record<string, never>>) => void) => void;
    'match:input': (payload: InputPayload) => void;
    'match:rematch': (ack: (result: Ack<Record<string, never>>) => void) => void;
    ping: (payload: PingPayload, ack: (result: { sentAt: number; serverTime: number }) => void) => void;
}

export interface ServerToClientEvents {
    'room:state': (room: RoomView) => void;
    'room:closed': (payload: { reason: string }) => void;
    'match:begin': (payload: MatchBeginMessage) => void;
    'match:snapshot': (payload: SnapshotMessage) => void;
    'match:over': (payload: MatchOverMessage) => void;
    'opponent:disconnected': (payload: { nickname: string; graceMs: number }) => void;
    'opponent:reconnected': (payload: { nickname: string }) => void;
}

/** Default tuning, overridable by environment on the server. */
export const NETWORK_DEFAULTS = {
    /** Frames the client runs ahead of the server. */
    inputDelay: 3,
    /** Frames between two snapshots. Three frames is 20 snapshots a second. */
    snapshotInterval: 3,
    /** Confirmed input frames carried by each snapshot. */
    inputHistory: 12,
    /** How long a disconnected player may take to come back. */
    reconnectGraceMs: 12_000,
    /** A room with nobody in it is collected after this long. */
    emptyRoomTtlMs: 60_000,
    /** Inputs accepted per second, per client, before throttling. */
    inputRateLimit: 120
} as const;
