// src/schemas/product.schema.ts

import { z } from "zod";

export const createProductSchema = z.object({
  name: z
    .string({
      required_error: "El nombre es requerido",
    })
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(255, "El nombre no puede exceder 255 caracteres")
    .trim(),

  category: z
    .string({
      required_error: "La categoría es requerida",
    })
    .min(1, "La categoría es requerida")
    .max(255, "La categoría no puede exceder 255 caracteres")
    .trim(),

  brand: z
    .string()
    .max(255, "La marca no puede exceder 255 caracteres")
    .trim()
    .optional()
    .default(""),
});

export const updateProductSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(255, "El nombre no puede exceder 255 caracteres")
    .trim()
    .optional(),

  category: z
    .string()
    .min(1, "La categoría es requerida")
    .max(255, "La categoría no puede exceder 255 caracteres")
    .trim()
    .optional(),

  brand: z
    .string()
    .max(255, "La marca no puede exceder 255 caracteres")
    .trim()
    .optional(),
});

export const productQuerySchema = z.object({
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

  category: z.string().trim().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;