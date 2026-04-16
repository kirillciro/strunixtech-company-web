"use client";

import { useAuth } from "@/context/AuthContext";
import { LogOut, UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import type { DashboardDictionary } from "@/lib/content-schema";

type SettingsDict = DashboardDictionary["settings"];

export default function ProfileSettingsTab({ dict }: { dict?: SettingsDict }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.replace("/");
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h2 className="text-xl font-semibold mb-1">
          {dict?.title ?? "Settings"}
        </h2>
        <p className="text-slate-400 text-sm">
          {dict?.subtitle ?? "Manage your account preferences"}
        </p>
      </div>

      {/* Profile card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center gap-5">
        <div className="w-14 h-14 rounded-full bg-linear-to-br from-cyan-500/30 to-blue-600/30 flex items-center justify-center text-2xl font-bold text-cyan-300 shrink-0">
          {user?.fullName?.[0]?.toUpperCase() ?? <UserCircle />}
        </div>
        <div>
          <p className="text-white font-semibold text-lg leading-tight">
            {user?.fullName}
          </p>
          <p className="text-slate-400 text-sm mt-0.5">{user?.email}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                user?.isVerified
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-amber-500/15 text-amber-400"
              }`}
            >
              {user?.isVerified
                ? (dict?.verified ?? "Verified")
                : (dict?.notVerified ?? "Not verified")}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-700/60 text-slate-400 capitalize">
              {user?.provider}
            </span>
          </div>
        </div>
      </div>

      {/* Account info rows */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl divide-y divide-slate-800">
        {[
          { label: dict?.fieldFullName ?? "Full name", value: user?.fullName },
          { label: dict?.fieldEmail ?? "Email address", value: user?.email },
          {
            label: dict?.fieldSignIn ?? "Sign-in method",
            value: user?.provider,
            className: "capitalize",
          },
          {
            label: dict?.fieldMemberSince ?? "Member since",
            value: user?.createdAt
              ? new Date(user.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "—",
          },
        ].map(({ label, value, className }) => (
          <div
            key={label}
            className="flex items-center justify-between px-5 py-3.5"
          >
            <span className="text-xs text-slate-500 uppercase tracking-wider">
              {label}
            </span>
            <span className={`text-sm text-slate-300 ${className ?? ""}`}>
              {value ?? "—"}
            </span>
          </div>
        ))}
      </div>

      {/* Danger zone */}
      <div className="bg-slate-900 border border-red-900/30 rounded-2xl p-5">
        <p className="text-sm font-semibold text-white mb-1">
          {dict?.signOutTitle ?? "Sign out"}
        </p>
        <p className="text-xs text-slate-500 mb-4">
          {dict?.signOutSubtitle ?? "You will be redirected to the homepage."}
        </p>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-600/15 hover:bg-red-600/25 text-red-400 text-sm font-medium rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          {dict?.signOutButton ?? "Sign out"}
        </button>
      </div>
    </div>
  );
}
