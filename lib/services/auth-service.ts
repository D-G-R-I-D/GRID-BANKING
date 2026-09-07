import "server-only";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { accountNumberFromPhone, normalizePhone } from "@/lib/phone";
import { createStarterAccounts } from "@/lib/data/accounts";
import {
  createUser,
  findUserByEmail,
  findUserByEmailOrPhone,
} from "@/lib/data/users";
import type { SignUpInput } from "@/lib/validation";

type RegisterResult =
  { ok: true; userId: string } | { ok: false; error: string };

/** Create a user, derive their account number from their phone, open accounts. */
export async function register(input: SignUpInput): Promise<RegisterResult> {
  const phone = normalizePhone(input.phone);
  if (!phone) return { ok: false, error: "Enter a valid Nigerian number" };

  const clash = await findUserByEmailOrPhone(input.email, phone);
  if (clash) {
    return {
      ok: false,
      error: "We couldn't create that account. Try signing in.",
    };
  }

  const user = await createUser({
    name: input.name,
    email: input.email,
    phone,
    accountNumber: accountNumberFromPhone(phone),
    passwordHash: await hashPassword(input.password),
  });
  await createStarterAccounts(user.id);

  return { ok: true, userId: user.id };
}

/** Returns the user id on success, null otherwise (generic — no enumeration). */
export async function authenticate(
  email: string,
  password: string,
): Promise<string | null> {
  const user = await findUserByEmail(email);
  const ok = user ? await verifyPassword(password, user.passwordHash) : false;
  return user && ok ? user.id : null;
}
