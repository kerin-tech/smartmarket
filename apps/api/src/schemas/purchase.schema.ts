// src/schemas/purchase.schema.ts
import { z } from "zod";

// Schema para un item de compra (ACTUALIZADO)
const purchaseItemSchema = z.object({
  productId: z
    .string({
      required_error: "El producto es requerido",
    })
    .uuid("ID de producto inválido"),

  quantity: z
    .number({
      required_error: "La cantidad es requerida",
      invalid_type_error: "La cantidad debe ser un número",
    })
    .positive("La cantidad debe ser mayor a 0")
    .max(999999.999, "La cantidad excede el límite permitido"),

  unitPrice: z
    .number({
      required_error: "El precio es requerido",
      invalid_type_error: "El precio debe ser un número",
    })
    .positive("El precio debe ser mayor a 0")
    .max(99999999.99, "El precio excede el límite permitido"),

  // NUEVO CAMPO PARA DESCUENTO
  discountPercentage: z
    .number({
      invalid_type_error: "El descuento debe ser un número",
    })
    .min(0, "El descuento no puede ser negativo")
    .max(100, "El descuento no puede ser mayor al 100%")
    .default(0)
    .optional(),
});

// El resto de los esquemas (createPurchaseSchema, updatePurchaseSchema, etc.) se mantienen igual
export const createPurchaseSchema = z.object({
  storeId: z.string().uuid(),
  date: z.string().refine((val) => !isNaN(Date.parse(val))),
  items: z.array(purchaseItemSchema).min(1).max(100),
});

export const updatePurchaseSchema = z.object({
  storeId: z.string().uuid().optional(),
  date: z.string().refine((val) => !isNaN(Date.parse(val))).optional(),
  items: z.array(purchaseItemSchema).min(1).max(100).optional(),
});

export const purchaseQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)).pipe(z.number().min(1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 20)).pipe(z.number().min(1).max(100)),
  month: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  storeId: z.string().uuid().optional(),
  search: z.string().max(100).optional(),
});

export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>;
export type UpdatePurchaseInput = z.infer<typeof updatePurchaseSchema>;
export type PurchaseQueryInput = z.infer<typeof purchaseQuerySchema>;
export type PurchaseItemInput = z.infer<typeof purchaseItemSchema>;