"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { setInitialPin } from "@/lib/services/pin-service";
import { setPinSchema } from "@/lib/validation";
import { firstFieldErrors, type FormState } from "@/lib/form";

export async function setPinAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in again" };

  const parsed = setPinSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: firstFieldErrors(parsed.error) };

  const result = await setInitialPin(user.id, parsed.data.pin);
  if (!result.ok) return { error: result.error };

  redirect("/dashboard");
}
