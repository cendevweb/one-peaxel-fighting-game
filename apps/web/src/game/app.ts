import { clearTaps, pollMenu, type MenuInput } from '../input/devices';
import { play, unlockAudio } from '../audio/sound';

/**
 * Scenes and the fixed-step loop. The simulation runs at exactly 60 ticks
 * per second whatever the display's refresh rate; drawing happens once per
 * animation frame.
 */

export interface Scene {
    enter?(): void;
    /** One simulation tick; `menu` holds menu actions since the last tick. */
    tick(menu: MenuInput[]): void;
    draw(ctx: CanvasRenderingContext2D): void;
}

export const WIDTH = 640;
export const HEIGHT = 360;

export class App {
    private scene: Scene | null = null;
    private next: Scene | null = null;
    private fade = 0;
    private fadeDir: 0 | 1 | -1 = 0;
    private acc = 0;
    private last = 0;
    ticks = 0;

    constructor(readonly ctx: CanvasRenderingContext2D) {
        window.addEventListener('keydown', () => unlockAudio(), { once: false });
        window.addEventListener('pointerdown', () => unlockAudio());
    }

    /** Switch scene with a short fade through black. */
    go(scene: Scene, instant = false): void {
        if (instant || !this.scene) {
            this.scene = scene;
            clearTaps();
            scene.enter?.();
            this.fade = 1;
            this.fadeDir = -1;
            return;
        }
        this.next = scene;
        this.fadeDir = 1;
    }

    start(): void {
        const frame = (now: number) => {
            if (!this.last) this.last = now;
            this.acc += Math.min(100, now - this.last);
            this.last = now;
            let steps = 0;
            while (this.acc >= 1000 / 60 && steps < 4) {
                this.acc -= 1000 / 60;
                this.tick();
                steps++;
            }
            if (steps === 4) this.acc = 0;
            this.draw();
            requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
    }

    private tick(): void {
        this.ticks++;
        const menu = pollMenu();
        if (this.fadeDir === 1) {
            this.fade = Math.min(1, this.fade + 0.12);
            if (this.fade >= 1 && this.next) {
                this.scene = this.next;
                this.next = null;
                clearTaps();
                this.scene.enter?.();
                this.fadeDir = -1;
            }
            this.scene?.tick([]);
            return;
        }
        if (this.fadeDir === -1) {
            this.fade = Math.max(0, this.fade - 0.1);
            if (this.fade <= 0) this.fadeDir = 0;
        }
        this.scene?.tick(menu);
    }

    private draw(): void {
        const ctx = this.ctx;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.imageSmoothingEnabled = false;
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        this.scene?.draw(ctx);
        if (this.fade > 0) {
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.fillStyle = `rgba(0,0,0,${this.fade})`;
            ctx.fillRect(0, 0, WIDTH, HEIGHT);
        }
    }
}

/** A vertical list of options, used by every menu. */
export class OptionList {
    index = 0;

    constructor(public items: string[]) {}

    handle(menu: MenuInput[], sides: (0 | 1)[] = [0, 1]): 'confirm' | 'back' | null {
        for (const m of menu) {
            if (!sides.includes(m.side)) continue;
            if (m.action === 'up') { this.index = (this.index + this.items.length - 1) % this.items.length; play('uiMove'); }
            if (m.action === 'down') { this.index = (this.index + 1) % this.items.length; play('uiMove'); }
            if (m.action === 'confirm') { play('uiConfirm'); return 'confirm'; }
            if (m.action === 'back') { play('uiBack'); return 'back'; }
        }
        return null;
    }
}
