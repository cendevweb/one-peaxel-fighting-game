/**
 * Fingerprint of the simulation this build runs, exchanged in `hello`.
 *
 * PROTOCOL_VERSION only changes when someone remembers to bump it; a player
 * with a cached older page and one with the new deploy would otherwise meet,
 * run different `stepMatch`es and desync at the first difference. The
 * fingerprint hashes every fighter's data (moves, frame data, sprite boxes)
 * and the outcome of a short scripted fight for each fighter, which changes
 * whenever the engine's behaviour does. A few milliseconds, computed once.
 */
import { ROSTER } from '../characters';
import { createMatch, stepMatch } from '../engine/match';
import { BTN } from '../engine/types';
import { checksum } from './checksum';

let cached: number | null = null;

function hashString(h: number, s: string): number {
    for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193);
    return h;
}

export function buildFingerprint(): number {
    if (cached !== null) return cached;
    let h = 0x811c9dc5;
    for (const def of ROSTER) h = hashString(h, JSON.stringify(def));
    // Scripted fights: fixed pseudo-random inputs (bits 0..6 and the
    // ultimate key, no start).
    let seed = 12345;
    const next = () => {
        seed = (Math.imul(seed, 1103515245) + 12345) >>> 0;
        const r = (seed >>> 16) & 0xff;
        return (r & 0x7f) | (r & 0x80 ? BTN.ultimate : 0);
    };
    for (let i = 0; i < ROSTER.length; i++) {
        const st = createMatch(ROSTER[i].id, ROSTER[(i + 1) % ROSTER.length].id);
        let a = 0;
        let b = 0;
        for (let f = 0; f < 400; f++) {
            if (f % 6 === 0) { a = next(); b = next(); }
            stepMatch(st, [a, b]);
        }
        h = Math.imul(h ^ checksum(st), 0x01000193);
    }
    cached = h >>> 0;
    return cached;
}
