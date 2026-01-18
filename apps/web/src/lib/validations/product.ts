import { z } from 'zod';

export const productSchema = z.object({
  name: z.string()
    .min(1, "El nombre es requerido")
    .max(50, "El nombre no puede exceder los 50 caracteres"),
  category: z.string().min(1, "Debes seleccionar una categoría"),
  brand: z.string().optional(),
  unit: z.string().min(1, "Debes seleccionar una unidad de medida"),
});

export type ProductFormValues = z.infer<typeof productSchema>;
