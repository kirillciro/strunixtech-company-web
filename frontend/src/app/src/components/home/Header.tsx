"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { templateCategories } from "@/lib/template-categories";
import {
  Bot,
  Briefcase,
  Building2,
  Calendar,
  ChevronDown,
  FileText,
  LayoutDashboard,
  LayoutTemplate,
  LogIn,
  LogOut,
  Menu,
  MessageCircleMore,
  MessagesSquare,
  Megaphone,
  MousePointerClick,
  Palette,
  LifeBuoy,
  Globe2,
  BookOpen,
  Users2,
  Phone,
  Handshake,
  Lock,
  Rocket,
  ScrollText,
  Cookie,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  User,
  UserRound,
  X,
  Search,
} from "lucide-react";
import LanguageSwitcher from "@/app/src/components/home/LanguageSwitcher";
import { useAuth } from "@/context/AuthContext";

type HeaderLabels = {
  templates: string;
  login: string;
  logout: string;
  chat: string;
  services: string;
  company: string;
  legal: string;
  myProfile: string;
  adminDashboard: string;
  serviceItems: string[];
  companyItems: string[];
  legalItems: string[];
  translationOn: string;
  translationOff: string;
};

const serviceHrefs = [
  "/services/web-development",
  "/services/seo",
  "/services/advertising",
  "/services/design",
  "/services/support",
];
const serviceIcons = [Globe2, Search, Megaphone, Palette, LifeBuoy];

const companyHrefs = [
  "/company/about",
  "/company/blog",
  "/company/careers",
  "/company/contact",
  "/company/partners",
];
const companyIcons = [Building2, BookOpen, Briefcase, Phone, Handshake];

const legalHrefs = ["/legal/privacy", "/legal/terms", "/legal/cookies"];
const legalIcons = [Lock, ScrollText, Cookie];

const templateIconMap: Record<string, React.ElementType> = {
  briefcase: Briefcase,
  calendar: Calendar,
  "shopping-bag": ShoppingBag,
  "layout-dashboard": LayoutDashboard,
  "messages-square": MessagesSquare,
  smartphone: Smartphone,
  bot: Bot,
  "mouse-pointer-click": MousePointerClick,
  "user-round": UserRound,
  rocket: Rocket,
};

