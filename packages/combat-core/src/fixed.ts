/**
 * Fixed-point arithmetic.
 *
 * The simulation has to produce bit-identical results on the server (Node) and
 * on both clients (browsers), otherwise rollback reconciliation diverges and
 * the two players stop seeing the same fight. Floating point is avoided
 * entirely inside the simulation: every position, velocity and acceleration is
 * an integer expressed in 1/64th of a game pixel.
 */

/** Number of fixed-point units in one game pixel. A power of two, so the
 *  conversion back to pixels is an arithmetic shift and never rounds oddly. */
export const FP_BITS = 6;
export const FP_ONE = 1 << FP_BITS; // 64

/** Converts a design-time pixel value (may be fractional) to fixed point. */
export const px = (value: number): number => Math.round(value * FP_ONE);

/** Converts fixed point back to whole pixels, rounding towards negative
 *  infinity so the result is identical for negative coordinates too. */
export const toPx = (value: number): number => value >> FP_BITS;

/** Clamps an integer between two bounds. */
export const clamp = (value: number, min: number, max: number): number =>
    (value < min ? min : value > max ? max : value);

/** Integer absolute value. */
export const iabs = (value: number): number => (value < 0 ? -value : value);

/** Sign of an integer, as -1, 0 or 1. */
export const isign = (value: number): -1 | 0 | 1 => (value < 0 ? -1 : value > 0 ? 1 : 0);

/**
 * Deterministic 32-bit linear congruential generator. Only used for cosmetic
 * variation (which impact spark is shown); never for anything that decides the
 * outcome of the fight, so that a desync in taste is impossible.
 */
export const nextRandom = (seed: number): number => (Math.imul(seed, 1664525) + 1013904223) >>> 0;
