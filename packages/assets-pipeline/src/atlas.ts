/**
 * The published form of a character.
 *
 * Frames are stored trimmed — only the pixels that are not transparent — but
 * every frame declares the same logical box (`sourceSize`) and the same origin,
 * so the renderer can play any animation of the character without touching the
 * sprite's origin between frames. That is what keeps a fighter's feet nailed to
 * the floor while his arm stretches halfway across the arena.
 */
export interface AtlasFrame {
    filename: string;
    frame: { x: number; y: number; w: number; h: number };
    rotated: false;
    trimmed: boolean;
    spriteSourceSize: { x: number; y: number; w: number; h: number };
    sourceSize: { w: number; h: number };
}

export interface AtlasFile {
    frames: AtlasFrame[];
    meta: {
        app: string;
        version: string;
        image: string;
        format: 'RGBA8888';
        size: { w: number; h: number };
        scale: '1';
    };
}

/** Everything the game needs to know about a character's published frames,
 *  beyond the atlas itself. */
export interface CharacterManifest {
    id: string;
    texture: string;
    source: string;
    /** Logical frame box; the origin is (0.5, 1) inside it. */
    frameWidth: number;
    frameHeight: number;
    /** Plate colour that was keyed out, for the record. */
    plate: { r: number; g: number; b: number };
    bands: Array<{
        index: number;
        top: number;
        bottom: number;
        frameCount: number;
        /** Semantic name assigned to this band, if any. */
        animation?: string;
    }>;
    animations: Array<{
        key: string;
        frames: string[];
        frameRate: number;
        repeat: number;
        /** The source row is drawn facing the other way; mirror it. */
        flip?: boolean;
    }>;
    /** Frames that exist in the atlas but are not used by any animation. */
    unusedFrames: string[];
    /** Bands the sheet has that no animation claims, for the next pass. */
    skippedBands: number[];
    warnings: string[];
}

export interface AssetManifest {
    generatedAt: string;
    characters: CharacterManifest[];
    stages: Array<{ id: string; image: string; width: number; height: number }>;
}
