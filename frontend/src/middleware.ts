import { NextRequest, NextResponse } from "next/server";

const PROTECTED = ["/ai-tutor", "/notes"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  if (!isProtected) return NextResponse.next();

  if (!request.cookies.has("aspire_auth")) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/ai-tutor/:path*", "/notes/:path*"],
};
