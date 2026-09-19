'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
    AI_LEVELS,
    CHARACTER_LIST,
    DEFAULT_AI_LEVEL,
    ROSTER,
    createAiReader,
    findStage,
    pickStage,
    type AiLevel,
    type CombatEvent
} from '@opfg/combat-core';
import type { MatchOverMessage } from '@opfg/shared';
import { CharacterSelect } from '@/components/CharacterSelect';
import { ControlsCard } from '@/components/ControlsCard';
import { Hud } from '@/components/Hud';
import { Results } from '@/components/Results';
import { SpritePreview } from '@/components/SpritePreview';
import { createBridge } from '@/game/bridge';
import { animationsByKey, loadManifest, type AssetManifest } from '@/game/manifest';
import { PhaserGame } from '@/game/PhaserGame';
import { KeyboardReader, PLAYER_BINDINGS } from '@/input/keyboard';
import { LocalDriver } from '@/net/netcode';

type Screen = 'select' | 'ladder' | 'fight';

/**
 * Arcade mode: one player, the whole roster in the way.
 *
 * You pick a fighter and then face every other character in turn. The computer
 * holds the second seat through the same `LocalDriver` the training room uses,
 * so nothing about the fight itself is special-cased — the bot sends input
 * masks and the simulation cannot tell it from a person.
 *
 * The ladder is deliberately the rest of the roster and nothing else: the
 * request was to fight every character you did not choose, so the length of
 * the run is whatever the roster happens to be, and a sixth character would
 * lengthen it without a line changing here.
 */
