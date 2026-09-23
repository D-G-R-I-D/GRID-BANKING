import "server-only";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { findUserById } from "@/lib/data/users";
import { checkExpiry } from "@/lib/session-policy";
import { sessionOptions, type SessionData } from "@/lib/session-config";

export type { SessionData } from "@/lib/session-config";
export { sessionOptions } from "@/lib/session-config";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  accountNumber: string;
  /** Length of their transaction PIN, or null if they haven't set one yet. */
  pinLength: number | null;
}

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions());
}

export async function startSession(userId: string) {
  const session = await getSession();
  const now = Date.now();
  session.userId = userId;
  session.createdAt = now;
  session.lastSeenAt = now;
  await session.save();
}

export async function endSession() {
  const session = await getSession();
  session.destroy();
}

/**
 * Current user (safe fields only) or null. Cached per request.
 * Enforces the session timers read-only — the proxy does the cookie
 * cleanup, this just refuses to authorise a stale session.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await getSession();
  if (!session.userId) return null;
  if (checkExpiry(session)) return null;

  const user = await findUserById(session.userId);
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    accountNumber: user.accountNumber,
    pinLength: user.pinHash ? user.pinLength : null,
  };
});

/** Use in a Server Component / layout to gate a route. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  return user;
}

/**
 * Gate for the app proper: signed in AND has a transaction PIN. Anyone
 * without one (a new sign-up, or an account from before PINs) is sent to
 * set one first — it's mandatory.
 */
export async function requireUserWithPin(): Promise<
  CurrentUser & { pinLength: number }
> {
  const user = await requireUser();
  if (user.pinLength === null) redirect("/set-pin");
  return { ...user, pinLength: user.pinLength };
}
