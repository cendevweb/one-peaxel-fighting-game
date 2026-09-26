import { registerCharacter } from '../engine/registry';
import type { CharacterDef } from '../engine/types';

/**
 * Every `characters/<id>.ts` exporting a CharacterDef joins the roster by
 * itself; ORDER only decides the select-screen order.
 */
const ORDER = ['luffy', 'enel', 'lucci', 'crocodile', 'akainu'];

const modules = import.meta.glob<Record<string, unknown>>('./*.ts', { eager: true });

const found: CharacterDef[] = [];
for (const [path, mod] of Object.entries(modules)) {
    if (path.endsWith('/index.ts')) continue;
    for (const value of Object.values(mod)) {
        const def = value as CharacterDef;
        if (def && typeof def === 'object' && 'moves' in def && 'manifest' in def) found.push(def);
    }
}

export const ROSTER: CharacterDef[] = found.sort(
    (a, b) => (ORDER.indexOf(a.id) + 1 || 99) - (ORDER.indexOf(b.id) + 1 || 99)
);

for (const def of ROSTER) registerCharacter(def);
