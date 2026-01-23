// src/schemas/analytics.schema.ts

import { z } from "zod";

export const monthsQuerySchema = z.object({
  months: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 6))
    .pipe(z.number().min(1).max(24)),
});

export type MonthsQuery = z.infer<typeof monthsQuerySchema>;