import { config } from './config.js';

const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 } as const;
type Level = keyof typeof LEVELS;

const threshold = LEVELS[(config.logLevel as Level) in LEVELS ? (config.logLevel as Level) : 'info'];

/** One line per event, prefixed by the room it belongs to: enough to follow a
 *  match after the fact without drowning the output at 60 frames a second. */
export const log = (level: Level, message: string, fields: Record<string, unknown> = {}): void => {
    if (LEVELS[level] > threshold) {
        return;
    }
    const parts = Object.entries(fields).map(([key, value]) => `${key}=${String(value)}`);
    const line = `${new Date().toISOString()} ${level.toUpperCase().padEnd(5)} ${message}${parts.length ? ` ${parts.join(' ')}` : ''}`;
    if (level === 'error') {
        console.error(line);
    } else if (level === 'warn') {
        console.warn(line);
    } else {
        console.log(line);
    }
};