export default function ArcadePage(): React.ReactElement {
    const [manifest, setManifest] = useState<AssetManifest | null>(null);
    const [assetError, setAssetError] = useState<string | null>(null);
    const [screen, setScreen] = useState<Screen>('select');

    const [pick, setPick] = useState<string | null>(null);
    const [aiLevel, setAiLevel] = useState<AiLevel>(DEFAULT_AI_LEVEL);
    const [run, setRun] = useState<{ opponents: string[]; index: number; seed: number } | null>(null);
    const [result, setResult] = useState<MatchOverMessage | null>(null);
    const [defeated, setDefeated] = useState(false);

    const bridge = useMemo(() => createBridge(), []);
    const keyboardRef = useRef<KeyboardReader | null>(null);

    useEffect(() => {
        void loadManifest().then(setManifest).catch((cause: unknown) => {
            setAssetError(cause instanceof Error ? cause.message : String(cause));
        });
        const reader = new KeyboardReader(PLAYER_BINDINGS);
        reader.attach();
        keyboardRef.current = reader;
        return () => reader.detach();
    }, []);

    const fight = run && screen === 'fight'
        ? {
              characters: [pick ?? CHARACTER_LIST[0]!.id, run.opponents[run.index] ?? CHARACTER_LIST[0]!.id] as [
                  string,
                  string
              ],
              // A different arena for every bout, drawn from the run's seed, so
              // a whole ladder is not fought on one background.
              stageId: pickStage((run.seed + run.index * 7919) >>> 0),
              seed: (run.seed + run.index * 104729) >>> 0
          }
        : null;

    // One bout. Slot 0 is the keyboard, slot 1 is the bot; both are just
    // masks by the time the simulation sees them.
    useEffect(() => {
        if (!fight) {
            bridge.tick = null;
            bridge.state = null;
            return;
        }

        const rounds: MatchOverMessage['rounds'] = [];
        const bot = createAiReader(1, aiLevel, fight.seed, ROSTER);
        const driver = new LocalDriver(fight.characters, fight.stageId, fight.seed, (state) => [
            keyboardRef.current?.read() ?? 0,
            bot(state)
        ]);

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
        // `fight` is rebuilt whenever the bout changes, which is exactly when
        // the driver has to be replaced.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bridge, aiLevel, fight?.characters[0], fight?.characters[1], fight?.seed, fight?.stageId]);

    const startRun = useCallback(
        (characterId: string) => {
            const seed = (Date.now() ^ (Math.random() * 0xffffffff)) >>> 0;
            const opponents = CHARACTER_LIST.filter((character) => character.id !== characterId).map(
                (character) => character.id
            );
            setRun({ opponents, index: 0, seed });
            setResult(null);
            setDefeated(false);
            setScreen('ladder');
        },
        []
    );

    /** Called from the results screen once a bout has been decided. */
    const settle = useCallback(() => {
        if (!run || !result) {
            return;
        }
        setResult(null);
        if (result.winner === 0) {
            setRun({ ...run, index: run.index + 1 });
            setScreen('ladder');
        } else {
            setDefeated(true);
            setScreen('ladder');
        }
    }, [run, result]);

    const retry = useCallback(() => {
        if (!run) {
            return;
        }
        setResult(null);
        setDefeated(false);
        // A retry is a fresh bout, not a replay: a new seed means the bot does
        // not repeat the run that just beat you.
        setRun({ ...run, seed: (run.seed * 1103515245 + 12345) >>> 0 });
        setScreen('fight');
    }, [run]);

    const quit = useCallback(() => {
        setRun(null);
        setResult(null);
        setDefeated(false);
        setPick(null);
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

    if (screen === 'fight' && fight && run) {
        const stage = findStage(fight.stageId);
        return (
            <main className="flex min-h-dvh flex-col items-center justify-center gap-3 p-2 sm:p-4">
                <div className="flex w-full max-w-[960px] items-center justify-between">
                    <button type="button" className="label hover:text-text" onClick={quit}>
                        ← Quitter l&apos;arcade
                    </button>
                    <span className="label">
                        Combat {run.index + 1}/{run.opponents.length} · {stage.name} · {aiLevel.name}
                    </span>
                </div>

                <div className="scanlines panel relative aspect-video w-full max-w-[960px] overflow-hidden">
                    <PhaserGame
                        bridge={bridge}
                        manifest={manifest}
                        characters={fight.characters}
                        stageId={fight.stageId}
                    />
                    <Hud bridge={bridge} playerNames={['Vous', 'Ordinateur']} slot={0} />

                    {result ? (
                        <Results
                            manifest={manifest}
                            result={result}
                            characters={fight.characters}
                            playerNames={['Vous', 'Ordinateur']}
                            slot={0}
                            rematchRequested={false}
                            opponentWantsRematch={false}
                            onRematch={settle}
                            onMenu={quit}
                            primaryLabel={result.winner === 0 ? 'Continuer' : 'Retenter'}
                            menuLabel="Quitter l’arcade"
                        />
                    ) : null}
                </div>

                <p className="label">Flèches pour bouger · J coup léger · K coup lourd · L spécial · M ultime</p>
            </main>
        );
    }

    if (screen === 'ladder' && run) {
        return (
            <LadderScreen
                manifest={manifest}
                run={run}
                playerCharacterId={pick ?? CHARACTER_LIST[0]!.id}
                aiLevel={aiLevel}
                defeated={defeated}
                onFight={() => setScreen('fight')}
                onRetry={retry}
                onQuit={quit}
            />
        );
    }

    return (
        <div className="flex min-h-dvh flex-col">
            <CharacterSelect
                manifest={manifest}
                picks={[pick, null]}
                ready={[false, false]}
                playerNames={['Vous', 'Ordinateur']}
                slot={0}
                onPick={setPick}
                onReady={(value) => {
                    if (value && pick) {
                        startRun(pick);
                    }
                }}
                onBack={() => {
                    window.location.href = '/';
                }}
            />

            <div className="mx-auto grid w-full max-w-6xl gap-5 p-4 pb-10 sm:p-8 sm:pt-0 lg:grid-cols-[1fr_1.1fr]">
                <div className="panel p-5">
                    <h3 className="label mb-3">Difficulté</h3>
                    <div className="grid gap-2">
                        {AI_LEVELS.map((candidate) => (
                            <button
                                key={candidate.id}
                                type="button"
                                className={`btn text-left text-xs ${aiLevel.id === candidate.id ? 'btn-primary' : ''}`}
                                onClick={() => setAiLevel(candidate)}
                            >
                                <span className="block font-bold">{candidate.name}</span>
                                <span className="block opacity-80">{candidate.description}</span>
                            </button>
                        ))}
                    </div>
                    <p className="mt-4 text-xs leading-relaxed text-muted">
                        Choisissez un combattant : vous affronterez ensuite tous les autres, un par un.
                        L&apos;ordinateur joue avec les mêmes touches et les mêmes règles que vous, sans
                        rien savoir de plus sur le combat.
                    </p>
                    <Link href="/" className="btn mt-4 inline-block">
                        Retour au menu
                    </Link>
                </div>

                <div className="panel p-5">
                    <ControlsCard />
                </div>
            </div>
        </div>
    );
}

interface LadderScreenProps {
    manifest: AssetManifest;
    run: { opponents: string[]; index: number; seed: number };
    playerCharacterId: string;
    aiLevel: AiLevel;
    defeated: boolean;
    onFight: () => void;
    onRetry: () => void;
    onQuit: () => void;
}

/** The board between bouts: who is beaten, who is next, who is left. */
function LadderScreen({
    manifest,
    run,
    playerCharacterId,
    aiLevel,
    defeated,
    onFight,
    onRetry,
    onQuit
}: LadderScreenProps): React.ReactElement {
    const animations = useMemo(() => animationsByKey(manifest), [manifest]);
    const player = ROSTER[playerCharacterId];
    const cleared = run.index >= run.opponents.length;

    return (
        <main className="flex min-h-dvh flex-col items-center justify-center gap-6 p-6">
            <header className="text-center">
                <p className="label">Mode arcade · {aiLevel.name}</p>
                <h1 className="display mt-2 text-3xl sm:text-4xl">
                    {cleared
                        ? 'Parcours terminé'
                        : defeated
                          ? 'Vous êtes vaincu'
                          : run.index === 0
                            ? 'Premier adversaire'
                            : 'Adversaire suivant'}
                </h1>
                <p className="mt-2 text-sm text-muted">
                    {cleared
                        ? `${player?.name ?? 'Votre combattant'} a battu tout le reste du roster.`
                        : defeated
                          ? 'Le parcours s’arrête ici, à moins de reprendre ce combat.'
                          : `${run.index} combat${run.index > 1 ? 's' : ''} gagné${run.index > 1 ? 's' : ''} sur ${run.opponents.length}.`}
                </p>
            </header>

            <ol className="flex flex-wrap items-end justify-center gap-4">
                {run.opponents.map((opponentId, index) => {
                    const character = ROSTER[opponentId];
                    const beaten = index < run.index;
                    const current = index === run.index;
                    return (
                        <li
                            key={opponentId}
                            className={`panel flex w-32 flex-col items-center gap-2 p-3 transition-opacity ${
                                beaten ? 'opacity-40' : current ? '' : 'opacity-70'
                            }`}
                            style={current ? { borderColor: character?.color } : undefined}
                        >
                            <SpritePreview
                                texture={character?.texture ?? ''}
                                animation={
                                    character ? animations.get(character.animations.idle) : undefined
                                }
                                height={72}
                            />
                            <span className="label text-center">{character?.name ?? opponentId}</span>
                            <span className="text-[10px] uppercase tracking-widest text-muted">
                                {beaten ? 'Battu' : current ? 'À venir' : `#${index + 1}`}
                            </span>
                        </li>
                    );
                })}
            </ol>

            <div className="flex flex-wrap items-center justify-center gap-3">
                {cleared ? (
                    <button type="button" className="btn btn-primary" onClick={onQuit}>
                        Refaire un parcours
                    </button>
                ) : defeated ? (
                    <button type="button" className="btn btn-primary" onClick={onRetry}>
                        Retenter ce combat
                    </button>
                ) : (
                    <button type="button" className="btn btn-primary" onClick={onFight}>
                        Combattre
                    </button>
                )}
                <button type="button" className="btn" onClick={onQuit}>
                    Quitter l&apos;arcade
                </button>
            </div>
        </main>
    );
}
