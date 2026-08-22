import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { canonicalHostRedirectUrl } from "./lib/auth-origins";

const handleI18n = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const canonical = canonicalHostRedirectUrl(request.nextUrl);
  if (canonical) {
    return NextResponse.redirect(canonical, 308);
  }
  return handleI18n(request);
}

export const config = {
  matcher: ["/", "/(hu|en)/:path*"],
};
