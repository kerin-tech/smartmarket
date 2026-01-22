// src/lib/validations/product.schema.ts

import { z } from 'zod';

export const productSchema = z.object({
  name: z
    .string({
      required_error: 'El nombre es requerido',
    })
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(255, 'El nombre no puede exceder 255 caracteres')
    .trim(),

  category: z
    .string({
      required_error: 'La categoría es requerida',
    })
    .min(1, 'La categoría es requerida'),

  brand: z
    .string()
    .max(255, 'La marca no puede exceder 255 caracteres')
    .trim()
    .optional()
    .default(''),
});

export type ProductFormValues = z.infer<typeof productSchema>;

// Opciones de categorías para el select
export const categoryOptions = [
  { value: 'Frutas', label: 'Frutas', emoji: '🍎' },
  { value: 'Verduras', label: 'Verduras', emoji: '🥬' },
  { value: 'Granos', label: 'Granos', emoji: '🍚' },
  { value: 'Lácteos', label: 'Lácteos', emoji: '🥛' },
  { value: 'Carnes', label: 'Carnes', emoji: '🥩' },
  { value: 'Bebidas', label: 'Bebidas', emoji: '🥤' },
  { value: 'Limpieza', label: 'Limpieza', emoji: '🧹' },
  { value: 'Otros', label: 'Otros', emoji: '📦' },
];