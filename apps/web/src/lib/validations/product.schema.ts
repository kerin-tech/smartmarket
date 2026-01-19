// src/lib/validations/product.schema.ts

import { z } from 'zod';

export const categoryOptions = [
  { value: 'fruits', label: 'Frutas', emoji: '🍎' },
  { value: 'vegetables', label: 'Verduras', emoji: '🥬' },
  { value: 'grains', label: 'Granos', emoji: '🍚' },
  { value: 'dairy', label: 'Lácteos', emoji: '🥛' },
  { value: 'meats', label: 'Carnes', emoji: '🥩' },
  { value: 'beverages', label: 'Bebidas', emoji: '🥤' },
  { value: 'cleaning', label: 'Limpieza', emoji: '🧹' },
  { value: 'other', label: 'Otros', emoji: '📦' },
] as const;

export const unitOptions = [
  { value: 'kg', label: 'kg' },
  { value: 'gr', label: 'gr' },
  { value: 'lt', label: 'lt' },
  { value: 'ml', label: 'ml' },
  { value: 'unidad', label: 'unidad' },
] as const;

export const productSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  category: z.enum(
    ['fruits', 'vegetables', 'grains', 'dairy', 'meats', 'beverages', 'cleaning', 'other'],
    { required_error: 'Selecciona una categoría' }
  ),
  unit: z.enum(
    ['kg', 'gr', 'lt', 'ml', 'unidad'],
    { required_error: 'Selecciona una unidad de medida' }
  ),
});

export type ProductFormValues = z.infer<typeof productSchema>;
