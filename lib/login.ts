import { accountNumberFromPhone, normalizePhone } from "./phone";

/**
 * What someone typed in the sign-in box: an email, or their account number.
 * The account number is the phone number without its leading 0, so a full
 * phone number (0803…, +234…) resolves to the same account.
 */
export type LoginIdentifier =
  { kind: "email"; email: string } | { kind: "account"; accountNumber: string };

export function parseLoginIdentifier(raw: string): LoginIdentifier | null {
  const value = raw.trim();
  if (value.includes("@")) return { kind: "email", email: value.toLowerCase() };

  const phone = normalizePhone(value);
  return phone
    ? { kind: "account", accountNumber: accountNumberFromPhone(phone) }
    : null;
}
