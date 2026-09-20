#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { STAGES } from '@opfg/combat-core';
import { CHARACTER_SOURCES } from './characters.config.js';
import { renderContactSheet } from './contact.js';
import { analyseSheet, extractCharacter } from './extract.js';
import { writePng } from './image.js';
import type { AssetManifest } from './atlas.js';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../../..');
const sheetsDir = join(repoRoot, 'assets/sheets');
const backgroundsDir = join(repoRoot, 'assets/backgrounds');
const outputDir = join(repoRoot, 'apps/web/public/atlases');
const stagesDir = join(repoRoot, 'apps/web/public/stages');
const contactDir = join(repoRoot, 'tmp/contact');

/** Published width of a stage backdrop. Wider than the 960-pixel viewport so
 *  the parallax has somewhere to scroll. */
const STAGE_WIDTH = 1440;
/** Vertical window kept from the portrait source, as fractions of its height. */
const STAGE_CROP_TOP = 0.5;
const STAGE_CROP_HEIGHT = 0.36;

const analyse = async (): Promise<void> => {
    for (const source of CHARACTER_SOURCES) {
        const file = join(sheetsDir, source.file);
        const { bands, plate, image } = await analyseSheet(source, file);
        console.log(
            `\n=== ${source.id}  ${image.width}x${image.height}  plaque rgb(${plate.r},${plate.g},${plate.b})  ${bands.length} bandes`
        );
        for (const band of bands) {
            const widths = band.frames.map((frame) => frame.right - frame.left + 1);
            const mapped = source.bands.find((entry) => entry.band === band.index);
            console.log(
                `  bande ${String(band.index).padStart(2)}  y ${String(band.top).padStart(4)}..${String(band.bottom).padStart(4)}` +
                    `  h ${String(band.bottom - band.top + 1).padStart(3)}` +
                    `  ${String(band.frames.length).padStart(2)} frames` +
                    `  largeurs ${Math.min(...widths)}..${Math.max(...widths)}` +
                    (mapped ? `  -> ${mapped.animation}` : '  -> (non attribuee)')
            );
        }
    }
};

const contact = async (): Promise<void> => {
    await mkdir(contactDir, { recursive: true });
    for (const source of CHARACTER_SOURCES) {
        const file = join(sheetsDir, source.file);
        const analysed = await analyseSheet(source, file);
        const sheet = renderContactSheet(analysed.image, analysed.plate, analysed.bands);
        const out = join(contactDir, `${source.id}.png`);
        await writePng(sheet, out);
        console.log(`${source.id}: ${analysed.bands.length} bandes -> ${out} (${sheet.width}x${sheet.height})`);
    }
};

/** One contact sheet per band, so a long sheet can be read without squinting. */
const contactBands = async (characterId: string): Promise<void> => {
    const source = CHARACTER_SOURCES.find((entry) => entry.id === characterId);
    if (!source) {
        throw new Error(`Personnage inconnu : ${characterId}`);
    }
    await mkdir(contactDir, { recursive: true });
    const analysed = await analyseSheet(source, join(sheetsDir, source.file));
    for (const band of analysed.bands) {
        const sheet = renderContactSheet(analysed.image, analysed.plate, [band]);
        const out = join(contactDir, `${source.id}-band${String(band.index).padStart(2, '0')}.png`);
        await writePng(sheet, out);
        console.log(`${out}  ${band.frames.length} frames  ${sheet.width}x${sheet.height}`);
    }
};

/**
 * One contact sheet per *animation*, not per band. A band tells you what the
 * rip contains; an animation tells you what the game will actually play, after
 * the range, the ordering and the trimming have been applied. Reading the band
 * and assuming the animation follows is how a move ends up opening on a text
 * label or closing three frames before its own impact.
 */
