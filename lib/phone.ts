/**
 * Nigerian phone handling. The account number is the last 10 digits of the
 * phone (the local number without its leading 0) — the same scheme neobanks
 * like Kuda and OPay use, and it's unique because the phone is unique.
 */

/** Normalise common Nigerian formats to `+234XXXXXXXXXX`, or null if invalid. */
export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");

  let local: string;
  if (digits.length === 11 && digits.startsWith("0")) {
    local = digits.slice(1); // 0803… -> 803…
  } else if (digits.length === 13 && digits.startsWith("234")) {
    local = digits.slice(3);
  } else if (digits.length === 10) {
    local = digits;
  } else {
    return null;
  }

  if (!/^[789]\d{9}$/.test(local)) return null; // NG mobile prefixes
  return `+234${local}`;
}

/** The 10-digit account number derived from a normalised phone. */
export function accountNumberFromPhone(normalized: string): string {
  return normalized.slice(-10);
}

/** "•••• •• 4567" — show only the last four. */
export function maskAccountNumber(accountNumber: string): string {
  return `•••• •• ${accountNumber.slice(-4)}`;
}
