// src/validators/ocrValidators.ts

import { z } from 'zod';

// Tamaño máximo: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Formatos permitidos
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
];

export const uploadTicketSchema = z.object({
  file: z
    .any()
    .refine((file) => file !== undefined, 'La imagen es requerida')
    .refine(
      (file) => file?.size <= MAX_FILE_SIZE,
      'La imagen no debe superar 5MB'
    )
    .refine(
      (file) => ALLOWED_MIME_TYPES.includes(file?.mimetype),
      'Formato no soportado. Usa JPG, PNG o WEBP'
    ),
});

export type UploadTicketInput = z.infer<typeof uploadTicketSchema>;