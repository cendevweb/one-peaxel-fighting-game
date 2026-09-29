import { BTN } from '../engine/types';

/**
 * Gamepads → engine button bits. Pure: takes what `navigator.getGamepads()`
 * returns, so the tests can feed it fake pads.
 *
 * Browsers give PS4, PS5, Xbox and Switch Pro pads the "standard" mapping
 * (Chrome, Edge, Safari, and Firefox on Windows): buttons are named by
 * position, 0 bottom, 1 right, 2 left, 3 top, whatever is printed on them.
 * Firefox on Linux and macOS hands some of them over raw instead; `layoutOf`
 * knows those layouts from the vendor id in `Gamepad.id`.
 */

/** The fields of a Gamepad this module reads. */
export interface PadLike {
    id: string;
    index: number;
    mapping: string;
    connected: boolean;
    buttons: readonly { pressed: boolean; value: number }[];
    axes: readonly number[];
}

export type PadFamily = 'playstation' | 'xbox' | 'switch' | 'generic';

export function familyOf(id: string): PadFamily {
    const s = id.toLowerCase();
    // Vendor ids first: the names overlap ("Xbox Wireless Controller" vs the
    // PS4's plain "Wireless Controller").
    if (/054c/.test(s)) return 'playstation';
    if (/057e/.test(s)) return 'switch';
    if (/045e/.test(s)) return 'xbox';
    if (/xbox|xinput|microsoft/.test(s)) return 'xbox';
    if (/pro controller|nintendo|joy-con/.test(s)) return 'switch';
    if (/dualsense|dualshock|wireless controller|playstation|ps[345]/.test(s)) return 'playstation';
    return 'generic';
}

/** Where each logical button sits on a pad: indices into `buttons`, and the
 *  axes of the d-pad when it is reported as axes rather than buttons. */
interface Layout {
    south: number; east: number; west: number; north: number;
    l1: number; r1: number; l2: number; r2: number;
    start: number;
    up: number; down: number; left: number; right: number;
    /** Axes: [x, y] of a d-pad reported as two axes, or one "hat" axis. */
    dpadAxes?: [number, number];
    hat?: number;
    /** Triggers reported as axes (-1 released, 1 pulled). */
    triggerAxes?: [number, number];
}

const STANDARD: Layout = {
    south: 0, east: 1, west: 2, north: 3, l1: 4, r1: 5, l2: 6, r2: 7, start: 9,
    up: 12, down: 13, left: 14, right: 15
};

/** Raw layouts Firefox reports on Linux / macOS (evdev and HID order). */
const RAW: Record<PadFamily, Layout> = {
    // DualShock 4 and DualSense: Cross, Circle, Triangle, Square, L1, R1, L2, R2, Share, Options.
    playstation: { south: 0, east: 1, north: 2, west: 3, l1: 4, r1: 5, l2: 6, r2: 7, start: 9, up: -1, down: -1, left: -1, right: -1, dpadAxes: [6, 7], triggerAxes: [2, 5] },
    // Xbox (xpad): A, B, X, Y, LB, RB, View, Menu; triggers and d-pad on axes.
    xbox: { south: 0, east: 1, west: 2, north: 3, l1: 4, r1: 5, l2: -1, r2: -1, start: 7, up: -1, down: -1, left: -1, right: -1, dpadAxes: [6, 7], triggerAxes: [2, 5] },
    // Switch Pro (hid-nintendo): B, A, X, Y by label, i.e. south, east, north, west.
    switch: { south: 0, east: 1, north: 2, west: 3, l1: 5, r1: 6, l2: 7, r2: 8, start: 10, up: 13, down: 14, left: 15, right: 16 },
    // Unknown pad: assume the common HID order and a hat switch on axis 9.
    generic: { south: 0, east: 1, west: 2, north: 3, l1: 4, r1: 5, l2: 6, r2: 7, start: 9, up: 12, down: 13, left: 14, right: 15, hat: 9 }
};

function layoutOf(p: PadLike): Layout {
    return p.mapping === 'standard' ? STANDARD : RAW[familyOf(p.id)];
}

/** Pads whose hat axis has been seen at rest. */
const hatSeen = new Set<string>();

/** Stick past this length counts as a direction. */
const DEAD = 0.5;
/** cos 67.5°: splits the stick into 8 equal sectors, so diagonals are as easy as straights. */
const SECTOR = 0.3827;

/** What the pad asks for: directions and the six fighting buttons. */
export interface PadState {
    up: boolean; down: boolean; left: boolean; right: boolean;
    /** Face buttons by position. */
    south: boolean; east: boolean; west: boolean; north: boolean;
    l1: boolean; r1: boolean; l2: boolean; r2: boolean;
    start: boolean;
}

