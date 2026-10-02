import { play } from '../audio/sound';
import { hasVoice, playVoice, stopVoice } from '../audio/voices';
import { ROSTER } from '../characters';
import { KEYS, keyLabel, type MenuInput } from '../input/devices';
import { drawText } from '../render/font';
import { VOLUME_DEFAULT, VOLUME_MAX, resetSettings, settings, updateSettings, type Settings } from '../settings';
import { LEVEL_NAMES } from './ai';
import type { App, Scene } from './app';
import { COLORS, hint, menuBackdrop, panel, roundPips, title } from './ui';

/**
 * OPTIONS: the sound mix on four gauges (left), the rules and comfort
 * settings (right), then reset and back. Every change is applied and saved
 * at once (`settings.ts`). Reached from the main menu and from the pause
 * menu of an offline fight, which waits paused underneath.
 */

type VolumeKey = 'master' | 'music' | 'sfx' | 'voice';
type ChoiceKey = 'rounds' | 'arcadeLevel' | 'shake' | 'rumble' | 'display';

type Item =
    | { kind: 'gauge'; key: VolumeKey; label: string; help: string }
    | { kind: 'choice'; key: ChoiceKey; label: string; help: string; values: readonly Settings[ChoiceKey][]; name: (v: Settings[ChoiceKey]) => string }
    | { kind: 'button'; id: 'reset' | 'back'; label: string; help: string };

const yesNo = (v: Settings[ChoiceKey]) => (v ? 'OUI' : 'NON');

const ITEMS: Item[] = [
    { kind: 'gauge', key: 'master', label: 'VOLUME GÉNÉRAL', help: 'Le volume de tout le jeu : musique, effets et voix.' },
    { kind: 'gauge', key: 'music', label: 'MUSIQUE', help: 'Les thèmes des menus et de chaque arène.' },
    { kind: 'gauge', key: 'sfx', label: 'EFFETS SONORES', help: 'Coups, gardes, sauts, attaques spéciales et menus.' },
    { kind: 'gauge', key: 'voice', label: 'VOIX', help: 'Les répliques des combattants : sélection, ultimes et victoires.' },
    {
        kind: 'choice', key: 'rounds', label: 'MANCHES À GAGNER', values: [1, 2, 3], name: (v) => `${v} MANCHE${v === 1 ? '' : 'S'}`,
        help: 'Arcade et versus ordinateur. J1 contre J2 : se règle dans le menu versus.'
    },
    {
        kind: 'choice', key: 'arcadeLevel', label: 'DIFFICULTÉ ARCADE', values: [0, 1, 2, 3, 4], name: (v) => LEVEL_NAMES[v as number],
        help: 'Niveau du premier adversaire en arcade ; il se durcit à chaque combat.'
    },
    { kind: 'choice', key: 'shake', label: 'SECOUSSES D\'ÉCRAN', values: [true, false], name: yesNo, help: 'L\'écran tremble sous les coups les plus lourds.' },
    { kind: 'choice', key: 'rumble', label: 'VIBRATIONS MANETTE', values: [true, false], name: yesNo, help: 'La manette vibre quand votre combattant encaisse un coup.' },
    {
        kind: 'choice', key: 'display', label: 'AFFICHAGE', values: ['sharp', 'stretch'], name: (v) => (v === 'sharp' ? 'NET' : 'ÉTIRÉ'),
        help: 'Net : pixels carrés, à taille entière. Étiré : remplit toute la fenêtre.'
    },
    { kind: 'button', id: 'reset', label: 'PAR DÉFAUT', help: 'Rétablit tous les réglages d\'origine.' },
    { kind: 'button', id: 'back', label: 'RETOUR', help: 'Les réglages sont enregistrés dans ce navigateur.' }
];

const GAUGES = ITEMS.filter((i) => i.kind === 'gauge').length;
const CHOICES = ITEMS.filter((i) => i.kind === 'choice').length;

