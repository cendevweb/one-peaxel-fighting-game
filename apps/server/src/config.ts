import { NETWORK_DEFAULTS } from '@opfg/shared';

const int = (value: string | undefined, fallback: number): number => {
    const parsed = Number.parseInt(value ?? '', 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

/**
 * Every knob the deployment needs. `ALLOWED_ORIGINS` is the one that matters
 * in production: the web app is served from Vercel and the socket from Render,
 * so the browser treats the connection as cross-origin and will refuse it
 * unless the server names the site explicitly.
 */
export const config = {
    port: int(process.env.PORT, 8080),
    host: process.env.HOST ?? '0.0.0.0',
    allowedOrigins: (process.env.ALLOWED_ORIGINS ?? 'http://localhost:3000')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    inputDelay: int(process.env.INPUT_DELAY, NETWORK_DEFAULTS.inputDelay),
    snapshotInterval: int(process.env.SNAPSHOT_INTERVAL, NETWORK_DEFAULTS.snapshotInterval),
    reconnectGraceMs: int(process.env.RECONNECT_GRACE_MS, NETWORK_DEFAULTS.reconnectGraceMs),
    emptyRoomTtlMs: int(process.env.EMPTY_ROOM_TTL_MS, NETWORK_DEFAULTS.emptyRoomTtlMs),
    logLevel: process.env.LOG_LEVEL ?? 'info'
} as const;

export const originAllowed = (origin: string | undefined): boolean => {
    if (!origin) {
        return true; // Same-origin requests and non-browser clients.
    }
    if (config.allowedOrigins.includes('*')) {
        return true;
    }
    return config.allowedOrigins.some((allowed) => {
        if (allowed === origin) {
            return true;
        }
        // A single leading wildcard covers Vercel preview deployments, which
        // get a fresh hostname on every push.
        if (allowed.startsWith('https://*.')) {
            return origin.startsWith('https://') && origin.endsWith(allowed.slice('https://*'.length));
        }
        return false;
    });
};
