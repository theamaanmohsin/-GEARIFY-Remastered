import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("gearify_token")?.value;
  const { pathname } = request.nextUrl;

  // Protected paths requiring login token
  const isProtectedPath =
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname.startsWith("/services/new") ||
    pathname.startsWith("/admin");

  if (isProtectedPath && !token) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/services/new",
    "/services/new/:path*",
    "/admin",
    "/admin/:path*",
  ],
};