/** Panels and rows, in 640×360 screen pixels. */
const PANEL_Y = 48;
const PANEL_H = 186;
const SOUND_X = 30;
const GAME_X = 326;
const PANEL_W = 284;
const GAUGE_ROW = 38;
const CHOICE_ROW = 30;
const BUTTON_Y = 242;
const SEG_W = 18;
const SEG_GAP = 2;

/** Gauge colours, bottom step to top: cool blue, gold up to the default, hot above it. */
function segmentColor(k: number): string {
    if (k >= VOLUME_DEFAULT) return '#ff8a5c';
    const ramp = ['#4cc3ff', '#5fc8f0', '#7ccfd8', '#9bd6b8', '#bcdc92', '#dcd86a', '#f2d34e', '#ffd23f'];
    return ramp[Math.min(ramp.length - 1, Math.round((k * (ramp.length - 1)) / (VOLUME_DEFAULT - 1)))];
}

export class SettingsScene implements Scene {
    private t = 0;
    private index = 0;
    /** Ticks left on the "restored" notice. */
    private notice = 0;
    /** The voice sample waits for the gauge to settle, so held arrows do not stutter. */
    private voiceIn = 0;

    constructor(private app: App, private back: Scene) {}

    tick(menu: MenuInput[]): void {
        this.t++;
        if (this.notice > 0) this.notice--;
        if (this.voiceIn > 0 && --this.voiceIn === 0) this.sampleVoice();
        for (const m of menu) {
            const item = ITEMS[this.index];
            if (m.action === 'back' || m.action === 'start') { this.leave(); return; }
            if (m.action === 'up' || m.action === 'down') {
                this.index = (this.index + (m.action === 'up' ? ITEMS.length - 1 : 1)) % ITEMS.length;
                play('uiMove');
            } else if (m.action === 'left' || m.action === 'right') {
                const dir = m.action === 'left' ? -1 : 1;
                if (item.kind === 'button') {
                    // The two buttons share a row: left and right walk it.
                    const first = ITEMS.length - 2;
                    this.index = first + ((this.index - first + 1) % 2);
                    play('uiMove');
                } else this.adjust(item, dir);
            } else if (m.action === 'confirm') {
                if (item.kind === 'choice') this.adjust(item, 1, true);
                else if (item.kind === 'button' && item.id === 'reset') {
                    resetSettings();
                    this.notice = 120;
                    play('uiConfirm');
                } else if (item.kind === 'button') { this.leave(); return; }
            }
        }
    }

    private leave(): void {
        play('uiBack');
        stopVoice('options');
        this.app.go(this.back);
    }

    /** One step on a gauge or a choice; choices wrap round when `wrap` (confirm). */
    private adjust(item: Item, dir: 1 | -1, wrap = false): void {
        if (item.kind === 'gauge') {
            const v = Math.max(0, Math.min(VOLUME_MAX, settings[item.key] + dir));
            if (v === settings[item.key]) return;
            updateSettings({ [item.key]: v });
            // Heard at the new level: a blip for the mix, a line for the voices.
            if (item.key === 'voice') this.voiceIn = 10;
            else play('uiMove');
            return;
        }
        if (item.kind !== 'choice') return;
        const i = item.values.indexOf(settings[item.key]);
        const n = item.values.length;
        const next = wrap ? (i + 1) % n : Math.max(0, Math.min(n - 1, i + dir));
        if (next === i) return;
        updateSettings({ [item.key]: item.values[next] });
        play('uiMove');
    }

    /** A fighter's select line, picked at random, to judge the voice level by. */
    private sampleVoice(): void {
        const voiced = ROSTER.filter((c) => hasVoice(c.id, 'select'));
        if (!voiced.length) return;
        playVoice(voiced[Math.floor(Math.random() * voiced.length)].id, 'select', 'options');
    }

