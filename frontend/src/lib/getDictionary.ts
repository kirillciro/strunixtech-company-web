import { defaultLang, isSupportedLanguage, type AppLanguage } from "@/lib/i18n";
import type { MarketingDictionary } from "@/lib/content-schema";

const CONTENT_KEY = "marketing-homepage";

function getApiBaseUrl(): string {
  // Server-side: call the backend directly to avoid HTTPS self-signed cert issues
  if (typeof window === "undefined") {
    return process.env.INTERNAL_API_URL ?? "http://localhost:4000";
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
}

const dictionaries = {
  en: () => import("@/dictionaries/en.json").then((module) => module.default),
  nl: () => import("@/dictionaries/nl.json").then((module) => module.default),
  de: () => import("@/dictionaries/de.json").then((module) => module.default),
  fr: () => import("@/dictionaries/fr.json").then((module) => module.default),
  it: () => import("@/dictionaries/it.json").then((module) => module.default),
  es: () => import("@/dictionaries/es.json").then((module) => module.default),
  pt: () => import("@/dictionaries/pt.json").then((module) => module.default),
  pl: () => import("@/dictionaries/pl.json").then((module) => module.default),
  ro: () => import("@/dictionaries/ro.json").then((module) => module.default),
  et: () => import("@/dictionaries/et.json").then((module) => module.default),
  lv: () => import("@/dictionaries/lv.json").then((module) => module.default),
  fi: () => import("@/dictionaries/fi.json").then((module) => module.default),
  sv: () => import("@/dictionaries/sv.json").then((module) => module.default),
  da: () => import("@/dictionaries/da.json").then((module) => module.default),
  no: () => import("@/dictionaries/no.json").then((module) => module.default),
  cs: () => import("@/dictionaries/cs.json").then((module) => module.default),
  hu: () => import("@/dictionaries/hu.json").then((module) => module.default),
  el: () => import("@/dictionaries/el.json").then((module) => module.default),
} as const;

export type Dictionary = MarketingDictionary;

const dictionaryFallbacks: Record<AppLanguage, keyof typeof dictionaries> = {
  en: "en",
  nl: "nl",
  de: "de",
  fr: "fr",
  it: "it",
  es: "es",
  pt: "pt",
  pl: "pl",
  ro: "ro",
  et: "et",
  lv: "lv",
  fi: "fi",
  sv: "sv",
  da: "da",
  no: "no",
  cs: "cs",
  hu: "hu",
  el: "el",
};

async function fetchDictionaryFromApi(
  lang: AppLanguage,
): Promise<Dictionary | null> {
  try {
    const response = await fetch(
      `${getApiBaseUrl()}/content/${CONTENT_KEY}?lang=${lang}`,
      process.env.NODE_ENV === "development"
        ? { cache: "no-store" }
        : { next: { revalidate: 300 } },
    );

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as {
      content?: unknown;
      fallback?: boolean;
    };

    // Backend fell back to English — treat as no translation available
    if (!data.content || typeof data.content !== "object" || data.fallback) {
      return null;
    }

    return data.content as Dictionary;
  } catch {
    return null;
  }
}

/** Deep-merge b into a, keeping only keys defined in a (schema-constrained). */
function deepMerge<T extends Record<string, unknown>>(a: T, b: Partial<T>): T {
  const result = { ...a };
  for (const key of Object.keys(a) as (keyof T)[]) {
    const bVal = b[key];
    if (bVal === undefined) continue;
    const aVal = a[key];
    if (
      bVal !== null &&
      typeof bVal === "object" &&
      !Array.isArray(bVal) &&
      aVal !== null &&
      typeof aVal === "object" &&
      !Array.isArray(aVal)
    ) {
      result[key] = deepMerge(
        aVal as Record<string, unknown>,
        bVal as Record<string, unknown>,
      ) as T[keyof T];
    } else {
      result[key] = bVal as T[keyof T];
    }
  }
  return result;
}

export async function getDictionary(lang: string): Promise<Dictionary> {
  const resolvedLang: AppLanguage = isSupportedLanguage(lang)
    ? lang
    : defaultLang;
  const localFallback = await dictionaries[dictionaryFallbacks[resolvedLang]]();
  const apiDictionary = await fetchDictionaryFromApi(resolvedLang);

  if (apiDictionary) {
    // Deep-merge so local fallback fills in fields not yet stored in the CMS
    return deepMerge(
      localFallback as unknown as Record<string, unknown>,
      apiDictionary as unknown as Record<string, unknown>,
    ) as unknown as Dictionary;
  }

  return localFallback;
}
