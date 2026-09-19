import { createServer } from 'node:http';
import { Server, type Socket } from 'socket.io';
import { CHARACTER_IDS, TICK_RATE } from '@opfg/combat-core';
import {
    NETWORK_DEFAULTS,
    PROTOCOL_VERSION,
    createRoomSchema,
    inputSchema,
    joinRoomSchema,
    pingSchema,
    quickMatchSchema,
    readySchema,
    resumeSchema,
    selectCharacterSchema,
    type Ack,
    type ClientToServerEvents,
    type ErrorCode,
    type RoomView,
    type ServerToClientEvents
} from '@opfg/shared';
import { config, originAllowed } from './config.js';
import { log } from './log.js';
import { RoomRegistry } from './rooms.js';
import type { Outbound } from './room.js';

type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

const http = createServer((request, response) => {
    // Render polls this to decide whether the instance is alive, and a browser
    // hitting the socket URL directly should see something other than a 404.
    if (request.url === '/health' || request.url === '/') {
        response.writeHead(200, { 'content-type': 'application/json' });
        response.end(
            JSON.stringify({
                status: 'ok',
                protocol: PROTOCOL_VERSION,
                tickRate: TICK_RATE,
                rooms: registry.size,
                roster: CHARACTER_IDS,
                uptime: Math.round(process.uptime())
            })
        );
        return;
    }
    response.writeHead(404, { 'content-type': 'text/plain' });
    response.end('not found');
});

const io = new Server<ClientToServerEvents, ServerToClientEvents>(http, {
    cors: {
        origin: (origin, callback) => {
            if (originAllowed(origin)) {
                callback(null, true);
                return;
            }
            log('warn', 'origin refused', { origin: origin ?? 'none' });
            callback(new Error('origin not allowed'));
        },
        credentials: true
    },
    // Long-polling first would work, but a fighting game has no use for it and
    // the upgrade dance costs the first second of every connection.
    transports: ['websocket', 'polling'],
    // A player whose connection is cut, rather than closed, is only noticed
    // when the heartbeat runs out. With the library's defaults that takes up
    // to thirty seconds — longer than the twelve-second grace period the room
    // holds their seat for, so the opponent would sit in a frozen fight
    // waiting for a countdown that had not started. Four and eight seconds
    // puts detection inside the grace period, which is what the room's rules
    // assume, and the extra heartbeat traffic is a few bytes a second.
    pingInterval: 4_000,
    pingTimeout: 8_000
});

/**
 * Socket.IO's emitter is typed per event, which the room's generic transport
 * cannot express without repeating every event name. The cast is confined to
 * this one adapter; `Outbound` and `ServerToClientEvents` are kept in step by
 * the compile-time check just below it.
 */
type LooseEmit = (event: string, payload: unknown) => void;

const emitTo = (target: string): LooseEmit =>
    io.to(target).emit.bind(io.to(target)) as unknown as LooseEmit;

const registry = new RoomRegistry(
    (code) => ({
        toPlayer: <E extends keyof Outbound>(playerId: string, event: E, payload: Outbound[E]): void => {
            emitTo(playerId)(event, payload);
        },
        toRoom: <E extends keyof Outbound>(event: E, payload: Outbound[E]): void => {
            emitTo(code)(event, payload);
        }
    }),
    {
        inputDelay: config.inputDelay,
        snapshotInterval: config.snapshotInterval,
        reconnectGraceMs: config.reconnectGraceMs
    },
    config.emptyRoomTtlMs
);

/** Fails to compile the moment the two event maps drift apart. */
type OutboundMatchesProtocol = {
    [E in keyof Outbound]: Outbound[E] extends Parameters<ServerToClientEvents[E]>[0] ? true : never;
};
const _outboundCheck: OutboundMatchesProtocol = {
    'room:state': true,
    'room:closed': true,
    'match:begin': true,
    'match:snapshot': true,
    'match:over': true,
    'opponent:disconnected': true,
    'opponent:reconnected': true,
    'session:token': true
};
void _outboundCheck;

const fail = <T>(code: ErrorCode, error: string): Ack<T> => ({ ok: false, code, error });
const done = <T>(data: T): Ack<T> => ({ ok: true, data });

/** A client that floods inputs is slowed down, not disconnected: the usual
 *  cause is a tab that was backgrounded and is now catching up. */
const rateLimiter = new Map<string, { count: number; windowStart: number }>();
const withinRate = (id: string, limit: number): boolean => {
    const now = Date.now();
    const entry = rateLimiter.get(id);
    if (!entry || now - entry.windowStart > 1000) {
        rateLimiter.set(id, { count: 1, windowStart: now });
        return true;
    }
    entry.count += 1;
    return entry.count <= limit;
};

