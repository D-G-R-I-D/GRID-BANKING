/**
 * Session lifetime policy — pure, so it's unit-testable and shared by
 * both the proxy (enforcement) and getCurrentUser (defense in depth).
 *
 * Two timers, like a real bank app:
 *  - idle: signed out after N minutes with no requests (sliding window)
 *  - absolute: signed out N hours after sign-in no matter how active
 */

const minutes = (n: number) => n * 60_000;
const hours = (n: number) => n * 3_600_000;

function envInt(name: string, fallback: number): number {
  const v = Number(process.env[name]);
  return Number.isFinite(v) && v > 0 ? v : fallback;
}

export const IDLE_TIMEOUT_MS = minutes(envInt("SESSION_IDLE_MINUTES", 20));
export const ABSOLUTE_TIMEOUT_MS = hours(envInt("SESSION_ABSOLUTE_HOURS", 12));

/**
 * Step-up: after you re-enter your password for a sensitive action (moving
 * money, changing security settings) that confirmation is trusted for this
 * long before we ask again.
 */
export const STEP_UP_TTL_MS = minutes(envInt("STEP_UP_MINUTES", 5));

export function stepUpIsValid(
  stepUpAt: number | undefined,
  now: number = Date.now(),
): boolean {
  return typeof stepUpAt === "number" && now - stepUpAt < STEP_UP_TTL_MS;
}

/** iron-session cookie TTL (seconds): the idle window is the backstop. */
export const COOKIE_TTL_SECONDS = Math.floor(IDLE_TIMEOUT_MS / 1000);

export interface SessionTimers {
  createdAt?: number;
  lastSeenAt?: number;
}

export type ExpiryReason = "idle" | "absolute" | null;

export function checkExpiry(
  { createdAt, lastSeenAt }: SessionTimers,
  now: number = Date.now(),
): ExpiryReason {
  if (!createdAt || !lastSeenAt) return "idle"; // malformed / pre-timers cookie
  if (now - createdAt >= ABSOLUTE_TIMEOUT_MS) return "absolute";
  if (now - lastSeenAt >= IDLE_TIMEOUT_MS) return "idle";
  return null;
}
