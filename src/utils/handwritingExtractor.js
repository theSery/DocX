import RNFS from 'react-native-fs';
import {
  AlphaType,
  ColorType,
  ImageFormat,
  Skia,
} from '@shopify/react-native-skia';

/**
 * Production signature / handwriting extractor.
 * Decodes common photo formats (JPEG/PNG/WebP; HEIC via picker conversion),
 * estimates paper color from borders, and emits a transparent PNG of the ink.
 */

/** Final ink tint applied after background removal (#0047AB). */
const SIGNATURE_INK = { r: 0, g: 71, b: 171 };

const DEFAULT_OPTIONS = {
  /** Longest side after decode; keeps memory bounded on camera photos. */
  maxDimension: 2048,
  /**
   * Darkness vs local paper where ink begins.
   * Kept high so soft photo shadows stay transparent.
   */
  inkStart: 0.11,
  /** Darkness vs local paper where ink is fully opaque. */
  inkFull: 0.32,
  /** Only saturated strokes (blue/red pens) use color distance. */
  minSaturationForColorInk: 0.18,
  colorDistanceStart: 0.12,
  colorDistanceFull: 0.28,
  /** Border fraction used to sample global paper color. */
  borderSampleRatio: 0.08,
  /** Crush mid-tone alphas (shadows); 1 = linear, higher = stricter. */
  alphaGamma: 2.1,
  /** Alphas below this become fully transparent. */
  alphaFloor: 28,
  /** Yield to the JS event loop every N rows for large images. */
  yieldEveryRows: 48,
};

const clamp01 = value => Math.min(1, Math.max(0, value));
const clampByte = value => Math.min(255, Math.max(0, Math.round(value)));

const luma01 = (r, g, b) => (0.299 * r + 0.587 * g + 0.114 * b) / 255;

const saturation01 = (r, g, b) => {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max <= 0) {
    return 0;
  }
  return (max - min) / max;
};

