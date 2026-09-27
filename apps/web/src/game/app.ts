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
    /**
     * Keep ticking while the tab is hidden (requestAnimationFrame stops
     * there). Online scenes set it: the other player must not freeze
     * because this one switched tabs. Offline scenes pause as before.
     */
    readonly runsHidden?: boolean;
}

const STEP = 1000 / 60;

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
            this.pump(now, 4, 100);
            this.draw();
            requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
        // Hidden tab: no animation frames. Timers still run (throttled, down
        // to once a second), and `nudge` runs on every network message.
        setInterval(() => this.nudge(), STEP);
    }

    /** Catches up on missed ticks while the tab is hidden, if the scene wants it. */
    nudge(): void {
        if (typeof document === 'undefined' || !document.hidden) return;
        if (!(this.scene?.runsHidden || this.next?.runsHidden)) return;
        this.pump(performance.now(), 60, 1000);
    }

    /** Runs the ticks due at `now` (at most `maxSteps`; time beyond `maxLag` ms is dropped). */
    private pump(now: number, maxSteps: number, maxLag: number): void {
        if (!this.last) this.last = now;
        // rAF timestamps and performance.now() share a clock but may be a
        // little out of order: never let time run backwards.
        this.acc += Math.max(0, Math.min(maxLag, now - this.last));
        this.last = Math.max(this.last, now);
        let steps = 0;
        while (this.acc >= STEP && steps < maxSteps) {
            this.acc -= STEP;
            this.tick();
            steps++;
        }
        if (steps === maxSteps) this.acc = 0;
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
        // Dev only: which scene is up, for the end-to-end tests.
        if (import.meta.env.DEV) (window as unknown as { __opfgScene?: string }).__opfgScene = this.scene?.constructor.name;
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
