"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/session";
import { verifyTransactionPin } from "@/lib/services/pin-service";
import { applyForLoan, repayLoan } from "@/lib/services/loan-service";
import { loanApplicationSchema, loanRepaymentSchema } from "@/lib/validation";
import { firstFieldErrors } from "@/lib/form";

export interface LoanState {
  error?: string;
  fieldErrors?: Record<string, string>;
  /** Set on success. */
  loanId?: string;
}

function bumpPaths() {
  revalidatePath("/loans");
  revalidatePath("/dashboard");
  revalidatePath("/activity");
  revalidatePath("/transfer");
}

export async function applyForLoanAction(
  _prev: LoanState,
  formData: FormData,
): Promise<LoanState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in again" };

  const parsed = loanApplicationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: firstFieldErrors(parsed.error) };

  const pin = await verifyTransactionPin(user.id, parsed.data.pin);
  if (!pin.ok) return { fieldErrors: { pin: pin.error } };

  const result = await applyForLoan(user.id, parsed.data);
  if (!result.ok) return { error: result.error };

  bumpPaths();
  return { loanId: result.loanId };
}

export async function repayLoanAction(
  _prev: LoanState,
  formData: FormData,
): Promise<LoanState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in again" };

  const parsed = loanRepaymentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: firstFieldErrors(parsed.error) };

  const pin = await verifyTransactionPin(user.id, parsed.data.pin);
  if (!pin.ok) return { fieldErrors: { pin: pin.error } };

  const result = await repayLoan(user.id, parsed.data);
  if (!result.ok) return { error: result.error };

  bumpPaths();
  return { loanId: result.loanId };
}
