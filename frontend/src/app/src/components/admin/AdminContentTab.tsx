"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Save,
  Languages,
  Loader2,
  Check,
  ChevronDown,
  RefreshCw,
} from "lucide-react";
import { getAccessToken } from "@/lib/auth-client";
import type { AdminDictionary } from "@/lib/content-schema";

const CONTENT_KEY = "marketing-homepage";

type Leaf = { path: string; value: string };
type Status =
  | "idle"
  | "loading"
  | "ready"
  | "saving"
  | "translating"
  | "retranslating"
  | "done"
  | "error";

function apiBase() {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
}

function flattenLeaves(obj: unknown, prefix = ""): Leaf[] {
  if (typeof obj === "string") {
    return prefix ? [{ path: prefix, value: obj }] : [];
  }
  if (Array.isArray(obj)) {
    return obj.flatMap((item, i) =>
      flattenLeaves(item, prefix ? `${prefix}.${i}` : String(i)),
    );
  }
  if (obj && typeof obj === "object") {
    return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
      flattenLeaves(v, prefix ? `${prefix}.${k}` : k),
    );
  }
  return [];
}

function setAtPath(node: unknown, parts: string[], value: string): unknown {
  const [head, ...tail] = parts;
  if (Array.isArray(node)) {
    const idx = Number(head);
    const arr = [...node];
    arr[idx] = tail.length === 0 ? value : setAtPath(arr[idx], tail, value);
    return arr;
  }
  const obj = {
    ...(node && typeof node === "object"
      ? (node as Record<string, unknown>)
      : {}),
  };
  if (tail.length === 0) {
    obj[head] = value;
  } else {
    const nextIsIndex = /^\d+$/.test(tail[0]);
    const child = obj[head];
    const nextNode = nextIsIndex
      ? Array.isArray(child)
        ? child
        : []
      : child && typeof child === "object" && !Array.isArray(child)
        ? child
        : {};
    obj[head] = setAtPath(nextNode, tail, value);
  }
  return obj;
}

function humanizeKey(path: string) {
  return path
    .split(".")
    .map((p) =>
      /^\d+$/.test(p)
        ? `[${Number(p) + 1}]`
        : p
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (c) => c.toUpperCase())
            .trim(),
    )
    .join(" › ");
}

interface AdminContentTabProps {
  dict?: AdminDictionary["content"];
}

