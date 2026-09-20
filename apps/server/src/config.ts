import { NETWORK_DEFAULTS } from '@opfg/shared';

const int = (value: string | undefined, fallback: number): number => {
    const parsed = Number.parseInt(value ?? '', 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

/**
 * An origin, as the two sides of a comparison should see it.
 *
 * A browser sends `https://site.example` with no trailing slash and no path,
 * always lowercase. A human filling in `ALLOWED_ORIGINS` on a dashboard pastes
 * whatever the address bar gave them, which is usually `https://site.example/`
 * and sometimes carries a capital. Comparing the two raw strings then fails on
 * a configuration that is, to the eye, correct — and the only symptom is a
 * refused socket, which the client can only report as an unreachable server.
 */
const normalizeOrigin = (value: string): string => value.trim().replace(/\/+$/, '').toLowerCase();

const DEFAULT_ORIGINS = 'http://localhost:3000';

/**
 * Every knob the deployment needs. `ALLOWED_ORIGINS` is the one that matters
 * in production: the web app is served from Vercel and the socket from Render,
 * so the browser treats the connection as cross-origin and will refuse it
 * unless the server names the site explicitly.
 */
export const config = {
    port: int(process.env.PORT, 8080),
    host: process.env.HOST ?? '0.0.0.0',
    allowedOrigins: (process.env.ALLOWED_ORIGINS ?? DEFAULT_ORIGINS)
        .split(',')
        .map(normalizeOrigin)
        .filter(Boolean),
    /** True when nobody set `ALLOWED_ORIGINS` and the list above is the local
     *  default. In production that is a misconfiguration, not a choice. */
    originsAreDefault: !process.env.ALLOWED_ORIGINS?.trim(),
    inputDelay: int(process.env.INPUT_DELAY, NETWORK_DEFAULTS.inputDelay),
    snapshotInterval: int(process.env.SNAPSHOT_INTERVAL, NETWORK_DEFAULTS.snapshotInterval),
    reconnectGraceMs: int(process.env.RECONNECT_GRACE_MS, NETWORK_DEFAULTS.reconnectGraceMs),
    emptyRoomTtlMs: int(process.env.EMPTY_ROOM_TTL_MS, NETWORK_DEFAULTS.emptyRoomTtlMs),
    logLevel: process.env.LOG_LEVEL ?? 'info'
} as const;

/**
 * Whether one origin is covered by one allowlist entry. Pure, and exported so
 * the rules can be tested without standing a server up.
 *
 * Both sides are normalized here rather than only at the call site: the
 * function is the whole rule, and one that silently depended on its caller
 * having cleaned the allowlist first would be the kind of trap it exists to
 * remove.
 */
export const originMatches = (origin: string, allowed: string): boolean => {
    const entry = normalizeOrigin(allowed);
    if (entry === '*') {
        return true;
    }
    const wanted = normalizeOrigin(origin);
    if (entry === wanted) {
        return true;
    }
    // A single leading wildcard covers Vercel preview deployments, which get a
    // fresh hostname on every push. `https://*.vercel.app` must match
    // `https://x-y.vercel.app` and not `https://evil-vercel.app`, so the dot
    // is part of the suffix being compared.
    const wildcard = /^(https?:\/\/)\*(\..+)$/.exec(entry);
    if (!wildcard) {
        return false;
    }
    const scheme = wildcard[1] ?? '';
    const suffix = wildcard[2] ?? '';
    // The length test is what stops `https://.vercel.app` — a suffix with no
    // label in front of it — from passing as a subdomain.
    return (
        wanted.startsWith(scheme) && wanted.endsWith(suffix) && wanted.length > scheme.length + suffix.length
    );
};

export const originAllowed = (origin: string | undefined): boolean => {
    if (!origin) {
        return true; // Same-origin requests and non-browser clients.
    }
    return config.allowedOrigins.some((allowed) => originMatches(origin, allowed));
};
