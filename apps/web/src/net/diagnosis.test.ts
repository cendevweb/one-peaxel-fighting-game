import { describe, expect, it } from 'vitest';
import { connectionDiagnosis } from './diagnosis';

/**
 * Three deployments fail in ways that look identical from the page — "server
 * unreachable" — and two of them are settings rather than outages. These are
 * the rules that tell them apart.
 */
describe('connectionDiagnosis', () => {
    it('names a client compiled without a server address', () => {
        const message = connectionDiagnosis('http://localhost:8080', 'https://opfg.vercel.app');
        expect(message).toContain('NEXT_PUBLIC_GAME_SERVER_URL');
    });

    it('says nothing about localhost when the page is itself local', () => {
        expect(connectionDiagnosis('http://localhost:8080', 'http://localhost:3000')).toBeNull();
    });

    it('names blocked mixed content', () => {
        const message = connectionDiagnosis('http://opfg-game-server.onrender.com', 'https://opfg.vercel.app');
        expect(message).toContain('https://');
        expect(message).toContain('non chiffrée');
    });

    it('stays silent when the addresses are consistent, leaving the cause to the server', () => {
        // A correctly configured client that still cannot connect is either
        // talking to a dead server or being refused by its allowlist, and the
        // page cannot tell which without asking.
        expect(connectionDiagnosis('https://opfg-game-server.onrender.com', 'https://opfg.vercel.app')).toBeNull();
    });

    it('reports an address that is not a URL at all', () => {
        expect(connectionDiagnosis('opfg-game-server.onrender.com', 'https://opfg.vercel.app')).toContain('invalide');
    });
});
