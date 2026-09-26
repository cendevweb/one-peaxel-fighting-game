/**
 * A 5×7 bitmap font, drawn pixel by pixel so text stays as crisp as the
 * sprites at every scale. Uppercase only; accents are drawn as a mark above
 * the base letter.
 */

const GLYPHS: Record<string, string> = {
    A: '01110 10001 10001 11111 10001 10001 10001',
    B: '11110 10001 10001 11110 10001 10001 11110',
    C: '01110 10001 10000 10000 10000 10001 01110',
    D: '11110 10001 10001 10001 10001 10001 11110',
    E: '11111 10000 10000 11110 10000 10000 11111',
    F: '11111 10000 10000 11110 10000 10000 10000',
    G: '01110 10001 10000 10111 10001 10001 01111',
    H: '10001 10001 10001 11111 10001 10001 10001',
    I: '01110 00100 00100 00100 00100 00100 01110',
    J: '00111 00010 00010 00010 00010 10010 01100',
    K: '10001 10010 10100 11000 10100 10010 10001',
    L: '10000 10000 10000 10000 10000 10000 11111',
    M: '10001 11011 10101 10101 10001 10001 10001',
    N: '10001 10001 11001 10101 10011 10001 10001',
    O: '01110 10001 10001 10001 10001 10001 01110',
    P: '11110 10001 10001 11110 10000 10000 10000',
    Q: '01110 10001 10001 10001 10101 10010 01101',
    R: '11110 10001 10001 11110 10100 10010 10001',
    S: '01111 10000 10000 01110 00001 00001 11110',
    T: '11111 00100 00100 00100 00100 00100 00100',
    U: '10001 10001 10001 10001 10001 10001 01110',
    V: '10001 10001 10001 10001 10001 01010 00100',
    W: '10001 10001 10001 10101 10101 10101 01010',
    X: '10001 10001 01010 00100 01010 10001 10001',
    Y: '10001 10001 01010 00100 00100 00100 00100',
    Z: '11111 00001 00010 00100 01000 10000 11111',
    0: '01110 10001 10011 10101 11001 10001 01110',
    1: '00100 01100 00100 00100 00100 00100 01110',
    2: '01110 10001 00001 00010 00100 01000 11111',
    3: '11111 00010 00100 00010 00001 10001 01110',
    4: '00010 00110 01010 10010 11111 00010 00010',
    5: '11111 10000 11110 00001 00001 10001 01110',
    6: '00110 01000 10000 11110 10001 10001 01110',
    7: '11111 00001 00010 00100 01000 01000 01000',
    8: '01110 10001 10001 01110 10001 10001 01110',
    9: '01110 10001 10001 01111 00001 00010 01100',
    ' ': '00000 00000 00000 00000 00000 00000 00000',
    '.': '00000 00000 00000 00000 00000 01100 01100',
    ',': '00000 00000 00000 00000 01100 00100 01000',
    '!': '00100 00100 00100 00100 00100 00000 00100',
    '?': '01110 10001 00001 00010 00100 00000 00100',
    ':': '00000 01100 01100 00000 01100 01100 00000',
    ';': '00000 01100 01100 00000 01100 00100 01000',
    '-': '00000 00000 00000 11111 00000 00000 00000',
    '+': '00000 00100 00100 11111 00100 00100 00000',
    '/': '00001 00001 00010 00100 01000 10000 10000',
    "'": '00100 00100 01000 00000 00000 00000 00000',
    '"': '01010 01010 00000 00000 00000 00000 00000',
    '(': '00010 00100 01000 01000 01000 00100 00010',
    ')': '01000 00100 00010 00010 00010 00100 01000',
    '%': '11001 11010 00010 00100 01000 01011 10011',
    '×': '00000 10001 01010 00100 01010 10001 00000',
    '<': '00010 00100 01000 10000 01000 00100 00010',
    '>': '01000 00100 00010 00001 00010 00100 01000',
    '=': '00000 00000 11111 00000 11111 00000 00000',
    '_': '00000 00000 00000 00000 00000 00000 11111',
    '#': '01010 01010 11111 01010 11111 01010 01010',
    '«': '00000 00101 01010 10100 01010 00101 00000',
    '»': '00000 10100 01010 00101 01010 10100 00000',
    '↑': '00100 01110 10101 00100 00100 00100 00100',
    '↓': '00100 00100 00100 00100 10101 01110 00100',
    '←': '00000 00100 01000 11111 01000 00100 00000',
    '→': '00000 00100 00010 11111 00010 00100 00000',
    '↘': '00000 10000 01000 00101 00011 00111 00000',
    '↙': '00000 00001 00010 10100 11000 11100 00000',
    '↗': '00000 00111 00011 00101 01000 10000 00000',
    '↖': '00000 11100 11000 10100 00010 00001 00000',
    '•': '00000 00000 01110 01110 01110 00000 00000',
    '·': '00000 00000 00000 00100 00000 00000 00000',
    '—': '00000 00000 00000 11111 00000 00000 00000',
    '…': '00000 00000 00000 00000 00000 00000 10101',
    '[': '01110 01000 01000 01000 01000 01000 01110',
    ']': '01110 00010 00010 00010 00010 00010 01110',
    '★': '00100 00100 11111 01110 01110 11011 00000'
};

