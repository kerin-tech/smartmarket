// src/lib/validations/purchase.schema.ts

import { z } from 'zod';

// Schema para un item de compra
export const purchaseItemSchema = z.object({
  productId: z
    .string({
      required_error: 'El producto es requerido',
    })
    .min(1, 'El producto es requerido'),

  quantity: z
    .number({
      required_error: 'La cantidad es requerida',
      invalid_type_error: 'La cantidad debe ser un número',
    })
    .positive('La cantidad debe ser mayor a 0'),

  unitPrice: z
    .number({
      required_error: 'El precio es requerido',
      invalid_type_error: 'El precio debe ser un número',
    })
    .positive('El precio debe ser mayor a 0'),
});

// Schema para crear/editar una compra
export const purchaseSchema = z.object({
  storeId: z
    .string({
      required_error: 'El local es requerido',
    })
    .min(1, 'El local es requerido'),

  date: z
    .string({
      required_error: 'La fecha es requerida',
    })
    .min(1, 'La fecha es requerida'),

  items: z
    .array(purchaseItemSchema)
    .min(1, 'Debe agregar al menos un producto'),
});

export type PurchaseFormValues = z.infer<typeof purchaseSchema>;
export type PurchaseItemFormValues = z.infer<typeof purchaseItemSchema>;