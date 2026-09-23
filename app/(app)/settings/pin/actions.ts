"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/session";
import { changePin } from "@/lib/services/pin-service";
import { changePinSchema } from "@/lib/validation";
import { firstFieldErrors, type FormState } from "@/lib/form";

export interface ChangePinState extends FormState {
  done?: boolean;
}

export async function changePinAction(
  _prev: ChangePinState,
  formData: FormData,
): Promise<ChangePinState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in again" };

  const parsed = changePinSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: firstFieldErrors(parsed.error) };

  const result = await changePin(
    user.id,
    parsed.data.password,
    parsed.data.pin,
  );
  if (!result.ok) return { fieldErrors: { password: result.error } };

  revalidatePath("/settings");
  return { done: true };
}
