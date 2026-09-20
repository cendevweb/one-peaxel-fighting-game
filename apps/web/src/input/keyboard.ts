'use client';

import { Button } from '@opfg/combat-core';

/**
 * Keyboard bindings.
 *
 * Both a QWERTY and an AZERTY row are bound for movement, because the game is
 * built in French and `KeyW`/`KeyA` land under different fingers on the two
 * layouts. `event.code` is used throughout, so a binding means a physical key
 * and never a character the layout happens to produce.
 */
export interface Binding {
    readonly label: string;
    readonly codes: readonly string[];
    readonly button: Button;
}

export const PLAYER_BINDINGS: readonly Binding[] = [
    { label: 'Gauche', codes: ['ArrowLeft', 'KeyA', 'KeyQ'], button: Button.Left },
    { label: 'Droite', codes: ['ArrowRight', 'KeyD'], button: Button.Right },
    { label: 'Saut', codes: ['ArrowUp', 'KeyW', 'KeyZ'], button: Button.Up },
    { label: 'Bas', codes: ['ArrowDown', 'KeyS'], button: Button.Down },
    { label: 'Coup léger', codes: ['KeyJ'], button: Button.Light },
    { label: 'Coup lourd', codes: ['KeyK'], button: Button.Heavy },
    { label: 'Spéciale', codes: ['KeyL'], button: Button.Special },
    { label: 'Ultime', codes: ['KeyI', 'KeyO'], button: Button.Ultimate },
    // The guard is held, often for a whole string, so it goes under the thumb
    // rather than on a finger that is also needed to attack. That costs the
    // space bar its jump, which `ArrowUp`, `KeyW` and `KeyZ` still cover.
    { label: 'Garde', codes: ['Space', 'KeyH'], button: Button.Guard }
];

/** Second seat for the local training mode, on the right of the keyboard. */
export const SECOND_PLAYER_BINDINGS: readonly Binding[] = [
    { label: 'Gauche', codes: ['Numpad4'], button: Button.Left },
    { label: 'Droite', codes: ['Numpad6'], button: Button.Right },
    { label: 'Saut', codes: ['Numpad8'], button: Button.Up },
    { label: 'Bas', codes: ['Numpad5'], button: Button.Down },
    { label: 'Coup léger', codes: ['Numpad1'], button: Button.Light },
    { label: 'Coup lourd', codes: ['Numpad2'], button: Button.Heavy },
    { label: 'Spéciale', codes: ['Numpad3'], button: Button.Special },
    { label: 'Ultime', codes: ['Numpad0'], button: Button.Ultimate },
    { label: 'Garde', codes: ['Numpad7'], button: Button.Guard }
];

/**
 * Reads the keyboard into a bitmask. It listens on the window rather than on
 * the canvas so a click on the HUD never costs the player their inputs, and it
 * clears every held key when the tab loses focus — otherwise a fighter walks
 * into the wall while its player is reading their mail.
 */
export class KeyboardReader {
    private held = new Set<string>();
    private readonly bindings: readonly Binding[];
    private attached = false;

    constructor(bindings: readonly Binding[] = PLAYER_BINDINGS) {
        this.bindings = bindings;
    }

    private onKeyDown = (event: KeyboardEvent): void => {
        if (event.repeat) {
            return;
        }
        if (this.isBound(event.code)) {
            event.preventDefault();
            this.held.add(event.code);
        }
    };

    private onKeyUp = (event: KeyboardEvent): void => {
        this.held.delete(event.code);
    };

    private onBlur = (): void => {
        this.held.clear();
    };

    private isBound(code: string): boolean {
        return this.bindings.some((binding) => binding.codes.includes(code));
    }

    attach(): void {
        if (this.attached || typeof window === 'undefined') {
            return;
        }
        window.addEventListener('keydown', this.onKeyDown, { passive: false });
        window.addEventListener('keyup', this.onKeyUp);
        window.addEventListener('blur', this.onBlur);
        document.addEventListener('visibilitychange', this.onBlur);
        this.attached = true;
    }

    detach(): void {
        if (!this.attached || typeof window === 'undefined') {
            return;
        }
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('keyup', this.onKeyUp);
        window.removeEventListener('blur', this.onBlur);
        document.removeEventListener('visibilitychange', this.onBlur);
        this.held.clear();
        this.attached = false;
    }

    read(): number {
        let mask = 0;
        for (const binding of this.bindings) {
            if (binding.codes.some((code) => this.held.has(code))) {
                mask |= binding.button;
            }
        }
        return mask;
    }
}