    draw(ctx: CanvasRenderingContext2D): void {
        menuBackdrop(ctx, this.t, 'shandora', 'rgba(14,4,24,0.82)');
        title(ctx, 'OPTIONS', 14);

        panel(ctx, SOUND_X, PANEL_Y, PANEL_W, PANEL_H);
        this.sectionHeader(ctx, 'SON', SOUND_X);
        for (let i = 0; i < GAUGES; i++) this.drawGauge(ctx, ITEMS[i] as Extract<Item, { kind: 'gauge' }>, i);

        panel(ctx, GAME_X, PANEL_Y, PANEL_W, PANEL_H, COLORS.blue);
        this.sectionHeader(ctx, 'JEU', GAME_X);
        for (let i = 0; i < CHOICES; i++) this.drawChoice(ctx, ITEMS[GAUGES + i] as Extract<Item, { kind: 'choice' }>, GAUGES + i);

        ITEMS.slice(GAUGES + CHOICES).forEach((item, k) => this.drawButton(ctx, item, GAUGES + CHOICES + k, k === 0 ? SOUND_X : GAME_X));

        panel(ctx, 30, 280, 580, 34, COLORS.dim);
        if (this.notice > 0) drawText(ctx, 'RÉGLAGES D\'ORIGINE RÉTABLIS.', 44, 292, { color: '#9dff7a', outline: COLORS.ink });
        else drawText(ctx, ITEMS[this.index].help, 44, 292, { color: '#e8e0f0' });

        const k = KEYS[0];
        hint(ctx, `${keyLabel(k.up[0])}${keyLabel(k.down[0])} / ↑↓ : CHOISIR · ${keyLabel(k.left[0])}${keyLabel(k.right[0])} / ← → : RÉGLER · ${keyLabel(k.light[0])} / ENTRÉE : VALIDER · ${keyLabel(k.heavy[0])} / ÉCHAP : RETOUR`);
    }

    private sectionHeader(ctx: CanvasRenderingContext2D, text: string, x: number): void {
        drawText(ctx, text, x + 14, PANEL_Y + 9, { color: '#fff', gradient: COLORS.gold, outline: COLORS.ink, scale: 2 });
        ctx.fillStyle = 'rgba(255,210,63,0.25)';
        ctx.fillRect(x + 14, PANEL_Y + 27, PANEL_W - 28, 1);
    }

    /** The selection band and its marker, shared by every row. */
    private highlight(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
        ctx.fillStyle = 'rgba(255,210,63,0.16)';
        ctx.fillRect(x, y, w, h);
        const dx = Math.round(Math.sin(this.t / 8) * 2);
        drawText(ctx, '»', x + 3 + dx / 2, y + Math.round(h / 2) - 4, { color: COLORS.gold, outline: COLORS.ink });
    }

