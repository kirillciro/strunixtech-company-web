import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLang, isSupportedLanguage } from "@/lib/i18n";

const PUBLIC_FILE = /\.(.*)$/;
const LANG_COOKIE = "preferred_lang";

/**
 * Maps ISO 3166-1 alpha-2 country codes to app language codes.
 * Countries not listed fall back to Accept-Language, then defaultLang.
 */
const COUNTRY_TO_LANG: Record<string, string> = {
  // Dutch
  NL: "nl",
  BE: "nl",
  // German
  DE: "de",
  AT: "de",
  CH: "de",
  // French
  FR: "fr",
  LU: "fr",
  MC: "fr",
  // Italian
  IT: "it",
  SM: "it",
  VA: "it",
  // Spanish
  ES: "es",
  MX: "es",
  AR: "es",
  CO: "es",
  CL: "es",
  PE: "es",
  VE: "es",
  EC: "es",
  GT: "es",
  CU: "es",
  BO: "es",
  DO: "es",
  HN: "es",
  PY: "es",
  SV: "es",
  NI: "es",
  CR: "es",
  PA: "es",
  UY: "es",
  // Portuguese
  PT: "pt",
  BR: "pt",
  AO: "pt",
  MZ: "pt",
  // Polish
  PL: "pl",
  // Romanian
  RO: "ro",
  // Estonian
  EE: "et",
  // Latvian
  LV: "lv",
  // Finnish
  FI: "fi",
  // Swedish
  SE: "sv",
  // Danish
  DK: "da",
  // Norwegian
  NO: "no",
  // Czech
  CZ: "cs",
  // Hungarian
  HU: "hu",
  // Greek
  GR: "el",
  CY: "el",
  // English (explicit)
  GB: "en",
  US: "en",
  AU: "en",
  NZ: "en",
  CA: "en",
  IE: "en",
  ZA: "en",
  SG: "en",
  IN: "en",
};

function getPreferredLanguage(request: NextRequest): string {
  // 1. Cookie — user previously selected or already auto-detected
  const cookie = request.cookies.get(LANG_COOKIE)?.value;
  if (cookie && isSupportedLanguage(cookie)) return cookie;

  // 2. IP-based country detection via Vercel or Cloudflare headers
  const country =
    request.headers.get("x-vercel-ip-country") ?? // Vercel (production)
    request.headers.get("cf-ipcountry"); // Cloudflare

  if (country) {
    const lang = COUNTRY_TO_LANG[country.toUpperCase()];
    if (lang && isSupportedLanguage(lang)) return lang;
  }

  // 3. Accept-Language header — fallback for local dev / unrecognised countries
  const acceptLang = request.headers.get("accept-language");
  if (acceptLang) {
    const tags = acceptLang
      .split(",")
      .map((entry) => entry.split(";")[0].trim().slice(0, 2).toLowerCase());
    for (const tag of tags) {
      if (isSupportedLanguage(tag)) return tag;
    }
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
    // Path already has a valid lang prefix — sync cookie if it differs
    const currentLang = pathSegments[0];
    const cookieLang = request.cookies.get(LANG_COOKIE)?.value;
    if (cookieLang !== currentLang) {
      const response = NextResponse.next();
      response.cookies.set(LANG_COOKIE, currentLang, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
      });
      return response;
    }
    return NextResponse.next();
  }

  // No lang prefix — detect and redirect
  const lang = getPreferredLanguage(request);
  const redirectPath = `/${lang}${pathname === "/" ? "" : pathname}`;
  const response = NextResponse.redirect(new URL(redirectPath, request.url));

  response.cookies.set(LANG_COOKIE, lang, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  return response;
}

export const config = {
  matcher: ["/:path*"],
};
