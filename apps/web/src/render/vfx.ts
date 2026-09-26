import type { Spark } from '../engine/types';
import { animLength, drawFrame, hasAnim } from './sprites';

/**
 * Purely visual effects. Nothing here feeds back into the simulation: the
 * engine reports events, this module decorates them.
 */

interface SpriteFx {
    atlas: string;
    anim: string;
    x: number;
    y: number;
    facing: 1 | -1;
    t: number;
    /** Ticks per frame. */
    per: number;
    scale: number;
    additive: boolean;
    alpha: number;
}

type ParticleKind = 'spark' | 'dust' | 'ember' | 'bolt' | 'shard' | 'smoke' | 'streak';

interface Particle {
    kind: ParticleKind;
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    max: number;
    color: string;
    size: number;
    gravity: number;
    drag: number;
}

interface Ring { x: number; y: number; r: number; vr: number; life: number; max: number; color: string; width: number }

interface Popup { text: string; x: number; y: number; t: number; color: string; big: boolean }

export class Vfx {
    sprites: SpriteFx[] = [];
    particles: Particle[] = [];
    rings: Ring[] = [];
    popups: Popup[] = [];
    shake = 0;
    flash = 0;
    flashColor = '#fff';
    private seed = 12345;

    private rand(): number {
        this.seed = (this.seed * 16807) % 2147483647;
        return this.seed / 2147483647;
    }

    sprite(atlas: string, anim: string, x: number, y: number, facing: 1 | -1 = 1, opts: Partial<Pick<SpriteFx, 'per' | 'scale' | 'additive' | 'alpha'>> = {}): void {
        if (!hasAnim(atlas, anim)) return;
        this.sprites.push({ atlas, anim, x, y, facing, t: 0, per: opts.per ?? 3, scale: opts.scale ?? 1, additive: opts.additive ?? false, alpha: opts.alpha ?? 1 });
    }

    burst(x: number, y: number, n: number, kind: ParticleKind, colors: string[], speed: number, opts: { gravity?: number; life?: number; size?: number; dir?: number; spread?: number; drag?: number } = {}): void {
        for (let i = 0; i < n; i++) {
            const spread = opts.spread ?? Math.PI * 2;
            const base = opts.dir ?? 0;
            const a = base + (this.rand() - 0.5) * spread;
            const v = speed * (0.35 + this.rand() * 0.9);
            const life = Math.round((opts.life ?? 18) * (0.6 + this.rand() * 0.7));
            this.particles.push({
                kind, x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life, max: life,
                color: colors[Math.floor(this.rand() * colors.length)],
                size: (opts.size ?? 1) * (0.6 + this.rand() * 0.8), gravity: opts.gravity ?? 0, drag: opts.drag ?? 0.9
            });
        }
    }

    ring(x: number, y: number, color: string, speed = 3, life = 14, width = 1.5): void {
        this.rings.push({ x, y, r: 2, vr: speed, life, max: life, color, width });
    }

    popup(text: string, x: number, y: number, color = '#ffe45e', big = false): void {
        this.popups.push({ text, x, y, t: 0, color, big });
    }

    kick(shake: number, flash = 0, color = '#fff'): void {
        this.shake = Math.max(this.shake, shake);
        if (flash > this.flash) { this.flash = flash; this.flashColor = color; }
    }

    /** Hit spark, by kind. `dir` is the attacker's facing. */
    hit(x: number, y: number, spark: Spark, heavy: boolean, dir: 1 | -1, counter: boolean): void {
        const warm = ['#fff', '#fff6b0', '#ffd23f', '#ffb020'];
        switch (spark) {
            case 'light':
                this.sprite('common', 'spark', x, y, dir, { per: 2 });
                this.burst(x, y, 6, 'streak', warm, 3.2, { dir: dir === 1 ? 0 : Math.PI, spread: 2.2, life: 8 });
                break;
            case 'heavy':
                this.sprite('common', 'sparkHeavy', x, y, dir, { per: 2 });
                this.burst(x, y, 12, 'streak', warm, 4.2, { dir: dir === 1 ? 0 : Math.PI, spread: 2.6, life: 11 });
                this.ring(x, y, '#fff', 3.2, 10, 1);
                break;
            case 'big':
                this.sprite('common', 'sparkBig', x, y, dir, { per: 3 });
                this.sprite('common', 'burst', x, y, dir, { per: 2, additive: true });
                this.burst(x, y, 22, 'streak', warm, 5.5, { life: 14 });
                this.burst(x, y, 10, 'shard', ['#fff', '#ffe28a'], 3, { gravity: 0.15, life: 26 });
                this.ring(x, y, '#fff', 4.5, 14, 2);
                this.ring(x, y, '#ffd23f', 2.6, 18, 1);
                break;
            case 'fire':
            case 'magma':
                this.sprite('common', 'sparkHeavy', x, y, dir, { per: 2 });
                this.burst(x, y, 16, 'ember', spark === 'magma' ? ['#ff3b1f', '#ff7a1a', '#ffd23f', '#8a1a0a'] : ['#ff9a1f', '#ffd23f', '#fff1a8'], 3.5, { gravity: -0.05, life: 26, size: 1.4 });
                this.burst(x, y, 5, 'smoke', ['#3a2a28', '#584040'], 0.8, { gravity: -0.04, life: 34, size: 4 });
                this.ring(x, y, '#ff8a1c', 3, 12, 1.5);
                break;
            case 'electric':
                this.sprite('common', 'spark', x, y, dir, { per: 2, additive: true });
                this.burst(x, y, 8, 'bolt', ['#ffffff', '#9ff3ff', '#ffe95e'], 4.5, { life: 9, size: 1 });
                this.burst(x, y, 10, 'spark', ['#9ff3ff', '#fff'], 3, { life: 12 });
                this.kick(0, 0.18, '#dff9ff');
                break;
            case 'sand':
                this.sprite('common', 'sparkHeavy', x, y, dir, { per: 2 });
                this.burst(x, y, 18, 'dust', ['#e8cf8c', '#cfae66', '#f5e4b5'], 2.6, { gravity: 0.04, life: 30, size: 2 });
                break;
            case 'cut':
                this.burst(x, y, 1, 'streak', ['#ffffff'], 0.01, { life: 10, size: 3 });
                this.burst(x, y, 10, 'streak', ['#fff', '#dff'], 5, { dir: dir === 1 ? -0.5 : Math.PI + 0.5, spread: 0.5, life: 9 });
                this.sprite('common', 'spark', x, y, dir, { per: 2 });
                break;
        }
        if (counter) this.popup('CONTRE !', x, y - 22, '#ff5a3c');
        if (heavy) this.kick(0, 0.08);
    }

