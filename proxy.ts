import { getIronSession } from "iron-session";
import { NextResponse, type NextRequest } from "next/server";
import { sessionOptions, type SessionData } from "@/lib/session-config";
import { checkExpiry } from "@/lib/session-policy";

const PROTECTED = ["/dashboard", "/transfer", "/activity", "/settings"];
const REFRESH_EVERY_MS = 60_000; // don't re-seal the cookie on every request

function signInRedirect(req: NextRequest, reason?: string) {
  const url = req.nextUrl.clone();
  url.pathname = "/sign-in";
  url.search = reason ? `?reason=${reason}` : "";
  return NextResponse.redirect(url);
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const needsAuth = PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  if (!needsAuth) return NextResponse.next();

  const res = NextResponse.next();
  const session = await getIronSession<SessionData>(req, res, sessionOptions());

  if (!session.userId) return signInRedirect(req);

  const expired = checkExpiry(session);
  if (expired) {
    const redirect = signInRedirect(req, "timeout");
    const dead = await getIronSession<SessionData>(
      req,
      redirect,
      sessionOptions(),
    );
    dead.destroy();
    return redirect;
  }

  const now = Date.now();
  if (now - (session.lastSeenAt ?? 0) > REFRESH_EVERY_MS) {
    session.lastSeenAt = now;
    await session.save();
  }
  return res;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/transfer/:path*",
    "/activity/:path*",
    "/settings/:path*",
  ],
};
