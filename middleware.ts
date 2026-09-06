import { NextResponse, type NextRequest } from "next/server";

/**
 * Coarse gate: bounce anonymous visitors away from app routes before the
 * page renders. The real check still happens in the (app) layout via
 * requireUser() — this just avoids a flash of protected UI.
 */
const PROTECTED = ["/dashboard", "/transfer"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const needsAuth = PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (needsAuth && !request.cookies.has("grid_session")) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/transfer/:path*"],
};