const smoothstep = (edge0, edge1, x) => {
  if (edge1 <= edge0) {
    return x >= edge1 ? 1 : 0;
  }
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

const colorDistance01 = (r, g, b, pr, pg, pb) => {
  const dr = (r - pr) / 255;
  const dg = (g - pg) / 255;
  const db = (b - pb) / 255;
  return Math.sqrt(dr * dr + dg * dg + db * db) / Math.sqrt(3);
};

const medianByte = values => {
  if (values.length === 0) {
    return 255;
  }
  const sorted = values.slice().sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
};

const yieldToUi = () =>
  new Promise(resolve => {
    setTimeout(resolve, 0);
  });

function assertImage(value, message) {
  if (!value) {
    throw new Error(message);
  }
  return value;
}

function normalizeUri(sourcePath) {
  if (!sourcePath || typeof sourcePath !== 'string') {
    throw new Error('Source image path is required');
  }
  if (
    sourcePath.startsWith('file://') ||
    sourcePath.startsWith('content://') ||
    sourcePath.startsWith('ph://') ||
    sourcePath.startsWith('assets-library://') ||
    sourcePath.startsWith('http://') ||
    sourcePath.startsWith('https://')
  ) {
    return sourcePath;
  }
  return `file://${sourcePath}`;
}

async function loadEncodedData(sourcePath) {
  const uri = normalizeUri(sourcePath);

  try {
    const fromUri = await Skia.Data.fromURI(uri);
    if (fromUri) {
      return fromUri;
    }
  } catch {
    // Fall through to filesystem / base64 path.
  }

  const filePath = uri.startsWith('file://') ? uri.replace('file://', '') : uri;
  if (
    filePath.startsWith('content://') ||
    filePath.startsWith('ph://') ||
    filePath.startsWith('assets-library://') ||
    filePath.startsWith('http')
  ) {
    throw new Error('Unable to read image from this URI scheme');
  }

  const exists = await RNFS.exists(filePath);
  if (!exists) {
    throw new Error('Source image file was not found');
  }

  const base64 = await RNFS.readFile(filePath, 'base64');
  const data = Skia.Data.fromBase64(base64);
  if (!data) {
    throw new Error('Unable to read source image bytes');
  }
  return data;
}

function scaleImageIfNeeded(source, maxDimension) {
  const width = source.width();
  const height = source.height();
  const longest = Math.max(width, height);

  if (!maxDimension || longest <= maxDimension) {
    return { image: source, width, height, scaled: false };
  }

  const scale = maxDimension / longest;
  const targetWidth = Math.max(1, Math.round(width * scale));
  const targetHeight = Math.max(1, Math.round(height * scale));
  const surface = Skia.Surface.MakeOffscreen(targetWidth, targetHeight);
  if (!surface) {
    return { image: source, width, height, scaled: false };
  }

  const canvas = surface.getCanvas();
  canvas.clear(Skia.Color('transparent'));
  const paint = Skia.Paint();
  paint.setAntiAlias(true);
  // Cubic resampling preserves stroke edges better than nearest/bilinear alone.
  canvas.drawImageRectCubic(
    source,
    Skia.XYWHRect(0, 0, width, height),
    Skia.XYWHRect(0, 0, targetWidth, targetHeight),
    1 / 3,
    1 / 3,
    paint,
  );

  const scaled = assertImage(
    surface.makeImageSnapshot(),
    'Unable to downscale source image',
  );

  return {
    image: scaled,
    width: targetWidth,
    height: targetHeight,
    scaled: true,
  };
}

/**
 * Estimate paper RGB from border pixels (median of bright-ish samples).
 * Works for off-white / cream paper and uneven lighting better than a global threshold.
 */
function estimatePaperColor(pixels, width, height, borderSampleRatio) {
  const border = Math.max(
    2,
    Math.floor(Math.min(width, height) * borderSampleRatio),
  );
  const step = Math.max(1, Math.floor(Math.min(width, height) / 180));
  const rs = [];
  const gs = [];
  const bs = [];
  const push = (x, y) => {
    const i = (y * width + x) * 4;
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    // Skip obviously dark ink when sampling paper.
    if (luma01(r, g, b) < 0.35) {
      return;
    }
    rs.push(r);
    gs.push(g);
    bs.push(b);
  };

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < border; x += step) {
      push(x, y);
    }
    for (let x = width - border; x < width; x += step) {
      push(x, y);
    }
  }
  for (let x = border; x < width - border; x += step) {
    for (let y = 0; y < border; y += step) {
      push(x, y);
    }
    for (let y = height - border; y < height; y += step) {
      push(x, y);
    }
  }

  if (rs.length < 16) {
    return { r: 248, g: 248, b: 248, luma: luma01(248, 248, 248) };
  }

  const r = medianByte(rs);
  const g = medianByte(gs);
  const b = medianByte(bs);
  return { r, g, b, luma: luma01(r, g, b) };
}

/**
 * Coarse local paper-luma map (high percentile per tile).
 * Soft lighting shadows sit near this level; true ink is much darker.
 */
function buildLocalPaperLumaMap(pixels, width, height, fallbackLuma) {
  const tile = Math.max(20, Math.floor(Math.min(width, height) / 18));
  const cols = Math.ceil(width / tile);
  const rows = Math.ceil(height / tile);
  const grid = new Float32Array(cols * rows);

  for (let ty = 0; ty < rows; ty += 1) {
    for (let tx = 0; tx < cols; tx += 1) {
      const x0 = tx * tile;
      const y0 = ty * tile;
      const x1 = Math.min(width, x0 + tile);
      const y1 = Math.min(height, y0 + tile);
      const histogram = new Uint32Array(256);
      let count = 0;

      for (let y = y0; y < y1; y += 2) {
        for (let x = x0; x < x1; x += 2) {
          const i = (y * width + x) * 4;
          const value = clampByte(
            luma01(pixels[i], pixels[i + 1], pixels[i + 2]) * 255,
          );
          histogram[value] += 1;
          count += 1;
        }
      }

      if (count === 0) {
        grid[ty * cols + tx] = fallbackLuma;
        continue;
      }

      // High percentile ≈ local paper (including softly shaded paper).
      const target = Math.floor(count * 0.92);
      let seen = 0;
      let selected = 255;
      for (let bin = 0; bin < 256; bin += 1) {
        seen += histogram[bin];
        if (seen >= target) {
          selected = bin;
          break;
        }
      }
      // Do not pull shadowed tiles up toward global paper — that creates black shadows.
      grid[ty * cols + tx] = Math.max(0.2, selected / 255);
    }
  }

  return { grid, cols, rows, tile };
}

