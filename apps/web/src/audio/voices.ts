import manifest from '../generated/voices.json';
import { ensureAudio, runningContext, sfxOut } from './sound';

/**
 * Recorded character voices (`public/audio/voices`, imported by
 * `tools/audio/import_voices.mjs`). Every clip is fetched and decoded while
 * the game loads, so a voice starts on the very frame it is asked for. The
 * clips of one category are chained back to back, without a gap.
 *
 * Voices only ever follow what the view shows: nothing here is read by the
 * engine, so the online fingerprint and the rollback are untouched.
 */

/** `roundLose` and `roundStart` have no clips yet: dropping them in the
 *  source folders and re-running the import is enough to hear them. */
export type VoiceCategory = 'select' | 'win' | 'ultimate' | 'ultimateMax' | 'roundLose' | 'roundStart';

type Manifest = Record<string, Partial<Record<VoiceCategory, string[]>>>;
const CLIPS = manifest as Manifest;

/** Voices are a little louder than the synthesised effects they share the bus with. */
const VOICE_GAIN = 1.4;

const buffers = new Map<string, AudioBuffer>();
let voiceBus: GainNode | null = null;

/** Safari (before 18.4) cannot decode Ogg Vorbis: every clip also exists as AAC. */
function preferredExt(): 'ogg' | 'm4a' {
    if (typeof Audio === 'undefined') return 'm4a';
    return new Audio().canPlayType('audio/ogg; codecs="vorbis"') ? 'ogg' : 'm4a';
}

async function decode(ac: AudioContext, url: string): Promise<AudioBuffer> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    const data = await res.arrayBuffer();
    // The callback form: older Safari has no promise-returning decodeAudioData.
    return new Promise((resolve, reject) => ac.decodeAudioData(data, resolve, reject));
}

async function loadClip(ac: AudioContext, path: string, ext: 'ogg' | 'm4a'): Promise<void> {
    const base = `${import.meta.env.BASE_URL}audio/voices/${path}`;
    try {
        buffers.set(path, await decode(ac, `${base}.${ext}`));
    } catch {
        // canPlayType can say "maybe" and still fail: try the other format.
        try {
            buffers.set(path, await decode(ac, `${base}.${ext === 'ogg' ? 'm4a' : 'ogg'}`));
        } catch (err) {
            console.warn('Voix introuvable :', path, err);
        }
    }
}

/**
 * One loading job per clip, for the loading bar. A clip that fails is
 * skipped (the game plays on without it), so these never reject.
 */
export function voiceJobs(): Promise<void>[] {
    const ac = ensureAudio();
    if (!ac) return [];
    const ext = preferredExt();
    const paths = Object.values(CLIPS).flatMap((c) => Object.values(c).flat()) as string[];
    return paths.map((p) => loadClip(ac, p, ext));
}

export const hasVoice = (char: string, category: VoiceCategory): boolean => (CLIPS[char]?.[category]?.length ?? 0) > 0;

/** What is playing on each channel, so a new line cuts the previous one off. */
const channels = new Map<string, AudioBufferSourceNode[]>();

/** Stops whatever is playing on `channel`. */
export function stopVoice(channel: string): void {
    for (const src of channels.get(channel) ?? []) {
        try { src.stop(); } catch { /* already ended */ }
    }
    channels.delete(channel);
}

/**
 * Plays a character's line of that category, its numbered clips chained in
 * order. `channel` (one per player, say) cuts off the line still playing
 * there. Returns whether anything started.
 */
export function playVoice(char: string, category: VoiceCategory, channel = char): boolean {
    const ac = runningContext();
    const out = sfxOut();
    const list = CLIPS[char]?.[category];
    if (!ac || !out || !list?.length) return false;
    if (!voiceBus) {
        voiceBus = ac.createGain();
        voiceBus.gain.value = VOICE_GAIN;
        voiceBus.connect(out);
    }
    stopVoice(channel);
    const sources: AudioBufferSourceNode[] = [];
    let t = ac.currentTime;
    for (const path of list) {
        const buf = buffers.get(path);
        if (!buf) continue;
        const src = ac.createBufferSource();
        src.buffer = buf;
        src.connect(voiceBus);
        src.start(t);
        t += buf.duration;
        sources.push(src);
    }
    if (!sources.length) return false;
    channels.set(channel, sources);
    // Forget the channel once its last clip is over (unless replaced since).
    sources[sources.length - 1].onended = () => { if (channels.get(channel) === sources) channels.delete(channel); };
    return true;
}
