import { z } from "zod";
import { normalizePhone } from "./phone";
import { isPinFormat, isWeakPin } from "./pin";
import { LOAN_TERMS } from "./loan";

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

// --- Transaction PIN -------------------------------------------------------

/** The PIN typed to authorise one action. The service checks it's right. */
const pin = z.string().regex(/^\d{4,6}$/, "Enter your PIN");

const newPin = z
  .string()
  .refine(isPinFormat, "Use exactly 4 or 6 digits")
  .refine((v) => !isWeakPin(v), "Too easy to guess — avoid 1234 or 0000");

const newPinPair = z.object({ pin: newPin, confirmPin: z.string() });
const pinsMatch = (v: { pin: string; confirmPin: string }) =>
  v.pin === v.confirmPin;
const pinsMatchIssue = { message: "PINs don't match", path: ["confirmPin"] };

export const setPinSchema = newPinPair.refine(pinsMatch, pinsMatchIssue);
export type SetPinInput = z.infer<typeof setPinSchema>;

// Resetting the PIN needs the sign-in password, so it also works when the
// PIN has been forgotten.
export const changePinSchema = newPinPair
  .extend({ password: z.string().min(1, "Enter your password") })
  .refine(pinsMatch, pinsMatchIssue);
export type ChangePinInput = z.infer<typeof changePinSchema>;

// --- Transfers ---------------------------------------------------------------

export const internalTransferSchema = z.object({
  fromAccountId: z.string().min(1, "Choose an account"),
  toAccountId: z.string().min(1, "Choose an account"),
  amount: z.string().min(1, "Enter an amount"),
  note: z.string().trim().max(140).optional(),
  idempotencyKey: z.string().uuid(),
  pin,
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
  pin,
});
export type ExternalTransferInput = z.infer<typeof externalTransferSchema>;

export const recipientLookupSchema = z.object({ accountNumber });

// --- Loans -------------------------------------------------------------------

export const loanApplicationSchema = z.object({
  amount: z.string().min(1, "Enter an amount"),
  termMonths: z.coerce
    .number()
    .refine(
      (n) => (LOAN_TERMS as readonly number[]).includes(n),
      "Choose a term",
    ),
  plan: z.enum(["INSTALLMENTS", "SINGLE"], {
    errorMap: () => ({ message: "Choose how to repay" }),
  }),
  idempotencyKey: z.string().uuid(),
  pin,
});
export type LoanApplicationInput = z.infer<typeof loanApplicationSchema>;

export const loanRepaymentSchema = z.object({
  loanId: z.string().min(1),
  amount: z.string().min(1, "Enter an amount"),
  idempotencyKey: z.string().uuid(),
  pin,
});
export type LoanRepaymentInput = z.infer<typeof loanRepaymentSchema>;
