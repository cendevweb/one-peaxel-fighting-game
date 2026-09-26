import { play } from '../audio/sound';
import { startMusic, stopMusic } from '../audio/music';
import { ROSTER } from '../characters';
import { createMatch, stepMatch } from '../engine/match';
import { getChar } from '../engine/registry';
import { BTN, type CharacterDef, type MatchState, type MoveSlot } from '../engine/types';
import { KEYS, endInputTick, keyLabel, readSide, type MenuInput } from '../input/devices';
import { drawText } from '../render/font';
import { FightView } from '../render/fightView';
import { artOf, drawFrame } from '../render/sprites';
import { STAGES, stageImage } from '../render/stage';
import { Cpu, LEVELS, dummyBits, type DummyMode } from './ai';
import { OptionList, type App, type Scene } from './app';
import { COLORS, hint, menuBackdrop, menuItems, notation, panel, title } from './ui';

// ——— Session setup ———

export type Mode = 'arcade' | 'versus' | 'versusCpu' | 'training';

export interface Setup {
    mode: Mode;
    p1: string;
    p2: string;
    stage: string;
    cpuLevel: number;
    /** Arcade: opponents still to beat, and how many were beaten. */
    ladder?: string[];
    beaten?: number;
}

const randomStage = () => STAGES[Math.floor(Math.random() * STAGES.length)].id;

// ——— Title ———

export class TitleScene implements Scene {
    private t = 0;
    constructor(private app: App) {}

    enter(): void { startMusic('title'); }

    tick(menu: MenuInput[]): void {
        this.t++;
        if (menu.some((m) => m.action === 'confirm' || m.action === 'start')) {
            play('uiSelect');
            this.app.go(new MainMenuScene(this.app));
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        menuBackdrop(ctx, this.t, 'marineford', 'rgba(16,4,28,0.55)');
        // The roster, standing in a row and breathing.
        const n = ROSTER.length;
        ROSTER.forEach((c, i) => {
            const x = 320 + (i - (n - 1) / 2) * 104;
            ctx.save();
            ctx.setTransform(2, 0, 0, 2, 0, 0);
            ctx.fillStyle = 'rgba(0,0,0,0.35)';
            ctx.beginPath();
            ctx.ellipse(x / 2, 150, 16, 3, 0, 0, Math.PI * 2);
            ctx.fill();
            const anim = c.manifest.anims.idle;
            const per = Math.round(60 / (anim.fps ?? 6));
            drawFrame(ctx, c.id, 'idle', Math.floor((this.t + i * 7) / per) % anim.frames.length, x / 2, 150, i < n / 2 ? 1 : -1);
            ctx.restore();
        });
        const bob = Math.sin(this.t / 30) * 2;
        drawText(ctx, 'ONE PEAXEL', 320, 44 + bob, { color: '#ffffff', gradient: '#ffd23f', outline: COLORS.ink, shadow: '#7a1a10', scale: 7, align: 'center' });
        drawText(ctx, 'FIGHTING GAME', 320, 110 + bob, { color: '#ff8a5c', gradient: '#e8412c', outline: COLORS.ink, scale: 3, align: 'center' });
        if (this.t % 60 < 40) drawText(ctx, 'APPUYEZ SUR ENTRÉE', 320, 320, { color: '#ffffff', outline: COLORS.ink, scale: 2, align: 'center' });
        drawText(ctx, 'PROJET DE FAN NON OFFICIEL · SPRITES ONE PIECE GIGANT BATTLE 2 (BANDAI NAMCO / GANBARION)', 320, 348, { color: '#9a8fb0', align: 'center' });
    }
}

// ——— Main menu ———

export class MainMenuScene implements Scene {
    private t = 0;
    private list = new OptionList(['ARCADE', 'VERSUS J1 CONTRE J2', 'VERSUS ORDINATEUR', 'ENTRAÎNEMENT', 'COMMANDES']);
    private blurbs = [
        'Affrontez tout le roster, l\'un après l\'autre.',
        'Deux joueurs sur le même clavier ou deux manettes.',
        'Choisissez votre adversaire et sa difficulté.',
        'Adversaire immobile, vie et jauge infinies, boîtes visibles.',
        'Touches, manettes et toutes les mécaniques du jeu.'
    ];
    constructor(private app: App) {}

    tick(menu: MenuInput[]): void {
        this.t++;
        const r = this.list.handle(menu);
        if (r === 'back') this.app.go(new TitleScene(this.app));
        if (r !== 'confirm') return;
        const modes: (Mode | 'controls')[] = ['arcade', 'versus', 'versusCpu', 'training', 'controls'];
        const m = modes[this.list.index];
        if (m === 'controls') this.app.go(new ControlsScene(this.app, this));
        else this.app.go(new SelectScene(this.app, m));
    }

