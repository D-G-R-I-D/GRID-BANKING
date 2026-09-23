import "server-only";
import { hashPassword, verifyPassword } from "@/lib/auth";
import {
  afterWrongPin,
  attemptAllowed,
  isPinLocked,
  lockMessage,
  PIN_LOCK_MS,
} from "@/lib/pin";
import {
  clearPinAttempts,
  countPinAttempt,
  findUserPin,
  lockPin,
  savePin,
} from "@/lib/data/users";
import { verifyUserPassword } from "@/lib/services/auth-service";

export type PinResult = { ok: true } | { ok: false; error: string };

/**
 * Authorise one sensitive action with the transaction PIN. Five wrong tries
 * lock the PIN for 15 minutes. Messages are safe to show as a field error.
 */
export async function verifyTransactionPin(
  userId: string,
  pin: string,
): Promise<PinResult> {
  const row = await findUserPin(userId);
  if (!row?.pinHash) return { ok: false, error: "Set up your PIN first" };
  if (row.pinLockedUntil && isPinLocked(row.pinLockedUntil)) {
    return { ok: false, error: lockMessage(row.pinLockedUntil) };
  }

  const attempt = await countPinAttempt(userId);
  if (!attemptAllowed(attempt)) {
    const until = new Date(Date.now() + PIN_LOCK_MS);
    await lockPin(userId, until);
    return { ok: false, error: lockMessage(until) };
  }

  if (await verifyPassword(pin, row.pinHash)) {
    await clearPinAttempts(userId);
    return { ok: true };
  }

  const next = afterWrongPin(attempt);
  if ("lockedUntil" in next) {
    await lockPin(userId, next.lockedUntil);
    return { ok: false, error: lockMessage(next.lockedUntil) };
  }
  return {
    ok: false,
    error: `Wrong PIN. ${next.attemptsLeft} ${next.attemptsLeft === 1 ? "try" : "tries"} left.`,
  };
}

/** First PIN, right after sign-up. Refuses if one is already set. */
export async function setInitialPin(
  userId: string,
  pin: string,
): Promise<PinResult> {
  const row = await findUserPin(userId);
  if (row?.pinHash) return { ok: false, error: "You already have a PIN" };
  await savePin(userId, await hashPassword(pin), pin.length);
  return { ok: true };
}

/** Replace the PIN (also the "forgot my PIN" path) — needs the password. */
export async function changePin(
  userId: string,
  password: string,
  pin: string,
): Promise<PinResult> {
  if (!(await verifyUserPassword(userId, password))) {
    return { ok: false, error: "Password is incorrect" };
  }
  await savePin(userId, await hashPassword(pin), pin.length);
  return { ok: true };
}
