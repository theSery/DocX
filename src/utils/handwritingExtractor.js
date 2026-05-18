import RNFS from 'react-native-fs';
import { ImageFormat, Skia } from '@shopify/react-native-skia';

const defaultOptions = {
  contrast: 1.15,
  brightnessThreshold: 0.82,
  saturationGuard: 0.12,
};

const clamp = (value, min = 0, max = 255) => Math.min(max, Math.max(min, value));

const luma = (r, g, b) => (0.299 * r + 0.587 * g + 0.114 * b) / 255;

const percentile = (values, p) => {
  const histogram = new Uint32Array(256);
  for (let i = 0; i < values.length; i += 1) {
    histogram[values[i]] += 1;
  }

  const target = Math.floor((values.length - 1) * Math.min(1, Math.max(0, p)));
  let total = 0;
  for (let i = 0; i < histogram.length; i += 1) {
    total += histogram[i];
    if (total > target) {
      return i / 255;
    }
  }

  return 1;
};

const saturation = (r, g, b) => {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === 0) {
    return 0;
  }
  return (max - min) / max;
};

function assertImage(value, message) {
  if (!value) {
    throw new Error(message);
  }
  return value;
}

/** Removes bright paper background while preserving ink transparency and edges. */
export async function extractHandwritingToTransparentPng(sourcePath, options) {
  const effective = { ...defaultOptions, ...(options ?? {}) };
  const input = sourcePath.startsWith('file://')
    ? sourcePath.replace('file://', '')
    : sourcePath;
  const sourceBase64 = await RNFS.readFile(input, 'base64');
  const data = Skia.Data.fromBase64(sourceBase64);
  const source = assertImage(
    data ? Skia.Image.MakeImageFromEncoded(data) : null,
    'Unable to decode source image',
  );

  const width = source.width();
  const height = source.height();
  const srcPixels = source.readPixels();
  if (!srcPixels) {
    throw new Error('Unable to read image pixels');
  }

  const outPixels = new Uint8Array(srcPixels.length);
  const lumas = new Uint8Array(srcPixels.length / 4);

  for (let i = 0, j = 0; i < srcPixels.length; i += 4, j += 1) {
    lumas[j] = clamp(Math.round(luma(srcPixels[i], srcPixels[i + 1], srcPixels[i + 2]) * 255), 0, 255);
  }

  const p10 = percentile(lumas, 0.1);
  const p90 = percentile(lumas, 0.9);
  const adaptiveThreshold = Math.min(
    effective.brightnessThreshold,
    Math.max(0.38, p90 - Math.max(0.12, (p90 - p10) * 0.18)),
  );
  const paperCutoff = Math.min(0.98, p90 + 0.03);
  const satGuard = effective.saturationGuard;

  for (let i = 0; i < srcPixels.length; i += 4) {
    const r = srcPixels[i];
    const g = srcPixels[i + 1];
    const b = srcPixels[i + 2];
    const a = srcPixels[i + 3];

    const pixelLuma = luma(r, g, b);
    const pixelSat = saturation(r, g, b);
    const isLikelyPaper = pixelLuma >= paperCutoff && pixelSat <= satGuard;
    const darkness =
      clamp(
        Math.round(((adaptiveThreshold - pixelLuma) / Math.max(adaptiveThreshold, 0.01)) * 255),
        0,
        255,
      ) / 255;
    const satBoost = clamp(Math.round((pixelSat - satGuard) * 320), 0, 255) / 255;
    const inkScore = isLikelyPaper ? 0 : Math.max(darkness, satBoost * 0.8);
    const alpha = clamp(Math.round(a * inkScore ** 0.78), 0, 255);

    if (alpha < 16) {
      outPixels[i] = 0;
      outPixels[i + 1] = 0;
      outPixels[i + 2] = 0;
      outPixels[i + 3] = 0;
      continue;
    }

    const grayscale = clamp(
      Math.round((0.299 * r + 0.587 * g + 0.114 * b) * (2 - effective.contrast) - 20),
      0,
      255,
    );
    outPixels[i] = grayscale;
    outPixels[i + 1] = grayscale;
    outPixels[i + 2] = grayscale;
    outPixels[i + 3] = alpha;
  }

  const imageInfo = {
    width,
    height,
    colorType: 4,
    alphaType: 3,
  };
  const outData = Skia.Data.fromBytes(outPixels);
  const outImage = assertImage(
    Skia.Image.MakeImage(imageInfo, outData, width * 4),
    'Unable to create output image',
  );

  const outputBase64 = outImage.encodeToBase64(ImageFormat.PNG, 100);
  if (!outputBase64) {
    throw new Error('Unable to encode transparent PNG');
  }

  const outDir = `${RNFS.DocumentDirectoryPath}/handwriting_extracts`;
  const dirExists = await RNFS.exists(outDir);
  if (!dirExists) {
    await RNFS.mkdir(outDir);
  }

  const outputPath = `${outDir}/handwriting_${Date.now()}.png`;
  await RNFS.writeFile(outputPath, outputBase64, 'base64');

  return { outputPath, width, height };
}
