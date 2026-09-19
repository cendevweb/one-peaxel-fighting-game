'use client';

import { useEffect, useRef, useState } from 'react';
import { VIEW_HEIGHT, VIEW_WIDTH } from '@opfg/combat-core';
import type { FightBridge } from './bridge';
import type { AssetManifest } from './manifest';

export interface PhaserGameProps {
    bridge: FightBridge;
    manifest: AssetManifest;
    characters: [string, string];
    stageId: string;
}

/**
 * Mounts the Phaser canvas.
 *
 * Phaser reads `window` as it is imported, so it is pulled in dynamically
 * inside the effect: importing it at module scope would break the Next.js
 * server render. The canvas is created once per match and torn down with the
 * component; the bridge is what changes between frames, not the scene.
 */
export function PhaserGame({ bridge, manifest, characters, stageId }: PhaserGameProps): React.ReactElement {
    const hostRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let destroyed = false;
        let game: import('phaser').Game | null = null;

        const boot = async (): Promise<void> => {
            try {
                const [{ default: Phaser }, { FightScene }] = await Promise.all([
                    import('phaser'),
                    import('./FightScene')
                ]);
                if (destroyed || !hostRef.current) {
                    return;
                }

                game = new Phaser.Game({
                    type: Phaser.AUTO,
                    parent: hostRef.current,
                    width: VIEW_WIDTH,
                    height: VIEW_HEIGHT,
                    backgroundColor: '#05060a',
                    // Nearest-neighbour everywhere: a pixel-art fighter that is
                    // bilinear-filtered looks like a smear at 2.2x.
                    pixelArt: true,
                    antialias: false,
                    roundPixels: true,
                    scale: {
                        mode: Phaser.Scale.FIT,
                        autoCenter: Phaser.Scale.CENTER_BOTH,
                        width: VIEW_WIDTH,
                        height: VIEW_HEIGHT
                    },
                    audio: { noAudio: true },
                    banner: false,
                    scene: [FightScene]
                });

                game.scene.start('fight', { bridge, manifest, characters, stageId });
            } catch (cause) {
                setError(cause instanceof Error ? cause.message : String(cause));
            }
        };

        void boot();

        return () => {
            destroyed = true;
            game?.destroy(true);
            game = null;
        };
        // The scene is created for one match; a different match remounts it.
    }, [bridge, manifest, characters, stageId]);

    if (error) {
        return (
            <div className="panel flex h-full w-full items-center justify-center p-8 text-center">
                <p className="text-danger max-w-md text-sm">
                    Le moteur de rendu n&apos;a pas pu démarrer : {error}
                </p>
            </div>
        );
    }

    return <div ref={hostRef} className="h-full w-full" />;
}
