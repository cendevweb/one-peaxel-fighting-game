import { describe, expect, it } from 'vitest';
import { buildFingerprint } from '../net/fingerprint';

describe('build fingerprint', () => {
    it('is a stable 32-bit number, quick to compute', () => {
        const t0 = performance.now();
        const a = buildFingerprint();
        const ms = performance.now() - t0;
        expect(Number.isInteger(a) && a >= 0 && a <= 0xffffffff).toBe(true);
        expect(buildFingerprint()).toBe(a);
        expect(ms).toBeLessThan(500);
    });
});