    draw(ctx: CanvasRenderingContext2D): void {
        menuBackdrop(ctx, this.t, 'arlong-park');
        drawText(ctx, 'ONE PEAXEL', 44, 34, { color: '#fff', gradient: COLORS.gold, outline: COLORS.ink, scale: 4 });
        panel(ctx, 30, 96, 330, 150);
        menuItems(ctx, this.list.items, this.list.index, 52, 114, this.t);
        panel(ctx, 30, 256, 580, 34, COLORS.dim);
        drawText(ctx, this.blurbs[this.list.index], 44, 268, { color: '#e8e0f0' });
        // A fighter on the right, changing with the cursor.
        const c = ROSTER[this.list.index % ROSTER.length];
        const art = artOf(c.id, 'art');
        if (art) {
            const s = Math.min(2, 220 / art.height);
            ctx.drawImage(art, 610 - art.width * s, 250 - art.height * s, art.width * s, art.height * s);
        }
        hint(ctx, `${keyLabel(KEYS[0].up[0])}${keyLabel(KEYS[0].down[0])} / ↑↓ : CHOISIR · ${keyLabel(KEYS[0].light[0])} / ENTRÉE : VALIDER · ${keyLabel(KEYS[0].heavy[0])} / ÉCHAP : RETOUR`);
    }
}

// ——— Character select ———

interface Cursor { index: number; locked: boolean; side: 0 | 1 }

export class SelectScene implements Scene {
    private t = 0;
    private cursors: Cursor[];
    /** In one-player modes, player 1 picks both, one after the other. */
    private picking: 0 | 1 = 0;
    private level = 2;
    private levelStep = false;

    constructor(private app: App, private mode: Mode, private prev?: Setup) {
        const i1 = prev ? ROSTER.findIndex((c) => c.id === prev.p1) : 0;
        const i2 = prev ? ROSTER.findIndex((c) => c.id === prev.p2) : 1;
        this.cursors = [{ index: Math.max(0, i1), locked: false, side: 0 }, { index: Math.max(0, i2), locked: false, side: 1 }];
        if (prev) this.level = prev.cpuLevel;
    }

    enter(): void { startMusic('select'); }

    private get twoPlayers(): boolean { return this.mode === 'versus'; }

    tick(menu: MenuInput[]): void {
        this.t++;
        for (const m of menu) {
            const side = this.twoPlayers ? m.side : this.picking;
            if (!this.twoPlayers && m.side !== 0) continue;
            const c = this.cursors[side];
            if (this.levelStep) {
                if (m.action === 'left' || m.action === 'down') { this.level = Math.max(0, this.level - 1); play('uiMove'); }
                if (m.action === 'right' || m.action === 'up') { this.level = Math.min(LEVELS.length - 1, this.level + 1); play('uiMove'); }
                if (m.action === 'confirm') { play('uiSelect'); this.finish(); return; }
                if (m.action === 'back') { this.levelStep = false; this.cursors[1].locked = false; play('uiBack'); }
                continue;
            }
            if (m.action === 'back') {
                play('uiBack');
                if (c.locked) c.locked = false;
                else if (!this.twoPlayers && this.picking === 1) { this.picking = 0; this.cursors[0].locked = false; }
                else { this.app.go(new MainMenuScene(this.app)); return; }
                continue;
            }
            if (c.locked) continue;
            const n = ROSTER.length;
            if (m.action === 'left') { c.index = (c.index + n - 1) % n; play('uiMove'); }
            if (m.action === 'right') { c.index = (c.index + 1) % n; play('uiMove'); }
            if (m.action === 'confirm') {
                c.locked = true;
                play('uiSelect');
                if (!this.twoPlayers) {
                    if (this.mode === 'arcade') { this.finish(); return; }
                    if (this.picking === 0) this.picking = 1;
                    else if (this.mode === 'versusCpu') this.levelStep = true;
                    else { this.finish(); return; }
                }
            }
        }
        if (this.twoPlayers && this.cursors.every((c) => c.locked)) this.finish();
    }

    private finish(): void {
        const p1 = ROSTER[this.cursors[0].index].id;
        if (this.mode === 'arcade') {
            const others = ROSTER.map((c) => c.id).filter((id) => id !== p1);
            // The Admiral waits at the end of the road.
            const boss = others.includes('akainu') ? 'akainu' : others[others.length - 1];
            const rest = others.filter((id) => id !== boss).sort(() => Math.random() - 0.5);
            const ladder = [...rest, boss];
            const setup: Setup = { mode: 'arcade', p1, p2: ladder[0], stage: randomStage(), cpuLevel: 1, ladder, beaten: 0 };
            this.app.go(new VersusScene(this.app, setup));
            return;
        }
        const p2 = ROSTER[this.cursors[1].index].id;
        const setup: Setup = { mode: this.mode, p1, p2, stage: this.prev?.stage ?? randomStage(), cpuLevel: this.level };
        if (this.mode === 'training') this.app.go(new FightScene(this.app, { ...setup, stage: 'marineford' }));
        else this.app.go(new StageScene(this.app, setup));
    }

