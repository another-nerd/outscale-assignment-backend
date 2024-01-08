import { z } from "zod";

export const signupInputSchema = z.object({
  name: z.string().min(3).max(255).optional(),
  email: z.string().email(),
  password: z.string().min(8).max(255),
});

export const loginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(255),
});
