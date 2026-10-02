/**
 * Player settings, kept in the browser (localStorage) between visits.
 *
 * Nothing here is read by the engine: volumes, screen shake, rumble and the
 * display scale only change what the view and the speakers do. The two that
 * shape a match (rounds to win, default CPU level) only apply offline; the
 * online fight keeps its fixed rules, so both players always agree.
 */

/** Volume gauges run from 0 (cut) to VOLUME_MAX in whole steps. */
export const VOLUME_MAX = 10;
/** The gauge level that plays at the game's original mix. */
export const VOLUME_DEFAULT = 8;

export type DisplayMode = 'sharp' | 'stretch';

export interface Settings {
    master: number;
    music: number;
    sfx: number;
    voice: number;
    /** Rounds needed to win an offline match (1 to 3). */
    rounds: number;
    /** CPU level preselected in VERSUS ORDINATEUR (index into LEVELS). */
    cpuLevel: number;
    shake: boolean;
    rumble: boolean;
    /** sharp: whole-pixel scaling only; stretch: fill the window. */
    display: DisplayMode;
}

export const DEFAULTS: Readonly<Settings> = {
    master: VOLUME_DEFAULT, music: VOLUME_DEFAULT, sfx: VOLUME_DEFAULT, voice: VOLUME_DEFAULT,
    rounds: 2, cpuLevel: 2, shake: true, rumble: true, display: 'sharp'
};

const KEY = 'opfg.settings';

const clampInt = (v: unknown, lo: number, hi: number, fallback: number): number =>
    typeof v === 'number' && Number.isFinite(v) ? Math.max(lo, Math.min(hi, Math.round(v))) : fallback;

/** Whatever was stored, made safe: unknown keys dropped, values clamped. */
export function sanitize(raw: unknown): Settings {
    const r = (raw && typeof raw === 'object' ? raw : {}) as Partial<Record<keyof Settings, unknown>>;
    const d = DEFAULTS;
    return {
        master: clampInt(r.master, 0, VOLUME_MAX, d.master),
        music: clampInt(r.music, 0, VOLUME_MAX, d.music),
        sfx: clampInt(r.sfx, 0, VOLUME_MAX, d.sfx),
        voice: clampInt(r.voice, 0, VOLUME_MAX, d.voice),
        rounds: clampInt(r.rounds, 1, 3, d.rounds),
        cpuLevel: clampInt(r.cpuLevel, 0, 4, d.cpuLevel),
        shake: typeof r.shake === 'boolean' ? r.shake : d.shake,
        rumble: typeof r.rumble === 'boolean' ? r.rumble : d.rumble,
        display: r.display === 'stretch' || r.display === 'sharp' ? r.display : d.display
    };
}

function load(): Settings {
    try {
        const text = typeof localStorage !== 'undefined' ? localStorage.getItem(KEY) : null;
        return sanitize(text ? JSON.parse(text) : null);
    } catch {
        // Private browsing, blocked storage or a corrupt entry: defaults.
        return sanitize(null);
    }
}

/** The live settings. Change them through `updateSettings`. */
export const settings: Settings = load();

const listeners: ((s: Readonly<Settings>) => void)[] = [];

/** Called now and after every change (the audio mix, the canvas scale). */
export function onSettings(fn: (s: Readonly<Settings>) => void): void {
    listeners.push(fn);
    fn(settings);
}

export function updateSettings(patch: Partial<Settings>): void {
    Object.assign(settings, sanitize({ ...settings, ...patch }));
    try {
        if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, JSON.stringify(settings));
    } catch { /* not saved, still applied */ }
    for (const fn of listeners) fn(settings);
}

export function resetSettings(): void {
    updateSettings({ ...DEFAULTS });
}

/**
 * Gain multiplier for a gauge level. Squared, so each step sounds about as
 * big as the last (loudness is not linear); 1 at VOLUME_DEFAULT.
 */
export const volumeGain = (level: number): number => (level / VOLUME_DEFAULT) ** 2;
