'use client';

import { useEffect, useRef, useState } from 'react';
import {
    METER_MAX,
    ROSTER,
    ROUNDS_TO_WIN,
    TICK_RATE,
    type MatchState
} from '@opfg/combat-core';
import type { FightBridge } from '@/game/bridge';

interface HudSnapshot {
    health: [number, number];
    maxHealth: [number, number];
    meter: [number, number];
    wins: [number, number];
    names: [string, string];
    seconds: number;
    round: number;
    phase: MatchState['phase'];
    combo: { slot: 0 | 1; hits: number; damage: number } | null;
}

const read = (state: MatchState | null): HudSnapshot | null => {
    if (!state) {
        return null;
    }
    const first = ROSTER[state.fighters[0].characterId];
    const second = ROSTER[state.fighters[1].characterId];
    if (!first || !second) {
        return null;
    }
    const victim = state.fighters[0].comboHits > 1 ? 0 : state.fighters[1].comboHits > 1 ? 1 : null;
    return {
        health: [state.fighters[0].health, state.fighters[1].health],
        maxHealth: [first.stats.maxHealth, second.stats.maxHealth],
        meter: [state.fighters[0].meter, state.fighters[1].meter],
        wins: [state.fighters[0].wins, state.fighters[1].wins],
        names: [first.name, second.name],
        seconds: Math.ceil(state.timer / TICK_RATE),
        round: state.round,
        phase: state.phase,
        combo:
            victim === null
                ? null
                : {
                      slot: victim === 0 ? 1 : 0,
                      hits: state.fighters[victim].comboHits,
                      damage: state.fighters[victim].comboDamage
                  }
    };
};

/** A health bar with a slower red trail behind it, so a combo reads as one
 *  long hit rather than as a bar that teleports. */
function HealthBar({ value, max, mirrored }: { value: number; max: number; mirrored: boolean }): React.ReactElement {
    const [trail, setTrail] = useState(value);
    useEffect(() => {
        if (value >= trail) {
            setTrail(value);
            return;
        }
        const timer = setTimeout(() => setTrail((current) => Math.max(value, current - Math.max(2, (current - value) * 0.18))), 30);
        return () => clearTimeout(timer);
    }, [value, trail]);

    const ratio = Math.max(0, Math.min(1, value / max));
    const trailRatio = Math.max(0, Math.min(1, trail / max));
    const low = ratio < 0.25;

    return (
        <div
            className="relative h-6 w-full overflow-hidden border border-line bg-[#0a0d16]"
            style={{ transform: mirrored ? 'scaleX(-1)' : undefined }}
        >
            <div
                className="absolute inset-y-0 left-0 bg-danger/70 transition-[width] duration-200 ease-linear"
                style={{ width: `${trailRatio * 100}%` }}
            />
            <div
                className={`absolute inset-y-0 left-0 transition-[width] duration-75 ease-linear ${
                    low ? 'bg-gradient-to-r from-danger to-accent animate-pulse-accent' : 'bg-gradient-to-r from-accent to-accent-2'
                }`}
                style={{ width: `${ratio * 100}%` }}
            />
            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    backgroundImage:
                        'repeating-linear-gradient(90deg, rgba(0,0,0,0.28) 0 1px, transparent 1px 12px)'
                }}
            />
        </div>
    );
}

function MeterBar({ value, mirrored }: { value: number; mirrored: boolean }): React.ReactElement {
    const ratio = Math.max(0, Math.min(1, value / METER_MAX));
    const full = ratio >= 1;
    return (
        <div
            className="relative h-2.5 w-2/3 overflow-hidden border border-line/80 bg-[#0a0d16]"
            style={{ transform: mirrored ? 'scaleX(-1)' : undefined }}
        >
            <div
                className={`absolute inset-y-0 left-0 ${full ? 'bg-accent-2 animate-pulse-accent' : 'bg-cool'}`}
                style={{ width: `${ratio * 100}%` }}
            />
        </div>
    );
}

function RoundPips({ wins, mirrored }: { wins: number; mirrored: boolean }): React.ReactElement {
    return (
        <div className={`flex gap-1.5 ${mirrored ? 'flex-row-reverse' : ''}`}>
            {Array.from({ length: ROUNDS_TO_WIN }, (_, index) => (
                <span
                    key={index}
                    className={`block h-2.5 w-2.5 rotate-45 border ${
                        index < wins ? 'border-accent-2 bg-accent-2' : 'border-line bg-transparent'
                    }`}
                />
            ))}
        </div>
    );
}

