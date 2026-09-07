"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/session";
import { submitTransfer } from "@/lib/services/transfer-service";
import { transferSchema } from "@/lib/validation";
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

  const result = await submitTransfer(user.id, parsed.data);
  if (!result.ok) return { error: result.error };

  revalidatePath("/dashboard");
  revalidatePath("/transfer");
  revalidatePath("/activity");
  return { success: "Transfer complete." };
}
