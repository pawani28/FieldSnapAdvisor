import { ImageAnalysisMetrics } from '../types';

/**
 * Converts RGB to HSV
 * R, G, B are in [0, 255]
 * Returns { h: [0, 360], s: [0, 100], v: [0, 100] }
 */
function rgbToHsv(r: number, g: number, b: number) {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === rNorm) {
      h = 60 * (((gNorm - bNorm) / delta) % 6);
    } else if (max === gNorm) {
      h = 60 * ((bNorm - rNorm) / delta + 2);
    } else {
      h = 60 * ((rNorm - gNorm) / delta + 4);
    }
  }
  if (h < 0) h += 360;

  const s = max === 0 ? 0 : (delta / max) * 100;
  const v = max * 100;

  return { h, s, v };
}

/**
 * Loads an image from a data URI or URL into an HTMLImageElement
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

/**
 * Offline Canvas-based Soil Image Analyzer
 */
export async function analyzeSoilPhoto(imageSrc: string): Promise<{
  brightness: number;
  hue: number;
  variance: number;
  moisture: 'dry' | 'moist' | 'wet';
}> {
  try {
    const img = await loadImage(imageSrc);
    const canvas = document.createElement('canvas');
    const width = 120;
    const height = 120;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Canvas 2D context unavailable');

    ctx.drawImage(img, 0, 0, width, height);
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    let totalV = 0;
    let totalH = 0;
    const brightnesses: number[] = [];

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const { h, v } = rgbToHsv(r, g, b);
      totalV += v;
      totalH += h;
      brightnesses.push(v);
    }

    const count = brightnesses.length;
    const avgV = totalV / count;
    const avgH = totalH / count;

    // Calculate variance (texture / cracks)
    let sumDiffSq = 0;
    for (let i = 0; i < count; i++) {
      const diff = brightnesses[i] - avgV;
      sumDiffSq += diff * diff;
    }
    const variance = Math.sqrt(sumDiffSq / count);

    // Heuristics:
    // Very light soil (V > 50) + high contrast/texture (cracking, dust) = Dry
    // Darker soil (V < 40) = Moist / hydrated
    // Extremely dark / muddy (V < 22) = Over-saturated / wet
    let moisture: 'dry' | 'moist' | 'wet' = 'moist';
    if (avgV > 48 || (avgV > 42 && variance > 16)) {
      moisture = 'dry';
    } else if (avgV < 24) {
      moisture = 'wet';
    } else {
      moisture = 'moist';
    }

    return {
      brightness: Math.round(avgV),
      hue: Math.round(avgH),
      variance: Math.round(variance),
      moisture
    };
  } catch (error) {
    console.warn('Fallback soil heuristic used:', error);
    return {
      brightness: 45,
      hue: 35,
      variance: 14,
      moisture: 'moist'
    };
  }
}

/**
 * Offline Canvas-based Crop Row Image Analyzer
 */
export async function analyzeCropPhoto(imageSrc: string): Promise<{
  greennessIndex: number;
  chlorosisRatio: number;
  canopyCoverage: number;
}> {
  try {
    const img = await loadImage(imageSrc);
    const canvas = document.createElement('canvas');
    const width = 120;
    const height = 120;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Canvas 2D context unavailable');

    ctx.drawImage(img, 0, 0, width, height);
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    let greenPixelCount = 0;
    let yellowPixelCount = 0;
    let totalGreenRatioSum = 0;
    const totalPixels = width * height;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const sum = r + g + b || 1;

      // Excess green index ratio: G / (R + G + B)
      const greenRatio = g / sum;
      totalGreenRatioSum += greenRatio;

      // Detect vegetation (Green significantly higher than Blue and Red)
      const isGreenLeaf = g > r * 0.95 && g > b * 1.15 && g > 45;
      // Detect yellowing / chlorosis (Both Red & Green high, Blue low)
      const isYellowLeaf = r > 110 && g > 110 && b < 80 && Math.abs(r - g) < 50;

      if (isGreenLeaf) {
        greenPixelCount++;
      } else if (isYellowLeaf) {
        yellowPixelCount++;
      }
    }

    const avgGreenRatio = totalGreenRatioSum / totalPixels;
    const canopyCoverage = Math.min(100, Math.round(((greenPixelCount + yellowPixelCount) / totalPixels) * 100));
    const totalLeafPixels = (greenPixelCount + yellowPixelCount) || 1;
    const chlorosisRatio = yellowPixelCount / totalLeafPixels;

    return {
      greennessIndex: Number(avgGreenRatio.toFixed(3)),
      chlorosisRatio: Number(chlorosisRatio.toFixed(3)),
      canopyCoverage
    };
  } catch (error) {
    console.warn('Fallback crop heuristic used:', error);
    return {
      greennessIndex: 0.38,
      chlorosisRatio: 0.15,
      canopyCoverage: 65
    };
  }
}

/**
 * Runs full offline analysis pipeline on both photos
 */
export async function runOfflineImageAnalysis(
  soilSrc: string,
  cropSrc: string
): Promise<ImageAnalysisMetrics> {
  const soil = await analyzeSoilPhoto(soilSrc);
  const crop = await analyzeCropPhoto(cropSrc);

  return {
    soilBrightness: soil.brightness,
    soilHue: soil.hue,
    soilTextureVariance: soil.variance,
    soilMoistureLevel: soil.moisture,
    cropGreennessIndex: crop.greennessIndex,
    cropChlorosisRatio: crop.chlorosisRatio,
    cropCanopyCoverage: crop.canopyCoverage,
  };
}