    private drawGauge(ctx: CanvasRenderingContext2D, item: Extract<Item, { kind: 'gauge' }>, i: number): void {
        const sel = this.index === i;
        const x = SOUND_X + 8;
        const y = PANEL_Y + 34 + i * GAUGE_ROW;
        if (sel) this.highlight(ctx, x, y - 3, PANEL_W - 16, GAUGE_ROW - 4);
        const level = settings[item.key];
        drawText(ctx, item.label, x + 16, y, { color: sel ? '#fff' : '#bdb2cc', gradient: sel ? COLORS.gold : undefined, outline: COLORS.ink });
        // Value on the right: the level, or COUPÉ in red at zero.
        const value = level === 0 ? 'COUPÉ' : `${level * 10} %`;
        drawText(ctx, value, x + PANEL_W - 22, y, { color: level === 0 ? COLORS.red : sel ? '#fff' : '#cfc4dc', outline: COLORS.ink, align: 'right' });

        // A staircase of steps, taller toward the top, like a stereo's meter.
        const gx = x + 30;
        const base = y + 27;
        const width = VOLUME_MAX * (SEG_W + SEG_GAP) - SEG_GAP;
        if (sel) {
            const bob = Math.round(Math.sin(this.t / 8));
            drawText(ctx, '←', gx - 12 - bob, base - 8, { color: level > 0 ? COLORS.gold : COLORS.dim, outline: COLORS.ink });
            drawText(ctx, '→', gx + width + 6 + bob, base - 8, { color: level < VOLUME_MAX ? COLORS.gold : COLORS.dim, outline: COLORS.ink });
        }
        for (let k = 0; k < VOLUME_MAX; k++) {
            const sx = gx + k * (SEG_W + SEG_GAP);
            const h = 5 + k;
            const on = k < level;
            ctx.fillStyle = COLORS.ink;
            ctx.fillRect(sx - 1, base - h - 1, SEG_W + 2, h + 2);
            ctx.fillStyle = on ? segmentColor(k) : '#20142c';
            ctx.globalAlpha = on && !sel ? 0.8 : 1;
            ctx.fillRect(sx, base - h, SEG_W, h);
            if (on) {
                ctx.fillStyle = 'rgba(255,255,255,0.45)';
                ctx.fillRect(sx, base - h, SEG_W, 2);
            }
            ctx.globalAlpha = 1;
        }
        // A notch under the default level, the game's original mix.
        const nx = gx + VOLUME_DEFAULT * (SEG_W + SEG_GAP) - SEG_GAP / 2 - 1;
        ctx.fillStyle = COLORS.dim;
        ctx.fillRect(nx, base + 2, 2, 3);
    }

    private drawChoice(ctx: CanvasRenderingContext2D, item: Extract<Item, { kind: 'choice' }>, i: number): void {
        const sel = this.index === i;
        const x = GAME_X + 8;
        const y = PANEL_Y + 36 + (i - GAUGES) * CHOICE_ROW;
        if (sel) this.highlight(ctx, x, y - 4, PANEL_W - 16, CHOICE_ROW - 6);
        drawText(ctx, item.label, x + 16, y + 4, { color: sel ? '#fff' : '#bdb2cc', gradient: sel ? COLORS.gold : undefined, outline: COLORS.ink });
        const v = settings[item.key];
        const name = item.name(v);
        const color = typeof v === 'boolean' ? (v ? '#9dff7a' : '#ff8a5c') : '#ffffff';
        const right = x + PANEL_W - 22;
        const idx = item.values.indexOf(v);
        if (sel) {
            const bob = Math.round(Math.sin(this.t / 8));
            drawText(ctx, '→', right + bob, y + 4, { color: idx < item.values.length - 1 ? COLORS.gold : COLORS.dim, outline: COLORS.ink, align: 'right' });
            drawText(ctx, '←', right - 12 - name.length * 6 - 6 - bob, y + 4, { color: idx > 0 ? COLORS.gold : COLORS.dim, outline: COLORS.ink, align: 'right' });
        }
        const vx = sel ? right - 12 : right;
        drawText(ctx, name, vx, y + 4, { color, outline: COLORS.ink, align: 'right' });
        // Rounds: the win pips of the fight HUD, one per round to take.
        if (item.key === 'rounds') roundPips(ctx, v as number, vx - name.length * 6 - 4, y + 3);
    }

    private drawButton(ctx: CanvasRenderingContext2D, item: Item, i: number, x: number): void {
        const sel = this.index === i;
        panel(ctx, x, BUTTON_Y, PANEL_W, 28, sel ? COLORS.gold : COLORS.dim);
        if (sel) {
            ctx.fillStyle = 'rgba(255,210,63,0.16)';
            ctx.fillRect(x + 2, BUTTON_Y + 2, PANEL_W - 4, 24);
        }
        const dx = sel ? Math.round(Math.sin(this.t / 8) * 2) : 0;
        drawText(ctx, item.label, x + PANEL_W / 2 + dx, BUTTON_Y + 7, {
            color: sel ? '#fff' : '#bdb2cc', gradient: sel ? COLORS.gold : undefined, outline: COLORS.ink, scale: 2, align: 'center'
        });
    }
}
