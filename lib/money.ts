/**
 * Money is always integer minor units (kobo for NGN). Never a float.
 * These helpers are the only place we convert to/from a display string.
 */

export const DEFAULT_CURRENCY = "NGN";

export function formatMoney(
  minorUnits: number,
  currency = DEFAULT_CURRENCY,
): string {
  if (!Number.isInteger(minorUnits)) {
    throw new Error(
      `formatMoney expects integer minor units, got ${minorUnits}`,
    );
  }
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
  }).format(minorUnits / 100);
}

/**
 * Parse user input like "1,234.5" or "₦12" into integer minor units.
 * Returns null for anything that isn't a valid non-negative amount.
 */
export function parseAmountToMinor(input: string): number | null {
  const cleaned = input.replace(/[\s,₦$]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  const [whole, frac = ""] = cleaned.split(".");
  const minor = Number(whole) * 100 + Number(frac.padEnd(2, "0"));
  return Number.isSafeInteger(minor) ? minor : null;
}

/** Mask an account id for display: "•••• 3f9a". */
export function maskAccount(id: string): string {
  return `•••• ${id.slice(-4)}`;
}
