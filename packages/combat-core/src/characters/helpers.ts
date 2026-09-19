import type { HitProperties, MoveDefinition } from '../types.js';

/**
 * Small builders so a character file reads as frame data rather than as object
 * literals. Everything a move does is declared here; the engine has no
 * knowledge of any particular character.
 */

export const hit = (properties: Partial<HitProperties> & Pick<HitProperties, 'damage'>): HitProperties => ({
    chipDamage: Math.max(1, Math.round(properties.damage / 8)),
    hitstun: 16,
    blockstun: 10,
    knockbackX: 3,
    knockbackY: 0,
    hitstop: 7,
    meterGainOnHit: Math.round(properties.damage / 2),
    meterGainOnTakeHit: Math.round(properties.damage / 3),
    ...properties
});

export const move = (definition: MoveDefinition): MoveDefinition => {
    const last = definition.active[definition.active.length - 1];
    if (!last) {
        throw new Error(`Move "${definition.id}" has no active window.`);
    }
    if (definition.startup !== (definition.active[0]?.[0] ?? 0)) {
        throw new Error(`Move "${definition.id}": startup and first active frame disagree.`);
    }
    if (last[1] >= definition.duration) {
        throw new Error(`Move "${definition.id}" stays active past its last frame.`);
    }
    return definition;
};

/** Recovery is never authored: it is whatever is left after the last hit. */
export const recoveryOf = (definition: MoveDefinition): number => {
    const last = definition.active[definition.active.length - 1];
    return definition.duration - (last ? last[1] : 0) - 1;
};
