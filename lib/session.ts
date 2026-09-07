import "server-only";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { findUserById } from "@/lib/data/users";
import { checkExpiry, stepUpIsValid } from "@/lib/session-policy";
import { sessionOptions, type SessionData } from "@/lib/session-config";

export type { SessionData } from "@/lib/session-config";
export { sessionOptions } from "@/lib/session-config";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  accountNumber: string;
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

/** Record that the user just re-entered their password. */
export async function grantStepUp() {
  const session = await getSession();
  session.stepUpAt = Date.now();
  await session.save();
}

/** True if a recent password confirmation is still trusted. */
export async function hasStepUp(): Promise<boolean> {
  const session = await getSession();
  return stepUpIsValid(session.stepUpAt);
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
  };
});

/** Use in a Server Component / layout to gate a route. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  return user;
}
