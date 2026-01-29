import { z } from "zod";

// 1. Schema para un item de compra (Reutilizado para creación y escaneo)
export const purchaseItemSchema = z.object({
  productId: z
    .string({ required_error: "El producto es requerido" })
    .uuid("ID de producto inválido"),
  quantity: z
    .number({ required_error: "La cantidad es requerida" })
    .positive("La cantidad debe ser mayor a 0"),
  unitPrice: z
    .number({ required_error: "El precio es requerido" })
    .positive("El precio debe ser mayor a 0"),
  discountPercentage: z
    .number()
    .min(0)
    .max(100)
    .default(0)
    .optional(),
});

// 2. Esquemas de Compra Estándar (Los que ya tenías)
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

// 3. NUEVO: Esquema para recibir la imagen del Frontend
export const scanTicketSchema = z.object({
  image: z.string({ required_error: "La imagen en Base64 es requerida" }).min(10),
});

// 4. NUEVO: Esquema de lo que la IA nos devuelve (Nombres en lugar de IDs)
export const extractedDataSchema = z.object({
  storeName: z.string().nullable(),
  date: z.string().nullable(),
  items: z.array(z.object({
    productName: z.string(),
    quantity: z.number().default(1),
    unitPrice: z.number(),
    discountPercentage: z.number().default(0),
    category: z.string().optional(),
  })),
  total: z.number().nullable(),
});

// --- EXPORTACIÓN DE TIPOS ---
export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>;
export type UpdatePurchaseInput = z.infer<typeof updatePurchaseSchema>;
export type ScanTicketInput = z.infer<typeof scanTicketSchema>;
export type ExtractedTicketData = z.infer<typeof extractedDataSchema>;
export type PurchaseItemInput = z.infer<typeof purchaseItemSchema>;

export const purchaseQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)).pipe(z.number().min(1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 20)).pipe(z.number().min(1).max(100)),
  month: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  storeId: z.string().uuid().optional(),
  search: z.string().max(100).optional(),
});
export type PurchaseQueryInput = z.infer<typeof purchaseQuerySchema>;