'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { DEFAULT_STAGE, findStage } from '@opfg/combat-core';
import type { MatchBeginMessage, MatchOverMessage, RoomView } from '@opfg/shared';
import { CharacterSelect } from '@/components/CharacterSelect';
import { Hud } from '@/components/Hud';
import { Lobby } from '@/components/Lobby';
import { Results } from '@/components/Results';
import { createBridge } from '@/game/bridge';
import { loadManifest, type AssetManifest } from '@/game/manifest';
import { PhaserGame } from '@/game/PhaserGame';
import { KeyboardReader } from '@/input/keyboard';
import { NetcodeClient } from '@/net/netcode';
import { useGameSocket } from '@/net/useGameSocket';

const NICKNAME_KEY = 'opfg.nickname';

const namesOf = (room: RoomView | null): [string, string] => [
    room?.players.find((player) => player.slot === 0)?.nickname ?? 'Joueur 1',
    room?.players.find((player) => player.slot === 1)?.nickname ?? 'Joueur 2'
];

const picksOf = (room: RoomView | null): [string | null, string | null] => [
    room?.players.find((player) => player.slot === 0)?.characterId ?? null,
    room?.players.find((player) => player.slot === 1)?.characterId ?? null
];

const readyOf = (room: RoomView | null): [boolean, boolean] => [
    room?.players.find((player) => player.slot === 0)?.ready ?? false,
    room?.players.find((player) => player.slot === 1)?.ready ?? false
];

/**
 * The online game, start to finish.
 *
 * The screen the player sees is derived from the room's phase, which the
 * server owns: there is no client-side notion of "we are probably fighting
 * now". When the server says the match has begun, the netcode client is built
 * and handed to the bridge; everything else is presentation.
 */
