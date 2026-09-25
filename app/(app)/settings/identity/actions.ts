"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/session";
import { verifyTransactionPin } from "@/lib/services/pin-service";
import { saveIdentity } from "@/lib/services/identity-service";
import { identitySchema } from "@/lib/validation";
import { firstFieldErrors, type FormState } from "@/lib/form";

export interface IdentityState extends FormState {
  done?: boolean;
}

export async function saveIdentityAction(
  _prev: IdentityState,
  formData: FormData,
): Promise<IdentityState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in again" };

  const parsed = identitySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: firstFieldErrors(parsed.error) };

  const pin = await verifyTransactionPin(user.id, parsed.data.pin);
  if (!pin.ok) return { fieldErrors: { pin: pin.error } };

  const result = await saveIdentity(user.id, parsed.data);
  if (!result.ok) {
    return result.field
      ? { fieldErrors: { [result.field]: result.error } }
      : { error: result.error };
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  revalidatePath("/loans");
  return { done: true };
}
