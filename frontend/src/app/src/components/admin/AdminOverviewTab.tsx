"use client";

import { useEffect, useState } from "react";
import { Users, FileText, Globe, Loader2 } from "lucide-react";
import { getAccessToken } from "@/lib/auth-client";
import type { AdminDictionary } from "@/lib/content-schema";

type Stats = {
  totalUsers: number;
  totalContent: number;
  liveLocales: number;
};

function apiBase() {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
}

interface AdminOverviewTabProps {
  dict?: AdminDictionary["overview"];
}

export default function AdminOverviewTab({ dict }: AdminOverviewTabProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getAccessToken();
    fetch(`${apiBase()}/admin/stats`, {
      headers: { Authorization: `Bearer ${token ?? ""}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error("Failed");
        return r.json() as Promise<Stats>;
      })
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => {
        setError(dict?.errorLoad ?? "Could not load stats.");
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cards = [
    {
      label: dict?.statUsers ?? "Total Users",
      value: stats?.totalUsers,
      Icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      label: dict?.statContent ?? "Content Documents",
      value: stats?.totalContent,
      Icon: FileText,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20",
    },
    {
      label: dict?.statLocales ?? "Live Locales",
      value: stats?.liveLocales,
      Icon: Globe,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-1">
          {dict?.title ?? "Overview"}
        </h2>
        <p className="text-slate-400 text-sm">
          {dict?.subtitle ?? "Platform stats at a glance"}
        </p>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map(({ label, value, Icon, color, bg, border }) => (
          <div
            key={label}
            className={`bg-slate-900 border ${border} rounded-2xl p-5 flex items-center gap-4`}
          >
            <div
              className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center shrink-0`}
            >
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">
                {label}
              </p>
              {loading ? (
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              ) : (
                <p className="text-2xl font-bold text-white">{value ?? "—"}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quick tips */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
        <h3 className="text-sm font-semibold text-slate-300">
          {dict?.tipsTitle ?? "Quick Tips"}
        </h3>
        <ul className="space-y-2 text-sm text-slate-400">
          <li className="flex items-start gap-2">
            <span className="text-cyan-500 mt-0.5">→</span>
            {dict?.tip1 ?? (
              <>
                Use the <span className="text-white font-medium">Users</span>{" "}
                tab to grant or revoke admin access.
              </>
            )}
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cyan-500 mt-0.5">→</span>
            {dict?.tip2 ?? (
              <>
                Use the <span className="text-white font-medium">Content</span>{" "}
                tab to edit any homepage section — all languages auto-translate
                via AI.
              </>
            )}
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cyan-500 mt-0.5">→</span>
            {dict?.tip3 ?? (
              <>
                Add{" "}
                <span className="text-white font-mono text-xs bg-slate-800 px-1.5 py-0.5 rounded">
                  OPENAI_API_KEY
                </span>{" "}
                to{" "}
                <span className="text-white font-mono text-xs bg-slate-800 px-1.5 py-0.5 rounded">
                  backend/.env
                </span>{" "}
                to enable AI translation.
              </>
            )}
          </li>
        </ul>
      </div>
    </div>
  );
}
