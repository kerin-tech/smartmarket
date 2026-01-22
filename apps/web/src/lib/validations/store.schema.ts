// src/lib/validations/store.schema.ts

import { z } from 'zod';

export const storeSchema = z.object({
  name: z
    .string({
      required_error: 'El nombre es requerido',
    })
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(255, 'El nombre no puede exceder 255 caracteres')
    .trim(),

  location: z
    .string()
    .max(255, 'La ubicación no puede exceder 255 caracteres')
    .trim()
    .optional()
    .default(''),
});

export type StoreFormValues = z.infer<typeof storeSchema>;