const ACCENTS: Record<string, [string, 'acute' | 'grave' | 'circ' | 'cedil' | 'trema' | 'macron']> = {
    'É': ['E', 'acute'], 'È': ['E', 'grave'], 'Ê': ['E', 'circ'], 'Ë': ['E', 'trema'],
    'À': ['A', 'grave'], 'Â': ['A', 'circ'], 'Ç': ['C', 'cedil'], 'Î': ['I', 'circ'],
    'Ï': ['I', 'trema'], 'Ô': ['O', 'circ'], 'Ù': ['U', 'grave'], 'Û': ['U', 'circ'], 'Ü': ['U', 'trema'],
    'Ā': ['A', 'macron'], 'Ō': ['O', 'macron'], 'Ū': ['U', 'macron'], 'Ī': ['I', 'macron']
};

const bitmaps = new Map<string, number[][]>();
for (const [ch, rows] of Object.entries(GLYPHS)) {
    bitmaps.set(ch, rows.split(' ').map((r) => [...r].map(Number)));
}

export const GLYPH_W = 6;
export const GLYPH_H = 7;

export function textWidth(text: string, scale = 1): number {
    return Math.max(0, [...text].length * GLYPH_W - 1) * scale;
}

export interface TextStyle {
    color?: string;
    /** Outline colour, drawn one pixel around every lit pixel. */
    outline?: string;
    /** Drop shadow colour, one pixel down-right. */
    shadow?: string;
    scale?: number;
    align?: 'left' | 'center' | 'right';
    /** Vertical gradient: second colour for the lower half. */
    gradient?: string;
}

function plot(ctx: CanvasRenderingContext2D, ch: string, x: number, y: number, s: number, colorTop: string, colorBottom?: string): void {
    const upper = ch.toUpperCase();
    const accent = ACCENTS[upper];
    const base = accent ? accent[0] : upper;
    const bm = bitmaps.get(base) ?? bitmaps.get('?')!;
    for (let r = 0; r < 7; r++) {
        ctx.fillStyle = colorBottom && r >= 4 ? colorBottom : colorTop;
        for (let c = 0; c < 5; c++) if (bm[r][c]) ctx.fillRect(x + c * s, y + r * s, s, s);
    }
    if (!accent) return;
    ctx.fillStyle = colorTop;
    const kind = accent[1];
    const px = (cx: number, cy: number) => ctx.fillRect(x + cx * s, y + cy * s, s, s);
    if (kind === 'acute') { px(2, -2); px(3, -3); }
    else if (kind === 'grave') { px(2, -2); px(1, -3); }
    else if (kind === 'circ') { px(1, -2); px(2, -3); px(3, -2); }
    else if (kind === 'trema') { px(1, -2); px(3, -2); }
    else if (kind === 'macron') { px(1, -2); px(2, -2); px(3, -2); }
    else if (kind === 'cedil') { px(2, 7); px(1, 8); }
}

const cache = new Map<string, HTMLCanvasElement>();

/** Text is rasterised once per (string, style) and then blitted: plotting
 *  fonts pixel by pixel every frame would cost thousands of fillRects. */
function rasterise(text: string, style: TextStyle): HTMLCanvasElement {
    const key = `${text}|${style.color}|${style.outline}|${style.shadow}|${style.scale}|${style.gradient}`;
    let c = cache.get(key);
    if (c) return c;
    const s = style.scale ?? 1;
    const pad = 3 * s;
    c = document.createElement('canvas');
    c.width = textWidth(text, s) + pad * 2 + s;
    c.height = (GLYPH_H + 5) * s + pad * 2;
    const ctx = c.getContext('2d')!;
    const top = pad + 3 * s;
    const chars = [...text];
    const pass = (dx: number, dy: number, color: string, bottom?: string) => {
        chars.forEach((ch, i) => plot(ctx, ch, pad + i * GLYPH_W * s + dx, top + dy, s, color, bottom));
    };
    if (style.outline) {
        for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, 1], [-1, 1], [1, -1]]) pass(dx * s, dy * s, style.outline);
    }
    if (style.shadow) pass(s, s, style.shadow);
    pass(0, 0, style.color ?? '#fff', style.gradient);
    if (cache.size > 400) cache.delete(cache.keys().next().value!);
    cache.set(key, c);
    return c;
}

export function drawText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, style: TextStyle = {}): void {
    if (!text) return;
    const s = style.scale ?? 1;
    const w = textWidth(text, s);
    const left = Math.round(style.align === 'center' ? x - w / 2 : style.align === 'right' ? x - w : x);
    const img = rasterise(text, style);
    ctx.drawImage(img, left - 3 * s, Math.round(y) - 6 * s);
}
