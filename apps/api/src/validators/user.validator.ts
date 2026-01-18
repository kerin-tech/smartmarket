import { z } from 'zod';

export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  phone: z.string().optional(),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;