function sampleLocalPaperLuma(map, x, y, width, height) {
  const { grid, cols, rows } = map;
  const fx = clamp01(x / Math.max(width - 1, 1)) * (cols - 1);
  const fy = clamp01(y / Math.max(height - 1, 1)) * (rows - 1);
  const x0 = Math.floor(fx);
  const y0 = Math.floor(fy);
  const x1 = Math.min(cols - 1, x0 + 1);
  const y1 = Math.min(rows - 1, y0 + 1);
  const tx = fx - x0;
  const ty = fy - y0;

  const v00 = grid[y0 * cols + x0];
  const v10 = grid[y0 * cols + x1];
  const v01 = grid[y1 * cols + x0];
  const v11 = grid[y1 * cols + x1];
  const top = v00 * (1 - tx) + v10 * tx;
  const bottom = v01 * (1 - tx) + v11 * tx;
  return top * (1 - ty) + bottom * ty;
}

async function removeBackgroundPixels(pixels, width, height, paper, options) {
  const out = new Uint8Array(pixels.length);
  const {
    inkStart,
    inkFull,
    minSaturationForColorInk,
    colorDistanceStart,
    colorDistanceFull,
    alphaGamma,
    alphaFloor,
    yieldEveryRows,
  } = options;

  const globalPaperLuma = Math.max(paper.luma, 0.5);
  const localPaper = buildLocalPaperLumaMap(
    pixels,
    width,
    height,
    globalPaperLuma,
  );

  for (let y = 0; y < height; y += 1) {
    const rowOffset = y * width * 4;
    for (let x = 0; x < width; x += 1) {
      const i = rowOffset + x * 4;
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const a = pixels[i + 3];

      if (a < 8) {
        out[i] = 0;
        out[i + 1] = 0;
        out[i + 2] = 0;
        out[i + 3] = 0;
        continue;
      }

      const pixelLuma = luma01(r, g, b);
      // Compare only against local paper so lighting gradients / soft shadows cancel out.
      const paperLuma = sampleLocalPaperLuma(localPaper, x, y, width, height);
      const darkness = clamp01(paperLuma - pixelLuma);
      const sat = saturation01(r, g, b);

      let inkScore = smoothstep(inkStart, inkFull, darkness);

      // Colored pens only — gray shadow distance from cream paper must NOT count as ink.
      if (sat >= minSaturationForColorInk) {
        const distance = colorDistance01(r, g, b, paper.r, paper.g, paper.b);
        const colorScore = smoothstep(
          colorDistanceStart,
          colorDistanceFull,
          distance,
        );
        inkScore = Math.max(inkScore, colorScore);
      }

      // Crush soft mid-tones (shadow haze) while keeping stroke anti-aliasing.
      const shaped = Math.pow(inkScore, alphaGamma);
      const alpha = clampByte(a * shaped);

      if (alpha < alphaFloor) {
        out[i] = 0;
        out[i + 1] = 0;
        out[i + 2] = 0;
        out[i + 3] = 0;
        continue;
      }

      // Keep ink on transparent background, always tinted to #0047AB.
      out[i] = SIGNATURE_INK.r;
      out[i + 1] = SIGNATURE_INK.g;
      out[i + 2] = SIGNATURE_INK.b;
      out[i + 3] = alpha;
    }

    if (yieldEveryRows > 0 && y > 0 && y % yieldEveryRows === 0) {
      await yieldToUi();
    }
  }

  stripWeakShadowHaze(out, width, height);
  suppressIsolatedSpeckles(out, width, height);
  return out;
}

/**
 * Remove soft semi-transparent haze that isn't attached to solid ink strokes.
 */
