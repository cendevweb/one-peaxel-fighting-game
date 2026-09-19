import sharp from 'sharp';

/** A decoded sheet: straight RGBA, row-major, four bytes per pixel. */
export interface RawImage {
    width: number;
    height: number;
    data: Uint8Array;
}

export const loadImage = async (file: string): Promise<RawImage> => {
    const { data, info } = await sharp(file)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
    return { width: info.width, height: info.height, data: new Uint8Array(data) };
};

export const writePng = async (image: RawImage, file: string): Promise<void> => {
    await sharp(Buffer.from(image.data), {
        raw: { width: image.width, height: image.height, channels: 4 }
    })
        .png({ compressionLevel: 9, palette: false })
        .toFile(file);
};

export const createImage = (width: number, height: number): RawImage => ({
    width,
    height,
    data: new Uint8Array(width * height * 4)
});

export const pixelIndex = (image: RawImage, x: number, y: number): number =>
    (y * image.width + x) * 4;
