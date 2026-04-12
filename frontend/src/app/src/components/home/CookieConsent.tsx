"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { useState } from "react";
import { useSyncExternalStore } from "react";
import { Cookie, ShieldCheck, SlidersHorizontal } from "lucide-react";

const COOKIE_KEY = "cp_cookie_consent_v2";

type ConsentPreferences = {
  functional: true;
  preferences: boolean;
  statistics: boolean;
  marketing: boolean;
  consent: "accepted" | "denied" | "custom";
  updatedAt: string;
};

function subscribeCookieConsent(callback: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("cookie-consent:changed", callback as EventListener);
  return () => {
    window.removeEventListener(
      "cookie-consent:changed",
      callback as EventListener,
    );
  };
}

function getCookieConsentSnapshot(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return !localStorage.getItem(COOKIE_KEY);
}

function persistConsent(value: ConsentPreferences): void {
  localStorage.setItem(COOKIE_KEY, JSON.stringify(value));
  window.dispatchEvent(new Event("cookie-consent:changed"));
}

export default function CookieConsent() {
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    functional: true,
    preferences: true,
    statistics: true,
    marketing: true,
  });

  const visible = useSyncExternalStore(
    subscribeCookieConsent,
    getCookieConsentSnapshot,
    () => false,
  );

  const acceptAll = () => {
    persistConsent({
      functional: true,
      preferences: true,
      statistics: true,
      marketing: true,
      consent: "accepted",
      updatedAt: new Date().toISOString(),
    });
  };

  const denyOptional = () => {
    persistConsent({
      functional: true,
      preferences: false,
      statistics: false,
      marketing: false,
      consent: "denied",
      updatedAt: new Date().toISOString(),
    });
  };

  const savePreferences = () => {
    persistConsent({
      functional: true,
      preferences: preferences.preferences,
      statistics: preferences.statistics,
      marketing: preferences.marketing,
      consent: "custom",
      updatedAt: new Date().toISOString(),
    });
  };

  if (!visible) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-80 grid place-items-center p-4">
      <div className="absolute inset-0 bg-slate-950/85" />
      <div className="relative w-full max-w-2xl rounded-2xl border border-cyan-400/25 bg-slate-900/95 p-6 animate-slideInRight">
        <div className="flex items-start gap-3">
          <div className="rounded-xl border border-cyan-300/30 bg-cyan-400/10 p-2">
            <Cookie className="h-5 w-5 text-cyan-300" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Manage Cookie Consent
            </h3>
            <p className="mt-2 text-sm text-slate-300">
              To provide the best experiences, we use technologies like cookies
              to store and/or access device information. Consenting to these
              technologies will allow us to process data such as browsing
              behavior or unique IDs on this site. Not consenting or withdrawing
              consent may adversely affect certain features and functions.
            </p>
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="h-4 w-4 text-cyan-300" />
              Functional cookies are always active.
            </div>
          </div>
        </div>

        {showPreferences && (
          <div className="mt-5 rounded-xl border border-slate-700 bg-slate-950/50 p-4">
            <p className="text-sm text-slate-300 mb-4">
              To provide the best experiences, we use technologies like cookies
              to store and/or access device information. Consenting to these
              technologies will allow us to process data such as browsing
              behavior or unique IDs on this site. Not consenting or withdrawing
              consent may adversely affect certain features and functions.
            </p>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-lg border border-slate-700 px-3 py-2">
                <div>
                  <p className="text-white font-medium">Functional</p>
                  <p className="text-xs text-slate-400">Always active</p>
                </div>
                <span className="text-xs rounded-full bg-cyan-500/20 px-2 py-1 text-cyan-200">
                  Always active
                </span>
              </div>

              {[
                { key: "preferences", label: "Preferences" },
                { key: "statistics", label: "Statistics" },
                { key: "marketing", label: "Marketing" },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center justify-between rounded-lg border border-slate-700 px-3 py-2 cursor-pointer"
                >
                  <span className="text-white">{item.label}</span>
                  <input
                    type="checkbox"
                    checked={
                      preferences[
                        item.key as "preferences" | "statistics" | "marketing"
                      ]
                    }
                    onChange={(event) =>
                      setPreferences((prev) => ({
                        ...prev,
                        [item.key]: event.target.checked,
                      }))
                    }
                    className="h-4 w-4 accent-cyan-400"
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            onClick={acceptAll}
            className="rounded-lg bg-linear-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:from-cyan-400 hover:to-blue-500"
          >
            Accept
          </button>
          <button
            onClick={denyOptional}
            className="rounded-lg border border-slate-600 px-5 py-2.5 text-sm font-medium text-slate-200 transition hover:border-slate-400 hover:bg-slate-800"
          >
            Deny
          </button>
          <button
            onClick={() => setShowPreferences((prev) => !prev)}
            className="rounded-lg border border-cyan-400/50 px-5 py-2.5 text-sm font-medium text-cyan-200 transition hover:bg-cyan-500/10 inline-flex items-center gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Preferences
          </button>

          {showPreferences && (
            <button
              onClick={savePreferences}
              className="rounded-lg border border-emerald-400/50 px-5 py-2.5 text-sm font-medium text-emerald-200 transition hover:bg-emerald-500/10"
            >
              Save Preferences
            </button>
          )}
        </div>

        <div className="mt-4 flex items-center gap-4 text-xs">
          <Link
            href="/cookie-policy"
            className="text-cyan-300 hover:text-cyan-200 underline underline-offset-2"
          >
            Cookie Policy
          </Link>
          <Link
            href="/privacy-policy"
            className="text-cyan-300 hover:text-cyan-200 underline underline-offset-2"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>,
    document.body,
  );
}