const contactAnimations = async (characterId?: string): Promise<void> => {
    await mkdir(contactDir, { recursive: true });
    for (const source of CHARACTER_SOURCES) {
        if (characterId && source.id !== characterId) {
            continue;
        }
        const analysed = await analyseSheet(source, join(sheetsDir, source.file));
        for (const mapping of source.bands) {
            const band = analysed.bands.find((entry) => entry.index === mapping.band);
            if (!band) {
                console.warn(`${source.id}/${mapping.animation}: bande ${mapping.band} absente`);
                continue;
            }
            const indices = mapping.order
                ? mapping.order
                : Array.from(
                      { length: (mapping.range?.[1] ?? band.frames.length - 1) - (mapping.range?.[0] ?? 0) + 1 },
                      (_, offset) => (mapping.range?.[0] ?? 0) + offset
                  );
            const frames = indices
                .map((index) => band.frames[index])
                .filter((frame): frame is NonNullable<typeof frame> => frame !== undefined)
                .map((frame, index) => ({ ...frame, index }));
            if (frames.length === 0) {
                console.warn(`${source.id}/${mapping.animation}: aucune frame`);
                continue;
            }
            const sheet = renderContactSheet(analysed.image, analysed.plate, [{ ...band, frames }]);
            const out = join(contactDir, `${source.id}-anim-${mapping.animation}.png`);
            await writePng(sheet, out);
            console.log(
                `${out}  ${frames.length} frames  bande ${mapping.band}  ${sheet.width}x${sheet.height}`
            );
        }
    }
};

const publishStages = async (): Promise<AssetManifest['stages']> => {
    await mkdir(stagesDir, { recursive: true });
    const published: AssetManifest['stages'] = [];

    for (const stage of STAGES) {
        const input = join(backgroundsDir, `${stage.background}.png`);
        const output = join(stagesDir, `${stage.background}.webp`);

        // The backdrops were painted for a portrait 9:16 game, so the whole
        // image is useless here: a fighting stage needs a wide band with the
        // ground line near its foot. The lower middle of each painting is that
        // band — architecture above, ground or water below.
        const source = sharp(input);
        const meta = await source.metadata();
        const width = meta.width ?? 941;
        const height = meta.height ?? 1672;
        const top = Math.round(height * STAGE_CROP_TOP);
        const cropHeight = Math.min(height - top, Math.round(height * STAGE_CROP_HEIGHT));

        const info = await sharp(input)
            .extract({ left: 0, top, width, height: cropHeight })
            .resize({ width: STAGE_WIDTH, kernel: 'nearest' })
            .webp({ quality: 90 })
            .toFile(output);

        published.push({ id: stage.id, image: `${stage.background}.webp`, width: info.width, height: info.height });
        console.log(`stage ${stage.id}: ${width}x${height} -> ${info.width}x${info.height}  ${output}`);
    }

    return published;
};

const extract = async (): Promise<void> => {
    await mkdir(outputDir, { recursive: true });
    const manifest: AssetManifest = {
        generatedAt: new Date().toISOString(),
        characters: [],
        stages: []
    };

    let failed = false;
    for (const source of CHARACTER_SOURCES) {
        const file = join(sheetsDir, source.file);
        const analysed = await analyseSheet(source, file);
        const result = extractCharacter(analysed, file);

        await writePng(result.image, join(outputDir, `${source.texture}.png`));
        await writeFile(
            join(outputDir, `${source.texture}.json`),
            `${JSON.stringify(result.atlas, null, 2)}\n`,
            'utf8'
        );
        manifest.characters.push(result.manifest);

        const animated = result.manifest.animations.filter((animation) => animation.frames.length > 0);
        console.log(
            `${source.id}: ${result.atlas.frames.length} frames, ${animated.length}/${result.manifest.animations.length} animations,` +
                ` boite ${result.manifest.frameWidth}x${result.manifest.frameHeight}, atlas ${result.atlas.meta.size.w}x${result.atlas.meta.size.h}`
        );
        for (const warning of result.manifest.warnings) {
            console.warn(`  ! ${warning}`);
            failed = true;
        }
        if (source.bands.length === 0) {
            console.warn(`  ! aucune bande attribuee : ${source.id} n'aura aucune animation.`);
        }
    }

    manifest.stages = await publishStages();
    await writeFile(join(outputDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
    console.log(`\nmanifeste -> ${join(outputDir, 'manifest.json')}`);

    if (failed) {
        process.exitCode = 1;
    }
};

const main = async (): Promise<void> => {
    const [command, argument] = process.argv.slice(2);
    switch (command) {
        case 'analyse':
            await analyse();
            break;
        case 'contact':
            if (argument) {
                await contactBands(argument);
            } else {
                await contact();
            }
            break;
        case 'contact-anim':
            await contactAnimations(argument);
            break;
        case 'extract':
        case undefined:
            await extract();
            break;
        default:
            console.error(`Commande inconnue : ${command}\nUtilisation : opfg-sprites <analyse|contact [perso]|contact-anim [perso]|extract>`);
            process.exitCode = 2;
    }
};

main().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
});
