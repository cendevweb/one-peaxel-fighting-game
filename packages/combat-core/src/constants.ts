import { px } from './fixed.js';

/** The simulation always advances at this rate, on every machine. */
export const TICK_RATE = 60;
export const FRAME_MS = 1000 / TICK_RATE;

/** Logical rendering viewport. The Phaser canvas is scaled to fit. */
export const VIEW_WIDTH = 960;
export const VIEW_HEIGHT = 540;

/** Playable arena, wider than the viewport: the camera pans between fighters. */
export const ARENA_WIDTH = 1280;
export const ARENA_WIDTH_FP = px(ARENA_WIDTH);
/** Ceiling, so a jump cannot leave the stage. */
export const ARENA_CEILING_FP = px(340);
/** Fighters cannot be pushed past this margin from either wall. */
export const WALL_MARGIN_FP = px(24);

/** Full meter. A super costs the whole bar. */
export const METER_MAX = 1000;

/** Rounds needed to win the match, and the round clock. */
export const ROUNDS_TO_WIN = 2;
export const ROUND_TIME_SECONDS = 60;
export const ROUND_TIME_FRAMES = ROUND_TIME_SECONDS * TICK_RATE;

/** Phase durations, in frames. */
export const INTRO_FRAMES = 150;
export const KO_FREEZE_FRAMES = 110;
export const ROUND_END_FRAMES = 120;

/** How many frames of inputs a fighter keeps for combo detection. */
export const INPUT_BUFFER_FRAMES = 8;

/** Damage scaling inside a combo: the nth hit deals SCALE[n] percent. */
export const COMBO_SCALING = [100, 100, 90, 80, 70, 60, 50, 45, 40, 35, 30] as const;
export const COMBO_SCALING_FLOOR = 25;

/** Ground friction and the minimum push-apart speed, in fixed point. */
export const GROUND_FRICTION_FP = px(0.9);
export const AIR_FRICTION_FP = px(0.12);
export const PUSH_SPEED_FP = px(1.4);

/** Frames of invulnerability granted when a knocked-down fighter gets up. */
export const WAKEUP_INVULN_FRAMES = 12;
