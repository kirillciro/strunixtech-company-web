"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileEdit,
  MessageCircleMore,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import AdminOverviewTab from "./AdminOverviewTab";
import AdminUsersTab from "./AdminUsersTab";
import AdminContentTab from "./AdminContentTab";
import AdminMessagesTab from "./AdminMessagesTab";
import { useAdminUnreadCount } from "@/lib/useChatSocket";
import { useAuth } from "@/context/AuthContext";
import type { AdminDictionary } from "@/lib/content-schema";

type Tab = "overview" | "users" | "content" | "messages";

interface AdminDashboardProps {
  lang?: string;
  adminDict?: AdminDictionary;
}

export default function AdminDashboard({
  lang,
  adminDict,
}: AdminDashboardProps) {
  const [active, setActive] = useState<Tab>("overview");
  const totalUnread = useAdminUnreadCount();
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.replace(lang ? `/${lang}` : "/");
    }
  }, [user, loading, router, lang]);

  if (loading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const d = adminDict;
  const backHref = lang ? `/${lang}` : "/";

  const tabs = [
    {
      key: "overview" as Tab,
      label: d?.tabs.overview ?? "Overview",
      Icon: LayoutDashboard,
    },
    { key: "users" as Tab, label: d?.tabs.users ?? "Users", Icon: Users },
    {
      key: "content" as Tab,
      label: d?.tabs.content ?? "Content",
      Icon: FileEdit,
    },
    {
      key: "messages" as Tab,
      label: d?.tabs.messages ?? "Messages",
      Icon: MessageCircleMore,
    },
  ] as { key: Tab; label: string; Icon: React.ElementType }[];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* ── Top bar ── */}
      <div className="sticky top-0 z-20 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Brand row */}
          <div className="h-14 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-linear-to-br from-cyan-500 to-blue-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-sm text-white">
                {d?.title ?? "Admin Panel"}
              </span>
              <span className="hidden sm:inline text-slate-600 text-xs">
                — Company Platform
              </span>
            </div>
            <Link
              href={backHref}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {d?.backToSite ?? "Back to site"}
            </Link>
          </div>

          {/* Tab row */}
          <div className="flex gap-0 -mb-px">
            {tabs.map(({ key, label, Icon }) => (
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
                {key === "messages" && totalUnread > 0 && (
                  <span className="absolute -top-0.5 right-1 min-w-4 h-4 rounded-full bg-cyan-500 flex items-center justify-center text-[9px] font-bold text-white px-1">
                    {totalUnread > 99 ? "99+" : totalUnread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {active === "overview" && <AdminOverviewTab dict={d?.overview} />}
        {active === "users" && <AdminUsersTab dict={d?.users} />}
        {active === "content" && <AdminContentTab dict={d?.content} />}
        {active === "messages" && (
          <AdminMessagesTab dict={d?.messages} lang={lang ?? "en"} />
        )}
      </div>
    </div>
  );
}
