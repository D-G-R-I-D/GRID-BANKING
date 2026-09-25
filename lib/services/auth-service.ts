import "server-only";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { parseLoginIdentifier } from "@/lib/login";
import { accountNumberFromPhone, normalizePhone } from "@/lib/phone";
import { createStarterAccounts } from "@/lib/data/accounts";
import {
  createUser,
  findUserById,
  findUserByAccountNumber,
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

/**
 * Sign in with an email or an account number (lib/login.ts). Returns the user
 * id on success, null otherwise (generic — no enumeration).
 */
export async function authenticate(
  identifier: string,
  password: string,
): Promise<string | null> {
  const id = parseLoginIdentifier(identifier);
  const user = !id
    ? null
    : id.kind === "email"
      ? await findUserByEmail(id.email)
      : await findUserByAccountNumber(id.accountNumber);
  const ok = user ? await verifyPassword(password, user.passwordHash) : false;
  return user && ok ? user.id : null;
}

/** Step-up check: does this password match the signed-in user's? */
export async function verifyUserPassword(
  userId: string,
  password: string,
): Promise<boolean> {
  const user = await findUserById(userId);
  return user ? verifyPassword(password, user.passwordHash) : false;
}
