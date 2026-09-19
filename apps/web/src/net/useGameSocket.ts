'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import type {
    Ack,
    ClientToServerEvents,
    InputPayload,
    MatchBeginMessage,
    MatchOverMessage,
    RoomView,
    ServerToClientEvents,
    SnapshotMessage
} from '@opfg/shared';

export type ConnectionStatus = 'connecting' | 'online' | 'offline' | 'error';

export interface GameSocketHandlers {
    onBegin?: (message: MatchBeginMessage) => void;
    onSnapshot?: (message: SnapshotMessage) => void;
    onOver?: (message: MatchOverMessage) => void;
}

const serverUrl = (): string =>
    process.env.NEXT_PUBLIC_GAME_SERVER_URL ?? 'http://localhost:8080';

/**
 * The resume credential, in `sessionStorage` rather than `localStorage`.
 *
 * It belongs to this tab and to this tab only: two tabs on one machine are two
 * players, and sharing the token between them would let the second steal the
 * first's seat. It is also meant to die with the tab, which `sessionStorage`
 * does and `localStorage` does not.
 */
const TOKEN_KEY = 'opfg.session';

const readToken = (): string | null => {
    try {
        return window.sessionStorage.getItem(TOKEN_KEY);
    } catch {
        return null; // Private browsing, or storage the user has blocked.
    }
};

const writeToken = (token: string | null): void => {
    try {
        if (token === null) {
            window.sessionStorage.removeItem(TOKEN_KEY);
        } else {
            window.sessionStorage.setItem(TOKEN_KEY, token);
        }
    } catch {
        // Not being able to remember the token costs a reconnection, not a
        // crash: the player falls back to the lobby.
    }
};

/**
 * One socket for the whole session.
 *
 * The handlers are kept in a ref rather than in the effect's dependency list:
 * the netcode client is rebuilt on every match, and re-subscribing the socket
 * each time would drop the snapshots that arrive during the swap.
 */
export function useGameSocket(handlers: GameSocketHandlers) {
    const [status, setStatus] = useState<ConnectionStatus>('connecting');
    const [room, setRoom] = useState<RoomView | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [ping, setPing] = useState(0);
    const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
    const handlersRef = useRef(handlers);
    handlersRef.current = handlers;

    useEffect(() => {
        const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(serverUrl(), {
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 8,
            reconnectionDelay: 700,
            timeout: 8000
        });
        socketRef.current = socket;

        // Socket.IO reconnects on its own, but the server sees a new socket id
        // and therefore a stranger. The token is what says "this is the seat I
        // left": it is traded back on every connect, including the first,
        // where there is simply nothing to trade.
        socket.on('connect', () => {
            setStatus('online');
            const token = readToken();
            if (!token) {
                return;
            }
            (socket.emit as (e: string, p: unknown, ack: unknown) => void)(
                'room:resume',
                { token },
                (result: Ack<{ room: RoomView }>) => {
                    if (result.ok) {
                        setRoom(result.data.room);
                        setNotice('Reconnecté à la partie.');
                    } else {
                        writeToken(null);
                        if (result.code === 'seat-expired') {
                            setNotice("La partie ne t'a pas attendu.");
                        }
                    }
                }
            );
        });
        socket.on('disconnect', () => setStatus('offline'));
        socket.on('connect_error', () => setStatus('error'));
        socket.on('session:token', ({ token }) => writeToken(token));

        socket.on('room:state', (view) => setRoom(view));
        socket.on('room:closed', ({ reason }) => {
            setNotice(reason);
            setRoom(null);
            writeToken(null);
        });
        socket.on('match:begin', (message) => handlersRef.current.onBegin?.(message));
        socket.on('match:snapshot', (message) => handlersRef.current.onSnapshot?.(message));
        socket.on('match:over', (message) => handlersRef.current.onOver?.(message));
        socket.on('opponent:disconnected', ({ nickname, graceMs }) =>
            setNotice(`${nickname} s'est déconnecté. ${Math.round(graceMs / 1000)} secondes pour revenir.`)
        );
        socket.on('opponent:reconnected', ({ nickname }) => setNotice(`${nickname} est de retour.`));

        // A ping every two seconds: enough for the lobby to show a useful
        // number, rare enough that it costs nothing during a fight.
        const pinger = setInterval(() => {
            const sentAt = Date.now();
            socket.emit('ping', { sentAt }, () => setPing(Date.now() - sentAt));
        }, 2000);

        return () => {
            clearInterval(pinger);
            socket.removeAllListeners();
            socket.disconnect();
            socketRef.current = null;
        };
    }, []);

    const call = useCallback(
        <E extends keyof ClientToServerEvents, T>(event: E, payload?: unknown): Promise<Ack<T>> =>
            new Promise((resolve) => {
                const socket = socketRef.current;
                if (!socket) {
                    resolve({ ok: false, code: 'server-error', error: 'Pas de connexion au serveur.' });
                    return;
                }
                const acknowledge = (result: Ack<T>): void => resolve(result);
                if (payload === undefined) {
                    (socket.emit as (e: string, ack: unknown) => void)(event, acknowledge);
                } else {
                    (socket.emit as (e: string, p: unknown, ack: unknown) => void)(event, payload, acknowledge);
                }
            }),
        []
    );

    /**
     * Leaving on purpose: forget the seat token, so the next connection does
     * not drag the player back into a room they walked out of, and drop the
     * room locally rather than waiting to be told. The server confirms a
     * moment later; until it does, showing the room the player just left is
     * worse than showing the menu.
     */
    const forgetRoom = useCallback((): void => {
        writeToken(null);
        setRoom(null);
    }, []);

    const sendInput = useCallback((payload: InputPayload): void => {
        socketRef.current?.emit('match:input', payload);
    }, []);

    return useMemo(
        () => ({
            status,
            room,
            notice,
            ping,
            call,
            sendInput,
            forgetRoom,
            clearNotice: () => setNotice(null)
        }),
        [status, room, notice, ping, call, sendInput, forgetRoom]
    );
}
