const MAX_WALLPAPER_EDGE = 2400;
const WALLPAPER_QUALITY = 0.86;
const LUMINANCE_SAMPLE_EDGE = 64;

export type WallpaperPreparation = {
  dataUrl: string;
  luminance: number | null;
};

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Cannot read image file."));
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Image reader returned an empty result."));
    };
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Cannot load image preview."));
    image.src = src;
  });
}

export function computeAverageLuminance(pixels: Uint8ClampedArray): number | null {
  if (pixels.length < 4) return null;
  let total = 0;
  let samples = 0;
  for (let i = 0; i + 3 < pixels.length; i += 4) {
    const alpha = pixels[i + 3] / 255;
    if (alpha === 0) continue;
    const r = pixels[i] / 255;
    const g = pixels[i + 1] / 255;
    const b = pixels[i + 2] / 255;
    total += (0.2126 * r + 0.7152 * g + 0.0722 * b) * alpha;
    samples += alpha;
  }
  if (samples === 0) return null;
  return total / samples;
}

function sampleLuminance(image: HTMLImageElement): number | null {
  const ratio = Math.min(1, LUMINANCE_SAMPLE_EDGE / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * ratio));
  const height = Math.max(1, Math.round(image.naturalHeight * ratio));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return null;
  context.drawImage(image, 0, 0, width, height);
  try {
    const { data } = context.getImageData(0, 0, width, height);
    return computeAverageLuminance(data);
  } catch {
    return null;
  }
}

export async function prepareWallpaperImage(file: File): Promise<WallpaperPreparation> {
  const source = await readAsDataUrl(file);
  const image = await loadImage(source);
  const ratio = Math.min(1, MAX_WALLPAPER_EDGE / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * ratio));
  const height = Math.max(1, Math.round(image.naturalHeight * ratio));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return { dataUrl: source, luminance: sampleLuminance(image) };

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(image, 0, 0, width, height);
  return {
    dataUrl: canvas.toDataURL("image/jpeg", WALLPAPER_QUALITY),
    luminance: sampleLuminance(image),
  };
}
