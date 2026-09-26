/**
 * Every sound is synthesised with WebAudio: no audio file ships with the
 * game. Short envelopes over noise and simple oscillators give the crunchy,
 * handheld-era feel of the source game.
 */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let sfxBus: GainNode | null = null;
let musicBus: GainNode | null = null;
let noiseBuffer: AudioBuffer | null = null;

export const volume = { sfx: 0.8, music: 0.45 };

export function unlockAudio(): void {
    if (ctx) {
        if (ctx.state === 'suspended') void ctx.resume();
        return;
    }
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.7;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -12;
    comp.ratio.value = 4;
    master.connect(comp).connect(ctx.destination);
    sfxBus = ctx.createGain();
    sfxBus.gain.value = volume.sfx;
    sfxBus.connect(master);
    musicBus = ctx.createGain();
    musicBus.gain.value = volume.music;
    musicBus.connect(master);
    noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
}

export function setVolumes(sfx: number, music: number): void {
    volume.sfx = sfx;
    volume.music = music;
    if (sfxBus) sfxBus.gain.value = sfx;
    if (musicBus) musicBus.gain.value = music;
}

export const audioContext = () => ctx;
export const musicOut = () => musicBus;

interface Env { a?: number; d: number; peak?: number }

function envelope(g: GainNode, t: number, e: Env): void {
    const a = e.a ?? 0.002;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(e.peak ?? 0.5, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + e.d);
}

function noise(t: number, dur: number, filter: BiquadFilterType, f0: number, f1: number, e: Env, q = 1): void {
    if (!ctx || !noiseBuffer || !sfxBus) return;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer;
    src.playbackRate.value = 0.8 + Math.random() * 0.4;
    const bq = ctx.createBiquadFilter();
    bq.type = filter;
    bq.Q.value = q;
    bq.frequency.setValueAtTime(f0, t);
    bq.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    const g = ctx.createGain();
    envelope(g, t, e);
    src.connect(bq).connect(g).connect(sfxBus);
    src.start(t, Math.random() * 0.5);
    src.stop(t + dur + 0.05);
}

function tone(t: number, type: OscillatorType, f0: number, f1: number, e: Env, dest?: AudioNode): void {
    if (!ctx || !sfxBus) return;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + (e.a ?? 0.002) + e.d);
    const g = ctx.createGain();
    envelope(g, t, e);
    o.connect(g).connect(dest ?? sfxBus);
    o.start(t);
    o.stop(t + (e.a ?? 0.002) + e.d + 0.05);
}