    block(x: number, y: number, dir: 1 | -1): void {
        this.sprite('common', 'block', x, y, dir, { per: 2 });
        this.burst(x, y, 8, 'spark', ['#9fd4ff', '#ffffff', '#5ab4ff'], 3, { dir: dir === 1 ? Math.PI : 0, spread: 2, life: 10 });
    }

    dust(x: number, y: number, big: boolean): void {
        this.sprite('common', 'dust', x, y, 1, { per: big ? 4 : 3, scale: big ? 1 : 0.6, alpha: 0.8 });
        this.burst(x, y - 1, big ? 12 : 5, 'dust', ['#e6dccb', '#c9bba4', '#fff'], big ? 2 : 1.2, { dir: -Math.PI / 2, spread: Math.PI, gravity: 0.05, life: 22, size: big ? 2.2 : 1.4 });
    }

    update(): void {
        for (const s of this.sprites) s.t++;
        this.sprites = this.sprites.filter((s) => s.t < animLength(s.atlas, s.anim) * s.per);
        for (const p of this.particles) {
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= p.drag;
            p.vy = p.vy * p.drag + p.gravity;
            p.life--;
        }
        this.particles = this.particles.filter((p) => p.life > 0);
        for (const r of this.rings) { r.r += r.vr; r.vr *= 0.86; r.life--; }
        this.rings = this.rings.filter((r) => r.life > 0);
        for (const p of this.popups) p.t++;
        this.popups = this.popups.filter((p) => p.t < 50);
        this.shake *= 0.82;
        if (this.shake < 0.2) this.shake = 0;
        this.flash *= 0.8;
        if (this.flash < 0.02) this.flash = 0;
    }

    /** World-space drawing (context already offset by the camera). */
    draw(ctx: CanvasRenderingContext2D): void {
        for (const s of this.sprites) {
            drawFrame(ctx, s.atlas, s.anim, Math.floor(s.t / s.per), s.x, s.y, s.facing, { scale: s.scale, additive: s.additive, alpha: s.alpha });
        }
        ctx.save();
        for (const r of this.rings) {
            ctx.globalAlpha = r.life / r.max;
            ctx.strokeStyle = r.color;
            ctx.lineWidth = r.width;
            ctx.beginPath();
            ctx.ellipse(r.x, r.y, r.r, r.r * 0.8, 0, 0, Math.PI * 2);
            ctx.stroke();
        }
        for (const p of this.particles) {
            const k = p.life / p.max;
            ctx.globalAlpha = p.kind === 'smoke' ? k * 0.5 : Math.min(1, k * 1.5);
            ctx.fillStyle = p.color;
            ctx.strokeStyle = p.color;
            switch (p.kind) {
                case 'streak': {
                    ctx.lineWidth = Math.max(0.5, p.size * k);
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p.x - p.vx * 3, p.y - p.vy * 3);
                    ctx.stroke();
                    break;
                }
                case 'bolt': {
                    ctx.lineWidth = 0.75;
                    ctx.beginPath();
                    let x = p.x - p.vx * 4;
                    let y = p.y - p.vy * 4;
                    ctx.moveTo(x, y);
                    for (let i = 0; i < 4; i++) {
                        x += p.vx + (this.rand() - 0.5) * 3;
                        y += p.vy + (this.rand() - 0.5) * 3;
                        ctx.lineTo(x, y);
                    }
                    ctx.stroke();
                    break;
                }
                case 'smoke':
                case 'dust': {
                    const s = p.size * (p.kind === 'smoke' ? 1 + (1 - k) * 1.5 : 1);
                    ctx.fillRect(Math.round((p.x - s / 2) * 2) / 2, Math.round((p.y - s / 2) * 2) / 2, s, s);
                    break;
                }
                default: {
                    const s = p.size;
                    ctx.fillRect(Math.round(p.x * 2) / 2, Math.round(p.y * 2) / 2, s, s);
                }
            }
        }
        ctx.restore();
    }
}
