import { toPx } from './fixed.js';
import type { Box, FighterState, ProjectileState, WorldBox } from './types.js';

/**
 * Boxes are authored facing right. Resolving one means mirroring it when the
 * owner faces left, then translating it to the owner's pixel position. Working
 * in whole pixels here (rather than fixed point) keeps the overlap test cheap
 * and its results obvious when a frame has to be explained in a bug report.
 */
export const resolveBox = (box: Box, originX: number, originY: number, facing: 1 | -1): WorldBox => {
    const left = facing === 1 ? originX + box.x : originX - box.x - box.width;
    const bottom = originY + box.y;
    return {
        left,
        right: left + box.width,
        bottom,
        top: bottom + box.height
    };
};

export const boxesOverlap = (a: WorldBox, b: WorldBox): boolean =>
    a.left < b.right && a.right > b.left && a.bottom < b.top && a.top > b.bottom;

export const boxCenterX = (box: WorldBox): number => (box.left + box.right) >> 1;
export const boxCenterY = (box: WorldBox): number => (box.bottom + box.top) >> 1;

/** The overlap rectangle's centre, which is where an impact spark belongs. */
export const overlapCenter = (a: WorldBox, b: WorldBox): { x: number; y: number } => ({
    x: (Math.max(a.left, b.left) + Math.min(a.right, b.right)) >> 1,
    y: (Math.max(a.bottom, b.bottom) + Math.min(a.top, b.top)) >> 1
});

export const fighterPixelX = (fighter: FighterState): number => toPx(fighter.x);
export const fighterPixelY = (fighter: FighterState): number => toPx(fighter.y);

export const projectileBox = (projectile: ProjectileState, box: Box): WorldBox =>
    resolveBox(box, toPx(projectile.x), toPx(projectile.y), projectile.facing);
