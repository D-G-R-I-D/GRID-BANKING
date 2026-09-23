/**
 * Transaction PIN policy — pure, so it's unit-testable and safe to import on
 * the client (the set-PIN form uses isWeakPin for instant feedback).
 *
 * The password signs you in; the PIN authorises each sensitive action
 * (moving money, taking or repaying a loan). A 4-digit PIN is only 10,000
 * combinations, so the real protection is the lockout, not the hash.
 */

export const PIN_LENGTHS = [4, 6] as const;
export type PinLength = (typeof PIN_LENGTHS)[number];

export const MAX_PIN_ATTEMPTS = 5;
export const PIN_LOCK_MS = 15 * 60_000;

export function isPinLength(n: number): n is PinLength {
  return (PIN_LENGTHS as readonly number[]).includes(n);
}

/** Exactly 4 or 6 digits. */
export function isPinFormat(pin: string): boolean {
  return /^(\d{4}|\d{6})$/.test(pin);
}

/**
 * Reject PINs anyone would try first: one repeated digit (0000, 111111) or a
 * straight run up or down the number line (1234, 987654).
 */
export function isWeakPin(pin: string): boolean {
  const d = [...pin].map(Number);
  if (d.every((x) => x === d[0])) return true;
  const steps = d.slice(1).map((x, i) => x - d[i]!);
  return steps.every((s) => s === 1) || steps.every((s) => s === -1);
}

export function isPinLocked(
  lockedUntil: Date | null,
  now: number = Date.now(),
): boolean {
  return lockedUntil !== null && lockedUntil.getTime() > now;
}

/**
 * Attempts are counted *before* the PIN is compared (and reset on success),
 * so a burst of parallel guesses can't slip past the limit. `attempt` is the
 * 1-based count including this one.
 */
export function attemptAllowed(attempt: number): boolean {
  return attempt <= MAX_PIN_ATTEMPTS;
}

/** After a wrong PIN on this attempt: lock now, or say how many are left. */
export function afterWrongPin(
  attempt: number,
  now: number = Date.now(),
): { lockedUntil: Date } | { attemptsLeft: number } {
  if (attempt >= MAX_PIN_ATTEMPTS) {
    return { lockedUntil: new Date(now + PIN_LOCK_MS) };
  }
  return { attemptsLeft: MAX_PIN_ATTEMPTS - attempt };
}

/** "Try again in 12 minutes" style copy for a locked PIN. */
export function lockMessage(lockedUntil: Date, now: number = Date.now()) {
  const mins = Math.max(1, Math.ceil((lockedUntil.getTime() - now) / 60_000));
  return `Too many wrong PINs. Try again in ${mins} minute${mins === 1 ? "" : "s"}.`;
}
