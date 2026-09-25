/**
 * BVN & NIN rules — pure and client-safe. Both are optional. Adding both
 * unlocks the higher loan limit. Numbers are only format-checked: there is
 * no NIBSS/NIMC integration, so "added" never means "verified".
 */
import { LOAN_MAX_MINOR, LOAN_MAX_VERIFIED_MINOR } from "./loan";

export type IdentityKind = "bvn" | "nin";

export const IDENTITY_LABEL: Record<IdentityKind, string> = {
  bvn: "BVN",
  nin: "NIN",
};

/** Both BVN and NIN are exactly 11 digits. */
export function isIdentityNumber(value: string): boolean {
  return /^\d{11}$/.test(value);
}

/** "•••••••1234" — all we ever show. */
export function maskIdentity(last4: string): string {
  return `•••••••${last4}`;
}

export interface IdentityStatus {
  bvnLast4: string | null;
  ninLast4: string | null;
}

export function identityComplete(s: IdentityStatus): boolean {
  return s.bvnLast4 !== null && s.ninLast4 !== null;
}

/** The most someone can borrow, given what they've added. */
export function loanLimitFor(s: IdentityStatus): number {
  return identityComplete(s) ? LOAN_MAX_VERIFIED_MINOR : LOAN_MAX_MINOR;
}
