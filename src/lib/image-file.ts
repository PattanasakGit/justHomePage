const MAX_WALLPAPER_EDGE = 2400;
const WALLPAPER_QUALITY = 0.86;

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

export async function prepareWallpaperImage(file: File) {
  const source = await readAsDataUrl(file);
  const image = await loadImage(source);
  const ratio = Math.min(1, MAX_WALLPAPER_EDGE / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * ratio));
  const height = Math.max(1, Math.round(image.naturalHeight * ratio));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return source;

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", WALLPAPER_QUALITY);
}
