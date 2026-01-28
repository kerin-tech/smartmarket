// src/utils/imageProcessor.ts

import sharp from 'sharp';
import { OcrProcessingOptions } from '../types/ocr.types';

const DEFAULT_OPTIONS: OcrProcessingOptions = {
  enhanceContrast: true,
  autoRotate: true,
  maxWidth: 2000,
  maxHeight: 3000,
};

/**
 * Preprocesa una imagen para mejorar la precisión del OCR
 * - Convierte a escala de grises
 * - Mejora contraste
 * - Redimensiona si es muy grande
 * - Normaliza formato a JPEG
 */
export async function preprocessImage(
  imageBuffer: Buffer,
  options: OcrProcessingOptions = {}
): Promise<Buffer> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  let pipeline = sharp(imageBuffer);

  // Auto-rotar según metadatos EXIF (fotos de móvil)
  if (opts.autoRotate) {
    pipeline = pipeline.rotate();
  }

  // Redimensionar si excede límites (mantiene proporción)
  pipeline = pipeline.resize(opts.maxWidth, opts.maxHeight, {
    fit: 'inside',
    withoutEnlargement: true,
  });

  // Convertir a escala de grises para mejor OCR
  pipeline = pipeline.grayscale();

  // Mejorar contraste para tickets térmicos
  if (opts.enhanceContrast) {
    pipeline = pipeline.normalize().sharpen();
  }

  // Convertir a JPEG con buena calidad
  pipeline = pipeline.jpeg({ quality: 90 });

  return pipeline.toBuffer();
}

/**
 * Valida que el buffer sea una imagen válida
 */
export async function validateImage(
  imageBuffer: Buffer
): Promise<{ valid: boolean; format?: string; width?: number; height?: number; error?: string }> {
  try {
    const metadata = await sharp(imageBuffer).metadata();
    
    const allowedFormats = ['jpeg', 'jpg', 'png', 'webp', 'heif', 'heic'];
    
    if (!metadata.format || !allowedFormats.includes(metadata.format)) {
      return { valid: false, error: `Formato no soportado: ${metadata.format}` };
    }

    return {
      valid: true,
      format: metadata.format,
      width: metadata.width,
      height: metadata.height,
    };
  } catch (error) {
    return { valid: false, error: 'No se pudo leer la imagen' };
  }
}

/**
 * Obtiene las dimensiones de una imagen
 */
export async function getImageDimensions(
  imageBuffer: Buffer
): Promise<{ width: number; height: number }> {
  const metadata = await sharp(imageBuffer).metadata();
  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
  };
}