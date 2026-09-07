"use server";

import { redirect } from "next/navigation";
import { startSession } from "@/lib/session";
import { register } from "@/lib/services/auth-service";
import { signUpSchema } from "@/lib/validation";
import { firstFieldErrors, type FormState } from "@/lib/form";

export async function signUpAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: firstFieldErrors(parsed.error) };
  }

  const result = await register(parsed.data);
  if (!result.ok) return { error: result.error };

  await startSession(result.userId);
  redirect("/dashboard");
}
