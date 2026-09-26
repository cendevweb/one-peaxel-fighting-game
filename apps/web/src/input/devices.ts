import { BTN } from '../engine/types';

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
    start: string[];
}

export const KEYS: [KeyBinding, KeyBinding] = [
    {
        up: ['KeyW'], down: ['KeyS'], left: ['KeyA'], right: ['KeyD'],
        light: ['KeyJ'], heavy: ['KeyK'], special: ['KeyL'],
        throwKey: ['KeyU'], ultimate: ['KeyI'], start: ['Escape']
    },
    {
        up: ['ArrowUp'], down: ['ArrowDown'], left: ['ArrowLeft'], right: ['ArrowRight'],
        light: ['Numpad1', 'Comma'], heavy: ['Numpad2', 'Period'], special: ['Numpad3', 'Slash'],
        throwKey: ['Numpad4'], ultimate: ['Numpad5'], start: ['Backspace']
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
    return navigator.getGamepads ? [...navigator.getGamepads()] : [];
}

function padBits(index: number): number {
    const p = pads()[index];
    if (!p) return 0;
    const b = (i: number) => !!p.buttons[i]?.pressed;
    const ax = p.axes[0] ?? 0;
    const ay = p.axes[1] ?? 0;
    let bits = 0;
    if (b(12) || ay < -0.5) bits |= BTN.up;
    if (b(13) || ay > 0.5) bits |= BTN.down;
    if (b(14) || ax < -0.5) bits |= BTN.left;
    if (b(15) || ax > 0.5) bits |= BTN.right;
    if (b(2) || b(0)) bits |= BTN.light;
    if (b(3)) bits |= BTN.heavy;
    if (b(1)) bits |= BTN.special;
    if (b(4)) bits |= BTN.light | BTN.heavy;
    if (b(5) || b(7)) bits |= BTN.heavy | BTN.special;
    if (b(9)) bits |= BTN.start;
    return bits;
}

/** Assign connected pads to sides in order of connection. */
function assignPads(): void {
    const connected = pads().map((p, i) => (p ? i : -1)).filter((i) => i >= 0);
    padOf[0] = connected[0] ?? -1;
    padOf[1] = connected[1] ?? -1;
}
window.addEventListener('gamepadconnected', assignPads);
window.addEventListener('gamepaddisconnected', assignPads);

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
    if (anyGame(k.ultimate)) bits |= BTN.heavy | BTN.special;
    if (anyGame(k.start)) bits |= BTN.start;
    if (padOf[side] >= 0) bits |= padBits(padOf[side]);
    return bits;
}

// ——— Menus ———

export type MenuAction = 'up' | 'down' | 'left' | 'right' | 'confirm' | 'back' | 'start';

export interface MenuInput {
    side: 0 | 1;
    action: MenuAction;
}

const prevPad: [number, number] = [0, 0];
const repeat: Record<string, number> = {};

/**
 * Menu actions since the last call: edges, plus auto-repeat on held
 * directions. Enter confirms and Escape backs out for either side.
 */
export function pollMenu(): MenuInput[] {
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
        if (padOf[side] >= 0) {
            const bits = padBits(padOf[side]);
            const edge = bits & ~prevPad[side];
            prevPad[side] = bits;
            if (edge & BTN.up) push(side, 'up');
            if (edge & BTN.down) push(side, 'down');
            if (edge & BTN.left) push(side, 'left');
            if (edge & BTN.right) push(side, 'right');
            const p = pads()[padOf[side]];
            if (p) {
                const was = (repeat[`pad${side}`] ?? 0);
                const now = (p.buttons[0]?.pressed ? 1 : 0) | (p.buttons[1]?.pressed ? 2 : 0) | (p.buttons[9]?.pressed ? 4 : 0);
                const e = now & ~was;
                repeat[`pad${side}`] = now;
                if (e & 1) push(side, 'confirm');
                if (e & 2) push(side, 'back');
                if (e & 4) push(side, 'start');
            }
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