function DesktopDropdown({
  label,
  items,
  lang,
}: {
  label: string;
  items: { label: string; href: string; icon: React.ElementType }[];
  lang: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-3 py-2 text-sm text-slate-400 hover:text-white font-medium transition-colors rounded-lg hover:bg-slate-800/50"
      >
        {label}
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-2 w-52 bg-slate-900 border border-slate-700/60 rounded-xl py-1.5 shadow-xl shadow-black/50">
          {items.map((item) => (
            <Link
              key={item.href}
              href={`/${lang}${item.href}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <item.icon className="w-4 h-4 text-slate-500 shrink-0" />
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function MobileAccordion({
  label,
  icon: Icon,
  items,
  lang,
  onNavigate,
}: {
  label: string;
  icon: React.ElementType;
  items: { label: string; href: string; icon: React.ElementType }[];
  lang: string;
  onNavigate: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-3 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl transition-colors"
      >
        <span className="flex items-center gap-3">
          <Icon className="w-4 h-4 text-slate-400" />
          {label}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="ml-3 pl-3 border-l border-slate-700/60 space-y-0.5">
          {items.map((item) => (
            <Link
              key={item.href}
              href={`/${lang}${item.href}`}
              onClick={onNavigate}
              className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
            >
              <item.icon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

export default function Header({
  lang = "en",
  labels,
  templateCategoryLabels = {},
}: {
  lang?: string;
  labels: HeaderLabels;
  templateCategoryLabels?: Record<string, string>;
}) {
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobileTemplatesOpen, setIsMobileTemplatesOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const { user, openAuth, logout } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const templatesRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const onScroll = () => setHasScrolled(window.scrollY > 0);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      )
        setIsUserMenuOpen(false);
      if (
        templatesRef.current &&
        !templatesRef.current.contains(e.target as Node)
      )
        setIsTemplatesOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          hasScrolled
            ? "bg-slate-950/90 backdrop-blur-md border-b border-slate-700/50"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          {/* ── Logo ── */}
          <Link
            href={`/${lang}`}
            className="flex items-center gap-2.5 shrink-0"
          >
            <img
              src="/StrunixTechLogo.svg"
              alt="Strunix Tech"
              className="h-9 w-auto object-contain"
            />
          </Link>

          {/* ── Desktop Center Nav ── */}
          <div className="hidden md:flex items-center gap-1 flex-1">
            {/* Templates */}
            <div className="relative" ref={templatesRef}>
              <button
                onClick={() => setIsTemplatesOpen(!isTemplatesOpen)}
                className="flex items-center gap-1 px-3 py-2 text-sm text-slate-400 hover:text-white font-medium transition-colors rounded-lg hover:bg-slate-800/50"
              >
                {labels.templates}
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${isTemplatesOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isTemplatesOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-slate-900 border border-slate-700/60 rounded-xl py-1.5 shadow-xl shadow-black/50">
                  {templateCategories.map((cat) => {
                    const CatIcon = templateIconMap[cat.icon];
                    return (
                      <Link
                        key={cat.slug}
                        href={`/${lang}/templates/${cat.slug}`}
                        onClick={() => setIsTemplatesOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                      >
                        {CatIcon && (
                          <CatIcon className="w-4 h-4 text-slate-500 shrink-0" />
                        )}
                        {templateCategoryLabels[cat.slug] ?? cat.title}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <DesktopDropdown
              label={labels.services}
              items={serviceHrefs.map((href, i) => ({
                label: labels.serviceItems[i] ?? "",
                href,
                icon: serviceIcons[i],
              }))}
              lang={lang}
            />
            <DesktopDropdown
              label={labels.company}
              items={companyHrefs.map((href, i) => ({
                label: labels.companyItems[i] ?? "",
                href,
                icon: companyIcons[i],
              }))}
              lang={lang}
            />
            <DesktopDropdown
              label={labels.legal}
              items={legalHrefs.map((href, i) => ({
                label: labels.legalItems[i] ?? "",
                href,
                icon: legalIcons[i],
              }))}
              lang={lang}
            />

            {isAdmin && (
              <Link
                href={`/${lang}/admin`}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-cyan-400 hover:text-cyan-300 rounded-lg transition-colors ${hasScrolled ? "hover:bg-cyan-500/10" : ""}`}
              >
                <ShieldCheck className="w-4 h-4" />
                {labels.adminDashboard}
              </Link>
            )}
          </div>

          {/* ── Desktop Right Side ── */}
          <div className="hidden md:flex items-center gap-2 ml-auto">
            <LanguageSwitcher currentLang={lang} scrolled={hasScrolled} />
            <div className="w-px h-5 bg-slate-700/60" />
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-slate-100 transition hover:border-cyan-400 hover:text-white ${
                    hasScrolled
                      ? "border-slate-700 bg-slate-900/85"
                      : "border-transparent bg-transparent hover:bg-white/10"
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-linear-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {user.fullName?.[0]?.toUpperCase() ?? "U"}
                  </div>
                  <span className="font-semibold max-w-24 truncate">
                    {user.fullName?.split(" ")[0]}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${isUserMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isUserMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-52 bg-slate-900 border border-slate-700/60 rounded-xl shadow-xl shadow-black/50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-700/60">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-white truncate">
                          {user.fullName}
                        </p>
                        <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-cyan-500/15 text-cyan-300 border border-cyan-500/20">
                          {user.role}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {user.email}
                      </p>
                    </div>
                    <div className="py-1">
                      <Link
                        href={`/${lang}/dashboard`}
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        {labels.myProfile}
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        {labels.logout}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openAuth("login")}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-300 hover:text-white font-medium rounded-lg hover:bg-slate-800/50 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                {labels.login}
              </button>
            )}
            <button className="btn-soft-motion flex items-center gap-1.5 px-4 py-2 bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-sm font-semibold rounded-lg whitespace-nowrap transition-opacity">
              <MessageCircleMore className="w-4 h-4 shrink-0" />
              {labels.chat}
            </button>
          </div>

          {/* ── Mobile Right: CTA + Hamburger ── */}
          <div className="flex md:hidden items-center gap-2 ml-auto">
            {/* Icon-only on small mobile, full button on sm+ */}
            <button className="btn-soft-motion flex items-center justify-center gap-1.5 bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-lg transition-opacity w-9 h-9 p-0 sm:w-auto sm:h-auto sm:px-4 sm:py-2 sm:text-sm">
              <MessageCircleMore className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">
                {labels.chat}
              </span>
            </button>
            <button
              onClick={() => setIsMobileOpen(true)}
              className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
                hasScrolled
                  ? "border border-slate-700 bg-slate-900/85 text-slate-100 hover:border-cyan-400"
                  : "text-white hover:bg-white/10"
              }`}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </nav>
      </header>

      {/* ── Mobile Backdrop ── */}
      <div
        onClick={() => setIsMobileOpen(false)}
        className={`fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isMobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      {/* ── Mobile Panel ── */}
      <div
        className={`fixed inset-y-0 right-0 z-70 w-80 max-w-full bg-slate-950 border-l border-slate-800 flex flex-col transition-transform duration-300 ease-in-out md:hidden ${
          isMobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Panel Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <Link
            href={`/${lang}`}
            onClick={() => setIsMobileOpen(false)}
            className="flex items-center gap-2.5"
          >
            <img
              src="/StrunixTechLogo.svg"
              alt="Strunix Tech"
              className="h-8 w-auto object-contain"
            />
          </Link>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="flex items-center justify-center w-9 h-9 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Panel Body */}
        <div className="flex-1 overflow-y-auto py-4 px-4 space-y-1">
          {/* Language */}
          <div className="px-2 pb-3">
            <LanguageSwitcher currentLang={lang} scrolled={true} />
          </div>

          <div className="h-px bg-slate-800 mx-2 mb-3" />

          {/* My Profile — only when logged in */}
          {user && (
            <Link
              href={`/${lang}/dashboard`}
              onClick={() => setIsMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl transition-colors"
            >
              <User className="w-4 h-4 text-slate-400" />
              {labels.myProfile}
            </Link>
          )}

          {/* Templates */}
          <button
            onClick={() => setIsMobileTemplatesOpen(!isMobileTemplatesOpen)}
            className="flex items-center justify-between w-full px-3 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl transition-colors"
          >
            <span className="flex items-center gap-3">
              <LayoutTemplate className="w-4 h-4 text-slate-400" />
              {labels.templates}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isMobileTemplatesOpen ? "rotate-180" : ""}`}
            />
          </button>
          {isMobileTemplatesOpen && (
            <div className="ml-3 pl-3 border-l border-slate-700/60 space-y-0.5">
              {templateCategories.map((cat) => {
                const CatIcon = templateIconMap[cat.icon];
                return (
                  <Link
                    key={cat.slug}
                    href={`/${lang}/templates/${cat.slug}`}
                    onClick={() => setIsMobileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
                  >
                    {CatIcon && (
                      <CatIcon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    )}
                    {templateCategoryLabels[cat.slug] ?? cat.title}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Services */}
          <MobileAccordion
            label={labels.services}
            icon={Briefcase}
            items={serviceHrefs.map((href, i) => ({
              label: labels.serviceItems[i] ?? "",
              href,
              icon: serviceIcons[i],
            }))}
            lang={lang}
            onNavigate={() => setIsMobileOpen(false)}
          />

          {/* Company */}
          <MobileAccordion
            label={labels.company}
            icon={Building2}
            items={companyHrefs.map((href, i) => ({
              label: labels.companyItems[i] ?? "",
              href,
              icon: companyIcons[i],
            }))}
            lang={lang}
            onNavigate={() => setIsMobileOpen(false)}
          />

          {/* Legal */}
          <MobileAccordion
            label={labels.legal}
            icon={FileText}
            items={legalHrefs.map((href, i) => ({
              label: labels.legalItems[i] ?? "",
              href,
              icon: legalIcons[i],
            }))}
            lang={lang}
            onNavigate={() => setIsMobileOpen(false)}
          />

          {/* Admin Dashboard — last */}
          {isAdmin && (
            <Link
              href={`/${lang}/admin`}
              onClick={() => setIsMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-3 text-sm font-medium text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-xl transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              {labels.adminDashboard}
            </Link>
          )}
        </div>

        {/* Panel Footer — user section */}
        <div className="border-t border-slate-800 px-4 py-4">
          {user ? (
            <div className="space-y-1">
              <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-900/60 mb-2">
                <div className="w-9 h-9 rounded-full bg-linear-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
                  {user.fullName?.[0]?.toUpperCase() ?? "U"}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white truncate">
                      {user.fullName}
                    </p>
                    <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-cyan-500/15 text-cyan-300 border border-cyan-500/20">
                      {user.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {user.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  setIsMobileOpen(false);
                }}
                className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
                {labels.logout}
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                openAuth("login");
                setIsMobileOpen(false);
              }}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-semibold text-white border border-slate-700 rounded-xl hover:border-cyan-400 hover:bg-cyan-500/10 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              {labels.login}
            </button>
          )}
        </div>

        {/* Legal footer links */}
        <div className="border-t border-slate-800/60 px-5 py-3 flex items-center justify-center gap-4">
          <Link
            href={`/${lang}/legal/privacy`}
            onClick={() => setIsMobileOpen(false)}
            className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
          >
            Privacy
          </Link>
          <span className="text-slate-700 text-xs">·</span>
          <Link
            href={`/${lang}/legal/terms`}
            onClick={() => setIsMobileOpen(false)}
            className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
          >
            Terms
          </Link>
          <span className="text-slate-700 text-xs">·</span>
          <Link
            href={`/${lang}/legal/cookies`}
            onClick={() => setIsMobileOpen(false)}
            className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
          >
            Cookies
          </Link>
        </div>
      </div>
    </>
  );
}