export default function AdminContentTab({ dict }: AdminContentTabProps) {
  const SECTIONS = [
    { key: "hero", label: dict?.sectionHero ?? "Hero" },
    {
      key: "positioning",
      label: dict?.sectionPositioning ?? "Positioning Strip",
    },
    { key: "howItWorks", label: dict?.sectionHowItWorks ?? "How It Works" },
    { key: "templates", label: dict?.sectionTemplates ?? "Templates Showcase" },
    { key: "coreOffer", label: dict?.sectionCoreOffer ?? "Core Offer" },
    { key: "services", label: dict?.sectionServices ?? "Services" },
    { key: "whyChooseUs", label: dict?.sectionWhyChooseUs ?? "Why Choose Us" },
    { key: "cta", label: dict?.sectionCta ?? "Call to Action" },
    { key: "footer", label: dict?.sectionFooter ?? "Footer" },
  ];
  const [sectionKey, setSectionKey] = useState(SECTIONS[0].key);
  const [leaves, setLeaves] = useState<Leaf[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const loadSection = useCallback(async (key: string) => {
    setStatus("loading");
    setErrorMsg("");
    setLeaves([]);
    try {
      const r = await fetch(`/api/content/defaults?lang=en`, {
        cache: "no-store",
      });
      if (!r.ok) throw new Error("Could not load content");
      const body = (await r.json()) as { content?: Record<string, unknown> };
      const section = body.content?.[key] ?? {};
      setLeaves(flattenLeaves(section));
      setStatus("ready");
    } catch {
      setErrorMsg("Failed to load content. Is the backend running?");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    loadSection(SECTIONS[0].key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSectionChange(key: string) {
    setSectionKey(key);
    loadSection(key);
  }

  async function handleSave() {
    const token = getAccessToken();
    if (!token) {
      setErrorMsg("Not authenticated.");
      setStatus("error");
      return;
    }
    setStatus("saving");
    setErrorMsg("");
    try {
      let rebuilt: unknown = {};
      for (const { path, value } of leaves) {
        rebuilt = setAtPath(rebuilt, path.split("."), value);
      }
      const r = await fetch(
        `${apiBase()}/admin/content/${CONTENT_KEY}/section`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ sectionKey, data: rebuilt }),
        },
      );
      if (!r.ok) {
        const b = (await r.json()) as { message?: string };
        throw new Error(b.message ?? "Save failed");
      }
      setStatus("translating");
      setTimeout(() => setStatus("done"), 2500);
      setTimeout(() => setStatus("ready"), 5000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Unknown error");
      setStatus("error");
    }
  }

  const isBusy =
    status === "saving" ||
    status === "translating" ||
    status === "loading" ||
    status === "retranslating";

  async function handleRetranslate() {
    const token = getAccessToken();
    if (!token) {
      setErrorMsg("Not authenticated.");
      setStatus("error");
      return;
    }
    setStatus("retranslating");
    setErrorMsg("");
    try {
      const r = await fetch(
        `${apiBase()}/admin/content/${CONTENT_KEY}/retranslate`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!r.ok) {
        const b = (await r.json()) as { message?: string };
        throw new Error(b.message ?? "Retranslate failed");
      }
      setTimeout(() => setStatus("done"), 2500);
      setTimeout(() => setStatus("ready"), 5000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Unknown error");
      setStatus("error");
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold mb-1">
          {dict?.title ?? "Content Editor"}
        </h2>
        <p className="text-slate-400 text-sm">
          {dict?.subtitle ??
            "Edit English source — all languages auto-translate via AI"}
        </p>
      </div>

      {/* Section selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-400 shrink-0">
          {dict?.sectionLabel ?? "Section:"}
        </span>
        <div className="relative">
          <select
            value={sectionKey}
            onChange={(e) => handleSectionChange(e.target.value)}
            disabled={isBusy}
            className="pl-3 pr-8 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white appearance-none focus:outline-none focus:border-cyan-500 disabled:opacity-50 cursor-pointer transition-colors"
          >
            {SECTIONS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Fields */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {status === "loading" && (
          <div className="flex items-center justify-center gap-3 py-16 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">{dict?.loading ?? "Loading…"}</span>
          </div>
        )}
        {status === "error" && leaves.length === 0 && (
          <div className="py-16 text-center text-red-400 text-sm">
            {errorMsg}
          </div>
        )}
        {status !== "loading" &&
          !(status === "error" && leaves.length === 0) &&
          leaves.map(({ path, value }) => (
            <div
              key={path}
              className="px-5 py-4 border-b border-slate-800/60 last:border-0"
            >
              <label className="block text-slate-500 text-[10px] uppercase tracking-widest mb-1.5 font-mono">
                {humanizeKey(path)}
              </label>
              {value.length > 90 ? (
                <textarea
                  value={value}
                  onChange={(e) =>
                    setLeaves((prev) =>
                      prev.map((l) =>
                        l.path === path ? { ...l, value: e.target.value } : l,
                      ),
                    )
                  }
                  disabled={isBusy}
                  rows={3}
                  className="w-full bg-slate-800 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 text-white text-sm rounded-lg px-3 py-2 outline-none resize-y transition-colors disabled:opacity-50"
                />
              ) : (
                <input
                  type="text"
                  value={value}
                  onChange={(e) =>
                    setLeaves((prev) =>
                      prev.map((l) =>
                        l.path === path ? { ...l, value: e.target.value } : l,
                      ),
                    )
                  }
                  disabled={isBusy}
                  className="w-full bg-slate-800 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 text-white text-sm rounded-lg px-3 py-2 outline-none transition-colors disabled:opacity-50"
                />
              )}
            </div>
          ))}
      </div>

      {/* Footer bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="text-sm min-h-5">
          {status === "error" && errorMsg && (
            <span className="text-red-400">{errorMsg}</span>
          )}
          {status === "saving" && (
            <div className="flex items-center gap-2 text-slate-300">
              <Loader2 className="w-4 h-4 animate-spin" />
              {dict?.saving ?? "Saving…"}
            </div>
          )}
          {status === "translating" && (
            <div className="flex items-center gap-2 text-cyan-400">
              <Languages className="w-4 h-4 animate-pulse" />
              {dict?.translating ?? "Saved! AI translating all 17 languages…"}
            </div>
          )}
          {status === "retranslating" && (
            <div className="flex items-center gap-2 text-cyan-400">
              <RefreshCw className="w-4 h-4 animate-spin" />
              {dict?.retranslating ?? "Retranslating all 17 languages…"}
            </div>
          )}
          {status === "done" && (
            <div className="flex items-center gap-2 text-emerald-400">
              <Check className="w-4 h-4" />
              {dict?.allUpdated ?? "All languages updated!"}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRetranslate}
            disabled={isBusy}
            title="Re-run AI translation for all languages without saving"
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            {dict?.retranslate ?? "Retranslate All"}
          </button>
          <button
            onClick={handleSave}
            disabled={isBusy || leaves.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Save className="w-4 h-4" />
            {dict?.save ?? "Save & Translate"}
          </button>
        </div>
      </div>
    </div>
  );
}
