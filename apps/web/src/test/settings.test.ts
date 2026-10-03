import { describe, expect, it } from 'vitest';
import { DEFAULTS, VOLUME_DEFAULT, VOLUME_MAX, sanitize, volumeGain } from '../settings';

describe('settings', () => {
    it('falls back to the defaults on nothing stored', () => {
        expect(sanitize(null)).toEqual(DEFAULTS);
        expect(sanitize('garbage')).toEqual(DEFAULTS);
    });

    it('clamps and rounds what was stored, and drops what it does not know', () => {
        const s = sanitize({ master: 42, music: -3, sfx: 4.6, voice: 'loud', rounds: 9, versusRounds: 0, arcadeLevel: -1, shake: 'no', display: 'huge', extra: 1 });
        expect(s).toEqual({ ...DEFAULTS, master: VOLUME_MAX, music: 0, sfx: 5, rounds: 3, versusRounds: 1, arcadeLevel: 0 });
        expect('extra' in s).toBe(false);
    });

    it('keeps the original mix at the default gauge level, and silence at zero', () => {
        expect(volumeGain(VOLUME_DEFAULT)).toBe(1);
        expect(volumeGain(0)).toBe(0);
        for (let l = 1; l <= VOLUME_MAX; l++) expect(volumeGain(l)).toBeGreaterThan(volumeGain(l - 1));
    });
});
