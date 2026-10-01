import { describe, expect, it } from 'vitest';
import { BTN } from '../engine/types';
import { assignSlots, familyOf, padToBits, readPad, type PadLike } from '../input/gamepad';

const PS4 = 'Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 09cc)';
const PS5 = 'DualSense Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 0ce6)';
const XBOX = 'Xbox Wireless Controller (STANDARD GAMEPAD Vendor: 045e Product: 0b13)';
const SWITCH = 'Pro Controller (STANDARD GAMEPAD Vendor: 057e Product: 2009)';

function pad(opts: { id?: string; index?: number; mapping?: string; pressed?: number[]; axes?: number[]; buttons?: number } = {}): PadLike {
    const n = opts.buttons ?? 17;
    return {
        id: opts.id ?? PS4,
        index: opts.index ?? 0,
        mapping: opts.mapping ?? 'standard',
        connected: true,
        buttons: Array.from({ length: n }, (_, i) => ({ pressed: !!opts.pressed?.includes(i), value: opts.pressed?.includes(i) ? 1 : 0 })),
        axes: opts.axes ?? [0, 0, 0, 0]
    };
}
const bits = (p: PadLike) => padToBits(readPad(p));

describe('gamepads', () => {
    it('recognises the four pads Dylan listed', () => {
        expect(familyOf(PS4)).toBe('playstation');
        expect(familyOf(PS5)).toBe('playstation');
        expect(familyOf(XBOX)).toBe('xbox');
        expect(familyOf('Xbox 360 Controller (XInput STANDARD GAMEPAD)')).toBe('xbox');
        expect(familyOf(SWITCH)).toBe('switch');
        expect(familyOf('054c-0ce6-DualSense Wireless Controller')).toBe('playstation');
        expect(familyOf('Some Arcade Stick')).toBe('generic');
    });

    it('maps the standard layout by position', () => {
        expect(bits(pad({ pressed: [2] }))).toBe(BTN.light); // Square / X / Y
        expect(bits(pad({ pressed: [0] }))).toBe(BTN.light); // Cross / A / B
        expect(bits(pad({ pressed: [3] }))).toBe(BTN.heavy); // Triangle / Y / X
        expect(bits(pad({ pressed: [1] }))).toBe(BTN.special); // Circle / B / A
        expect(bits(pad({ pressed: [4] }))).toBe(BTN.light | BTN.heavy);
        expect(bits(pad({ pressed: [5] }))).toBe(BTN.ultimate); // R1 / RB / R: the ultimate key
        expect(bits(pad({ pressed: [7] }))).toBe(BTN.light | BTN.heavy | BTN.special);
        expect(bits(pad({ pressed: [9] }))).toBe(BTN.start);
        expect(bits(pad({ pressed: [12, 15] }))).toBe(BTN.up | BTN.right);
        for (const id of [PS5, XBOX, SWITCH]) expect(bits(pad({ id, pressed: [13] }))).toBe(BTN.down);
    });

    it('counts a half-pulled analog trigger', () => {
        const p = pad();
        (p.buttons as { pressed: boolean; value: number }[])[6] = { pressed: false, value: 0.7 };
        expect(bits(p)).toBe(BTN.light | BTN.heavy | BTN.special);
    });

    it('reads the stick in eight sectors with a dead zone', () => {
        expect(bits(pad({ axes: [0.3, 0.3, 0, 0] }))).toBe(0);
        expect(bits(pad({ axes: [0.9, 0.1, 0, 0] }))).toBe(BTN.right);
        expect(bits(pad({ axes: [0.7, 0.7, 0, 0] }))).toBe(BTN.right | BTN.down);
        expect(bits(pad({ axes: [-0.6, -0.65, 0, 0] }))).toBe(BTN.left | BTN.up);
        expect(bits(pad({ axes: [0.1, -0.95, 0, 0] }))).toBe(BTN.up);
    });

    it('handles raw layouts from Firefox on Linux and macOS', () => {
        const raw = (o: Parameters<typeof pad>[0]) => pad({ mapping: '', buttons: 13, axes: [0, 0, -1, 0, 0, -1, 0, 0], ...o });
        const ds = '054c-0ce6-DualSense Wireless Controller';
        expect(bits(raw({ id: ds, pressed: [3] }))).toBe(BTN.light); // Square
        expect(bits(raw({ id: ds, pressed: [2] }))).toBe(BTN.heavy); // Triangle
        expect(bits(raw({ id: ds, axes: [0, 0, -1, 0, 0, -1, -1, 1] }))).toBe(BTN.left | BTN.down); // d-pad on axes
        expect(bits(raw({ id: ds, axes: [0, 0, -1, 0, 0, 1, 0, 0] }))).toBe(BTN.light | BTN.heavy | BTN.special); // R2 axis
        expect(bits(raw({ id: ds }))).toBe(0); // triggers at rest
        const pro = '057e-2009-Pro Controller';
        expect(bits(pad({ id: pro, mapping: '', buttons: 18, pressed: [3] }))).toBe(BTN.light); // Y, the left face button
        expect(bits(pad({ id: pro, mapping: '', buttons: 18, pressed: [10] }))).toBe(BTN.start); // +
    });

    it('reads a hat switch only once it has been seen at rest', () => {
        const hat = (v: number) => pad({ id: 'Generic USB Joystick', index: 3, mapping: '', axes: [0, 0, 0, 0, 0, 0, 0, 0, 0, v] });
        expect(bits(hat(0))).toBe(0); // could be an ordinary axis at rest
        expect(bits(hat(3.2857))).toBe(0); // released
        expect(bits(hat(-1))).toBe(BTN.up);
        expect(bits(hat(-0.4286))).toBe(BTN.right);
        expect(bits(hat(0.1429))).toBe(BTN.down);
        expect(bits(hat(0.4286))).toBe(BTN.down | BTN.left);
        expect(bits(hat(1))).toBe(BTN.up | BTN.left);
    });

    it('keeps each pad on its side when another is unplugged', () => {
        const a = pad({ index: 0 }), b = pad({ index: 1 }), c = pad({ index: 2 });
        let slots = assignSlots([-1, -1], [a, b]);
        expect(slots).toEqual([0, 1]);
        slots = assignSlots(slots, [null, b]);
        expect(slots).toEqual([-1, 1]);
        slots = assignSlots(slots, [null, b, c]);
        expect(slots).toEqual([2, 1]);
        expect(assignSlots([-1, -1], [null, null, c])).toEqual([2, -1]);
    });
});
