'use client';

import { useState } from 'react';
import type { ConnectionStatus } from '@/net/useGameSocket';
import type { RoomView } from '@opfg/shared';
import { Brand } from './Brand';
import { ControlsCard } from './ControlsCard';

export interface LobbyProps {
    status: ConnectionStatus;
    room: RoomView | null;
    nickname: string;
    ping: number;
    error: string | null;
    busy: boolean;
    onNickname: (value: string) => void;
    onCreate: () => void;
    onJoin: (code: string) => void;
    onQuick: () => void;
    onLeave: () => void;
    onLocal: () => void;
}

const STATUS_TEXT: Record<ConnectionStatus, string> = {
    connecting: 'Connexion au serveur…',
    online: 'Connecté',
    offline: 'Serveur injoignable',
    error: 'Serveur injoignable'
};

/**
 * Menu and lobby in one screen.
 *
 * Nothing here hides behind a spinner: the connection state, the ping and the
 * room code are on screen from the first frame, because the first thing that
 * goes wrong in an online game is the connection, and a player who cannot see
 * it just thinks the game is broken.
 */
export function Lobby({
    status,
    room,
    nickname,
    ping,
    error,
    busy,
    onNickname,
    onCreate,
    onJoin,
    onQuick,
    onLeave,
    onLocal
}: LobbyProps): React.ReactElement {
    const [code, setCode] = useState('');
    const [copied, setCopied] = useState(false);
    const online = status === 'online';

    const copy = async (): Promise<void> => {
        if (!room) {
            return;
        }
        try {
            await navigator.clipboard.writeText(room.code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
        } catch {
            setCopied(false);
        }
    };

    return (
        <main className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col items-center justify-center gap-8 p-6">
            <Brand />

            <div className="flex items-center gap-3">
                <span
                    className={`block h-2 w-2 rotate-45 ${
                        online ? 'bg-good' : status === 'connecting' ? 'bg-accent-2 animate-pulse-accent' : 'bg-danger'
                    }`}
                />
                <span className="label">
                    {STATUS_TEXT[status]}
                    {online && ping > 0 ? ` · ${ping} ms` : ''}
                </span>
            </div>

            {room ? (
                <section className="panel panel-accent w-full max-w-xl animate-rise p-6">
                    <h2 className="display text-2xl">Partie {room.code}</h2>
                    <p className="label mt-1">Donne ce code à ton adversaire</p>

                    <div className="mt-4 flex items-center gap-3">
                        <span className="display flex-1 border border-line bg-ink px-4 py-3 text-4xl tracking-[0.35em]">
                            {room.code}
                        </span>
                        <button type="button" className="btn" onClick={() => void copy()}>
                            {copied ? 'Copié' : 'Copier'}
                        </button>
                    </div>

                    <ul className="mt-5 space-y-2">
                        {[0, 1].map((slot) => {
                            const player = room.players.find((entry) => entry.slot === slot);
                            return (
                                <li
                                    key={slot}
                                    className="flex items-center justify-between border-b border-line/50 pb-2 last:border-0"
                                >
                                    <span className="flex items-center gap-2">
                                        <span className="label">P{slot + 1}</span>
                                        <span className={player ? '' : 'text-muted'}>
                                            {player ? player.nickname : 'En attente…'}
                                        </span>
                                    </span>
                                    <span className="label">
                                        {player ? (player.connected ? `${player.ping} ms` : 'déconnecté') : ''}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>

                    <button type="button" className="btn mt-5 w-full" onClick={onLeave}>
                        Quitter la partie
                    </button>
                </section>
            ) : (
                <section className="panel w-full max-w-xl p-6">
                    <label className="label block" htmlFor="nickname">
                        Ton pseudo
                    </label>
                    <input
                        id="nickname"
                        value={nickname}
                        maxLength={16}
                        onChange={(event) => onNickname(event.target.value)}
                        className="mt-2 w-full border border-line bg-ink px-4 py-3 text-lg outline-none focus:border-accent"
                        placeholder="Dylan"
                    />

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={onQuick}
                            disabled={!online || busy || nickname.trim().length === 0}
                        >
                            Partie rapide
                        </button>
                        <button
                            type="button"
                            className="btn"
                            onClick={onCreate}
                            disabled={!online || busy || nickname.trim().length === 0}
                        >
                            Créer une partie
                        </button>
                    </div>

                    <div className="mt-5 flex gap-3">
                        <input
                            value={code}
                            maxLength={5}
                            onChange={(event) => setCode(event.target.value.toUpperCase())}
                            className="display w-full border border-line bg-ink px-4 py-3 text-2xl tracking-[0.3em] outline-none focus:border-accent"
                            placeholder="CODE"
                        />
                        <button
                            type="button"
                            className="btn shrink-0"
                            onClick={() => onJoin(code)}
                            disabled={!online || busy || code.length !== 5 || nickname.trim().length === 0}
                        >
                            Rejoindre
                        </button>
                    </div>

                    <div className="mt-6 border-t border-line/60 pt-5">
                        <button type="button" className="btn w-full" onClick={onLocal}>
                            Entraînement local · deux joueurs, un clavier
                        </button>
                        <p className="mt-2 text-xs text-muted">
                            Ne nécessite aucune connexion : la même simulation tourne entièrement dans ce navigateur.
                        </p>
                    </div>

                    {error ? <p className="text-danger mt-4 text-sm">{error}</p> : null}
                </section>
            )}

            <section className="panel w-full max-w-3xl p-6">
                <ControlsCard />
            </section>
        </main>
    );
}
