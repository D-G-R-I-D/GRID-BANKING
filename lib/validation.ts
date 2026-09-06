import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().trim().min(1, "Enter your name").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z
    .string()
    .min(10, "Use at least 10 characters")
    .max(200, "That's too long"),
});
export type SignUpInput = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});
export type SignInInput = z.infer<typeof signInSchema>;

export const transferSchema = z.object({
  fromAccountId: z.string().min(1, "Choose an account"),
  toAccountId: z.string().min(1, "Choose an account"),
  amount: z.string().min(1, "Enter an amount"),
  note: z.string().trim().max(140).optional(),
  idempotencyKey: z.string().uuid(),
});
export type TransferInput = z.infer<typeof transferSchema>;
