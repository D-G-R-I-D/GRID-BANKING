"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/auth";
import { startSession } from "@/lib/session";
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

  const { email, password } = parsed.data;
  const user = await db.user.findUnique({ where: { email } });

  // Same generic message and similar timing whether or not the user exists.
  const ok = user ? await verifyPassword(password, user.passwordHash) : false;
  if (!user || !ok) {
    return { error: "Email or password is incorrect" };
  }

  await startSession(user.id);
  redirect("/dashboard");
}
