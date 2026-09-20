'use client';

import { useMemo } from 'react';
import { ROSTER } from '@opfg/combat-core';
import type { MatchOverMessage } from '@opfg/shared';
import { animationsByKey, type AssetManifest } from '@/game/manifest';
import { SpritePreview } from './SpritePreview';

export interface ResultsProps {
    manifest: AssetManifest;
    result: MatchOverMessage;
    characters: [string, string];
    playerNames: [string, string];
    slot: 0 | 1 | null;
    rematchRequested: boolean;
    opponentWantsRematch: boolean;
    onRematch: () => void;
    onMenu: () => void;
    /** Overrides the primary button. Arcade mode carries on rather than
     *  replaying, so "Revanche" would be the wrong word there. */
    primaryLabel?: string;
    menuLabel?: string;
}

export function Results({
    manifest,
    result,
    characters,
    playerNames,
    slot,
    rematchRequested,
    opponentWantsRematch,
    onRematch,
    onMenu,
    primaryLabel = 'Revanche',
    menuLabel = 'Menu principal'
}: ResultsProps): React.ReactElement {
    const animations = useMemo(() => animationsByKey(manifest), [manifest]);
    const winner = result.winner;
    const winnerCharacter = winner === null ? null : ROSTER[characters[winner]];

    const headline =
        winner === null
            ? 'Match nul'
            : slot === null
              ? `${playerNames[winner]} gagne`
              : winner === slot
                ? 'Victoire'
                : 'Défaite';

    return (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-ink/85 backdrop-blur-sm">
            <div className="panel panel-accent animate-rise w-full max-w-2xl p-8 text-center">
                <p className="label">Résultat du match</p>
                <h1
                    className={`display mt-1 text-6xl ${
                        winner === null ? 'text-text' : slot !== null && winner === slot ? 'text-good' : 'text-danger'
                    }`}
                >
                    {headline}
                </h1>

                {winnerCharacter ? (
                    <div className="mt-4 flex items-end justify-center gap-6">
                        <SpritePreview
                            texture={winnerCharacter.texture}
                            animation={animations.get(winnerCharacter.animations.idle)}
                            height={150}
                            scale={2.4}
                        />
                        <div className="pb-4 text-left">
                            <div className="display text-3xl" style={{ color: winnerCharacter.color }}>
                                {winnerCharacter.name}
                            </div>
                            <div className="label">{playerNames[winner!]}</div>
                        </div>
                    </div>
                ) : null}

                <div className="mt-6 grid grid-cols-2 gap-4 text-left">
                    <div>
                        <h3 className="label mb-1">Rounds</h3>
                        <ul className="space-y-1 text-sm">
                            {result.rounds.map((round) => (
                                <li key={round.round} className="flex justify-between border-b border-line/40 pb-1">
                                    <span>Round {round.round}</span>
                                    <span className="text-muted">
                                        {round.winner === null ? 'nul' : playerNames[round.winner]}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="label mb-1">Vitalité restante</h3>
                        <ul className="space-y-1 text-sm">
                            {[0, 1].map((index) => (
                                <li key={index} className="flex justify-between border-b border-line/40 pb-1">
                                    <span>{playerNames[index]}</span>
                                    <span className="text-muted">{result.health[index as 0 | 1]}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <button
                        type="button"
                        className={`btn flex-1 ${rematchRequested ? '' : 'btn-primary'}`}
                        onClick={onRematch}
                        disabled={rematchRequested}
                    >
                        {rematchRequested ? 'En attente de l’adversaire…' : primaryLabel}
                    </button>
                    <button type="button" className="btn flex-1" onClick={onMenu}>
                        {menuLabel}
                    </button>
                </div>
                {opponentWantsRematch && !rematchRequested ? (
                    <p className="label animate-pulse-accent mt-3">Ton adversaire veut sa revanche</p>
                ) : null}
            </div>
        </div>
    );
}
