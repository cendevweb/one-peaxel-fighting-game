import { describe, expect, it } from 'vitest';
import { netSimFrom } from '../net/transport';

describe('netSimFrom (test hook)', () => {
    it('is off without parameters', () => {
        expect(netSimFrom('')).toBeNull();
        expect(netSimFrom('?peer=127.0.0.1:9000&salon=ABCDEF')).toBeNull();
    });
    it('reads lag, jitter and loss, and caps loss', () => {
        expect(netSimFrom('?netlag=80&netjitter=20&netloss=0.1')).toEqual({ lag: 80, jitter: 20, loss: 0.1 });
        expect(netSimFrom('?netloss=5')).toEqual({ lag: 0, jitter: 0, loss: 0.9 });
        expect(netSimFrom('?netlag=-3&netloss=abc')).toBeNull();
    });
});
