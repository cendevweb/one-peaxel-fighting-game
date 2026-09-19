'use client';

import { useEffect, useRef, useState } from 'react';
import type { ManifestAnimation } from '@/game/manifest';

interface AtlasFrame {
    filename: string;
    frame: { x: number; y: number; w: number; h: number };
    spriteSourceSize: { x: number; y: number; w: number; h: number };
    sourceSize: { w: number; h: number };
}

interface AtlasFile {
    frames: AtlasFrame[];
}

const atlasCache = new Map<string, Promise<{ image: HTMLImageElement; frames: Map<string, AtlasFrame> }>>();

const loadAtlas = (texture: string): Promise<{ image: HTMLImageElement; frames: Map<string, AtlasFrame> }> => {
    const existing = atlasCache.get(texture);
    if (existing) {
        return existing;
    }
    const promise = (async () => {
        const [json, image] = await Promise.all([
            fetch(`/atlases/${texture}.json`).then((response) => response.json() as Promise<AtlasFile>),
            new Promise<HTMLImageElement>((resolve, reject) => {
                const element = new Image();
                element.onload = () => resolve(element);
                element.onerror = () => reject(new Error(`Atlas introuvable : ${texture}`));
                element.src = `/atlases/${texture}.png`;
            })
        ]);
        return { image, frames: new Map(json.frames.map((frame) => [frame.filename, frame])) };
    })();
    atlasCache.set(texture, promise);
    return promise;
};

export interface SpritePreviewProps {
    texture: string;
    animation: ManifestAnimation | undefined;
    /** Rendered size of the logical frame box, in CSS pixels. */
    height?: number;
    scale?: number;
    flip?: boolean;
    className?: string;
}

/**
 * An animated character on a canvas, drawn straight from the published atlas.
 *
 * The select screen needs fighters that move — a grid of still portraits is
 * the difference between a game and a form. Running a second Phaser instance
 * for that would cost a WebGL context per tile, so this walks the same atlas
 * by hand on a 2D canvas.
 */
export function SpritePreview({
    texture,
    animation,
    height = 150,
    scale = 2,
    flip = false,
    className
}: SpritePreviewProps): React.ReactElement {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        let raf = 0;
        let cancelled = false;

        void loadAtlas(texture).then(({ image, frames }) => {
            if (cancelled) {
                return;
            }
            const canvas = canvasRef.current;
            const context = canvas?.getContext('2d');
            if (!canvas || !context || !animation || animation.frames.length === 0) {
                return;
            }
            setReady(true);

            const first = frames.get(animation.frames[0] ?? '');
            const box = first?.sourceSize ?? { w: 120, h: 120 };
            canvas.width = Math.round(box.w * scale);
            canvas.height = Math.round(box.h * scale);
            context.imageSmoothingEnabled = false;

            let index = 0;
            let last = performance.now();
            const step = (now: number): void => {
                if (cancelled) {
                    return;
                }
                const interval = 1000 / Math.max(1, animation.frameRate);
                if (now - last >= interval) {
                    last = now;
                    index = (index + 1) % animation.frames.length;
                }

                const frame = frames.get(animation.frames[index] ?? '');
                context.clearRect(0, 0, canvas.width, canvas.height);
                if (frame) {
                    context.save();
                    if (flip) {
                        context.translate(canvas.width, 0);
                        context.scale(-1, 1);
                    }
                    context.drawImage(
                        image,
                        frame.frame.x,
                        frame.frame.y,
                        frame.frame.w,
                        frame.frame.h,
                        Math.round(frame.spriteSourceSize.x * scale),
                        Math.round(frame.spriteSourceSize.y * scale),
                        Math.round(frame.frame.w * scale),
                        Math.round(frame.frame.h * scale)
                    );
                    context.restore();
                }
                raf = requestAnimationFrame(step);
            };
            raf = requestAnimationFrame(step);
        });

        return () => {
            cancelled = true;
            cancelAnimationFrame(raf);
        };
    }, [texture, animation, scale, flip]);

    return (
        <canvas
            ref={canvasRef}
            className={className}
            style={{
                height,
                width: 'auto',
                imageRendering: 'pixelated',
                opacity: ready ? 1 : 0,
                transition: 'opacity 200ms linear'
            }}
        />
    );
}
