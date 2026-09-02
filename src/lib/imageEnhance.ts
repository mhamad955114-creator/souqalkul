/**
 * Automatic image enhancement applied before upload:
 * 1. Trims unwanted uniform borders (letterboxing / screenshot bars / blank margins).
 * 2. Improves lighting: histogram stretch (auto levels) + gentle gamma correction.
 * 3. Normalizes every image to a single format (WebP).
 */

const OUTPUT_TYPE = "image/webp";
const OUTPUT_QUALITY = 0.86;
const MAX_DIMENSION = 1600;

/** Max fraction of each side that auto-crop is allowed to remove. */
const MAX_TRIM_RATIO = 0.25;
/** Colour distance (0-255) under which a row/column counts as part of a uniform border. */
const BORDER_TOLERANCE = 12;

type Bounds = { left: number; top: number; right: number; bottom: number };

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image decode failed"));
    };
    img.src = url;
  });
}

function sampleColor(data: Uint8ClampedArray, w: number, x: number, y: number) {
  const i = (y * w + x) * 4;
  return [data[i], data[i + 1], data[i + 2]] as const;
}

function isUniformLine(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  index: number,
  horizontal: boolean,
  ref: readonly [number, number, number]
): boolean {
  const length = horizontal ? w : h;
  const step = Math.max(1, Math.floor(length / 64));
  for (let p = 0; p < length; p += step) {
    const [r, g, b] = horizontal
      ? sampleColor(data, w, p, index)
      : sampleColor(data, w, index, p);
    if (
      Math.abs(r - ref[0]) > BORDER_TOLERANCE ||
      Math.abs(g - ref[1]) > BORDER_TOLERANCE ||
      Math.abs(b - ref[2]) > BORDER_TOLERANCE
    ) {
      return false;
    }
  }
  return true;
}

/** Detect uniform borders (blank space / bars) around the actual subject. */
function detectContentBounds(data: Uint8ClampedArray, w: number, h: number): Bounds {
  const corner = sampleColor(data, w, 0, 0);
  const maxX = Math.floor(w * MAX_TRIM_RATIO);
  const maxY = Math.floor(h * MAX_TRIM_RATIO);

  let top = 0;
  while (top < maxY && isUniformLine(data, w, h, top, true, corner)) top++;

  let bottom = h - 1;
  while (h - 1 - bottom < maxY && isUniformLine(data, w, h, bottom, true, corner)) bottom--;

  let left = 0;
  while (left < maxX && isUniformLine(data, w, h, left, false, corner)) left++;

  let right = w - 1;
  while (w - 1 - right < maxX && isUniformLine(data, w, h, right, false, corner)) right--;

  if (right - left < w * 0.4 || bottom - top < h * 0.4) {
    return { left: 0, top: 0, right: w - 1, bottom: h - 1 };
  }
  return { left, top, right, bottom };
}

/** Auto levels + gentle gamma so dark or flat photos read clearly. */
function improveLighting(imageData: ImageData) {
  const { data } = imageData;
  const histogram = new Uint32Array(256);
  let total = 0;

  for (let i = 0; i < data.length; i += 4) {
    const luma = (data[i] * 299 + data[i + 1] * 587 + data[i + 2] * 114) / 1000;
    histogram[luma | 0]++;
    total++;
  }

  // Clip 0.5% of pixels on each end to find robust black/white points.
  const clip = total * 0.005;
  let low = 0;
  let high = 255;
  let acc = 0;
  for (let v = 0; v < 256; v++) {
    acc += histogram[v];
    if (acc > clip) {
      low = v;
      break;
    }
  }
  acc = 0;
  for (let v = 255; v >= 0; v--) {
    acc += histogram[v];
    if (acc > clip) {
      high = v;
      break;
    }
  }
  if (high - low < 24) return; // already flat/low-contrast beyond safe correction

  // Mean brightness decides the gamma nudge (dark photos get lifted).
  let sum = 0;
  for (let v = 0; v < 256; v++) sum += v * histogram[v];
  const mean = sum / total;
  const gamma = mean < 110 ? 0.85 : mean > 175 ? 1.08 : 1;

  const lut = new Uint8ClampedArray(256);
  const range = high - low;
  for (let v = 0; v < 256; v++) {
    const stretched = Math.min(1, Math.max(0, (v - low) / range));
    lut[v] = Math.round(Math.pow(stretched, gamma) * 255);
  }

  for (let i = 0; i < data.length; i += 4) {
    data[i] = lut[data[i]];
    data[i + 1] = lut[data[i + 1]];
    data[i + 2] = lut[data[i + 2]];
  }
}

function canvasToFile(canvas: HTMLCanvasElement, name: string): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error("encode failed"));
        const webpName = name.replace(/\.[^.]+$/, "") + ".webp";
        resolve(new File([blob], webpName, { type: OUTPUT_TYPE }));
      },
      OUTPUT_TYPE,
      OUTPUT_QUALITY
    );
  });
}

/**
 * Enhance a listing image: auto-crop uniform borders, fix lighting, output WebP.
 * Returns the original file untouched on any failure or for non-images.
 */
export async function enhanceImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;

  try {
    const img = await loadImage(file);
    const srcW = img.naturalWidth;
    const srcH = img.naturalHeight;
    if (!srcW || !srcH) return file;

    const src = document.createElement("canvas");
    src.width = srcW;
    src.height = srcH;
    const sctx = src.getContext("2d", { willReadFrequently: true });
    if (!sctx) return file;
    sctx.drawImage(img, 0, 0);

    const full = sctx.getImageData(0, 0, srcW, srcH);
    const bounds = detectContentBounds(full.data, srcW, srcH);

    const cropW = bounds.right - bounds.left + 1;
    const cropH = bounds.bottom - bounds.top + 1;

    const scale = Math.min(1, MAX_DIMENSION / Math.max(cropW, cropH));
    const outW = Math.max(1, Math.round(cropW * scale));
    const outH = Math.max(1, Math.round(cropH * scale));

    const out = document.createElement("canvas");
    out.width = outW;
    out.height = outH;
    const octx = out.getContext("2d", { willReadFrequently: true });
    if (!octx) return file;
    octx.imageSmoothingQuality = "high";
    octx.drawImage(src, bounds.left, bounds.top, cropW, cropH, 0, 0, outW, outH);

    const outData = octx.getImageData(0, 0, outW, outH);
    improveLighting(outData);
    octx.putImageData(outData, 0, 0);

    const enhanced = await canvasToFile(out, file.name);
    return enhanced.size > 0 ? enhanced : file;
  } catch (error) {
    console.warn("Image enhancement failed, using original:", error);
    return file;
  }
}
