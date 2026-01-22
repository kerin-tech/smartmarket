import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string({
      required_error: "El nombre es requerido",
    })
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres")
    .trim(),

  email: z
    .string({
      required_error: "El correo electrónico es requerido",
    })
    .email("El correo electrónico no es válido")
    .toLowerCase()
    .trim(),

  password: z
    .string({
      required_error: "La contraseña es requerida",
    })
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(100, "La contraseña no puede exceder 100 caracteres"),
});

export type RegisterInput = z.infer<typeof registerSchema>;