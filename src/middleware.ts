// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/dashboard")) {
    // Auth check would happen here via session cookie
    // For Phase 0, redirect unauth users to login
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
