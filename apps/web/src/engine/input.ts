import { BTN } from './types';

/**
 * Input reading, in the fighter's own frame of reference.
 *
 * History entries pack a numpad direction (1–9, 5 is neutral, 6 is towards
 * the opponent) in the low 4 bits and the raw button bits above them, so a
 * motion like ↓↘→ is simply the sequence 2, 3, 6.
 */

export const HISTORY = 40;

export function numpad(bits: number, facing: 1 | -1): number {
    const up = (bits & BTN.up) !== 0;
    const down = (bits & BTN.down) !== 0;
    let left = (bits & BTN.left) !== 0;
    let right = (bits & BTN.right) !== 0;
    if (left && right) left = right = false;
    const fwd = facing === 1 ? right : left;
    const back = facing === 1 ? left : right;
    const h = fwd ? 1 : back ? -1 : 0;
    const v = up && !down ? 1 : down && !up ? -1 : 0;
    return 5 + h + v * 3;
}

export const pack = (dir: number, bits: number) => dir | (bits << 4);
export const dirOf = (entry: number) => entry & 15;
export const bitsOf = (entry: number) => entry >> 4;

export function pushHistory(history: number[], entry: number): void {
    history.push(entry);
    if (history.length > HISTORY) history.shift();
}

/** Button went down this tick. */
export function pressed(history: number[], bit: number, ago = 0): boolean {
    const n = history.length - 1 - ago;
    if (n < 1) return false;
    return (bitsOf(history[n]) & bit) !== 0 && (bitsOf(history[n - 1]) & bit) === 0;
}

/** Button went down within the last `window` ticks. */
export function pressedWithin(history: number[], bit: number, window: number): boolean {
    for (let i = 0; i < window; i++) if (pressed(history, bit, i)) return true;
    return false;
}

export const held = (history: number[], bit: number) =>
    history.length > 0 && (bitsOf(history[history.length - 1]) & bit) !== 0;

export const currentDir = (history: number[]) => (history.length ? dirOf(history[history.length - 1]) : 5);

/**
 * Whether the directions `seq` were entered in order within `window` ticks,
 * ending no earlier than `lastBy` ticks ago. Directions in between are
 * tolerated, which is what makes ↓↘→ forgiving on a keyboard, where ↘ is
 * two keys and often skipped: each step also accepts its neighbours listed
 * with `|` (e.g. '3|2').
 */
export function motion(history: number[], seq: string[], window: number, lastBy = 8): boolean {
    let step = seq.length - 1;
    const start = history.length - 1;
    for (let i = start; i >= 0 && start - i <= window; i--) {
        const d = String(dirOf(history[i]));
        if (seq[step].split('|').includes(d)) {
            if (step === seq.length - 1 && start - i > lastBy) return false;
            step--;
            if (step < 0) return true;
        }
    }
    return false;
}

export const QCF = ['2', '3|2', '6|3'];
export const QCB = ['2', '1|2', '4|1'];
export const DP = ['6', '2|3', '3'];
export const DOUBLE_QCF = ['2', '6|3', '2', '6|3'];

/** Two taps of the same direction: forward dash 6 5 6, back dash 4 5 4. */
export function doubleTap(history: number[], dir: 4 | 6, window = 14): boolean {
    const start = history.length - 1;
    if (start < 2 || dirOf(history[start]) !== dir || dirOf(history[start - 1]) === dir) return false;
    let sawNeutral = false;
    for (let i = start - 1; i >= 0 && start - i <= window; i--) {
        const d = dirOf(history[i]);
        if (d === dir && sawNeutral) return true;
        if (d !== dir) sawNeutral = true;
        if (d !== dir && d !== 5 && d !== (dir === 6 ? 3 : 1) && d !== (dir === 6 ? 9 : 7)) return false;
    }
    return false;
}
