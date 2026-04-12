import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLang, isSupportedLanguage } from "@/lib/i18n";

const PUBLIC_FILE = /\.(.*)$/;

function getPreferredLanguage(request: NextRequest): string {
  const value = request.headers
    .get("accept-language")
    ?.split(",")[0]
    ?.slice(0, 2);
  if (value && isSupportedLanguage(value)) {
    return value;
  }
  return defaultLang;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const pathSegments = pathname.split("/").filter(Boolean);
  const hasLangPrefix = pathSegments[0] && isSupportedLanguage(pathSegments[0]);

  if (hasLangPrefix) {
    return NextResponse.next();
  }

  const lang = pathname === "/" ? getPreferredLanguage(request) : defaultLang;
  const redirectPath = pathname === "/" ? `/${lang}` : `/${lang}${pathname}`;

  return NextResponse.redirect(new URL(redirectPath, request.url));
}

export const config = {
  matcher: ["/:path*"],
};
