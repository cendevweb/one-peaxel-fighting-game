/**
 * Inputs are a single 16-bit mask per frame. A mask is the only thing a client
 * is ever allowed to send: everything else (damage, position, meter, the
 * result of the match) is decided by the simulation from those masks.
 */
// A plain enum rather than a `const enum`: the web app is compiled with
// `isolatedModules`, which cannot inline a const enum coming from a package.
export enum Button {
    Left = 1 << 0,
    Right = 1 << 1,
    Up = 1 << 2,
    Down = 1 << 3,
    Light = 1 << 4,
    Heavy = 1 << 5,
    Special = 1 << 6,
    Ultimate = 1 << 7,
    /** A button of its own, not a direction: walking back is only walking. */
    Guard = 1 << 8
}

export const ALL_BUTTONS =
    Button.Left | Button.Right | Button.Up | Button.Down |
    Button.Light | Button.Heavy | Button.Special | Button.Ultimate |
    Button.Guard;

export const NEUTRAL_INPUT = 0;

/** Strips any bit a client has no business setting. */
export const sanitizeInput = (mask: number): number => (mask | 0) & ALL_BUTTONS;

export const held = (mask: number, button: Button): boolean => (mask & button) !== 0;

/** True on the frame a button goes down, which is what every move needs. */
export const pressed = (mask: number, previous: number, button: Button): boolean =>
    (mask & button) !== 0 && (previous & button) === 0;

/** Attack buttons, in the order they are checked when several are held. */
export const ATTACK_BUTTONS = [
    Button.Ultimate,
    Button.Special,
    Button.Heavy,
    Button.Light
] as const;
