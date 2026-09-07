"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser, grantStepUp, hasStepUp } from "@/lib/session";
import { verifyUserPassword } from "@/lib/services/auth-service";
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
  /** Set on success — the client redirects to /transfer/receipt/[id]. */
  transferId?: string;
}

function bumpPaths() {
  revalidatePath("/dashboard");
  revalidatePath("/transfer");
  revalidatePath("/activity");
}

/**
 * Step-up gate. Returns null when the sensitive action may proceed, or a
 * TransferState describing why not (missing / wrong password).
 */
async function requireStepUp(
  userId: string,
  password: string | undefined,
): Promise<TransferState | null> {
  if (await hasStepUp()) return null;
  if (!password) {
    return { fieldErrors: { password: "Confirm with your password" } };
  }
  const ok = await verifyUserPassword(userId, password);
  if (!ok) return { fieldErrors: { password: "Password is incorrect" } };
  await grantStepUp();
  return null;
}

export async function internalTransferAction(
  _prev: TransferState,
  formData: FormData,
): Promise<TransferState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in again" };

  const parsed = internalTransferSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: firstFieldErrors(parsed.error) };

  const gate = await requireStepUp(user.id, parsed.data.password);
  if (gate) return gate;

  const result = await submitInternalTransfer(user.id, parsed.data);
  if (!result.ok) return { error: result.error };

  bumpPaths();
  return { transferId: result.transferId };
}

export async function externalTransferAction(
  _prev: TransferState,
  formData: FormData,
): Promise<TransferState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in again" };

  const parsed = externalTransferSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: firstFieldErrors(parsed.error) };

  const gate = await requireStepUp(user.id, parsed.data.password);
  if (gate) return gate;

  const result = await submitExternalTransfer(user.id, parsed.data);
  if (!result.ok) return { error: result.error };

  bumpPaths();
  return { transferId: result.transferId };
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
