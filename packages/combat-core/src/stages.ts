/**
 * Stages are pure data: a backdrop, a floor line and the parallax factors the
 * renderer applies. No stage introduces geometry the simulation would have to
 * know about — the arena is a flat plane in every one of them, which is what
 * keeps collisions honest and the netcode small.
 */
export interface StageDefinition {
    id: string;
    name: string;
    /** Background image published by the asset pipeline. */
    background: string;
    /** Screen row the fighters' feet rest on, in viewport pixels. */
    floorY: number;
    /** How much the backdrop moves relative to the camera, 0 fixed, 1 locked. */
    parallax: number;
    /** Tint applied over the backdrop so sprites stay readable: a CSS value
     *  for the interface, and the same colour as a number for the renderer. */
    overlay: string;
    overlayColor: number;
    overlayAlpha: number;
    /** Accent colour for the round banner. */
    accent: string;
    ambience: 'none' | 'embers' | 'snow' | 'sparks' | 'dust';
}

export const STAGES: readonly StageDefinition[] = [
    {
        id: 'marineford',
        name: 'Marineford',
        background: 'marineford',
        floorY: 452,
        parallax: 0.45,
        overlay: 'rgba(24,10,8,0.28)',
        overlayColor: 0x180a08,
        overlayAlpha: 0.28,
        accent: '#ff7a3c',
        ambience: 'embers'
    },
    {
        id: 'enies-lobby',
        name: 'Enies Lobby',
        background: 'enies-lobby',
        floorY: 452,
        parallax: 0.42,
        overlay: 'rgba(10,14,32,0.24)',
        overlayColor: 0x0a0e20,
        overlayAlpha: 0.24,
        accent: '#5aa9ff',
        ambience: 'dust'
    },
    {
        id: 'impel-down',
        name: 'Impel Down',
        background: 'impel-down',
        floorY: 452,
        parallax: 0.38,
        overlay: 'rgba(8,4,16,0.36)',
        overlayColor: 0x080410,
        overlayAlpha: 0.36,
        accent: '#b061ff',
        ambience: 'none'
    },
    {
        id: 'rain-dinners',
        name: 'Rain Dinners',
        background: 'rain-dinners',
        floorY: 452,
        parallax: 0.4,
        overlay: 'rgba(30,22,6,0.24)',
        overlayColor: 0x1e1606,
        overlayAlpha: 0.24,
        accent: '#ffd166',
        ambience: 'dust'
    },
    {
        id: 'shandora',
        name: 'Shandora',
        background: 'shandora',
        floorY: 452,
        parallax: 0.44,
        overlay: 'rgba(6,20,14,0.24)',
        overlayColor: 0x06140e,
        overlayAlpha: 0.24,
        accent: '#5ee6a8',
        ambience: 'sparks'
    },
    {
        id: 'arlong-park',
        name: 'Arlong Park',
        background: 'arlong-park',
        floorY: 452,
        parallax: 0.4,
        overlay: 'rgba(6,16,30,0.24)',
        overlayColor: 0x06101e,
        overlayAlpha: 0.24,
        accent: '#4fd0e3',
        ambience: 'none'
    }
];

export const STAGE_IDS: readonly string[] = STAGES.map((stage) => stage.id);
export const DEFAULT_STAGE = STAGES[0]!.id;

export const findStage = (id: string): StageDefinition =>
    STAGES.find((stage) => stage.id === id) ?? STAGES[0]!;

/** Deterministic stage pick, so both clients land on the same arena. */
export const pickStage = (seed: number): string => {
    const index = (seed >>> 8) % STAGES.length;
    return STAGES[index]?.id ?? DEFAULT_STAGE;
};