export default function Page(): React.ReactElement {
    const [manifest, setManifest] = useState<AssetManifest | null>(null);
    const [assetError, setAssetError] = useState<string | null>(null);
    const [nickname, setNickname] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [match, setMatch] = useState<MatchBeginMessage | null>(null);
    const [result, setResult] = useState<MatchOverMessage | null>(null);
    const [rematchRequested, setRematchRequested] = useState(false);
    const [hitboxes, setHitboxes] = useState(false);

    const bridge = useMemo(() => createBridge(), []);
    const netcodeRef = useRef<NetcodeClient | null>(null);
    const keyboardRef = useRef<KeyboardReader | null>(null);

    useEffect(() => {
        setNickname(window.localStorage.getItem(NICKNAME_KEY) ?? '');
        void loadManifest().then(setManifest).catch((cause: unknown) => {
            setAssetError(cause instanceof Error ? cause.message : String(cause));
        });
        const keyboard = new KeyboardReader();
        keyboard.attach();
        keyboardRef.current = keyboard;
        return () => keyboard.detach();
    }, []);

    useEffect(() => {
        bridge.showHitboxes = hitboxes;
    }, [bridge, hitboxes]);

    // A debug key rather than a menu toggle: it is there for whoever is
    // tuning frame data, and invisible to everyone else.
    useEffect(() => {
        const onKey = (event: KeyboardEvent): void => {
            if (event.code === 'KeyB' && event.shiftKey) {
                setHitboxes((current) => !current);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const socket = useGameSocket({
        onBegin: (message) => {
            setResult(null);
            setRematchRequested(false);
            setMatch(message);
        },
        onSnapshot: (snapshot) => netcodeRef.current?.onSnapshot(snapshot),
        onOver: (message) => setResult(message)
    });

    const { room, status, ping, call, sendInput, notice, forgetRoom } = socket;

    // Build the netcode client once the server has declared the match.
    useEffect(() => {
        if (!match) {
            netcodeRef.current = null;
            bridge.tick = null;
            bridge.state = null;
            return;
        }

        const client = new NetcodeClient({
            characters: match.characters,
            stageId: match.stageId,
            seed: match.seed,
            slot: match.slot,
            inputDelay: match.inputDelay,
            readInput: () => keyboardRef.current?.read() ?? 0,
            send: sendInput
        });
        netcodeRef.current = client;

        bridge.tick = (deltaMs: number) => {
            client.update(deltaMs);
            bridge.state = client.state;
            bridge.events.push(...client.drainEvents());
        };
        bridge.state = client.state;

        return () => {
            bridge.tick = null;
            netcodeRef.current = null;
        };
    }, [match, bridge, sendInput]);

    const saveNickname = useCallback((value: string) => {
        setNickname(value);
        window.localStorage.setItem(NICKNAME_KEY, value);
    }, []);

    const action = useCallback(
        async (event: 'room:create' | 'room:quick', payload: unknown): Promise<void> => {
            setBusy(true);
            setError(null);
            const response = await call(event, payload);
            setBusy(false);
            if (!response.ok) {
                setError(response.error);
            }
        },
        [call]
    );

    /** Every deliberate exit: drop the seat token first, then tell the server,
     *  so a reconnection does not drag the player back in. */
    const leave = useCallback((): void => {
        forgetRoom();
        setMatch(null);
        setResult(null);
        void call('room:leave');
    }, [call, forgetRoom]);

    const join = useCallback(
        async (code: string): Promise<void> => {
            setBusy(true);
            setError(null);
            const response = await call('room:join', { nickname: nickname.trim(), code });
            setBusy(false);
            if (!response.ok) {
                setError(response.error);
            }
        },
        [call, nickname]
    );

    const phase = room?.phase ?? 'lobby';
    const names = namesOf(room);
    const picks = picksOf(room);
    const ready = readyOf(room);
    const mySlot = (room?.players.find((player) => player.nickname === nickname.trim())?.slot ??
        match?.slot ??
        null) as 0 | 1 | null;

    if (assetError) {
        return (
            <main className="flex min-h-dvh items-center justify-center p-8">
                <div className="panel max-w-lg p-8 text-center">
                    <h1 className="display text-2xl">Ressources manquantes</h1>
                    <p className="mt-3 text-sm text-muted">{assetError}</p>
                    <code className="mt-4 block bg-ink px-3 py-2 text-xs">npm run assets</code>
                </div>
            </main>
        );
    }

    if (!manifest) {
        return (
            <main className="flex min-h-dvh items-center justify-center">
                <span className="label animate-pulse-accent">Chargement des ressources…</span>
            </main>
        );
    }

    if (phase === 'select' && room) {
        return (
            <CharacterSelect
                manifest={manifest}
                picks={picks}
                ready={ready}
                playerNames={names}
                slot={mySlot}
                onPick={(characterId) => void call('select:character', { characterId })}
                onReady={(value) => void call('select:ready', { ready: value })}
                onBack={leave}
                waitingFor={room.players.length < 2 ? "En attente d'un adversaire…" : null}
            />
        );
    }

    if ((phase === 'countdown' || phase === 'fight' || phase === 'result') && match) {
        const stage = findStage(match.stageId ?? DEFAULT_STAGE);
        return (
            <main className="flex min-h-dvh flex-col items-center justify-center gap-3 p-2 sm:p-4">
                <div className="flex w-full max-w-[960px] items-center justify-between">
                    <Link href="/" className="label hover:text-text" onClick={leave}>
                        ← Quitter
                    </Link>
                    <span className="label">
                        {stage.name} · {ping} ms{hitboxes ? ' · hitboxes' : ''}
                    </span>
                </div>

                <div className="scanlines panel relative aspect-video w-full max-w-[960px] overflow-hidden">
                    <PhaserGame
                        bridge={bridge}
                        manifest={manifest}
                        characters={match.characters}
                        stageId={match.stageId}
                    />
                    <Hud bridge={bridge} playerNames={names} slot={mySlot} />

                    {room?.startsIn !== null && room?.startsIn !== undefined && phase === 'countdown' ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-ink/60">
                            <span className="display animate-pulse-accent text-7xl">
                                {Math.ceil(room.startsIn / 1000)}
                            </span>
                        </div>
                    ) : null}

                    {result ? (
                        <Results
                            manifest={manifest}
                            result={result}
                            characters={match.characters}
                            playerNames={names}
                            slot={mySlot}
                            rematchRequested={rematchRequested}
                            opponentWantsRematch={(room?.rematchVotes.length ?? 0) > 0 && !rematchRequested}
                            onRematch={() => {
                                setRematchRequested(true);
                                void call('match:rematch');
                            }}
                            onMenu={leave}
                        />
                    ) : null}
                </div>

                {notice ? <p className="label text-accent-2">{notice}</p> : null}
            </main>
        );
    }

    return (
        <Lobby
            status={status}
            room={room}
            nickname={nickname}
            ping={ping}
            error={error ?? notice}
            busy={busy}
            onNickname={saveNickname}
            onCreate={() => void action('room:create', { nickname: nickname.trim() })}
            onQuick={() => void action('room:quick', { nickname: nickname.trim() })}
            onJoin={(code) => void join(code)}
            onLeave={leave}
            onLocal={() => {
                window.location.href = '/entrainement';
            }}
            onArcade={() => {
                window.location.href = '/arcade';
            }}
        />
    );
}
