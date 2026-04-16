"use client";

import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  MessageCircleMore,
  LayoutTemplate,
  Settings,
  ArrowLeft,
  User,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import ProfileOverviewTab from "./ProfileOverviewTab";
import ProfileMessagesTab from "./ProfileMessagesTab";
import ProfileTemplatesTab from "./ProfileTemplatesTab";
import ProfileSettingsTab from "./ProfileSettingsTab";
import type { DashboardDictionary } from "@/lib/content-schema";

type Tab = "overview" | "messages" | "templates" | "settings";

const TAB_KEYS: Tab[] = ["overview", "messages", "templates", "settings"];
const TAB_ICONS: Record<Tab, React.ElementType> = {
  overview: LayoutDashboard,
  messages: MessageCircleMore,
  templates: LayoutTemplate,
  settings: Settings,
};

export default function ProfileDashboard({
  lang: langProp,
  dashboardDict,
}: {
  lang?: string;
  dashboardDict?: DashboardDictionary;
}) {
  const searchParams = useSearchParams();
  const params = useParams();
  const lang = langProp ?? (params?.lang as string) ?? "en";
  const initialTab = searchParams.get("tab") as Tab | null;
  const [active, setActive] = useState<Tab>(
    TAB_KEYS.includes(initialTab as Tab) ? (initialTab as Tab) : "overview",
  );
  const [unreadMessages, setUnreadMessages] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    const tab = searchParams.get("tab") as Tab | null;
    if (tab && TAB_KEYS.includes(tab)) {
      setActive(tab);
    }
  }, [searchParams]);

  const d = dashboardDict;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* ── Top bar ── */}
      <div className="sticky top-0 z-20 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Brand row */}
          <div className="h-14 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-linear-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                {user?.fullName?.[0]?.toUpperCase() ?? (
                  <User className="w-3.5 h-3.5" />
                )}
              </div>
              <span className="font-semibold text-sm text-white">
                {user?.fullName ?? d?.myProfile ?? "My Profile"}
              </span>
              <span className="hidden sm:inline text-slate-600 text-xs">
                — {d?.myProfile ?? "My Profile"}
              </span>
            </div>
            <Link
              href={`/${lang}`}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {d?.backToSite ?? "Back to site"}
            </Link>
          </div>

          {/* Tab row */}
          <div className="flex gap-0 -mb-px">
            {TAB_KEYS.map((key) => {
              const Icon = TAB_ICONS[key];
              const label = d?.tabs?.[key] ?? key;
              return (
                <button
                  key={key}
                  onClick={() => setActive(key)}
                  className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    active === key
                      ? "border-cyan-500 text-cyan-400"
                      : "border-transparent text-slate-400 hover:text-white hover:border-slate-600"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                  {key === "messages" &&
                    unreadMessages > 0 &&
                    active !== "messages" && (
                      <span className="min-w-4 h-4 rounded-full bg-cyan-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
                        {unreadMessages}
                      </span>
                    )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Tab content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {active === "overview" && (
          <ProfileOverviewTab
            onTabChange={(t: string) => setActive(t as Tab)}
            dict={d?.overview}
          />
        )}
        {/* Always mounted so the socket stays connected for push notifications */}
        <div className={active !== "messages" ? "hidden" : ""}>
          <ProfileMessagesTab
            isActive={active === "messages"}
            onUnreadChange={setUnreadMessages}
            lang={lang}
            dict={d?.messages}
          />
        </div>
        {active === "templates" && <ProfileTemplatesTab />}
        {active === "settings" && <ProfileSettingsTab dict={d?.settings} />}
      </div>
    </div>
  );
}
