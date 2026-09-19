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

        socket.on('connect', () => setStatus('online'));
        socket.on('disconnect', () => setStatus('offline'));
        socket.on('connect_error', () => setStatus('error'));

        socket.on('room:state', (view) => setRoom(view));
        socket.on('room:closed', ({ reason }) => {
            setNotice(reason);
            setRoom(null);
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

    const sendInput = useCallback((payload: InputPayload): void => {
        socketRef.current?.emit('match:input', payload);
    }, []);

    return useMemo(
        () => ({ status, room, notice, ping, call, sendInput, clearNotice: () => setNotice(null) }),
        [status, room, notice, ping, call, sendInput]
    );
}
