/** Shape of `public/atlases/manifest.json`, written by the asset pipeline. */
export interface ManifestAnimation {
    key: string;
    frames: string[];
    frameRate: number;
    repeat: number;
}

export interface ManifestCharacter {
    id: string;
    texture: string;
    source: string;
    frameWidth: number;
    frameHeight: number;
    animations: ManifestAnimation[];
    warnings: string[];
}

export interface ManifestStage {
    id: string;
    image: string;
    width: number;
    height: number;
}

export interface AssetManifest {
    generatedAt: string;
    characters: ManifestCharacter[];
    stages: ManifestStage[];
}

let cached: Promise<AssetManifest> | null = null;

/** Loaded once per page: the select screen, the arena and the result screen
 *  all need the same frame data. */
export const loadManifest = async (): Promise<AssetManifest> => {
    cached ??= fetch('/atlases/manifest.json', { cache: 'force-cache' }).then(async (response) => {
        if (!response.ok) {
            throw new Error(
                `Les ressources du jeu sont introuvables (${response.status}). Lance "npm run assets" avant de démarrer.`
            );
        }
        return (await response.json()) as AssetManifest;
    });
    return cached;
};

export const animationsByKey = (manifest: AssetManifest): Map<string, ManifestAnimation> => {
    const map = new Map<string, ManifestAnimation>();
    for (const character of manifest.characters) {
        for (const animation of character.animations) {
            if (animation.frames.length > 0) {
                map.set(animation.key, animation);
            }
        }
    }
    return map;
};
