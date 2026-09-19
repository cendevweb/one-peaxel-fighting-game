/**
 * Shelf packer. Frames are sorted by height and laid out in rows; for a few
 * hundred sprite frames this wastes a few percent of the sheet and is far
 * easier to verify than a maximal-rectangles packer.
 */
export interface PackInput {
    key: string;
    width: number;
    height: number;
}

export interface PackedRect extends PackInput {
    x: number;
    y: number;
}

export interface PackResult {
    width: number;
    height: number;
    rects: PackedRect[];
}

const nextPowerOfTwo = (value: number): number => {
    let result = 1;
    while (result < value) {
        result *= 2;
    }
    return result;
};

export const pack = (inputs: readonly PackInput[], padding = 2): PackResult => {
    const sorted = [...inputs].sort((a, b) => b.height - a.height || b.width - a.width);
    const widest = sorted.reduce((max, item) => Math.max(max, item.width + padding * 2), 1);
    const area = sorted.reduce((total, item) => total + (item.width + padding * 2) * (item.height + padding * 2), 0);

    // Start from a square-ish sheet and grow only if a row overflows.
    let sheetWidth = Math.max(nextPowerOfTwo(widest), nextPowerOfTwo(Math.ceil(Math.sqrt(area))));

    for (;;) {
        const rects: PackedRect[] = [];
        let cursorX = padding;
        let cursorY = padding;
        let rowHeight = 0;
        let overflow = false;

        for (const item of sorted) {
            if (cursorX + item.width + padding > sheetWidth) {
                cursorX = padding;
                cursorY += rowHeight + padding;
                rowHeight = 0;
            }
            if (item.width + padding * 2 > sheetWidth) {
                overflow = true;
                break;
            }
            rects.push({ ...item, x: cursorX, y: cursorY });
            cursorX += item.width + padding;
            rowHeight = Math.max(rowHeight, item.height);
        }

        if (overflow) {
            sheetWidth *= 2;
            continue;
        }

        return {
            width: sheetWidth,
            height: nextPowerOfTwo(cursorY + rowHeight + padding),
            rects
        };
    }
};
