#!/usr/bin/env node
/**
 * Imports the character voice clips into the game.
 *
 *   node tools/audio/import_voices.mjs [source]   (default: assets/voices)
 *
 * The source keeps the layout the clips were sorted in:
 *   caractere-selection/<perso>/*.ogg   → select
 *   caractere-win/<perso>/*.ogg         → win
 *   caractere-battle/<perso>/*.ogg      → start when the name contains
 *                                         "start", ultimateMax when it
 *                                         contains "max", else ultimate
 *   caractere-lost/<perso>/*.ogg        → roundLose
 * File names are loose (typos, " - Copie", "max-2"…): only the folder, the
 * "max" and the trailing number count. Numbered clips of one category are
 * chained in numeric order when played.
 *
 * Writes apps/web/public/audio/voices/<id>/<category>-<n>.ogg, the same as
 * .m4a (AAC, for Safari, which cannot decode Ogg Vorbis; needs ffmpeg on the
 * PATH), and the manifest apps/web/src/generated/voices.json.
 */
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const source = resolve(process.argv[2] ?? join(root, 'assets/voices'));
const outDir = join(root, 'apps/web/public/audio/voices');
const manifestPath = join(root, 'apps/web/src/generated/voices.json');

const FOLDERS = { 'caractere-selection': 'select', 'caractere-win': 'win', 'caractere-battle': 'battle', 'caractere-lost': 'roundLose' };

/** Folder names that differ from the character ids. */
const IDS = { baggy: 'buggy', 'barbe-blanche': 'whitebeard', 'barbe-noire': 'blackbeard', xdrake: 'drake' };

const idOf = (folder) => IDS[folder.toLowerCase()] ?? folder.toLowerCase();

/** Trailing number of a clip name ("luffy-ultimate-max-2" → 2, none → 0). */
function orderOf(name) {
    const m = name.replace(/\.ogg$/i, '').replace(/\s*-\s*copie$/i, '').match(/(\d+)$/);
    return m ? Number(m[1]) : 0;
}

const clips = {}; // id → category → [{ file, order }]
for (const [folder, kind] of Object.entries(FOLDERS)) {
    const dir = join(source, folder);
    if (!existsSync(dir)) throw new Error(`Dossier introuvable : ${dir}`);
    for (const who of readdirSync(dir)) {
        for (const file of readdirSync(join(dir, who))) {
            if (!/\.ogg$/i.test(file)) continue;
            const category = kind !== 'battle' ? kind : /start/i.test(file) ? 'start' : /max/i.test(file) ? 'ultimateMax' : 'ultimate';
            const id = idOf(who);
            ((clips[id] ??= {})[category] ??= []).push({ file: join(dir, who, file), order: orderOf(file) });
        }
    }
}

rmSync(outDir, { recursive: true, force: true });
const manifest = {};
for (const id of Object.keys(clips).sort()) {
    manifest[id] = {};
    mkdirSync(join(outDir, id), { recursive: true });
    for (const category of Object.keys(clips[id]).sort()) {
        const list = clips[id][category].sort((a, b) => a.order - b.order);
        manifest[id][category] = list.map((clip, i) => {
            const base = `${category}-${i + 1}`;
            copyFileSync(clip.file, join(outDir, id, `${base}.ogg`));
            execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', clip.file, '-c:a', 'aac', '-b:a', '96k', join(outDir, id, `${base}.m4a`)]);
            return `${id}/${base}`;
        });
    }
}
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
const total = Object.values(manifest).reduce((n, c) => n + Object.values(c).flat().length, 0);
console.log(`${total} clips, ${Object.keys(manifest).length} personnages → ${outDir}`);
