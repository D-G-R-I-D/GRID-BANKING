"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { startSession } from "@/lib/session";
import { provisionStarterAccounts } from "@/lib/accounts";
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

  const { name, email, password } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    // Don't confirm or deny which emails exist beyond this generic message.
    return { error: "We couldn't create that account. Try signing in." };
  }

  const user = await db.user.create({
    data: { name, email, passwordHash: await hashPassword(password) },
  });
  await provisionStarterAccounts(user.id);
  await startSession(user.id);

  redirect("/dashboard");
}
