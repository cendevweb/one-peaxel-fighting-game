import { BTN, type GameEvent } from '../engine/types';
import { PAD_LABELS, assignSlots, familyOf, padToBits, readPad, type PadFamily } from './gamepad';

/**
 * Keyboard and gamepads, turned into the engine's button bits once per tick.
 *
 * Keys are matched by `KeyboardEvent.code`, which names the physical key: the
 * same four keys move the fighter on QWERTY (WASD) and AZERTY (ZQSD).
 */

export interface KeyBinding {
    up: string[];
    down: string[];
    left: string[];
    right: string[];
    light: string[];
    heavy: string[];
    special: string[];
    /** Shortcuts: both buttons at once. */
    throwKey: string[];
    ultimate: string[];
    /** L + H + S: the second ultimate. */
    ultimate2: string[];
    start: string[];
}

/**
 * Two players share one keyboard: J1 on the left half (WASD/ZQSD, attacks on
 * C V B under F G H), J2 on the right half (arrows, attacks on J K L under
 * U I O, or the numpad). When only one person plays, both halves drive them.
 */
export const KEYS: [KeyBinding, KeyBinding] = [
    {
        up: ['KeyW'], down: ['KeyS'], left: ['KeyA'], right: ['KeyD'],
        light: ['KeyC'], heavy: ['KeyV'], special: ['KeyB'],
        throwKey: ['KeyF'], ultimate: ['KeyG'], ultimate2: ['KeyH'], start: ['Escape']
    },
    {
        up: ['ArrowUp'], down: ['ArrowDown'], left: ['ArrowLeft'], right: ['ArrowRight'],
        light: ['KeyJ', 'Numpad1'], heavy: ['KeyK', 'Numpad2'], special: ['KeyL', 'Numpad3'],
        throwKey: ['KeyU', 'Numpad4'], ultimate: ['KeyI', 'Numpad5'], ultimate2: ['KeyO', 'Numpad6'], start: ['Backspace']
    }
];

const down = new Set<string>();
/** Keys pressed since the last menu poll, so a quick tap is never missed. */
const tapped = new Set<string>();
/** Keys pressed since the last game tick: a press and release that both
 *  land between two ticks still counts as held for one tick. */
const gameTaps = new Set<string>();

window.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    down.add(e.code);
    tapped.add(e.code);
    gameTaps.add(e.code);
    if (e.code.startsWith('Arrow') || e.code === 'Space' || e.code === 'Tab') e.preventDefault();
});
window.addEventListener('keyup', (e) => down.delete(e.code));
window.addEventListener('blur', () => down.clear());

const any = (codes: string[]) => codes.some((c) => down.has(c));
const anyGame = (codes: string[]) => codes.some((c) => down.has(c) || gameTaps.has(c));

/** Call once per game tick, after reading both sides. */
export function endInputTick(): void {
    gameTaps.clear();
}

/** Layout-aware label for a physical key, e.g. KeyW → "Z" on AZERTY. */
const labels = new Map<string, string>();
const kb = (navigator as unknown as { keyboard?: { getLayoutMap(): Promise<Map<string, string>> } }).keyboard;
kb?.getLayoutMap().then((map) => {
    map.forEach((v, k) => labels.set(k, v.toUpperCase()));
}).catch(() => { /* not supported: fall back to QWERTY names */ });

export function keyLabel(code: string): string {
    const l = labels.get(code);
    if (l) return l;
    if (code.startsWith('Key')) return code.slice(3);
    if (code.startsWith('Numpad')) return `PAVÉ ${code.slice(6)}`;
    if (code.startsWith('Digit')) return code.slice(5);
    const names: Record<string, string> = {
        ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→', Escape: 'ÉCHAP', Enter: 'ENTRÉE',
        Space: 'ESPACE', Backspace: 'RETOUR', Comma: ',', Period: '.', Slash: '/'
    };
    return names[code] ?? code;
}

// ——— Gamepads ———

/** Which gamepad index drives each side; -1 when none. */
export const padOf: [number, number] = [-1, -1];

function pads(): (Gamepad | null)[] {
    try {
        return navigator.getGamepads ? [...navigator.getGamepads()] : [];
    } catch {
        return []; // blocked by a permissions policy
    }
}

function padAt(index: number): Gamepad | null {
    return index >= 0 ? pads()[index] ?? null : null;
}

function padBits(index: number): number {
    const p = padAt(index);
    return p ? padToBits(readPad(p)) : 0;
}

/** The pad family on a side, or null when that side has no pad. */
export function padFamily(side: 0 | 1): PadFamily | null {
    const p = padAt(padOf[side]);
    return p ? familyOf(p.id) : null;
}

/** Last pad plugged or unplugged, shown briefly on screen by the app. */
export const padNotice = { text: '', at: 0 };

/** Re-read which pads are plugged in; called once per tick by pollMenu.
 *  Browsers only list a pad once one of its buttons has been pressed. */
function refreshPads(): void {
    const list = pads();
    const next = assignSlots(padOf, list);
    for (const side of [0, 1] as const) {
        if (next[side] === padOf[side]) continue;
        const p = list[next[side]];
        if (p) padNotice.text = `MANETTE ${PAD_LABELS[familyOf(p.id)].name} : J${side + 1}`;
        else padNotice.text = `MANETTE J${side + 1} DÉBRANCHÉE`;
        padNotice.at = performance.now();
        padFresh[side] = true;
        padOf[side] = next[side];
    }
}