    draw(ctx: CanvasRenderingContext2D): void {
        menuBackdrop(ctx, this.t, 'enies-lobby', 'rgba(14,4,24,0.8)');
        title(ctx, 'CHOIX DU COMBATTANT', 16);
        const labels: Record<Mode, string> = { arcade: 'ARCADE', versus: 'VERSUS', versusCpu: 'CONTRE L\'ORDINATEUR', training: 'ENTRAÎNEMENT' };
        drawText(ctx, labels[this.mode], 320, 44, { color: COLORS.dim, align: 'center' });

        // Big art for each side.
        for (const side of [0, 1] as const) {
            if (this.mode === 'arcade' && side === 1) continue;
            const c = ROSTER[this.cursors[side].index];
            const active = this.twoPlayers || this.picking === side || this.cursors[side].locked;
            if (!active && side === 1) continue;
            this.drawSide(ctx, c, side, this.cursors[side].locked);
        }

        // Portrait grid.
        const n = ROSTER.length;
        const cw = 62;
        const x0 = 320 - (n * cw) / 2;
        const y0 = 262;
        ROSTER.forEach((c, i) => {
            const x = x0 + i * cw;
            ctx.fillStyle = '#12091c';
            ctx.fillRect(x + 2, y0, cw - 4, 70);
            const p = artOf(c.id, 'portrait');
            if (p) {
                const s = Math.min((cw - 8) / p.width, 64 / p.height);
                ctx.drawImage(p, x + (cw - p.width * s) / 2, y0 + 3 + (64 - p.height * s), p.width * s, p.height * s);
            }
            ctx.strokeStyle = '#3a2a4a';
            ctx.strokeRect(x + 2.5, y0 + 0.5, cw - 5, 69);
        });
        for (const side of [0, 1] as const) {
            if (this.mode === 'arcade' && side === 1) continue;
            if (!this.twoPlayers && side === 1 && this.picking === 0 && !this.cursors[1].locked) continue;
            const c = this.cursors[side];
            const x = x0 + c.index * cw;
            const color = side === 0 ? '#ff5a3c' : '#4cc3ff';
            const blink = c.locked || this.t % 20 < 14;
            if (blink) {
                ctx.strokeStyle = color;
                ctx.lineWidth = 2;
                const inset = side === 0 ? 1 : 4;
                ctx.strokeRect(x + 1 + inset, y0 - 1 + inset, cw - 2 - inset * 2, 72 - inset * 2);
                ctx.lineWidth = 1;
            }
            drawText(ctx, side === 0 ? 'J1' : (this.twoPlayers ? 'J2' : 'CPU'), x + (side === 0 ? 6 : cw - 20), y0 - 10, { color, outline: COLORS.ink });
        }
        if (this.levelStep) {
            panel(ctx, 220, 150, 200, 60, COLORS.blue);
            drawText(ctx, 'DIFFICULTÉ', 320, 160, { color: '#fff', outline: COLORS.ink, align: 'center' });
            const names = ['FACILE', 'NORMAL', 'DIFFICILE', 'EXPERT', 'AMIRAL'];
            drawText(ctx, `← ${names[this.level]} →`, 320, 182, { color: COLORS.gold, outline: COLORS.ink, scale: 2, align: 'center' });
        }
        hint(ctx, this.twoPlayers ? 'J1 : ← → ET J · J2 : ← → ET PAVÉ 1 · RETOUR : K / PAVÉ 2' : '← → : CHOISIR · J / ENTRÉE : VALIDER · K / ÉCHAP : RETOUR');
    }

