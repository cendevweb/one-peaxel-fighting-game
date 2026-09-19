import { createImage, type RawImage } from './image.js';
import { keyedAlpha, type Plate } from './mask.js';
import type { Band } from './segment.js';

/**
 * Contact sheets exist so a human can answer the one question the segmentation
 * cannot: is this row an animation, and which one? Each band is drawn on its
 * own line, frames in order, on an alternating checker so the boundary between
 * two frames is visible, with a tick mark every fifth frame.
 */
const BACKGROUND: readonly [number, number, number] = [18, 20, 28];
const ALTERNATE: readonly [number, number, number] = [30, 34, 48];
const TICK: readonly [number, number, number] = [255, 90, 60];

const fill = (image: RawImage, x0: number, y0: number, w: number, h: number, colour: readonly [number, number, number]): void => {
    for (let y = y0; y < y0 + h && y < image.height; y += 1) {
        for (let x = x0; x < x0 + w && x < image.width; x += 1) {
            const index = (y * image.width + x) * 4;
            image.data[index] = colour[0];
            image.data[index + 1] = colour[1];
            image.data[index + 2] = colour[2];
            image.data[index + 3] = 255;
        }
    }
};

export const renderContactSheet = (
    source: RawImage,
    plate: Plate,
    bands: readonly Band[],
    options: { gap: number; margin: number } = { gap: 4, margin: 10 }
): RawImage => {
    const { gap, margin } = options;

    const rowWidths = bands.map(
        (band) =>
            band.frames.reduce((total, frame) => total + (frame.right - frame.left + 1) + gap, 0) + margin
    );
    const rowHeights = bands.map((band) => band.bottom - band.top + 1);

    const width = Math.max(320, ...rowWidths) + margin;
    const height = rowHeights.reduce((total, row) => total + row + gap + 8, margin * 2);

    const sheet = createImage(width, height);
    fill(sheet, 0, 0, width, height, BACKGROUND);

    let cursorY = margin;
    bands.forEach((band, bandIndex) => {
        const bandHeight = band.bottom - band.top + 1;
        // A faint stripe every other band, so two adjacent rows never read as one.
        if (bandIndex % 2 === 1) {
            fill(sheet, 0, cursorY - 2, width, bandHeight + 4, ALTERNATE);
        }

        let cursorX = margin;
        band.frames.forEach((frame, frameIndex) => {
            const frameWidth = frame.right - frame.left + 1;

            for (let y = band.top; y <= band.bottom; y += 1) {
                for (let x = frame.left; x <= frame.right; x += 1) {
                    const sourceIndex = (y * source.width + x) * 4;
                    const alpha = keyedAlpha(source, sourceIndex, plate);
                    if (alpha === 0) {
                        continue;
                    }
                    const destX = cursorX + (x - frame.left);
                    const destY = cursorY + (y - band.top);
                    if (destX >= sheet.width || destY >= sheet.height) {
                        continue;
                    }
                    const destIndex = (destY * sheet.width + destX) * 4;
                    sheet.data[destIndex] = source.data[sourceIndex] ?? 0;
                    sheet.data[destIndex + 1] = source.data[sourceIndex + 1] ?? 0;
                    sheet.data[destIndex + 2] = source.data[sourceIndex + 2] ?? 0;
                    sheet.data[destIndex + 3] = 255;
                }
            }

            // Anchor column, drawn under every frame: a walk cycle whose ticks
            // wander is a walk cycle that will slide across the floor.
            fill(sheet, cursorX + (frame.anchorX - frame.left), cursorY + bandHeight, 1, 3, TICK);
            if (frameIndex % 5 === 0) {
                fill(sheet, cursorX, cursorY + bandHeight + 3, frameWidth, 1, TICK);
            }

            cursorX += frameWidth + gap;
        });

        cursorY += bandHeight + gap + 8;
    });

    return sheet;
};
