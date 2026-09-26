import { audioContext, musicOut } from './sound';

/**
 * A small chiptune sequencer: bass, lead and drums, scheduled ahead of time
 * on the WebAudio clock. Each track is a few bars of patterns; every stage
 * gets its own key and tempo so no two arenas sound the same.
 */

interface Track {
    bpm: number;
    root: number;
    /** Scale degrees per 16th step, -1 = rest; 8 steps per bar pattern. */
    bass: number[];
    lead: number[];
    drums: string;
    wave: OscillatorType;
}

// Minor pentatonic-ish scale, in semitones from the root.
const SCALE = [0, 3, 5, 7, 10, 12, 15, 17, 19, 22, 24];

const TRACKS: Record<string, Track> = {
    title: {
        bpm: 128, root: 45, wave: 'square',
        bass: [0, -1, 0, -1, 3, -1, 3, 2, 0, -1, 0, -1, 4, -1, 3, -1],
        lead: [7, -1, 9, 7, 6, -1, 5, -1, 7, -1, 5, 4, 3, -1, -1, -1, 5, -1, 6, 5, 4, -1, 3, -1, 4, -1, 3, 2, 0, -1, -1, -1],
        drums: 'k-h-s-h-k-k-s-h-'
    },
    select: {
        bpm: 118, root: 50, wave: 'square',
        bass: [0, -1, 0, 0, 2, -1, 2, 2, 3, -1, 3, 3, 1, -1, 1, 2],
        lead: [5, -1, 6, -1, 7, -1, 6, 5, 4, -1, 5, -1, 3, -1, -1, -1],
        drums: 'k-h-s-hhk-h-s-h-'
    },
    results: {
        bpm: 100, root: 48, wave: 'triangle',
        bass: [0, -1, -1, -1, 3, -1, -1, -1, 4, -1, -1, -1, 2, -1, 3, -1],
        lead: [7, -1, 8, -1, 9, -1, -1, -1, 8, -1, 7, -1, 5, -1, -1, -1],
        drums: 'k---s---k-k-s---'
    },
    marineford: {
        bpm: 150, root: 43, wave: 'square',
        bass: [0, 0, 7, 0, 0, 7, 0, 5, 3, 3, 8, 3, 4, 4, 9, 4],
        lead: [7, -1, 7, 8, 9, -1, 7, -1, 10, -1, 9, 8, 7, -1, 5, -1, 3, -1, 5, 7, 8, -1, 7, -1, 5, -1, 4, 3, 2, -1, 3, -1],
        drums: 'k-hsk-hsk-hsk-ss'
    },
    'arlong-park': {
        bpm: 140, root: 47, wave: 'square',
        bass: [0, -1, 0, 5, 0, -1, 3, -1, 2, -1, 2, 6, 2, -1, 4, -1],
        lead: [5, 6, 7, -1, 7, -1, 6, 5, 4, -1, 5, -1, 3, -1, -1, -1, 5, 6, 7, -1, 9, -1, 8, 7, 6, -1, 5, -1, 7, -1, -1, -1],
        drums: 'k-h-s-hkk-h-s-hs'
    },
    'rain-dinners': {
        bpm: 132, root: 46, wave: 'sawtooth',
        bass: [0, -1, 7, -1, 0, -1, 7, 5, 1, -1, 8, -1, 1, -1, 8, 6],
        lead: [4, -1, 5, 4, 3, -1, 1, -1, 3, -1, 4, -1, 0, -1, -1, -1, 4, -1, 5, 6, 7, -1, 6, -1, 5, -1, 4, 3, 1, -1, -1, -1],
        drums: 'k--hs-h-k-khs-h-'
    },
    'enies-lobby': {
        bpm: 146, root: 48, wave: 'square',
        bass: [0, 0, -1, 0, 3, 3, -1, 3, 4, 4, -1, 4, 2, 2, 3, 4],
        lead: [7, -1, 8, -1, 9, 8, 7, -1, 5, -1, 7, -1, 4, -1, -1, -1, 7, -1, 8, -1, 10, 9, 8, -1, 7, -1, 5, 4, 5, -1, -1, -1],
        drums: 'k-hsk-hsk-hskshs'
    },
    shandora: {
        bpm: 124, root: 44, wave: 'triangle',
        bass: [0, -1, -1, 0, 2, -1, -1, 2, 3, -1, -1, 3, 1, -1, 2, -1],
        lead: [5, -1, -1, 6, 7, -1, 6, -1, 5, -1, 3, -1, 4, -1, -1, -1, 5, -1, -1, 7, 8, -1, 7, -1, 6, -1, 5, -1, 3, -1, -1, -1],
        drums: 'k---s--hk-k-s---'
    },
    'impel-down': {
        bpm: 156, root: 40, wave: 'sawtooth',
        bass: [0, 0, 0, 1, 0, 0, 0, 3, 0, 0, 0, 1, 0, 4, 3, 1],
        lead: [7, -1, -1, 8, 7, -1, 5, -1, 4, -1, 5, -1, 3, -1, 1, -1, 7, -1, -1, 8, 10, -1, 9, -1, 8, -1, 7, -1, 5, -1, 4, -1],
        drums: 'kkhskkhskkhskshs'
    }
};

