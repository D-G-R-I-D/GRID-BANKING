"use server";

import { redirect } from "next/navigation";
import { startSession } from "@/lib/session";
import { authenticate } from "@/lib/services/auth-service";
import { signInSchema } from "@/lib/validation";
import { firstFieldErrors, type FormState } from "@/lib/form";

export async function signInAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = signInSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: firstFieldErrors(parsed.error) };
  }

  const userId = await authenticate(parsed.data.email, parsed.data.password);
  if (!userId) return { error: "Email or password is incorrect" };

  await startSession(userId);
  redirect("/dashboard");
}
