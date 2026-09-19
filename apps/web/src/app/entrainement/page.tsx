'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
    CHARACTER_LIST,
    DEFAULT_STAGE,
    STAGES,
    findStage,
    pickStage,
    type CombatEvent
} from '@opfg/combat-core';
import type { MatchOverMessage } from '@opfg/shared';
import { CharacterSelect } from '@/components/CharacterSelect';
import { ControlsCard } from '@/components/ControlsCard';
import { Hud } from '@/components/Hud';
import { Results } from '@/components/Results';
import { createBridge } from '@/game/bridge';
import { loadManifest, type AssetManifest } from '@/game/manifest';
import { PhaserGame } from '@/game/PhaserGame';
import { KeyboardReader, PLAYER_BINDINGS, SECOND_PLAYER_BINDINGS } from '@/input/keyboard';
import { LocalDriver } from '@/net/netcode';

type Screen = 'select' | 'fight';

const FALLBACK: [string, string] = [CHARACTER_LIST[0]!.id, CHARACTER_LIST[1]!.id];

/**
 * The training room: the same simulation, both seats on this keyboard.
 *
 * It exists for two reasons. A player can learn a character's frame data
 * without an opponent and without a connection, and whoever is tuning the
 * engine can see a change immediately instead of booting a server and two
 * browsers. Nothing here talks to the network, so the only difference from an
 * online match is where the buttons come from.
 */