io.on('connection', (socket: GameSocket) => {
    log('info', 'socket connected', { socket: socket.id });

    const joinRoomChannel = (view: RoomView): void => {
        void socket.join(view.code);
        void socket.join(socket.id);
    };

    /** Hands the tab the credential it will need if its socket ever drops. */
    const issueToken = (): void => {
        const token = registry.issueToken(socket.id);
        if (token) {
            (socket as unknown as { emit: (event: string, payload: unknown) => void }).emit('session:token', {
                token
            });
        }
    };

    socket.on('room:create', (payload, ack) => {
        const parsed = createRoomSchema.safeParse(payload);
        if (!parsed.success) {
            ack(fail('invalid-payload', 'Pseudo invalide.'));
            return;
        }
        const room = registry.create(socket.id, parsed.data.nickname);
        joinRoomChannel(room.view());
        issueToken();
        room.publish();
        ack(done({ room: room.view() }));
    });

    socket.on('room:join', (payload, ack) => {
        const parsed = joinRoomSchema.safeParse(payload);
        if (!parsed.success) {
            ack(fail('invalid-payload', 'Code ou pseudo invalide.'));
            return;
        }
        const { room, error } = registry.join(socket.id, parsed.data.nickname, parsed.data.code);
        if (!room) {
            ack(
                fail(
                    error ?? 'server-error',
                    error === 'room-full' ? 'Cette partie est déjà complète.' : "Cette partie n'existe pas."
                )
            );
            return;
        }
        joinRoomChannel(room.view());
        issueToken();
        room.publish();
        ack(done({ room: room.view() }));
    });

    socket.on('room:quick', (payload, ack) => {
        const parsed = quickMatchSchema.safeParse(payload);
        if (!parsed.success) {
            ack(fail('invalid-payload', 'Pseudo invalide.'));
            return;
        }
        const room = registry.quickMatch(socket.id, parsed.data.nickname);
        joinRoomChannel(room.view());
        issueToken();
        room.publish();
        ack(done({ room: room.view() }));
    });

    // A tab that lost its socket mid-match comes back here. The seat is only
    // still there if the grace period has not run out; otherwise the match was
    // already forfeited and there is nothing honest to return.
    socket.on('room:resume', (payload, ack) => {
        const parsed = resumeSchema.safeParse(payload);
        if (!parsed.success) {
            ack(fail('invalid-payload', 'Jeton de reprise invalide.'));
            return;
        }
        const room = registry.resume(parsed.data.token, socket.id);
        if (!room) {
            ack(fail('seat-expired', 'La partie ne t\'attend plus.'));
            return;
        }
        joinRoomChannel(room.view());
        room.publish();
        ack(done({ room: room.view() }));
    });

    socket.on('room:leave', (ack) => {
        // Leaving the broadcast channel matters as much as leaving the room:
        // a socket still subscribed to it keeps receiving the room's state and
        // the client keeps rendering a room the player has walked out of.
        const room = registry.roomOfPlayer(socket.id);
        if (room) {
            void socket.leave(room.code);
        }
        registry.leave(socket.id);
        ack(done({}));
    });

    socket.on('select:character', (payload, ack) => {
        const parsed = selectCharacterSchema.safeParse(payload);
        const room = registry.roomOfPlayer(socket.id);
        if (!parsed.success) {
            ack(fail('invalid-payload', 'Personnage invalide.'));
            return;
        }
        if (!room) {
            ack(fail('not-in-room', "Tu n'es dans aucune partie."));
            return;
        }
        if (!room.selectCharacter(socket.id, parsed.data.characterId)) {
            ack(fail('unknown-character', 'Ce personnage ne peut pas être choisi maintenant.'));
            return;
        }
        ack(done({}));
    });

    socket.on('select:ready', (payload, ack) => {
        const parsed = readySchema.safeParse(payload);
        const room = registry.roomOfPlayer(socket.id);
        if (!parsed.success || !room) {
            ack(fail(parsed.success ? 'not-in-room' : 'invalid-payload', 'Action impossible.'));
            return;
        }
        if (!room.setReady(socket.id, parsed.data.ready)) {
            ack(fail('wrong-phase', "Ce n'est pas le moment de se déclarer prêt."));
            return;
        }
        ack(done({}));
    });

    socket.on('match:input', (payload) => {
        if (!withinRate(socket.id, NETWORK_DEFAULTS.inputRateLimit)) {
            return;
        }
        const parsed = inputSchema.safeParse(payload);
        if (!parsed.success) {
            return;
        }
        registry.roomOfPlayer(socket.id)?.applyInput(socket.id, parsed.data);
    });

    socket.on('match:rematch', (ack) => {
        const room = registry.roomOfPlayer(socket.id);
        if (!room || !room.requestRematch(socket.id)) {
            ack(fail('wrong-phase', 'Pas de revanche possible maintenant.'));
            return;
        }
        ack(done({}));
    });

    socket.on('ping', (payload, ack) => {
        const parsed = pingSchema.safeParse(payload);
        const sentAt = parsed.success ? parsed.data.sentAt : 0;
        const room = registry.roomOfPlayer(socket.id);
        if (room && sentAt > 0) {
            room.setPing(socket.id, Math.min(999, Date.now() - sentAt));
        }
        ack({ sentAt, serverTime: Date.now() });
    });

    socket.on('disconnect', (reason) => {
        log('info', 'socket disconnected', { socket: socket.id, reason });
        registry.disconnect(socket.id);
        rateLimiter.delete(socket.id);
    });
});

// One loop drives every room. Node's timers drift, so each room works from the
// wall clock and a fixed-step accumulator rather than from the tick count.
const loop = setInterval(() => {
    try {
        registry.tick(Date.now());
    } catch (error) {
        log('error', 'tick failed', { error: String(error) });
    }
}, 1000 / TICK_RATE);

const shutdown = (signal: string): void => {
    log('info', 'shutting down', { signal });
    clearInterval(loop);
    io.close(() => {
        http.close(() => process.exit(0));
    });
    setTimeout(() => process.exit(0), 5000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

http.listen(config.port, config.host, () => {
    log('info', 'server listening', {
        port: config.port,
        tickRate: TICK_RATE,
        origins: config.allowedOrigins.join(',')
    });
});
