import { NextResponse, type NextRequest } from "next/server";

// Optimistic auth gate: redirect to /login when the session cookie is absent.
// Real session validation happens server-side in getCurrentUser(). Keep this DB-free.
export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has("session");
  if (!hasSession) {
    const url = new URL("/login", request.url);
    const path = request.nextUrl.pathname + request.nextUrl.search;
    if (path && path !== "/") url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  // Run on everything EXCEPT api routes, Next internals, auth/invite pages, and assets.
  matcher: [
    "/((?!api|_next/static|_next/image|login|signup|invite|favicon.ico|.*\\.(?:png|svg|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
