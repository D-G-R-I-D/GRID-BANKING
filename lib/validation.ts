import { z } from "zod";
import { normalizePhone } from "./phone";

export const signUpSchema = z.object({
  name: z.string().trim().min(1, "Enter your name").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  phone: z
    .string()
    .trim()
    .refine((v) => normalizePhone(v) !== null, "Enter a valid Nigerian number"),
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

export const internalTransferSchema = z.object({
  fromAccountId: z.string().min(1, "Choose an account"),
  toAccountId: z.string().min(1, "Choose an account"),
  amount: z.string().min(1, "Enter an amount"),
  note: z.string().trim().max(140).optional(),
  idempotencyKey: z.string().uuid(),
});
export type InternalTransferInput = z.infer<typeof internalTransferSchema>;

const accountNumber = z
  .string()
  .trim()
  .regex(/^\d{10}$/, "Enter a 10-digit account number");

export const externalTransferSchema = z.object({
  recipientAccountNumber: accountNumber,
  amount: z.string().min(1, "Enter an amount"),
  note: z.string().trim().max(140).optional(),
  idempotencyKey: z.string().uuid(),
});
export type ExternalTransferInput = z.infer<typeof externalTransferSchema>;

export const recipientLookupSchema = z.object({ accountNumber });