function stripWeakShadowHaze(pixels, width, height) {
  const solid = 140;
  const weak = 110;
  const radius = 2;

  for (let y = radius; y < height - radius; y += 1) {
    for (let x = radius; x < width - radius; x += 1) {
      const i = (y * width + x) * 4;
      const alpha = pixels[i + 3];
      if (alpha === 0 || alpha >= solid) {
        continue;
      }
      if (alpha > weak) {
        continue;
      }

      let nearSolid = false;
      for (let dy = -radius; dy <= radius && !nearSolid; dy += 1) {
        for (let dx = -radius; dx <= radius; dx += 1) {
          const ni = ((y + dy) * width + (x + dx)) * 4;
          if (pixels[ni + 3] >= solid) {
            nearSolid = true;
            break;
          }
        }
      }

      if (!nearSolid) {
        pixels[i] = 0;
        pixels[i + 1] = 0;
        pixels[i + 2] = 0;
        pixels[i + 3] = 0;
      }
    }
  }
}

/**
 * Drop tiny isolated opaque pixels that are usually sensor/JPEG noise on paper.
 */
function suppressIsolatedSpeckles(pixels, width, height) {
  const minNeighbor = 40;
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const i = (y * width + x) * 4;
      const alpha = pixels[i + 3];
      if (alpha < 50 || alpha > 170) {
        continue;
      }

      let neighborInk = 0;
      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          if (dx === 0 && dy === 0) {
            continue;
          }
          const ni = ((y + dy) * width + (x + dx)) * 4;
          if (pixels[ni + 3] >= minNeighbor) {
            neighborInk += 1;
          }
        }
      }

      if (neighborInk <= 1) {
        pixels[i] = 0;
        pixels[i + 1] = 0;
        pixels[i + 2] = 0;
        pixels[i + 3] = 0;
      }
    }
  }
}

async function ensureOutputDir() {
  const outDir = `${RNFS.CachesDirectoryPath}/handwriting_extracts`;
  const dirExists = await RNFS.exists(outDir);
  if (!dirExists) {
    await RNFS.mkdir(outDir);
  }
  return outDir;
}

/**
 * Removes paper/background from a signature photo and writes a transparent PNG.
 *
 * @param {string} sourcePath Absolute path or file/content URI from the image picker.
 * @param {Partial<typeof DEFAULT_OPTIONS>} [options]
 * @returns {Promise<{ outputPath: string, width: number, height: number }>}
 */
export async function extractHandwritingToTransparentPng(sourcePath, options) {
  const effective = { ...DEFAULT_OPTIONS, ...(options ?? {}) };
  const encoded = await loadEncodedData(sourcePath);
  const decoded = assertImage(
    Skia.Image.MakeImageFromEncoded(encoded),
    'Unable to decode image. Use JPEG/PNG/WebP, or pick with compatible representation for HEIC.',
  );

  const {
    image: workingImage,
    width,
    height,
  } = scaleImageIfNeeded(decoded, effective.maxDimension);

  const raster =
    workingImage.makeNonTextureImage?.() ?? workingImage;
  const srcPixels = raster.readPixels(0, 0, {
    width,
    height,
    colorType: ColorType.BGRA_8888,
    alphaType: AlphaType.Unpremul,
  });
  if (!srcPixels || srcPixels.length < width * height * 4) {
    throw new Error('Unable to read image pixels');
  }

  const paper = estimatePaperColor(
    srcPixels,
    width,
    height,
    effective.borderSampleRatio,
  );
  const outPixels = await removeBackgroundPixels(
    srcPixels,
    width,
    height,
    paper,
    effective,
  );

  const imageInfo = {
    width,
    height,
    colorType: ColorType.RGBA_8888,
    alphaType: AlphaType.Unpremul,
  };
  const outData = Skia.Data.fromBytes(outPixels);
  const outImage = assertImage(
    Skia.Image.MakeImage(imageInfo, outData, width * 4),
    'Unable to create transparent output image',
  );

  const outputBase64 = outImage.encodeToBase64(ImageFormat.PNG, 100);
  if (!outputBase64) {
    throw new Error('Unable to encode transparent PNG');
  }

  const outDir = await ensureOutputDir();
  const outputPath = `${outDir}/handwriting_${Date.now()}.png`;
  await RNFS.writeFile(outputPath, outputBase64, 'base64');

  return { outputPath, width, height };
}
