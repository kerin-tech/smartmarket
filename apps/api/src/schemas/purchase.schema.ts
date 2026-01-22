// src/schemas/purchase.schema.ts

import { z } from "zod";

// Schema para un item de compra
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
});

// Schema para crear una compra
export const createPurchaseSchema = z.object({
  storeId: z
    .string({
      required_error: "El local es requerido",
    })
    .uuid("ID de local inválido"),

  date: z
    .string({
      required_error: "La fecha es requerida",
    })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Fecha inválida",
    }),

  items: z
    .array(purchaseItemSchema, {
      required_error: "Debe agregar al menos un producto",
    })
    .min(1, "Debe agregar al menos un producto")
    .max(100, "Máximo 100 productos por compra"),
});

// Schema para actualizar una compra
export const updatePurchaseSchema = z.object({
  storeId: z
    .string()
    .uuid("ID de local inválido")
    .optional(),

  date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Fecha inválida",
    })
    .optional(),

  items: z
    .array(purchaseItemSchema)
    .min(1, "Debe agregar al menos un producto")
    .max(100, "Máximo 100 productos por compra")
    .optional(),
});

// Schema para query params
export const purchaseQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().min(1, "La página debe ser mayor a 0")),

  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .pipe(z.number().min(1).max(100, "El límite máximo es 100")),

  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/, "Formato de mes inválido (YYYY-MM)")
    .optional(),

  storeId: z
    .string()
    .uuid("ID de local inválido")
    .optional(),

  search: z
    .string()
    .max(100, "Búsqueda muy larga")
    .optional(),
});

// Types inferidos
export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>;
export type UpdatePurchaseInput = z.infer<typeof updatePurchaseSchema>;
export type PurchaseQueryInput = z.infer<typeof purchaseQuerySchema>;
export type PurchaseItemInput = z.infer<typeof purchaseItemSchema>;