    private drawSide(ctx: CanvasRenderingContext2D, c: CharacterDef, side: 0 | 1, locked: boolean): void {
        const art = artOf(c.id, 'art');
        const x = side === 0 ? 20 : 620;
        if (art) {
            const s = Math.min(1.4, 190 / art.height);
            const w = art.width * s;
            const h = art.height * s;
            ctx.save();
            if (side === 1) { ctx.translate(x, 0); ctx.scale(-1, 1); ctx.translate(-x, 0); }
            ctx.globalAlpha = locked ? 1 : 0.9;
            ctx.drawImage(art, x, 250 - h, w, h);
            ctx.restore();
        }
        const tx = side === 0 ? 30 : 610;
        const align = side === 0 ? 'left' : 'right';
        ctx.fillStyle = 'rgba(10,4,20,0.7)';
        ctx.fillRect(side === 0 ? 20 : 400, 58, 220, 108);
        drawText(ctx, c.name.toUpperCase(), tx, 64, { color: '#ffffff', gradient: c.color, outline: COLORS.ink, scale: 3, align });
        drawText(ctx, c.title.toUpperCase(), tx, 92, { color: COLORS.gold, outline: COLORS.ink, align });
        // Stats.
        const stats: [string, number][] = [
            ['VIE', (c.health - 850) / 300],
            ['VITESSE', (c.walk - 1) / 1.2],
            ['PUISSANCE', (c.moves.heavy.hits[0]?.damage ?? 60) / 100]
        ];
        stats.forEach(([label, v], i) => {
            const y = 108 + i * 12;
            drawText(ctx, label, side === 0 ? tx : tx - 120, y, { color: '#cfc4dc', outline: COLORS.ink });
            const bx = side === 0 ? tx + 64 : tx - 56;
            ctx.fillStyle = '#20142c';
            ctx.fillRect(bx, y, 56, 6);
            ctx.fillStyle = c.color;
            ctx.fillRect(bx, y, Math.round(56 * Math.max(0.1, Math.min(1, v))), 6);
        });
        if (locked) drawText(ctx, 'PRÊT !', tx, 150, { color: '#9dff7a', outline: COLORS.ink, scale: 2, align });
    }
}

// ——— Stage select ———

export class StageScene implements Scene {
    private t = 0;
    private index: number;
    constructor(private app: App, private setup: Setup) {
        this.index = Math.max(0, STAGES.findIndex((s) => s.id === setup.stage));
    }

