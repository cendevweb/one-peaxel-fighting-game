import { ROSTER } from './characters';
import { App } from './game/app';
import { TitleScene } from './game/scenes';
import { drawText } from './render/font';
import { loadAtlas, loadCommon } from './render/sprites';
import { STAGES, loadStage } from './render/stage';

const canvas = document.getElementById('screen') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
ctx.imageSmoothingEnabled = false;

/** Scale the 640×360 canvas to the window: whole multiples when they fit,
 *  so every sprite pixel stays square. */
function fit(): void {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const fitScale = Math.min(w / 640, h / 360);
    const scale = fitScale >= 1 ? Math.max(1, Math.floor(fitScale * 2) / 2) : fitScale;
    canvas.style.width = `${Math.floor(640 * scale)}px`;
    canvas.style.height = `${Math.floor(360 * scale)}px`;
}
window.addEventListener('resize', fit);
fit();

async function boot(): Promise<void> {
    const jobs: Promise<void>[] = [loadCommon(), ...ROSTER.map((c) => loadAtlas(c.manifest)), ...STAGES.map((s) => loadStage(s.id))];
    let done = 0;
    const progress = () => {
        ctx.fillStyle = '#07040c';
        ctx.fillRect(0, 0, 640, 360);
        drawText(ctx, 'CHARGEMENT…', 320, 160, { color: '#ffd23f', outline: '#1a0b12', scale: 2, align: 'center' });
        ctx.fillStyle = '#20142c';
        ctx.fillRect(220, 190, 200, 6);
        ctx.fillStyle = '#ffd23f';
        ctx.fillRect(220, 190, 200 * (done / jobs.length), 6);
    };
    progress();
    await Promise.all(jobs.map((j) => j.then(() => { done++; progress(); })));
    const app = new App(ctx);
    app.go(new TitleScene(app), true);
    app.start();
}

boot().catch((err) => {
    ctx.fillStyle = '#300';
    ctx.fillRect(0, 0, 640, 360);
    drawText(ctx, 'ERREUR DE CHARGEMENT', 320, 150, { color: '#fff', scale: 2, align: 'center' });
    drawText(ctx, String(err.message ?? err).toUpperCase().slice(0, 90), 320, 180, { color: '#fcc', align: 'center' });
    console.error(err);
});
