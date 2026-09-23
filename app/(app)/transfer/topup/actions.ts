"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/session";
import { verifyTransactionPin } from "@/lib/services/pin-service";
import { buyTopUp } from "@/lib/services/topup-service";
import { topUpSchema } from "@/lib/validation";
import { firstFieldErrors } from "@/lib/form";
import type { TransferState } from "../actions";

export async function buyTopUpAction(
  _prev: TransferState,
  formData: FormData,
): Promise<TransferState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in again" };

  const parsed = topUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: firstFieldErrors(parsed.error) };

  const pin = await verifyTransactionPin(user.id, parsed.data.pin);
  if (!pin.ok) return { fieldErrors: { pin: pin.error } };

  const result = await buyTopUp(user.id, parsed.data);
  if (!result.ok) return { error: result.error };

  revalidatePath("/dashboard");
  revalidatePath("/activity");
  revalidatePath("/transfer");
  return { transferId: result.transferId };
}
