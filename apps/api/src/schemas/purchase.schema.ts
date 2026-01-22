// src/schemas/purchase.schema.ts

import { z } from "zod";

export const createPurchaseSchema = z.object({
  productId: z
    .string({
      required_error: "El producto es requerido",
    })
    .uuid("ID de producto inválido"),

  storeId: z
    .string({
      required_error: "El local es requerido",
    })
    .uuid("ID de local inválido"),

  price: z
    .number({
      required_error: "El precio es requerido",
      invalid_type_error: "El precio debe ser un número",
    })
    .positive("El precio debe ser mayor a 0")
    .max(999999999.99, "El precio excede el límite permitido"),

  quantity: z
    .number({
      required_error: "La cantidad es requerida",
      invalid_type_error: "La cantidad debe ser un número",
    })
    .positive("La cantidad debe ser mayor a 0")
    .max(999999999.99, "La cantidad excede el límite permitido"),

  date: z
    .string({
      required_error: "La fecha es requerida",
    })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Fecha inválida",
    }),
});

export const updatePurchaseSchema = z.object({
  productId: z
    .string()
    .uuid("ID de producto inválido")
    .optional(),

  storeId: z
    .string()
    .uuid("ID de local inválido")
    .optional(),

  price: z
    .number()
    .positive("El precio debe ser mayor a 0")
    .max(999999999.99, "El precio excede el límite permitido")
    .optional(),

  quantity: z
    .number()
    .positive("La cantidad debe ser mayor a 0")
    .max(999999999.99, "La cantidad excede el límite permitido")
    .optional(),

  date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Fecha inválida",
    })
    .optional(),
});

export const purchaseQuerySchema = z.object({
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

  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/, "Formato de mes inválido (YYYY-MM)")
    .optional(),

  productId: z
    .string()
    .uuid("ID de producto inválido")
    .optional(),

  storeId: z
    .string()
    .uuid("ID de local inválido")
    .optional(),

  dateFrom: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Fecha desde inválida",
    })
    .optional(),

  dateTo: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Fecha hasta inválida",
    })
    .optional(),
});

export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>;
export type UpdatePurchaseInput = z.infer<typeof updatePurchaseSchema>;
export type PurchaseQueryInput = z.infer<typeof purchaseQuerySchema>;