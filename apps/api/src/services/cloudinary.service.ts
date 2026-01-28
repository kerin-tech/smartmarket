// src/services/cloudinary.service.ts

import { v2 as cloudinary } from 'cloudinary';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}

/**
 * Sube una imagen a Cloudinary
 */
export async function uploadImage(
  imageBuffer: Buffer,
  folder: string = 'tickets'
): Promise<UploadResult> {
  try {
    // Convertir buffer a base64 data URI
    const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

    const result = await cloudinary.uploader.upload(base64Image, {
      folder: `smartmarket/${folder}`,
      resource_type: 'image',
      transformation: [
        { quality: 'auto:good' },  // Optimizar calidad
        { fetch_format: 'auto' },   // Formato óptimo (webp si el navegador soporta)
      ],
    });

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    console.error('❌ Error subiendo imagen a Cloudinary:', message);
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Elimina una imagen de Cloudinary
 */
export async function deleteImage(publicId: string): Promise<boolean> {
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error('❌ Error eliminando imagen:', error);
    return false;
  }
}

/**
 * Genera una URL optimizada para una imagen
 */
export function getOptimizedUrl(publicId: string, options?: {
  width?: number;
  height?: number;
  quality?: string;
}): string {
  return cloudinary.url(publicId, {
    secure: true,
    transformation: [
      { width: options?.width, height: options?.height, crop: 'limit' },
      { quality: options?.quality || 'auto:good' },
      { fetch_format: 'auto' },
    ],
  });
}

/**
 * Verifica la conexión con Cloudinary
 */
export async function testConnection(): Promise<boolean> {
  try {
    await cloudinary.api.ping();
    return true;
  } catch {
    return false;
  }
}