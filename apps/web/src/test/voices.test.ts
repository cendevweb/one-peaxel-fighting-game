import { describe, expect, it } from 'vitest';
import { ROSTER } from '../characters';
import manifest from '../generated/voices.json';

/** Fighters left without voices on purpose. */
const SILENT = ['crocodile', 'zoro'];
/** The clips shipped in public/ (the glob only lists them, nothing is loaded). */
const FILES = new Set(Object.keys(import.meta.glob('../../public/audio/voices/**/*.{ogg,m4a}')).map((p) => p.replace('../../public/audio/voices/', '')));

describe('voices', () => {
    const clips = manifest as Record<string, Record<string, string[]>>;

    it('covers every voiced fighter with the four categories', () => {
        for (const c of ROSTER) {
            if (SILENT.includes(c.id)) continue;
            for (const category of ['select', 'win', 'ultimate', 'ultimateMax']) {
                expect(clips[c.id]?.[category]?.length ?? 0, `${c.id} ${category}`).toBeGreaterThan(0);
            }
        }
    });

    it('only names real fighters', () => {
        const ids = ROSTER.map((c) => c.id);
        for (const id of Object.keys(clips)) expect(ids).toContain(id);
    });

    it('ships every clip as Ogg and as AAC (Safari)', () => {
        for (const path of Object.values(clips).flatMap((c) => Object.values(c).flat())) {
            expect(FILES.has(`${path}.ogg`), path).toBe(true);
            expect(FILES.has(`${path}.m4a`), path).toBe(true);
        }
    });
});
