"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { templateCategories } from "@/lib/template-categories";
import { ChevronDown, LogIn, LogOut, MessageCircleMore } from "lucide-react";
import AuthModal from "@/app/src/components/home/AuthModal";
import LanguageSwitcher from "@/app/src/components/home/LanguageSwitcher";
import { clearSession, getStoredUser } from "@/lib/auth-client";

type HeaderLabels = {
  templates: string;
  login: string;
  logout: string;
  chat: string;
};

function subscribeAuth(callback: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("storage", callback);
  window.addEventListener("auth:changed", callback as EventListener);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("auth:changed", callback as EventListener);
  };
}

function getAuthSnapshot(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return getStoredUser()?.email ?? null;
}

export default function Header({
  lang = "en",
  labels,
}: {
  lang?: string;
  labels: HeaderLabels;
}) {
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const userEmail = useSyncExternalStore(
    subscribeAuth,
    getAuthSnapshot,
    () => null,
  );

  useEffect(() => {
    const onScroll = () => {
      setHasScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        !hasScrolled
          ? "bg-transparent border-b border-transparent"
          : "bg-linear-to-b from-slate-950 to-slate-900/80 border-b border-slate-700/50"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
        {/* Logo */}
        <Link href={`/${lang}`} className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-linear-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-lg">
            CP
          </div>
          <span className="text-xl font-bold hidden sm:inline bg-linear-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
            Company Platform
          </span>
        </Link>

        {/* Center Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <div className="relative">
            <button
              onClick={() => setIsTemplatesOpen(!isTemplatesOpen)}
              className="text-slate-200 hover:text-cyan-300 font-medium transition-colors flex items-center gap-1"
            >
              {labels.templates}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${isTemplatesOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown Menu */}
            {isTemplatesOpen && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-slate-900/95 border border-slate-700 rounded-lg py-2 origin-top animate-fadeInUp">
                {templateCategories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/${lang}/templates/${cat.slug}`}
                    onClick={() => setIsTemplatesOpen(false)}
                    className="block px-4 py-3 text-slate-200 hover:bg-cyan-500/10 hover:text-cyan-300 transition-colors text-sm"
                  >
                    {cat.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Navigation */}
        <div className="flex items-center gap-2 sm:gap-4">
          <LanguageSwitcher currentLang={lang} />
          {userEmail ? (
            <button
              onClick={() => {
                clearSession();
                window.dispatchEvent(new Event("auth:changed"));
              }}
              className="text-slate-200 hover:text-cyan-300 font-medium transition-colors hidden sm:flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              {labels.logout}
            </button>
          ) : (
            <button
              onClick={() => setIsAuthOpen(true)}
              className="text-slate-200 hover:text-cyan-300 font-medium transition-colors hidden sm:flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              {labels.login}
            </button>
          )}
          {!userEmail && (
            <button
              onClick={() => setIsAuthOpen(true)}
              className="sm:hidden rounded-lg border border-slate-600 px-3 py-2 text-slate-200 transition hover:border-cyan-400 hover:text-cyan-300"
              aria-label="Open login popup"
            >
              <LogIn className="w-4 h-4" />
            </button>
          )}
          <button className="btn-soft-motion hidden sm:inline-flex px-5 py-2 bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-lg items-center gap-2 whitespace-nowrap">
            <MessageCircleMore className="w-4 h-4" />
            {labels.chat}
          </button>
          <button
            className="sm:hidden rounded-lg bg-linear-to-r from-cyan-500 to-blue-600 px-3 py-2 text-white"
            aria-label="Open developer chat"
          >
            <MessageCircleMore className="w-4 h-4" />
          </button>
        </div>
      </nav>

      <AuthModal
        open={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => {
          window.dispatchEvent(new Event("auth:changed"));
        }}
      />
    </header>
  );
}
