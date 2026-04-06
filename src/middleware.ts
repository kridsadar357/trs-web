import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0] ?? "";
  const pathname = request.nextUrl.pathname;

  if (!host.startsWith("chats.")) {
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sw-support.js"
  ) {
    return NextResponse.next();
  }

  if (pathname === "/manifest.webmanifest") {
    const url = request.nextUrl.clone();
    url.pathname = "/chat-app/manifest.webmanifest";
    return NextResponse.rewrite(url);
  }

  const url = request.nextUrl.clone();
  const suffix = pathname === "/" ? "" : pathname;
  url.pathname = `/chat-app${suffix}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Do not run on `/api/*` — middleware there can break App Router Route Handlers
  // (NextAuth `GET /api/auth/session` was returning the HTML not-found page in dev).
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
