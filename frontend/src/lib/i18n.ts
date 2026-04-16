export const languageOptions = [
  { code: "en", label: "United Kingdom", flag: "🇬🇧" },
  { code: "nl", label: "Netherlands", flag: "🇳🇱" },
  { code: "de", label: "Germany", flag: "🇩🇪" },
  { code: "fr", label: "France", flag: "🇫🇷" },
  { code: "it", label: "Italy", flag: "🇮🇹" },
  { code: "es", label: "Spain", flag: "🇪🇸" },
  { code: "pt", label: "Portugal", flag: "🇵🇹" },
  { code: "pl", label: "Poland", flag: "🇵🇱" },
  { code: "ro", label: "Romania", flag: "🇷🇴" },
  { code: "et", label: "Estonia", flag: "🇪🇪" },
  { code: "lv", label: "Latvia", flag: "🇱🇻" },
  { code: "fi", label: "Finland", flag: "🇫🇮" },
  { code: "sv", label: "Sweden", flag: "🇸🇪" },
  { code: "da", label: "Denmark", flag: "🇩🇰" },
  { code: "no", label: "Norway", flag: "🇳🇴" },
  { code: "cs", label: "Czech Republic", flag: "🇨🇿" },
  { code: "hu", label: "Hungary", flag: "🇭🇺" },
  { code: "el", label: "Greece", flag: "🇬🇷" },
] as const;

export const languages = languageOptions.map(
  (item) => item.code,
) as ReadonlyArray<(typeof languageOptions)[number]["code"]>;

export type AppLanguage = (typeof languageOptions)[number]["code"];

export const defaultLang: AppLanguage = "en";

export function isSupportedLanguage(value: string): value is AppLanguage {
  return languages.includes(value as AppLanguage);
}

export function getLanguageOption(lang: string) {
  return languageOptions.find((item) => item.code === lang);
}
