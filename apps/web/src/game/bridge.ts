'use client';

import type { CombatEvent, MatchState } from '@opfg/combat-core';

/**
 * The single object React and Phaser share.
 *
 * React never reaches into the scene and the scene never re-renders React:
 * the driver writes the current state here every frame, the scene reads it,
 * and the HUD subscribes to a throttled copy. Without this, every hit would
 * push a React render into the middle of the render loop.
 */
export interface FightBridge {
    state: MatchState | null;
    events: CombatEvent[];
    /** Set by the driver; the scene calls it once per rendered frame. */
    tick: ((deltaMs: number) => void) | null;
    showHitboxes: boolean;
    paused: boolean;
}

export const createBridge = (): FightBridge => ({
    state: null,
    events: [],
    tick: null,
    showHitboxes: false,
    paused: false
});
