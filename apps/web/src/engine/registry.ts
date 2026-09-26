import type { CharacterDef } from './types';

/**
 * The characters the engine knows about. Filled once at start-up by
 * `characters/index.ts`; the engine itself imports no character.
 */
const registry = new Map<string, CharacterDef>();

export function registerCharacter(def: CharacterDef): void {
    registry.set(def.id, def);
}

export function getChar(id: string): CharacterDef {
    const def = registry.get(id);
    if (!def) throw new Error(`Unknown character: ${id}`);
    return def;
}

export const allCharacters = (): CharacterDef[] => [...registry.values()];