/** A short rumble on a side's pad, where the browser supports it. */
export function rumble(side: 0 | 1, strong: number, ms: number): void {
    const act = (padAt(padOf[side]) as (Gamepad & { vibrationActuator?: { playEffect?(t: string, o: object): Promise<unknown> } }) | null)?.vibrationActuator;
    act?.playEffect?.('dual-rumble', { duration: ms, strongMagnitude: strong, weakMagnitude: Math.min(1, strong + 0.2) })?.catch(() => { /* unsupported */ });
}

/** The engine bits held right now by a side. */
export function readSide(side: 0 | 1): number {
    const k = KEYS[side];
    let bits = 0;
    if (anyGame(k.up)) bits |= BTN.up;
    if (anyGame(k.down)) bits |= BTN.down;
    if (anyGame(k.left)) bits |= BTN.left;
    if (anyGame(k.right)) bits |= BTN.right;
    if (anyGame(k.light)) bits |= BTN.light;
    if (anyGame(k.heavy)) bits |= BTN.heavy;
    if (anyGame(k.special)) bits |= BTN.special;
    if (anyGame(k.throwKey)) bits |= BTN.light | BTN.heavy;
    if (anyGame(k.ultimate)) bits |= BTN.ultimate;
    if (anyGame(k.ultimate2)) bits |= BTN.light | BTN.heavy | BTN.special;
    if (anyGame(k.start)) bits |= BTN.start;
    if (padOf[side] >= 0) bits |= padBits(padOf[side]);
    return bits;
}

/** One person at the controls (arcade, versus CPU, training, online): every
 *  key set and the first pad all drive them. */
export function readSolo(): number {
    return readSide(0) | readSide(1);
}

/** Rumble the pads in `slots` when fighter `side` gets hit or knocked out. */
export function rumbleOn(events: readonly GameEvent[], side: number, slots: readonly (0 | 1)[]): void {
    for (const e of events) {
        let strong = 0, ms = 0;
        if (e.type === 'hit' && e.attacker !== side) { strong = e.heavy ? 0.6 : 0.3; ms = e.heavy ? 160 : 90; }
        if (e.type === 'ko' && e.side === side) { strong = 1; ms = 450; }
        if (ms) for (const slot of slots) rumble(slot, strong, ms);
    }
}

// ——— Menus ———

export type MenuAction = 'up' | 'down' | 'left' | 'right' | 'confirm' | 'back' | 'start';

export interface MenuInput {
    side: 0 | 1;
    action: MenuAction;
}

const prevPad: [number, number] = [0, 0];
/** The press that makes a browser reveal a pad must not also act in a menu. */
const padFresh: [boolean, boolean] = [false, false];
const padIgnore: [number, number] = [0, 0];
const PAD_UP = 1, PAD_DOWN = 2, PAD_LEFT = 4, PAD_RIGHT = 8, PAD_OK = 16, PAD_BACK = 32, PAD_START = 64;
const repeat: Record<string, number> = {};

/**
 * Menu actions since the last call: edges, plus auto-repeat on held
 * directions. Enter confirms and Escape backs out for either side.
 */
export function pollMenu(): MenuInput[] {
    refreshPads();
    const out: MenuInput[] = [];
    const push = (side: 0 | 1, action: MenuAction) => out.push({ side, action });
    for (const side of [0, 1] as const) {
        const k = KEYS[side];
        const map: [string[], MenuAction][] = [
            [k.up, 'up'], [k.down, 'down'], [k.left, 'left'], [k.right, 'right'],
            [k.light, 'confirm'], [k.heavy, 'back'], [k.start, 'start']
        ];
        for (const [codes, action] of map) {
            if (codes.some((c) => tapped.has(c))) push(side, action);
            const key = `${side}${action}`;
            if (['up', 'down', 'left', 'right'].includes(action) && any(codes)) {
                repeat[key] = (repeat[key] ?? 0) + 1;
                if (repeat[key] > 22 && repeat[key] % 5 === 0) push(side, action);
            } else if (['up', 'down', 'left', 'right'].includes(action)) repeat[key] = 0;
        }
        const p = padAt(padOf[side]);
        if (p) {
            const st = readPad(p);
            const now = (st.up ? PAD_UP : 0) | (st.down ? PAD_DOWN : 0) | (st.left ? PAD_LEFT : 0) | (st.right ? PAD_RIGHT : 0)
                | (st.south ? PAD_OK : 0) | (st.east ? PAD_BACK : 0) | (st.start ? PAD_START : 0);
            // Buttons held when the pad appeared stay ignored until released.
            if (padFresh[side]) { padIgnore[side] = now; padFresh[side] = false; }
            padIgnore[side] &= now;
            const edge = now & ~prevPad[side] & ~padIgnore[side];
            prevPad[side] = now;
            const dirs: [number, MenuAction][] = [[PAD_UP, 'up'], [PAD_DOWN, 'down'], [PAD_LEFT, 'left'], [PAD_RIGHT, 'right']];
            for (const [bit, action] of dirs) {
                const key = `pad${side}${action}`;
                if (edge & bit) push(side, action);
                if (now & bit) {
                    repeat[key] = (repeat[key] ?? 0) + 1;
                    if (repeat[key] > 22 && repeat[key] % 5 === 0) push(side, action);
                } else repeat[key] = 0;
            }
            if (edge & PAD_OK) push(side, 'confirm');
            if (edge & PAD_BACK) push(side, 'back');
            if (edge & PAD_START) push(side, 'start');
        }
    }
    if (tapped.has('Enter') || tapped.has('Space')) push(0, 'confirm');
    if (tapped.has('Escape')) {
        if (!out.some((o) => o.action === 'start')) push(0, 'start');
        push(0, 'back');
    }
    tapped.clear();
    return out;
}

/** Forget pending taps, e.g. when a scene starts. */
export function clearTaps(): void {
    tapped.clear();
}