export function readPad(p: PadLike): PadState {
    const L = layoutOf(p);
    const btn = (i: number) => i >= 0 && !!(p.buttons[i]?.pressed || (p.buttons[i]?.value ?? 0) > 0.5);
    const axis = (i: number) => p.axes[i] ?? 0;
    const trig = (b: number, a: number | undefined) => btn(b) || (a !== undefined && p.axes.length > a && axis(a) > 0.2);

    let up = btn(L.up), down = btn(L.down), left = btn(L.left), right = btn(L.right);
    if (L.dpadAxes) {
        const [x, y] = L.dpadAxes;
        if (axis(x) < -0.5) left = true;
        if (axis(x) > 0.5) right = true;
        if (axis(y) < -0.5) up = true;
        if (axis(y) > 0.5) down = true;
    }
    if (L.hat !== undefined && p.axes.length > L.hat) {
        // Hat switch: -1 up, then clockwise in steps of 2/7; released reads
        // above 1. Only trusted once seen released, so an ordinary axis
        // resting at 0 is not taken for "down" held.
        const v = axis(L.hat);
        const key = `${p.index}:${p.id}`;
        if (v > 1.05) hatSeen.add(key);
        if (hatSeen.has(key) && v >= -1.05 && v <= 1.05) {
            const dir = Math.round((v + 1) * 3.5) % 8; // 0 up, 1 up-right, … 7 up-left
            if (dir === 7 || dir <= 1) up = true;
            if (dir >= 1 && dir <= 3) right = true;
            if (dir >= 3 && dir <= 5) down = true;
            if (dir >= 5 && dir <= 7) left = true;
        }
    }
    // Left stick, in 8 sectors.
    const ax = axis(0), ay = axis(1);
    const mag = Math.hypot(ax, ay);
    if (mag > DEAD) {
        if (ax / mag < -SECTOR) left = true;
        if (ax / mag > SECTOR) right = true;
        if (ay / mag < -SECTOR) up = true;
        if (ay / mag > SECTOR) down = true;
    }
    const [lt, rt] = L.triggerAxes ?? [undefined, undefined];
    return {
        up, down, left, right,
        south: btn(L.south), east: btn(L.east), west: btn(L.west), north: btn(L.north),
        l1: btn(L.l1), r1: btn(L.r1), l2: trig(L.l2, lt), r2: trig(L.r2, rt),
        start: btn(L.start)
    };
}

/**
 * The fighting layout, the same on every pad by position:
 * left face = [A], top = [B], right = [C], bottom = [A] too (it is also
 * "confirm" in menus); L1 = throw [A]+[B], R1 = ultimate [B]+[C],
 * L2 / R2 = max ultimate [A]+[B]+[C].
 */
export function padToBits(s: PadState): number {
    let bits = 0;
    if (s.up) bits |= BTN.up;
    if (s.down) bits |= BTN.down;
    if (s.left) bits |= BTN.left;
    if (s.right) bits |= BTN.right;
    if (s.west || s.south) bits |= BTN.light;
    if (s.north) bits |= BTN.heavy;
    if (s.east) bits |= BTN.special;
    if (s.l1) bits |= BTN.light | BTN.heavy;
    if (s.r1) bits |= BTN.heavy | BTN.special;
    if (s.l2 || s.r2) bits |= BTN.light | BTN.heavy | BTN.special;
    if (s.start) bits |= BTN.start;
    return bits;
}

/** Names printed on each pad, for the controls screen. */
export const PAD_LABELS: Record<PadFamily, { name: string; south: string; east: string; west: string; north: string; l1: string; r1: string; l2: string; r2: string; start: string }> = {
    playstation: { name: 'PLAYSTATION', south: 'CROIX', east: 'ROND', west: 'CARRÉ', north: 'TRIANGLE', l1: 'L1', r1: 'R1', l2: 'L2', r2: 'R2', start: 'OPTIONS' },
    xbox: { name: 'XBOX', south: 'A', east: 'B', west: 'X', north: 'Y', l1: 'LB', r1: 'RB', l2: 'LT', r2: 'RT', start: 'MENU' },
    switch: { name: 'SWITCH PRO', south: 'B', east: 'A', west: 'Y', north: 'X', l1: 'L', r1: 'R', l2: 'ZL', r2: 'ZR', start: '+' },
    generic: { name: 'MANETTE', south: 'BAS', east: 'DROITE', west: 'GAUCHE', north: 'HAUT', l1: 'L1', r1: 'R1', l2: 'L2', r2: 'R2', start: 'START' }
};

/**
 * Which pad drives which side. A pad keeps its side while it stays plugged
 * in; a new pad takes the first free side (J1 first). So unplugging J1's pad
 * mid-match does not hand J2's pad over to J1.
 */
export function assignSlots(slots: [number, number], pads: readonly (PadLike | null)[]): [number, number] {
    const live = new Set(pads.filter((p): p is PadLike => !!p && p.connected).map((p) => p.index));
    const next: [number, number] = [live.has(slots[0]) ? slots[0] : -1, live.has(slots[1]) ? slots[1] : -1];
    for (const i of [...live].sort((a, b) => a - b)) {
        if (next.includes(i)) continue;
        const free = next.indexOf(-1);
        if (free < 0) break;
        next[free] = i;
    }
    return next;
}
