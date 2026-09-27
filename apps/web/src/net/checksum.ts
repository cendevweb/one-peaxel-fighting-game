/**
 * Deep copy and hash of the match state, for rollback snapshots and desync
 * detection.
 *
 * MatchState is plain data (objects, arrays, numbers, strings, booleans,
 * null): no functions, class instances, Maps or cycles. `cloneState` relies on
 * that and is several times faster than structuredClone on it.
 */
import type { MatchState } from '../engine/types';

function cloneValue(v: unknown): unknown {
    if (v === null || typeof v !== 'object') return v;
    if (Array.isArray(v)) {
        const n = v.length;
        const out = new Array(n);
        for (let i = 0; i < n; i++) out[i] = cloneValue(v[i]);
        return out;
    }
    const out: Record<string, unknown> = {};
    for (const k in v as Record<string, unknown>) out[k] = cloneValue((v as Record<string, unknown>)[k]);
    return out;
}

export function cloneState(state: MatchState): MatchState {
    return cloneValue(state) as MatchState;
}

// ——— Hash: FNV-1a over a canonical walk of the state ———

const f64 = new Float64Array(1);
const u32 = new Uint32Array(f64.buffer);

/** 32-bit FNV-1a of one 32-bit word, byte by byte folded into two multiplies. */
function mix(h: number, w: number): number {
    h = Math.imul(h ^ (w & 0xffff), 0x01000193);
    h = Math.imul(h ^ (w >>> 16), 0x01000193);
    return h;
}

function hashValue(h: number, v: unknown): number {
    switch (typeof v) {
        case 'number':
            if (Number.isInteger(v) && v >= -0x80000000 && v <= 0x7fffffff) return mix(mix(h, 1), v | 0);
            // A few engine values are fractional (dash deceleration): hash the
            // exact float bits, which IEEE arithmetic makes identical everywhere.
            f64[0] = v;
            return mix(mix(mix(h, 2), u32[0]), u32[1]);
        case 'string': {
            h = mix(mix(h, 3), v.length);
            for (let i = 0; i < v.length; i++) h = mix(h, v.charCodeAt(i));
            return h;
        }
        case 'boolean':
            return mix(h, v ? 5 : 4);
        case 'undefined':
            return mix(h, 6);
        case 'object': {
            if (v === null) return mix(h, 7);
            if (Array.isArray(v)) {
                h = mix(mix(h, 8), v.length);
                for (const x of v) h = hashValue(h, x);
                return h;
            }
            h = mix(h, 9);
            const o = v as Record<string, unknown>;
            // Keys are hashed with their values, in insertion order: both peers
            // build the state with the same code, so the order is the same.
            for (const k in o) {
                h = hashValue(h, k);
                h = hashValue(h, o[k]);
            }
            return h;
        }
        default:
            throw new Error(`checksum: unexpected ${typeof v} in match state`);
    }
}

/** Unsigned 32-bit hash of the whole state. */
export function checksum(state: MatchState): number {
    return hashValue(0x811c9dc5, state) >>> 0;
}