export interface HudProps {
    bridge: FightBridge;
    playerNames: [string, string];
    /** Slot this browser controls, or null in a local match. */
    slot: 0 | 1 | null;
}

/**
 * The combat interface.
 *
 * It samples the bridge on an animation frame and re-renders at most twenty
 * times a second. The arena runs at sixty; pushing a React render into every
 * one of those frames is how a fighting game ends up dropping inputs.
 */
export function Hud({ bridge, playerNames, slot }: HudProps): React.ReactElement | null {
    const [snapshot, setSnapshot] = useState<HudSnapshot | null>(null);
    const lastRef = useRef(0);

    useEffect(() => {
        let raf = 0;
        const loop = (now: number): void => {
            if (now - lastRef.current > 50) {
                lastRef.current = now;
                setSnapshot(read(bridge.state));
            }
            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(raf);
    }, [bridge]);

    if (!snapshot) {
        return null;
    }

    const announcement =
        snapshot.phase === 'intro'
            ? `Round ${snapshot.round}`
            : snapshot.phase === 'ko'
              ? 'K.O.'
              : snapshot.phase === 'matchEnd'
                ? 'Match terminé'
                : null;

    return (
        <div className="pointer-events-none absolute inset-0 flex flex-col">
            {/* A scrim under the top row: a bright stage washes the names out
                otherwise, and the HUD has to stay readable on all six. */}
            <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-ink/85 via-ink/45 to-transparent" />

            <div className="relative flex items-start gap-3 p-3 sm:gap-6 sm:p-5">
                {[0, 1].map((index) => {
                    const mirrored = index === 1;
                    const isYou = slot === index;
                    return (
                        <div key={index} className={`flex-1 ${mirrored ? 'text-right' : ''}`}>
                            <div className={`mb-1 flex items-center gap-2 ${mirrored ? 'flex-row-reverse' : ''}`}>
                                <span className="display text-base leading-none drop-shadow-[0_2px_0_rgba(0,0,0,0.75)] sm:text-lg">
                                    {snapshot.names[index]}
                                </span>
                                <span className={`label truncate drop-shadow-[0_1px_0_rgba(0,0,0,0.75)] ${isYou ? 'text-accent' : ''}`}>
                                    {playerNames[index]}
                                    {isYou ? ' · toi' : ''}
                                </span>
                                <RoundPips wins={snapshot.wins[index] ?? 0} mirrored={mirrored} />
                            </div>
                            <HealthBar
                                value={snapshot.health[index] ?? 0}
                                max={snapshot.maxHealth[index] ?? 1}
                                mirrored={mirrored}
                            />
                            <div className={`mt-1 flex ${mirrored ? 'justify-end' : ''}`}>
                                <MeterBar value={snapshot.meter[index] ?? 0} mirrored={mirrored} />
                            </div>
                        </div>
                    );
                })}

                <div className="panel panel-accent flex h-16 w-20 shrink-0 flex-col items-center justify-center">
                    <span className="display text-3xl leading-none tabular-nums">{snapshot.seconds}</span>
                    <span className="label mt-0.5 text-[0.6rem]">Round {snapshot.round}</span>
                </div>
            </div>

            {snapshot.combo && snapshot.combo.hits > 1 ? (
                <div
                    className={`animate-rise mt-2 px-6 ${snapshot.combo.slot === 1 ? 'self-end text-right' : 'self-start'}`}
                >
                    <div className="display text-accent-2 text-4xl leading-none drop-shadow-[0_2px_0_rgba(0,0,0,0.6)]">
                        {snapshot.combo.hits} <span className="text-xl text-text">coups</span>
                    </div>
                    <div className="label">{snapshot.combo.damage} dégâts</div>
                </div>
            ) : null}

            {announcement ? (
                <div className="flex flex-1 items-center justify-center">
                    <span className="display animate-rise text-6xl tracking-[0.2em] text-text drop-shadow-[0_4px_0_rgba(0,0,0,0.7)] sm:text-8xl">
                        {announcement}
                    </span>
                </div>
            ) : null}
        </div>
    );
}
