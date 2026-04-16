"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Globe } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import {
  getLanguageOption,
  languageOptions,
  languages,
  type AppLanguage,
} from "@/lib/i18n";

function buildLocalizedPath(pathname: string, lang: AppLanguage): string {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return `/${lang}`;
  }

  if (languages.includes(segments[0] as AppLanguage)) {
    segments[0] = lang;
  } else {
    segments.unshift(lang);
  }

  return `/${segments.join("/")}`;
}

export default function LanguageSwitcher({
  currentLang,
  scrolled = true,
}: {
  currentLang: string;
  scrolled?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const currentOption =
    getLanguageOption(currentLang) ?? getLanguageOption("en");

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-slate-100 transition hover:border-cyan-400 hover:text-white ${
          scrolled
            ? "border-slate-700 bg-slate-900/85"
            : "border-transparent bg-transparent hover:bg-white/10"
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Open language selector"
      >
        <Globe className="h-4 w-4 text-cyan-300" />
        <span className="text-base leading-none">{currentOption?.flag}</span>
        <span className="hidden sm:inline font-semibold">
          {currentOption?.code.toUpperCase()}
        </span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen ? (
        <div
          className="absolute right-0 top-full z-60 mt-2 w-65 max-h-80 overflow-y-auto rounded-xl border border-slate-700 bg-slate-950 p-2 animate-fadeInUp [scrollbar-width:thin] [scrollbar-color:#475569_transparent]"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div className="px-3 py-2 text-[11px] uppercase tracking-[0.22em] text-slate-400">
            Languages
          </div>
          <div
            className="space-y-1"
            role="listbox"
            aria-label="Language options"
          >
            {languageOptions.map((option) => {
              const active = currentLang === option.code;
              return (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    // Persist manual selection in cookie (overrides auto-detect)
                    document.cookie = `preferred_lang=${option.code};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
                    router.push(buildLocalizedPath(pathname, option.code));
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition ${
                    active
                      ? "bg-cyan-500/15 text-cyan-100"
                      : "text-slate-200 hover:bg-slate-800 hover:text-white"
                  }`}
                  aria-label={`Switch language to ${option.label}`}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-base leading-none">
                      {option.flag}
                    </span>
                    <span className="text-sm font-medium">{option.label}</span>
                  </span>
                  <span className="text-xs font-semibold uppercase text-slate-400">
                    {option.code}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
