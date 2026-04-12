import { defaultLang, isSupportedLanguage, type AppLanguage } from "@/lib/i18n";
import type { MarketingDictionary } from "@/lib/content-schema";

const CONTENT_KEY = "marketing-homepage";

function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
}

const dictionaries = {
  en: () => import("@/dictionaries/en.json").then((module) => module.default),
  nl: () => import("@/dictionaries/nl.json").then((module) => module.default),
  de: () => import("@/dictionaries/de.json").then((module) => module.default),
  fr: () => import("@/dictionaries/fr.json").then((module) => module.default),
  it: () => import("@/dictionaries/it.json").then((module) => module.default),
  es: () => import("@/dictionaries/es.json").then((module) => module.default),
} as const;

export type Dictionary = MarketingDictionary;

const dictionaryFallbacks: Record<AppLanguage, keyof typeof dictionaries> = {
  en: "en",
  nl: "nl",
  de: "de",
  fr: "fr",
  it: "it",
  es: "es",
  pt: "en",
  pl: "en",
  ro: "en",
  et: "en",
  lv: "en",
  fi: "en",
};

async function fetchDictionaryFromApi(
  lang: AppLanguage,
): Promise<Dictionary | null> {
  try {
    const response = await fetch(
      `${getApiBaseUrl()}/content/${CONTENT_KEY}?lang=${lang}`,
      {
        // Keep localized marketing content warm while allowing periodic refresh.
        next: { revalidate: 300 },
      },
    );

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as { content?: unknown };

    if (!data.content || typeof data.content !== "object") {
      return null;
    }

    return data.content as Dictionary;
  } catch {
    return null;
  }
}

export async function getDictionary(lang: string): Promise<Dictionary> {
  const resolvedLang: AppLanguage = isSupportedLanguage(lang)
    ? lang
    : defaultLang;
  const apiDictionary = await fetchDictionaryFromApi(resolvedLang);

  if (apiDictionary) {
    return apiDictionary;
  }

  return dictionaries[dictionaryFallbacks[resolvedLang]]();
}
