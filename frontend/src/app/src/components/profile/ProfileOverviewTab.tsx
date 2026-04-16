"use client";

import { useAuth } from "@/context/AuthContext";
import {
  MessageCircleMore,
  LayoutTemplate,
  Settings,
  Sparkles,
} from "lucide-react";
import type { DashboardDictionary } from "@/lib/content-schema";

type OverviewDict = DashboardDictionary["overview"];

export default function ProfileOverviewTab({
  onTabChange,
  dict,
}: {
  onTabChange?: (tab: string) => void;
  dict?: OverviewDict;
}) {
  const { user } = useAuth();

  const links = [
    {
      key: "messages",
      label: dict?.links?.messages?.label ?? "Messages",
      description: dict?.links?.messages?.description ?? "Chat with the team",
      Icon: MessageCircleMore,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20",
    },
    {
      key: "templates",
      label: dict?.links?.templates?.label ?? "Templates",
      description:
        dict?.links?.templates?.description ?? "Browse available projects",
      Icon: LayoutTemplate,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      key: "settings",
      label: dict?.links?.settings?.label ?? "Settings",
      description: dict?.links?.settings?.description ?? "Manage your account",
      Icon: Settings,
      color: "text-slate-400",
      bg: "bg-slate-500/10",
      border: "border-slate-700/50",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="relative overflow-hidden bg-linear-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-2xl px-6 py-8">
        <div className="absolute inset-0 bg-linear-to-br from-cyan-500/5 to-blue-600/5 pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-medium uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            {dict?.welcomeBack ?? "Welcome back"}
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">
            {user?.fullName ?? "Hello!"}
          </h1>
          <p className="text-slate-400 text-sm">{user?.email}</p>
          <div className="mt-4 flex items-center gap-3 flex-wrap">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                user?.isVerified
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-amber-500/15 text-amber-400"
              }`}
            >
              {user?.isVerified
                ? (dict?.emailVerified ?? "Email verified")
                : (dict?.emailNotVerified ?? "Email not verified")}
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-700/60 text-slate-400 capitalize">
              {user?.provider} {dict?.providerAccount ?? "account"}
            </span>
          </div>
        </div>
      </div>

      {/* Quick access cards */}
      <div>
        <h2 className="text-base font-semibold text-white mb-4">
          {dict?.quickAccess ?? "Quick Access"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {links.map(({ key, label, description, Icon, color, bg, border }) => (
            <button
              key={key}
              onClick={() => onTabChange?.(key)}
              className={`flex items-start gap-4 p-5 rounded-2xl border ${border} ${bg} hover:brightness-125 transition-all text-left`}
            >
              <div className="p-2 rounded-lg bg-slate-900/60">
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
