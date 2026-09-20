import { describe, expect, it } from 'vitest';
import { originMatches } from './config.js';

/**
 * The allowlist is the only thing standing between a working deployment and a
 * client that reports the server as unreachable, and every rule here exists
 * because the failure it prevents is invisible: the browser refuses the socket
 * and the page has no way to say why.
 */
describe('originMatches', () => {
    it('accepts an exact origin', () => {
        expect(originMatches('https://opfg.vercel.app', 'https://opfg.vercel.app')).toBe(true);
    });

    it('accepts an origin whose allowlist entry was pasted with a trailing slash', () => {
        // What an address bar gives you, and the single most likely way to fill
        // ALLOWED_ORIGINS in wrongly while believing it is right.
        expect(originMatches('https://opfg.vercel.app', 'https://opfg.vercel.app/')).toBe(true);
    });

    it('ignores case, which a browser normalizes and a human does not', () => {
        expect(originMatches('https://opfg.vercel.app', 'https://OPFG.Vercel.App')).toBe(true);
    });

    it('covers preview deployments through a leading wildcard', () => {
        expect(originMatches('https://opfg-git-main-dylan.vercel.app', 'https://*.vercel.app')).toBe(true);
    });

    it('does not let a wildcard match the bare suffix', () => {
        expect(originMatches('https://.vercel.app', 'https://*.vercel.app')).toBe(false);
    });

    it('does not let a wildcard match a lookalike domain', () => {
        // The dot belongs to the suffix: without it, `evil-vercel.app` passes.
        expect(originMatches('https://evil-vercel.app', 'https://*.vercel.app')).toBe(false);
    });

    it('keeps the scheme significant', () => {
        expect(originMatches('http://opfg.vercel.app', 'https://opfg.vercel.app')).toBe(false);
        expect(originMatches('http://opfg-x.vercel.app', 'https://*.vercel.app')).toBe(false);
    });

    it('refuses an unrelated origin', () => {
        expect(originMatches('https://elsewhere.example', 'https://opfg.vercel.app')).toBe(false);
    });

    it('accepts everything behind a star', () => {
        expect(originMatches('https://anything.example', '*')).toBe(true);
    });
});
