"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, ShieldCheck, Loader2, Trash2 } from "lucide-react";
import { getAccessToken, type AuthUser } from "@/lib/auth-client";
import type { AdminDictionary } from "@/lib/content-schema";

function apiBase() {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
}

interface AdminUsersTabProps {
  dict?: AdminDictionary["users"];
}

export default function AdminUsersTab({ dict }: AdminUsersTabProps) {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const load = useCallback(async (q = "") => {
    setLoading(true);
    const token = getAccessToken();
    try {
      const r = await fetch(
        `${apiBase()}/admin/users?search=${encodeURIComponent(q)}`,
        { headers: { Authorization: `Bearer ${token ?? ""}` } },
      );
      const data = (await r.json()) as { users?: AuthUser[] };
      setUsers(data.users ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function deleteUser(id: number) {
    setDeletingId(id);
    setConfirmDeleteId(null);
    const token = getAccessToken();
    try {
      await fetch(`${apiBase()}/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token ?? ""}` },
      });
      setUsers((prev) => prev.filter((x) => x.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  async function toggleRole(u: AuthUser) {
    const newRole = u.role === "admin" ? "user" : "admin";
    setUpdatingId(u.id);
    const token = getAccessToken();
    try {
      await fetch(`${apiBase()}/admin/users/${u.id}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token ?? ""}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      setUsers((prev) =>
        prev.map((x) => (x.id === u.id ? { ...x, role: newRole } : x)),
      );
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold mb-1">Users</h2>
          <p className="text-slate-400 text-sm">
            {users.length} registered user{users.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder={
              dict?.searchPlaceholder ?? "Search name or email\u2026"
            }
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              load(e.target.value);
            }}
            className="pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-64 transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-16 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">{dict?.loading ?? "Loading users…"}</span>
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm">
            {dict?.noUsers ?? "No users found"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 text-[10px] uppercase tracking-wider">
                  <th className="text-left px-5 py-3">
                    {dict?.colUser ?? "User"}
                  </th>
                  <th className="text-left px-5 py-3 hidden md:table-cell">
                    {dict?.colProvider ?? "Provider"}
                  </th>
                  <th className="text-left px-5 py-3 hidden sm:table-cell">
                    {dict?.colStatus ?? "Status"}
                  </th>
                  <th className="text-left px-5 py-3">
                    {dict?.colRole ?? "Role"}
                  </th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-t border-slate-800/60 hover:bg-slate-800/20 transition-colors"
                  >
                    {/* User info */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-linear-to-br from-cyan-500/30 to-blue-600/30 flex items-center justify-center text-xs font-bold text-cyan-300 shrink-0">
                          {u.fullName?.[0]?.toUpperCase() ?? "?"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-medium truncate max-w-40">
                            {u.fullName}
                          </p>
                          <p className="text-slate-400 text-xs truncate max-w-40">
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    {/* Provider */}
                    <td className="px-5 py-3.5 text-slate-400 capitalize hidden md:table-cell">
                      {u.provider}
                    </td>
                    {/* Verified */}
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                          u.isVerified
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-amber-500/15 text-amber-400"
                        }`}
                      >
                        {u.isVerified
                          ? (dict?.verified ?? "Verified")
                          : (dict?.pending ?? "Pending")}
                      </span>
                    </td>
                    {/* Role */}
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${
                          u.role === "admin"
                            ? "bg-cyan-500/15 text-cyan-400"
                            : "bg-slate-700/60 text-slate-400"
                        }`}
                      >
                        {u.role === "admin" && (
                          <ShieldCheck className="w-3 h-3" />
                        )}
                        {u.role}
                      </span>
                    </td>
                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        {/* Role toggle */}
                        <button
                          onClick={() => toggleRole(u)}
                          disabled={updatingId === u.id || deletingId === u.id}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-40 ${
                            u.role === "admin"
                              ? "bg-slate-800 hover:bg-slate-700 text-slate-300"
                              : "bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400"
                          }`}
                        >
                          {updatingId === u.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : u.role === "admin" ? (
                            (dict?.removeAdmin ?? "Remove Admin")
                          ) : (
                            (dict?.makeAdmin ?? "Make Admin")
                          )}
                        </button>

                        {/* Delete */}
                        {confirmDeleteId === u.id ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-slate-400">
                              {dict?.confirmSure ?? "Sure?"}
                            </span>
                            <button
                              onClick={() => deleteUser(u.id)}
                              disabled={deletingId === u.id}
                              className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 transition-colors disabled:opacity-40"
                            >
                              {deletingId === u.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                (dict?.delete ?? "Delete")
                              )}
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors"
                            >
                              {dict?.cancel ?? "Cancel"}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(u.id)}
                            disabled={
                              updatingId === u.id || deletingId === u.id
                            }
                            className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-40"
                            title="Delete user"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
