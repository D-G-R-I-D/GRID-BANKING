"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/session";
import {
  lookupRecipient,
  submitExternalTransfer,
  submitInternalTransfer,
} from "@/lib/services/transfer-service";
import {
  externalTransferSchema,
  internalTransferSchema,
  recipientLookupSchema,
} from "@/lib/validation";
import { firstFieldErrors } from "@/lib/form";
import type { RecipientView } from "@/lib/view";

export interface TransferState {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: string;
}

function bumpPaths() {
  revalidatePath("/dashboard");
  revalidatePath("/transfer");
  revalidatePath("/activity");
}

export async function internalTransferAction(
  _prev: TransferState,
  formData: FormData,
): Promise<TransferState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in again" };

  const parsed = internalTransferSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: firstFieldErrors(parsed.error) };

  const result = await submitInternalTransfer(user.id, parsed.data);
  if (!result.ok) return { error: result.error };

  bumpPaths();
  return { success: "Moved between your accounts." };
}

export async function externalTransferAction(
  _prev: TransferState,
  formData: FormData,
): Promise<TransferState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in again" };

  const parsed = externalTransferSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: firstFieldErrors(parsed.error) };

  const result = await submitExternalTransfer(user.id, parsed.data);
  if (!result.ok) return { error: result.error };

  bumpPaths();
  return { success: "Sent." };
}

export async function lookupRecipientAction(
  accountNumber: string,
): Promise<RecipientView | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const parsed = recipientLookupSchema.safeParse({ accountNumber });
  if (!parsed.success) return null;

  return lookupRecipient(user.id, parsed.data.accountNumber);
}