const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12);
const note = (root: number, degree: number) => root + SCALE[Math.max(0, Math.min(SCALE.length - 1, degree))];

let timer: number | null = null;
let current: string | null = null;
let noise: AudioBuffer | null = null;

function voice(ac: AudioContext, out: AudioNode, t: number, type: OscillatorType, freq: number, dur: number, vol: number): void {
    const o = ac.createOscillator();
    o.type = type;
    o.frequency.value = freq;
    const g = ac.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(out);
    o.start(t);
    o.stop(t + dur + 0.02);
}

function drum(ac: AudioContext, out: AudioNode, t: number, kind: string): void {
    if (kind === 'k') {
        const o = ac.createOscillator();
        o.frequency.setValueAtTime(140, t);
        o.frequency.exponentialRampToValueAtTime(40, t + 0.12);
        const g = ac.createGain();
        g.gain.setValueAtTime(0.5, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
        o.connect(g).connect(out);
        o.start(t);
        o.stop(t + 0.16);
        return;
    }
    if (!noise) {
        noise = ac.createBuffer(1, ac.sampleRate / 2, ac.sampleRate);
        const d = noise.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const src = ac.createBufferSource();
    src.buffer = noise;
    const f = ac.createBiquadFilter();
    f.type = kind === 's' ? 'bandpass' : 'highpass';
    f.frequency.value = kind === 's' ? 1800 : 7000;
    const g = ac.createGain();
    const dur = kind === 's' ? 0.12 : 0.04;
    g.gain.setValueAtTime(kind === 's' ? 0.35 : 0.12, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(out);
    src.start(t);
    src.stop(t + dur + 0.02);
}

export function startMusic(name: string): void {
    if (current === name) return;
    stopMusic();
    const track = TRACKS[name] ?? TRACKS.marineford;
    current = name;
    let step = 0;
    let nextTime = 0;
    const schedule = () => {
        const ac = audioContext();
        const out = musicOut();
        if (!ac || !out) return;
        if (nextTime < ac.currentTime) nextTime = ac.currentTime + 0.05;
        const stepDur = 60 / track.bpm / 4;
        while (nextTime < ac.currentTime + 0.2) {
            const b = track.bass[step % track.bass.length];
            if (b >= 0) voice(ac, out, nextTime, 'triangle', midi(note(track.root - 12, b)), stepDur * 1.6, 0.32);
            const l = track.lead[step % track.lead.length];
            if (l >= 0) voice(ac, out, nextTime, track.wave, midi(note(track.root + 12, l)), stepDur * 1.8, track.wave === 'sawtooth' ? 0.06 : 0.08);
            const d = track.drums[step % track.drums.length];
            if (d === 'k' || d === 's' || d === 'h') drum(ac, out, nextTime, d);
            nextTime += stepDur;
            step++;
        }
    };
    timer = window.setInterval(schedule, 50);
}

export function stopMusic(): void {
    if (timer !== null) window.clearInterval(timer);
    timer = null;
    current = null;
}