const SOUNDS: Record<string, (t: number) => void> = {
    swing: (t) => noise(t, 0.09, 'bandpass', 1800, 4200, { d: 0.08, peak: 0.25 }, 2),
    swingHeavy: (t) => noise(t, 0.16, 'bandpass', 700, 2600, { a: 0.01, d: 0.15, peak: 0.35 }, 1.5),
    stretch: (t) => { tone(t, 'triangle', 180, 720, { d: 0.18, peak: 0.3 }); noise(t, 0.12, 'bandpass', 1200, 3000, { d: 0.1, peak: 0.15 }); },
    gatling: (t) => { for (let i = 0; i < 5; i++) noise(t + i * 0.045, 0.04, 'bandpass', 2400, 1400, { d: 0.035, peak: 0.25 }, 3); },
    bazooka: (t) => { tone(t, 'square', 140, 60, { d: 0.25, peak: 0.3 }); noise(t, 0.3, 'lowpass', 1800, 200, { d: 0.28, peak: 0.4 }); },
    fire: (t) => { noise(t, 0.35, 'lowpass', 3000, 400, { a: 0.02, d: 0.32, peak: 0.35 }); noise(t + 0.05, 0.2, 'highpass', 3000, 5000, { d: 0.15, peak: 0.1 }); },
    electric: (t) => {
        for (let i = 0; i < 6; i++) tone(t + i * 0.025, 'square', 900 + Math.random() * 1600, 200 + Math.random() * 400, { d: 0.03, peak: 0.12 });
        noise(t, 0.2, 'highpass', 2000, 6000, { d: 0.18, peak: 0.2 });
    },
    sand: (t) => noise(t, 0.4, 'bandpass', 600, 2400, { a: 0.05, d: 0.34, peak: 0.28 }, 0.8),
    magma: (t) => { tone(t, 'sawtooth', 90, 40, { a: 0.02, d: 0.4, peak: 0.25 }); noise(t, 0.45, 'lowpass', 900, 120, { a: 0.03, d: 0.42, peak: 0.4 }); },
    slash: (t) => noise(t, 0.12, 'highpass', 3000, 7000, { d: 0.1, peak: 0.3 }, 1.2),
    grab: (t) => { tone(t, 'square', 220, 110, { d: 0.06, peak: 0.2 }); noise(t, 0.06, 'lowpass', 1200, 400, { d: 0.05, peak: 0.3 }); },
    beam: (t) => { tone(t, 'sawtooth', 300, 1400, { a: 0.05, d: 0.4, peak: 0.18 }); tone(t, 'square', 150, 700, { a: 0.05, d: 0.4, peak: 0.1 }); },
    gigant: (t) => { tone(t, 'sawtooth', 60, 30, { a: 0.05, d: 0.7, peak: 0.35 }); noise(t, 0.8, 'lowpass', 1500, 80, { a: 0.1, d: 0.7, peak: 0.45 }); },

    hitLight: (t) => { noise(t, 0.07, 'bandpass', 2600, 900, { d: 0.06, peak: 0.55 }, 1.2); tone(t, 'square', 320, 90, { d: 0.05, peak: 0.25 }); },
    hitHeavy: (t) => { noise(t, 0.14, 'lowpass', 4000, 300, { d: 0.13, peak: 0.7 }); tone(t, 'square', 180, 45, { d: 0.12, peak: 0.4 }); },
    hitBig: (t) => {
        noise(t, 0.4, 'lowpass', 5000, 100, { d: 0.38, peak: 0.85 });
        tone(t, 'sawtooth', 120, 30, { d: 0.35, peak: 0.45 });
        tone(t + 0.02, 'square', 70, 28, { d: 0.3, peak: 0.3 });
    },
    block: (t) => { tone(t, 'square', 1400, 900, { d: 0.05, peak: 0.2 }); noise(t, 0.05, 'highpass', 4000, 6000, { d: 0.04, peak: 0.25 }); },
    crush: (t) => { tone(t, 'square', 800, 100, { d: 0.35, peak: 0.3 }); noise(t, 0.3, 'bandpass', 3000, 400, { d: 0.3, peak: 0.4 }); },
    jump: (t) => tone(t, 'square', 260, 520, { d: 0.07, peak: 0.08 }),
    land: (t) => noise(t, 0.06, 'lowpass', 800, 200, { d: 0.05, peak: 0.2 }),
    thud: (t) => { noise(t, 0.2, 'lowpass', 700, 60, { d: 0.18, peak: 0.6 }); tone(t, 'sine', 90, 40, { d: 0.18, peak: 0.4 }); },
    dash: (t) => noise(t, 0.15, 'bandpass', 900, 2800, { a: 0.02, d: 0.12, peak: 0.2 }, 1),
    tech: (t) => { tone(t, 'square', 1200, 1200, { d: 0.05, peak: 0.15 }); tone(t + 0.06, 'square', 1600, 1600, { d: 0.05, peak: 0.15 }); },
    superFreeze: (t) => {
        tone(t, 'sawtooth', 110, 880, { a: 0.02, d: 0.5, peak: 0.25 });
        tone(t, 'square', 220, 1760, { a: 0.02, d: 0.45, peak: 0.12 });
        noise(t, 0.5, 'highpass', 1500, 8000, { a: 0.05, d: 0.45, peak: 0.2 });
    },
    ko: (t) => {
        noise(t, 1.2, 'lowpass', 6000, 60, { d: 1.1, peak: 0.9 });
        tone(t, 'sawtooth', 200, 25, { d: 1.0, peak: 0.4 });
    },

    uiMove: (t) => tone(t, 'square', 880, 880, { d: 0.035, peak: 0.12 }),
    uiConfirm: (t) => { tone(t, 'square', 660, 660, { d: 0.05, peak: 0.15 }); tone(t + 0.06, 'square', 990, 990, { d: 0.09, peak: 0.15 }); },
    uiBack: (t) => { tone(t, 'square', 520, 520, { d: 0.05, peak: 0.12 }); tone(t + 0.05, 'square', 390, 390, { d: 0.07, peak: 0.12 }); },
    uiSelect: (t) => { [523, 659, 784, 1047].forEach((f, i) => tone(t + i * 0.05, 'square', f, f, { d: 0.08, peak: 0.13 })); },
    round: (t) => { [392, 392, 523].forEach((f, i) => tone(t + i * 0.12, 'square', f, f, { d: 0.1, peak: 0.15 })); },
    fight: (t) => {
        [523, 659, 784].forEach((f, i) => tone(t + i * 0.06, 'square', f, f, { d: 0.08, peak: 0.16 }));
        tone(t + 0.2, 'sawtooth', 1047, 1047, { d: 0.35, peak: 0.18 });
        noise(t + 0.2, 0.3, 'highpass', 2000, 6000, { d: 0.3, peak: 0.15 });
    },
    win: (t) => { [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(t + i * 0.11, 'square', f, f, { d: 0.12, peak: 0.15 })); },
    lose: (t) => { [392, 370, 349, 262].forEach((f, i) => tone(t + i * 0.18, 'triangle', f, f, { d: 0.2, peak: 0.2 })); }
};

export function play(name: string | undefined, delay = 0): void {
    if (!name || !ctx) return;
    const fn = SOUNDS[name];
    if (fn) fn(ctx.currentTime + delay);
}
