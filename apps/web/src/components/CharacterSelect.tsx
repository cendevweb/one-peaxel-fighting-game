'use client';

import { useMemo, useState } from 'react';
import { CHARACTER_LIST, METER_MAX, type CharacterDefinition } from '@opfg/combat-core';
import { animationsByKey, type AssetManifest } from '@/game/manifest';
import { SpritePreview } from './SpritePreview';

export interface CharacterSelectProps {
    manifest: AssetManifest;
    /** Character each slot has locked, keyed by slot. */
    picks: [string | null, string | null];
    ready: [boolean, boolean];
    playerNames: [string, string];
    /** Slot this browser controls; null means both (local match). */
    slot: 0 | 1 | null;
    onPick: (characterId: string) => void;
    onReady: (ready: boolean) => void;
    onBack: () => void;
    /** Shown instead of the ready button when the second seat is empty. */
    waitingFor?: string | null;
}

const statRows = (character: CharacterDefinition): Array<{ label: string; value: number; max: number }> => [
    { label: 'Vitalité', value: character.stats.maxHealth, max: 1100 },
    { label: 'Vitesse', value: character.stats.walkSpeed * 100, max: 360 },
    { label: 'Poids', value: character.stats.weight, max: 130 },
    {
        label: 'Portée',
        value: Math.max(...character.moves.map((move) => move.hitbox.x + move.hitbox.width)),
        max: 260
    }
];

function StatBar({ label, value, max }: { label: string; value: number; max: number }): React.ReactElement {
    return (
        <div className="flex items-center gap-3">
            <span className="label w-20 shrink-0">{label}</span>
            <div className="h-1.5 flex-1 bg-surface-3">
                <div
                    className="h-full bg-gradient-to-r from-accent to-accent-2"
                    style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
                />
            </div>
        </div>
    );
}

/**
 * Character select.
 *
 * Every fighter is shown animated, idling in its own tile, because a fighting
 * game's select screen is the first thing that tells a player the characters
 * are real. The panel on the right is honest about each one: the frame data
 * of its moves, and the gaps its source sprite sheet actually has.
 */
export function CharacterSelect({
    manifest,
    picks,
    ready,
    playerNames,
    slot,
    onPick,
    onReady,
    onBack,
    waitingFor
}: CharacterSelectProps): React.ReactElement {
    const animations = useMemo(() => animationsByKey(manifest), [manifest]);
    const mySlot = slot ?? 0;
    const myPick = picks[mySlot];
    const [hovered, setHovered] = useState<string | null>(null);
    const focused =
        CHARACTER_LIST.find((character) => character.id === (hovered ?? myPick)) ?? CHARACTER_LIST[0]!;
    const amReady = ready[mySlot];

    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 p-4 sm:p-8">
            <div className="flex items-end justify-between gap-4">
                <div>
                    <h1 className="display text-3xl sm:text-4xl">Choisis ton combattant</h1>
                    <p className="label mt-1">
                        {slot === null ? 'Partie locale' : `Tu joues ${playerNames[mySlot]}`}
                    </p>
                </div>
                <button type="button" className="btn" onClick={onBack}>
                    Retour
                </button>
            </div>

            <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr]">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                    {CHARACTER_LIST.map((character) => {
                        const pickedBy = picks
                            .map((pick, index) => (pick === character.id ? index : -1))
                            .filter((index) => index >= 0);
                        const mine = myPick === character.id;
                        return (
                            <button
                                key={character.id}
                                type="button"
                                onMouseEnter={() => setHovered(character.id)}
                                onMouseLeave={() => setHovered(null)}
                                onFocus={() => setHovered(character.id)}
                                onClick={() => !amReady && onPick(character.id)}
                                disabled={amReady}
                                className={`panel group relative flex h-48 flex-col items-center justify-end overflow-hidden p-2 transition-transform duration-150 ${
                                    mine ? 'panel-accent -translate-y-1' : 'hover:-translate-y-1'
                                } ${amReady ? 'cursor-not-allowed' : ''}`}
                                style={{
                                    background: mine
                                        ? `linear-gradient(180deg, ${character.color}22, var(--color-surface))`
                                        : undefined
                                }}
                            >
                                <SpritePreview
                                    texture={character.texture}
                                    animation={animations.get(character.animations.idle)}
                                    height={118}
                                    scale={2}
                                    className="pointer-events-none"
                                />
                                <span className="display mt-1 text-sm tracking-widest">{character.name}</span>
                                <span
                                    className="absolute inset-x-0 bottom-0 h-1"
                                    style={{ background: character.color }}
                                />
                                {pickedBy.length > 0 ? (
                                    <span className="absolute left-1.5 top-1.5 flex gap-1">
                                        {pickedBy.map((index) => (
                                            <span
                                                key={index}
                                                className="label bg-ink/80 px-1.5 py-0.5 text-[0.6rem] text-text"
                                            >
                                                P{index + 1}
                                            </span>
                                        ))}
                                    </span>
                                ) : null}
                            </button>
                        );
                    })}
                </div>

                <div className="panel flex flex-col gap-4 p-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="display text-3xl" style={{ color: focused.color }}>
                                {focused.name}
                            </h2>
                            <p className="mt-1 max-w-sm text-sm text-muted">{focused.tagline}</p>
                        </div>
                        <SpritePreview
                            texture={focused.texture}
                            animation={animations.get(focused.animations.idle)}
                            height={96}
                            scale={1.6}
                        />
                    </div>

                    <div className="space-y-2">
                        {statRows(focused).map((row) => (
                            <StatBar key={row.label} {...row} />
                        ))}
                    </div>

                    <div>
                        <h3 className="label mb-2">Coups</h3>
                        <div className="space-y-1">
                            {focused.moves
                                .filter((move) => !move.slot.startsWith('air'))
                                .map((move) => (
                                    <div
                                        key={move.id}
                                        className="flex items-baseline justify-between gap-3 border-b border-line/40 pb-1 text-sm last:border-0"
                                    >
                                        <span className="truncate">{move.name}</span>
                                        <span className="label shrink-0 text-[0.65rem]">
                                            {move.startup} f · {move.hit.damage} dmg
                                            {move.meterCost === METER_MAX ? ' · jauge pleine' : ''}
                                        </span>
                                    </div>
                                ))}
                        </div>
                    </div>

                    {focused.spriteNotes?.length ? (
                        <p className="border-l-2 border-line pl-3 text-xs leading-relaxed text-muted">
                            {focused.spriteNotes.join(' ')}
                        </p>
                    ) : null}

                    <div className="mt-auto flex items-center gap-3">
                        {waitingFor ? (
                            <span className="label animate-pulse-accent">{waitingFor}</span>
                        ) : (
                            <button
                                type="button"
                                className={`btn ${amReady ? '' : 'btn-primary'} flex-1`}
                                onClick={() => onReady(!amReady)}
                                disabled={!myPick}
                            >
                                {amReady ? 'Annuler' : 'Prêt'}
                            </button>
                        )}
                        <span className="label">
                            {ready[0] ? '● ' : '○ '}
                            {playerNames[0]} {' · '}
                            {ready[1] ? '● ' : '○ '}
                            {playerNames[1]}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
