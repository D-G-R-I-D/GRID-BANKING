import type { SessionOptions } from "iron-session";
import { COOKIE_TTL_SECONDS } from "./session-policy";

// No "server-only" and no Prisma here on purpose: the proxy (edge runtime)
// imports this. Anything touching the DB lives in lib/session.ts.

export interface SessionData {
  userId?: string;
  createdAt?: number;
  lastSeenAt?: number;
  /** When the user last re-entered their password for a sensitive action. */
  stepUpAt?: number;
}

export function sessionOptions(): SessionOptions {
  const password = process.env.SESSION_SECRET;
  if (!password || password.length < 32) {
    throw new Error("SESSION_SECRET must be set and at least 32 characters");
  }
  return {
    password,
    cookieName: "grid_session",
    ttl: COOKIE_TTL_SECONDS,
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    },
  };
}
