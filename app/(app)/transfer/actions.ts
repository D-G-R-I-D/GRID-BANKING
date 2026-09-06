"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/session";
import { transferSchema } from "@/lib/validation";
import { parseAmountToMinor } from "@/lib/money";
import { createTransfer } from "@/lib/transfers";
import { firstFieldErrors } from "@/lib/form";

export interface TransferState {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: string;
}

export async function transferAction(
  _prev: TransferState,
  formData: FormData,
): Promise<TransferState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in again" };

  const parsed = transferSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: firstFieldErrors(parsed.error) };
  }

  const { fromAccountId, toAccountId, amount, note, idempotencyKey } =
    parsed.data;

  const amountMinor = parseAmountToMinor(amount);
  if (amountMinor === null) {
    return { fieldErrors: { amount: "Enter a valid amount, e.g. 25.00" } };
  }

  const result = await createTransfer({
    userId: user.id,
    fromAccountId,
    toAccountId,
    amountMinor,
    note,
    idempotencyKey,
  });

  if (!result.ok) return { error: result.error };

  revalidatePath("/dashboard");
  revalidatePath("/transfer");
  return { success: "Transfer complete." };
}
