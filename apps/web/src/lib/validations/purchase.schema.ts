// src/lib/validations/purchase.schema.ts

import { z } from 'zod';

export const purchaseItemSchema = z.object({
  productId: z.string().min(1, 'El producto es requerido'),
  quantity: z.number().positive('La cantidad debe ser mayor a 0'),
  unitPrice: z.number().positive('El precio debe ser mayor a 0'),
});

export const purchaseSchema = z.object({
  storeId: z.string().min(1, 'El local es requerido'),
  date: z.string().min(1, 'La fecha es requerida'),
  items: z.array(purchaseItemSchema).min(1, 'Debe agregar al menos un producto'),
});

export type PurchaseFormValues = z.infer<typeof purchaseSchema>;
export type PurchaseItemFormValues = z.infer<typeof purchaseItemSchema>;