export default function TrainingPage(): React.ReactElement {
    const [manifest, setManifest] = useState<AssetManifest | null>(null);
    const [assetError, setAssetError] = useState<string | null>(null);
    const [screen, setScreen] = useState<Screen>('select');
    const [picks, setPicks] = useState<[string | null, string | null]>([null, null]);
    const [ready, setReady] = useState<[boolean, boolean]>([false, false]);
    const [stageId, setStageId] = useState<string>(DEFAULT_STAGE);
    const [match, setMatch] = useState<{ characters: [string, string]; stageId: string; seed: number } | null>(
        null
    );
    const [result, setResult] = useState<MatchOverMessage | null>(null);
    const [hitboxes, setHitboxes] = useState(false);

    const bridge = useMemo(() => createBridge(), []);
    const readersRef = useRef<[KeyboardReader, KeyboardReader] | null>(null);

    useEffect(() => {
        void loadManifest().then(setManifest).catch((cause: unknown) => {
            setAssetError(cause instanceof Error ? cause.message : String(cause));
        });

        // Two readers on the same window, each with its own bindings. They
        // never collide because no physical key appears in both sets.
        const readers: [KeyboardReader, KeyboardReader] = [
            new KeyboardReader(PLAYER_BINDINGS),
            new KeyboardReader(SECOND_PLAYER_BINDINGS)
        ];
        readers.forEach((reader) => reader.attach());
        readersRef.current = readers;
        return () => readers.forEach((reader) => reader.detach());
    }, []);

    useEffect(() => {
        bridge.showHitboxes = hitboxes;
    }, [bridge, hitboxes]);

    useEffect(() => {
        const onKey = (event: KeyboardEvent): void => {
            if (event.code === 'KeyH' && event.shiftKey) {
                setHitboxes((current) => !current);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    // Drive the offline simulation. The rounds a match produces are collected
    // as they happen, so the result screen can show the same breakdown the
    // server sends online.
    useEffect(() => {
        if (!match) {
            bridge.tick = null;
            bridge.state = null;
            return;
        }

        const rounds: MatchOverMessage['rounds'] = [];
        const driver = new LocalDriver(
            match.characters,
            match.stageId,
            match.seed,
            () => [readersRef.current?.[0].read() ?? 0, readersRef.current?.[1].read() ?? 0]
        );

        bridge.state = driver.state;
        bridge.tick = (deltaMs: number) => {
            driver.update(deltaMs);
            bridge.state = driver.state;
            const events = driver.drainEvents();
            bridge.events.push(...events);
            for (const event of events as CombatEvent[]) {
                if (event.type === 'roundEnd') {
                    rounds.push({ round: rounds.length + 1, winner: event.winner });
                } else if (event.type === 'matchEnd') {
                    setResult({
                        winner: event.winner,
                        rounds: [...rounds],
                        health: [driver.state.fighters[0].health, driver.state.fighters[1].health]
                    });
                }
            }
        };

        return () => {
            bridge.tick = null;
        };
    }, [match, bridge]);

    const start = useCallback(
        (characters: [string, string], stage: string) => {
            setResult(null);
            setMatch({ characters, stageId: stage, seed: (Date.now() ^ (Math.random() * 0xffffffff)) >>> 0 });
            setScreen('fight');
        },
        []
    );

    const backToSelect = useCallback(() => {
        setMatch(null);
        setResult(null);
        setReady([false, false]);
        setScreen('select');
    }, []);

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

    if (screen === 'fight' && match) {
        const stage = findStage(match.stageId);
        return (
            <main className="flex min-h-dvh flex-col items-center justify-center gap-3 p-2 sm:p-4">
                <div className="flex w-full max-w-[960px] items-center justify-between">
                    <button type="button" className="label hover:text-text" onClick={backToSelect}>
                        ← Quitter l&apos;entraînement
                    </button>
                    <span className="label">
                        {stage.name} · local{hitboxes ? ' · hitboxes' : ''}
                    </span>
                </div>

                <div className="scanlines panel relative aspect-video w-full max-w-[960px] overflow-hidden">
                    <PhaserGame
                        bridge={bridge}
                        manifest={manifest}
                        characters={match.characters}
                        stageId={match.stageId}
                    />
                    <Hud bridge={bridge} playerNames={['Joueur 1', 'Joueur 2']} slot={null} />

                    {result ? (
                        <Results
                            manifest={manifest}
                            result={result}
                            characters={match.characters}
                            playerNames={['Joueur 1', 'Joueur 2']}
                            slot={null}
                            rematchRequested={false}
                            opponentWantsRematch={false}
                            onRematch={() => start(match.characters, match.stageId)}
                            onMenu={backToSelect}
                        />
                    ) : null}
                </div>

                <p className="label">
                    Maj + H affiche les boîtes de collision · Joueur 2 au pavé numérique
                </p>
            </main>
        );
    }

    // Both seats choose on the same screen, one after the other: the panel
    // belongs to the first player who has not locked in yet.
    const active: 0 | 1 = ready[0] ? 1 : 0;

    return (
        <div className="flex min-h-dvh flex-col">
            <CharacterSelect
                manifest={manifest}
                picks={picks}
                ready={ready}
                playerNames={['Joueur 1', 'Joueur 2']}
                slot={active}
                onPick={(characterId) =>
                    setPicks((current) => {
                        const next: [string | null, string | null] = [current[0], current[1]];
                        next[active] = characterId;
                        return next;
                    })
                }
                onReady={(value) => {
                    const next: [boolean, boolean] = [ready[0], ready[1]];
                    next[active] = value;
                    if (!value && active === 1) {
                        next[0] = false; // Cancelling gives the pad back to player 1.
                    }
                    setReady(next);
                    if (next[0] && next[1]) {
                        start([picks[0] ?? FALLBACK[0], picks[1] ?? FALLBACK[1]], stageId);
                    }
                }}
                onBack={() => {
                    window.location.href = '/';
                }}
            />

            <div className="mx-auto grid w-full max-w-6xl gap-5 p-4 pb-10 sm:p-8 sm:pt-0 lg:grid-cols-[1fr_1.1fr]">
                <div className="panel p-5">
                    <h3 className="label mb-3">Arène</h3>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        <button
                            type="button"
                            className="btn text-xs"
                            onClick={() => setStageId(pickStage(Date.now() >>> 0))}
                        >
                            Aléatoire
                        </button>
                        {STAGES.map((stage) => (
                            <button
                                key={stage.id}
                                type="button"
                                className={`btn text-xs ${stageId === stage.id ? 'btn-primary' : ''}`}
                                onClick={() => setStageId(stage.id)}
                            >
                                {stage.name}
                            </button>
                        ))}
                    </div>
                    <p className="mt-4 text-xs leading-relaxed text-muted">
                        Les deux combattants partagent ce clavier. Le joueur 1 utilise les flèches et J/K/L,
                        le joueur 2 le pavé numérique. Maj + H affiche les boîtes de collision pendant le
                        combat.
                    </p>
                    <Link href="/" className="btn mt-4 inline-block">
                        Retour au jeu en ligne
                    </Link>
                </div>

                <div className="panel p-5">
                    <ControlsCard showSecond />
                </div>
            </div>
        </div>
    );
}
