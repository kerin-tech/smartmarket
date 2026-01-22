// src/schemas/store.schema.ts

import { z } from "zod";

export const createStoreSchema = z.object({
  name: z
    .string({
      required_error: "El nombre es requerido",
    })
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(255, "El nombre no puede exceder 255 caracteres")
    .trim(),

  location: z
    .string()
    .max(255, "La ubicación no puede exceder 255 caracteres")
    .trim()
    .optional()
    .default(""),
});

export const updateStoreSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(255, "El nombre no puede exceder 255 caracteres")
    .trim()
    .optional(),

  location: z
    .string()
    .max(255, "La ubicación no puede exceder 255 caracteres")
    .trim()
    .optional(),
});

export const storeQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().min(1, "La página debe ser mayor a 0")),

  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .pipe(z.number().min(1).max(100, "El límite máximo es 100")),

  search: z.string().trim().optional(),
});

export type CreateStoreInput = z.infer<typeof createStoreSchema>;
export type UpdateStoreInput = z.infer<typeof updateStoreSchema>;
export type StoreQueryInput = z.infer<typeof storeQuerySchema>;