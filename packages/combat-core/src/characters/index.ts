import type { CharacterDefinition } from '../types.js';
import type { CharacterRoster } from '../engine.js';
import { luffy } from './luffy.js';
import { lucci } from './lucci.js';
import { crocodile } from './crocodile.js';
import { enel } from './enel.js';

/** Order shown on the select screen. */
export const CHARACTER_LIST: readonly CharacterDefinition[] = [luffy, lucci, crocodile, enel];

export const ROSTER: CharacterRoster = Object.freeze(
    Object.fromEntries(CHARACTER_LIST.map((character) => [character.id, character]))
);

export const CHARACTER_IDS: readonly string[] = CHARACTER_LIST.map((character) => character.id);

export const DEFAULT_CHARACTER = luffy.id;

export const isCharacterId = (value: unknown): value is string =>
    typeof value === 'string' && Object.prototype.hasOwnProperty.call(ROSTER, value);

export { luffy, lucci, crocodile, enel };
export * from './helpers.js';