    tick(menu: MenuInput[]): void {
        this.t++;
        for (const m of menu) {
            if (m.action === 'left') { this.index = (this.index + STAGES.length - 1) % STAGES.length; play('uiMove'); }
            if (m.action === 'right') { this.index = (this.index + 1) % STAGES.length; play('uiMove'); }
            if (m.action === 'back') { play('uiBack'); this.app.go(new SelectScene(this.app, this.setup.mode, this.setup)); return; }
            if (m.action === 'confirm') {
                play('uiSelect');
                this.app.go(new VersusScene(this.app, { ...this.setup, stage: STAGES[this.index].id }));
                return;
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const s = STAGES[this.index];
        menuBackdrop(ctx, this.t, s.id, 'rgba(10,4,20,0.35)');
        title(ctx, 'CHOIX DE L\'ARÈNE', 16);
        const img = stageImage(s.id);
        panel(ctx, 110, 60, 420, 200);
        if (img) ctx.drawImage(img, 0, 0, img.width, img.height, 114, 64, 412, 192);
        drawText(ctx, `← ${s.name.toUpperCase()} →`, 320, 272, { color: '#fff', gradient: COLORS.gold, outline: COLORS.ink, scale: 3, align: 'center' });
        const dots = STAGES.map((_, i) => (i === this.index ? '•' : '·')).join(' ');
        drawText(ctx, dots, 320, 306, { color: COLORS.gold, align: 'center' });
        hint(ctx, '← → : CHOISIR · J / ENTRÉE : COMBATTRE · K / ÉCHAP : RETOUR');
    }
}

// ——— Versus splash ———

export class VersusScene implements Scene {
    private t = 0;
    constructor(private app: App, private setup: Setup) {}

    enter(): void { stopMusic(); play('uiSelect'); }

    tick(menu: MenuInput[]): void {
        this.t++;
        if (this.t > 170 || (this.t > 30 && menu.some((m) => m.action === 'confirm'))) {
            this.app.go(new FightScene(this.app, this.setup));
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const [a, b] = [getChar(this.setup.p1), getChar(this.setup.p2)];
        const k = Math.min(1, this.t / 14);
        const ease = 1 - Math.pow(1 - k, 3);
        // Two halves split by a diagonal.
        ctx.fillStyle = a.color;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(360, 0); ctx.lineTo(280, 360); ctx.lineTo(0, 360); ctx.fill();
        ctx.fillStyle = b.color;
        ctx.beginPath(); ctx.moveTo(360, 0); ctx.lineTo(640, 0); ctx.lineTo(640, 360); ctx.lineTo(280, 360); ctx.fill();
        ctx.fillStyle = 'rgba(10,4,20,0.55)';
        ctx.fillRect(0, 0, 640, 360);
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.moveTo(356, 0); ctx.lineTo(364, 0); ctx.lineTo(284, 360); ctx.lineTo(276, 360); ctx.fill();
        for (const [c, side] of [[a, 0], [b, 1]] as const) {
            const art = artOf(c.id, 'art');
            if (!art) continue;
            const s = Math.min(1.8, 250 / art.height);
            const w = art.width * s;
            const h = art.height * s;
            const x = side === 0 ? -w + (w + 20) * ease : 640 - (w + 20) * ease;
            ctx.save();
            if (side === 1) { ctx.translate(x + w, 0); ctx.scale(-1, 1); ctx.drawImage(art, 0, 300 - h, w, h); }
            else ctx.drawImage(art, x, 300 - h, w, h);
            ctx.restore();
            const tx = side === 0 ? 24 : 616;
            const align = side === 0 ? 'left' : 'right';
            drawText(ctx, c.name.toUpperCase(), tx, 300, { color: '#fff', gradient: COLORS.gold, outline: COLORS.ink, scale: 4, align });
            drawText(ctx, c.title.toUpperCase(), tx, 334, { color: '#fff', outline: COLORS.ink, align });
        }
        const vsScale = this.t < 20 ? 1 : this.t < 26 ? 12 - (this.t - 20) : 6;
        if (this.t >= 20) drawText(ctx, 'VS', 320, 150 - vsScale * 3, { color: '#ffffff', gradient: '#ff5a3c', outline: COLORS.ink, shadow: '#000', scale: Math.round(vsScale), align: 'center' });
        const stage = STAGES.find((s) => s.id === this.setup.stage);
        if (this.setup.mode === 'arcade') {
            drawText(ctx, `COMBAT ${(this.setup.beaten ?? 0) + 1} / ${(this.setup.ladder?.length ?? 1)}`, 320, 20, { color: '#fff', outline: COLORS.ink, scale: 2, align: 'center' });
        }
        if (stage) drawText(ctx, stage.name.toUpperCase(), 320, 44, { color: COLORS.gold, outline: COLORS.ink, align: 'center' });
    }
}

// ——— Fight ———

const SLOT_NOTATION: [MoveSlot, string][] = [
    ['lightA', '[A]'], ['lightB', '[A] [A]'], ['lightC', '[A] [A] [A]'],
    ['heavy', '[B]'], ['heavyFwd', '→ [B]'], ['heavyBack', '← [B]'],
    ['crouchLight', '↓ [A]'], ['crouchHeavy', '↓ [B]'],
    ['airLight', 'SAUT [A]'], ['airHeavy', 'SAUT [B]'], ['airSpecial', 'SAUT [C]'],
    ['specialN', '[C]  OU  ↓↘→ [C]'], ['specialF', '→ [C]'], ['specialU', '↑ [C]  OU  →↓↘ [C]'],
    ['specialD', '↓ [C]  OU  ↓↙← [C]'], ['throw', '[A]+[B] (PRÈS)'], ['ultimate', '[B]+[C] (1 BARRE)']
];

export class FightScene implements Scene {
    private state: MatchState;
    private view: FightView;
    private cpu: (Cpu | null)[] = [null, null];
    private paused = false;
    private pauseList: OptionList;
    private showMoves = false;
    private endT = 0;
    private dummy: DummyMode = 'stand';
    private boxes = false;
    private t = 0;

    constructor(private app: App, private setup: Setup) {
        const training = setup.mode === 'training';
        this.state = createMatch(setup.p1, setup.p2, { training });
        const stage = STAGES.find((s) => s.id === setup.stage) ?? STAGES[0];
        const names: [string, string] = setup.mode === 'versus' ? ['J1', 'J2'] : ['J1', training ? 'MANNEQUIN' : 'CPU'];
        this.view = new FightView(this.state, stage, { names, training });
        if (setup.mode === 'arcade' || setup.mode === 'versusCpu') {
            const level = setup.mode === 'arcade' ? Math.min(LEVELS.length - 1, 1 + (setup.beaten ?? 0)) : setup.cpuLevel;
            this.cpu[1] = new Cpu(LEVELS[level], Date.now() & 0xffff);
        }
        this.pauseList = new OptionList(this.pauseItems());
    }

    enter(): void { startMusic(this.setup.stage); }

    private pauseItems(): string[] {
        if (this.setup.mode === 'training') {
            const names: Record<DummyMode, string> = { stand: 'DEBOUT', crouch: 'ACCROUPI', guard: 'GARDE', jump: 'SAUTE', cpu: 'ORDINATEUR' };
            return ['REPRENDRE', 'LISTE DES COUPS', `MANNEQUIN : ${names[this.dummy]}`, `BOÎTES : ${this.boxes ? 'OUI' : 'NON'}`, 'CHANGER DE PERSONNAGES', 'MENU PRINCIPAL'];
        }
        return ['REPRENDRE', 'LISTE DES COUPS', 'RECOMMENCER', 'MENU PRINCIPAL'];
    }

    tick(menu: MenuInput[]): void {
        this.t++;
        if (this.showMoves || this.paused) endInputTick();
        if (this.showMoves) {
            if (menu.some((m) => m.action === 'back' || m.action === 'confirm' || m.action === 'start')) { this.showMoves = false; play('uiBack'); }
            return;
        }
        if (this.paused) {
            const r = this.pauseList.handle(menu);
            if (menu.some((m) => m.action === 'start') || r === 'back') { this.paused = false; return; }
            if (r === 'confirm') this.pauseChoice(this.pauseList.items[this.pauseList.index]);
            return;
        }
        if (menu.some((m) => m.action === 'start') && this.state.phase !== 'matchEnd') {
            this.paused = true;
            this.pauseList.index = 0;
            play('uiConfirm');
            return;
        }

        const inputs: [number, number] = [0, 0];
        for (const side of [0, 1] as const) {
            const cpu = this.cpu[side];
            if (cpu) inputs[side] = cpu.next(this.state, side);
            else if (this.setup.mode === 'training' && side === 1) inputs[side] = dummyBits(this.dummy, this.state.fighters[1], this.t);
            else if (this.setup.mode === 'versus' || side === 0) inputs[side] = readSide(side) & ~BTN.start;
        }
        endInputTick();
        const events = stepMatch(this.state, inputs);
        this.view.handle(events);
        this.view.update();
        if (events.some((e) => e.type === 'matchEnd')) {
            const w = this.state.winner;
            const human = this.setup.mode === 'versus' ? w < 2 : w === 0;
            play(human ? 'win' : 'lose');
        }
        if (this.state.phase === 'matchEnd') {
            this.endT++;
            if (this.endT > 150) this.app.go(new ResultsScene(this.app, this.setup, this.state.winner));
        }
    }

    private pauseChoice(item: string): void {
        if (item === 'REPRENDRE') this.paused = false;
        else if (item === 'LISTE DES COUPS') this.showMoves = true;
        else if (item === 'RECOMMENCER') this.app.go(new FightScene(this.app, this.setup));
        else if (item === 'MENU PRINCIPAL') this.app.go(new MainMenuScene(this.app));
        else if (item === 'CHANGER DE PERSONNAGES') this.app.go(new SelectScene(this.app, this.setup.mode, this.setup));
        else if (item.startsWith('MANNEQUIN')) {
            const order: DummyMode[] = ['stand', 'crouch', 'guard', 'jump', 'cpu'];
            this.dummy = order[(order.indexOf(this.dummy) + 1) % order.length];
            this.cpu[1] = this.dummy === 'cpu' ? new Cpu(LEVELS[2], 3) : null;
        } else if (item.startsWith('BOÎTES')) {
            this.boxes = !this.boxes;
            this.view.options.showBoxes = this.boxes;
        }
        const i = this.pauseList.index;
        this.pauseList.items = this.pauseItems();
        this.pauseList.index = i;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        this.view.draw(ctx);
        if (this.setup.mode === 'training') this.drawTrainingInfo(ctx);
        if (this.paused) {
            ctx.fillStyle = 'rgba(8,4,16,0.7)';
            ctx.fillRect(0, 0, 640, 360);
            title(ctx, 'PAUSE', 70);
            panel(ctx, 180, 110, 280, this.pauseList.items.length * 22 + 20);
            menuItems(ctx, this.pauseList.items, this.pauseList.index, 200, 124, this.t);
        }
        if (this.showMoves) this.drawMoveList(ctx, getChar(this.setup.p1));
    }

    private drawTrainingInfo(ctx: CanvasRenderingContext2D): void {
        const f = this.state.fighters[0];
        const d = this.state.fighters[1];
        panel(ctx, 234, 48, 172, 30, COLORS.dim);
        drawText(ctx, `COMBO ${d.combo}  DÉGÂTS ${d.comboDamage}`, 320, 52, { color: '#fff', align: 'center' });
        drawText(ctx, `COUP : ${f.move ? getChar(f.char).moves[f.move as MoveSlot].name.toUpperCase().slice(0, 22) : '—'}`, 320, 64, { color: COLORS.gold, align: 'center' });
        drawText(ctx, 'ÉCHAP : PAUSE / OPTIONS', 320, 330, { color: '#cfc4dc', outline: COLORS.ink, align: 'center' });
    }

    private drawMoveList(ctx: CanvasRenderingContext2D, c: CharacterDef): void {
        ctx.fillStyle = 'rgba(8,4,16,0.88)';
        ctx.fillRect(0, 0, 640, 360);
        drawText(ctx, `${c.name.toUpperCase()} · LISTE DES COUPS`, 320, 14, { color: '#fff', gradient: COLORS.gold, outline: COLORS.ink, scale: 2, align: 'center' });
        const k = KEYS[0];
        drawText(ctx, `[A] LÉGER = ${keyLabel(k.light[0])}   [B] FORT = ${keyLabel(k.heavy[0])}   [C] SPÉCIAL = ${keyLabel(k.special[0])}`.replace(/\[|\]/g, ''), 320, 36, { color: COLORS.dim, align: 'center' });
        SLOT_NOTATION.forEach(([slot, input], i) => {
            const col = i < 9 ? 0 : 1;
            const row = i < 9 ? i : i - 9;
            const x = col === 0 ? 24 : 330;
            const y = 58 + row * 30;
            const move = c.moves[slot];
            const kind = move.kind === 'ultimate' ? '#ffd23f' : move.kind === 'special' ? '#9ff3ff' : '#ffffff';
            drawText(ctx, move.name.toUpperCase().slice(0, 44), x, y, { color: kind, outline: COLORS.ink });
            notation(ctx, input, x + 8, y + 12, '#cfc4dc');
        });
        hint(ctx, 'N\'IMPORTE QUELLE TOUCHE : FERMER');
    }
}

// ——— Results ———

export class ResultsScene implements Scene {
    private t = 0;
    private list: OptionList;

    constructor(private app: App, private setup: Setup, private winner: number) {
        const arcade = setup.mode === 'arcade';
        const won = winner === 0;
        if (arcade && won) {
            const done = (setup.beaten ?? 0) + 1 >= (setup.ladder?.length ?? 0);
            this.list = new OptionList(done ? ['GÉNÉRIQUE'] : ['COMBAT SUIVANT', 'MENU PRINCIPAL']);
        } else if (arcade) {
            this.list = new OptionList(['CONTINUER', 'MENU PRINCIPAL']);
        } else {
            this.list = new OptionList(['REVANCHE', 'CHANGER DE PERSONNAGES', 'MENU PRINCIPAL']);
        }
    }

    enter(): void { startMusic('results'); }

    tick(menu: MenuInput[]): void {
        this.t++;
        const r = this.list.handle(menu, [0]);
        if (r !== 'confirm') return;
        const item = this.list.items[this.list.index];
        const s = this.setup;
        if (item === 'REVANCHE' || item === 'CONTINUER') this.app.go(new VersusScene(this.app, s));
        else if (item === 'CHANGER DE PERSONNAGES') this.app.go(new SelectScene(this.app, s.mode, s));
        else if (item === 'MENU PRINCIPAL') this.app.go(new MainMenuScene(this.app));
        else if (item === 'COMBAT SUIVANT') {
            const beaten = (s.beaten ?? 0) + 1;
            this.app.go(new VersusScene(this.app, { ...s, beaten, p2: s.ladder![beaten], stage: randomStage() }));
        } else if (item === 'GÉNÉRIQUE') this.app.go(new EndingScene(this.app, s.p1));
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const draw = this.winner === 2;
        const winId = draw ? this.setup.p1 : this.winner === 0 ? this.setup.p1 : this.setup.p2;
        const c = getChar(winId);
        menuBackdrop(ctx, this.t, this.setup.stage, 'rgba(12,4,22,0.7)');
        const art = artOf(winId, 'art');
        if (art) {
            const s = Math.min(1.9, 300 / art.height);
            ctx.drawImage(art, 330, 340 - art.height * s, art.width * s, art.height * s);
        }
        const who = this.setup.mode === 'versus' ? (this.winner === 0 ? 'J1' : 'J2') : this.winner === 0 ? 'VOUS' : 'L\'ORDINATEUR';
        drawText(ctx, draw ? 'MATCH NUL' : 'VICTOIRE', 40, 50, { color: '#fff', gradient: COLORS.gold, outline: COLORS.ink, shadow: '#000', scale: 5 });
        if (!draw) {
            drawText(ctx, c.name.toUpperCase(), 40, 100, { color: c.color, outline: COLORS.ink, scale: 3 });
            drawText(ctx, who, 40, 128, { color: '#cfc4dc', outline: COLORS.ink, scale: 2 });
        }
        panel(ctx, 30, 180, 280, this.list.items.length * 22 + 20);
        menuItems(ctx, this.list.items, this.list.index, 50, 194, this.t);
    }
}

export class EndingScene implements Scene {
    private t = 0;
    constructor(private app: App, private hero: string) {}
    enter(): void { startMusic('results'); play('win'); }
    tick(menu: MenuInput[]): void {
        this.t++;
        if (this.t > 60 && menu.some((m) => m.action === 'confirm' || m.action === 'start')) this.app.go(new TitleScene(this.app));
    }
    draw(ctx: CanvasRenderingContext2D): void {
        const c = getChar(this.hero);
        menuBackdrop(ctx, this.t, 'marineford', 'rgba(40,20,0,0.5)');
        const art = artOf(this.hero, 'art');
        if (art) {
            const s = Math.min(2, 280 / art.height);
            ctx.drawImage(art, 320 - (art.width * s) / 2, 330 - art.height * s, art.width * s, art.height * s);
        }
        drawText(ctx, 'FÉLICITATIONS !', 320, 30, { color: '#fff', gradient: COLORS.gold, outline: COLORS.ink, scale: 4, align: 'center' });
        drawText(ctx, `${c.name.toUpperCase()} A VAINCU TOUS SES ADVERSAIRES.`, 320, 70, { color: '#fff', outline: COLORS.ink, scale: 2, align: 'center' });
        if (this.t > 60 && this.t % 60 < 40) drawText(ctx, 'APPUYEZ SUR ENTRÉE', 320, 340, { color: '#fff', outline: COLORS.ink, align: 'center' });
    }
}

// ——— Controls ———

export class ControlsScene implements Scene {
    private t = 0;
    private page = 0;
    constructor(private app: App, private back: Scene) {}

    tick(menu: MenuInput[]): void {
        this.t++;
        for (const m of menu) {
            if (m.action === 'left' || m.action === 'right') { this.page = 1 - this.page; play('uiMove'); }
            if (m.action === 'back' || m.action === 'start') { play('uiBack'); this.app.go(this.back); return; }
            if (m.action === 'confirm') { this.page = 1 - this.page; play('uiMove'); }
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        menuBackdrop(ctx, this.t, 'rain-dinners', 'rgba(12,4,22,0.85)');
        title(ctx, this.page === 0 ? 'COMMANDES' : 'MÉCANIQUES', 14);
        if (this.page === 0) this.drawKeys(ctx);
        else this.drawSystems(ctx);
        hint(ctx, '← → : PAGE SUIVANTE · K / ÉCHAP : RETOUR');
    }

    private drawKeys(ctx: CanvasRenderingContext2D): void {
        for (const side of [0, 1] as const) {
            const k = KEYS[side];
            const x = side === 0 ? 30 : 330;
            panel(ctx, x, 50, 280, 176, side === 0 ? '#ff5a3c' : '#4cc3ff');
            drawText(ctx, side === 0 ? 'JOUEUR 1 · CLAVIER' : 'JOUEUR 2 · CLAVIER', x + 12, 60, { color: '#fff', gradient: COLORS.gold, outline: COLORS.ink, scale: 1 });
            const rows: [string, string][] = [
                ['DÉPLACEMENT', `${keyLabel(k.up[0])} ${keyLabel(k.left[0])} ${keyLabel(k.down[0])} ${keyLabel(k.right[0])}`],
                ['[A] LÉGER', keyLabel(k.light[0])],
                ['[B] FORT', keyLabel(k.heavy[0])],
                ['[C] SPÉCIAL', keyLabel(k.special[0])],
                ['CHOPE [A]+[B]', keyLabel(k.throwKey[0])],
                ['ULTIME [B]+[C]', keyLabel(k.ultimate[0])],
                ['PAUSE', keyLabel(k.start[0])]
            ];
            rows.forEach(([label, key], i) => {
                notation(ctx, label, x + 14, 82 + i * 20, '#cfc4dc');
                drawText(ctx, key, x + 266, 82 + i * 20, { color: '#fff', outline: COLORS.ink, align: 'right' });
            });
        }
        panel(ctx, 30, 236, 580, 96, COLORS.dim);
        drawText(ctx, 'MANETTE', 44, 246, { color: '#fff', gradient: COLORS.gold, outline: COLORS.ink });
        const lines = [
            'CROIX / STICK : DÉPLACEMENT    A OU X : [A] LÉGER    Y : [B] FORT    B : [C] SPÉCIAL',
            'LB : CHOPE    RB / RT : ULTIME    START : PAUSE',
            'LA PREMIÈRE MANETTE BRANCHÉE JOUE J1, LA SECONDE J2.'
        ];
        lines.forEach((l, i) => notation(ctx, l, 44, 266 + i * 18, '#cfc4dc'));
    }

    private drawSystems(ctx: CanvasRenderingContext2D): void {
        const items: [string, string][] = [
            ['GARDE', 'Maintenir la direction opposée à l\'adversaire. Debout : bloque les coups hauts. Accroupi : les coups bas.'],
            ['JAUGE DE GARDE', 'Chaque coup bloqué l\'use. Vide : garde brisée, le combattant est étourdi.'],
            ['ENCHAÎNEMENTS', '[A] [A] [A] forme une série. Un coup normal qui touche s\'annule en coup spécial.'],
            ['COUPS DIRECTIONNELS', '→ [B] passe la garde basse, ← [B] projette en l\'air, ↓ [B] fauche.'],
            ['JONGLAGES', 'Un adversaire projeté peut être frappé en l\'air, dans une certaine limite.'],
            ['CHOPE', '[A]+[B] près de l\'adversaire. Se dégage en appuyant [A]+[B] à temps.'],
            ['ULTIME', 'La jauge se remplit en frappant et en encaissant. [B]+[C] avec une barre pleine.'],
            ['DÉPLACEMENTS', 'Double tap avant : ruée. Double tap arrière : esquive (brièvement invulnérable).']
        ];
        items.forEach(([h, text], i) => {
            const y = 48 + i * 36;
            drawText(ctx, h, 30, y, { color: COLORS.gold, outline: COLORS.ink });
            notation(ctx, text.toUpperCase(), 30, y + 13, '#e8e0f0');
        });
    }
}
