"use client";

import { Send, Wifi, WifiOff, MessageCircle, Languages } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useUserChat } from "@/lib/useChatSocket";
import type { DashboardDictionary } from "@/lib/content-schema";

type MessagesDict = DashboardDictionary["messages"];

function formatName(full: string): string {
  const [first, second] = full.trim().split(/\s+/);
  return second ? `${first} ${second[0]}.` : first;
}

const DEFAULT_FAQ_SUGGESTIONS = [
  "I want to build a website — where do I start?",
  "I need help choosing the right template.",
  "I already have an idea — can we discuss it?",
  "I want to see a preview before starting.",
  "I need a custom feature — is that possible?",
  "How long will it take to launch my project?",
];

interface Props {
  isActive: boolean;
  onUnreadChange?: (count: number) => void;
  lang?: string;
  dict?: MessagesDict;
}

export default function ProfileMessagesTab({
  isActive,
  onUnreadChange,
  lang = "en",
  dict,
}: Props) {
  const {
    connected,
    messages,
    send,
    unreadFromAdmin,
    clearUnread,
    translationEnabled,
    translationTargetLang,
    setTranslation,
  } = useUserChat();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevLangRef = useRef<string>(lang);

  // Sync targetLang with the backend whenever:
  // 1. The UI language changes while translation is ON (lang change)
  // 2. Translation state loads from server and targetLang doesn't match current UI lang
  useEffect(() => {
    const langChanged = lang !== prevLangRef.current;
    prevLangRef.current = lang;

    if (!translationEnabled) return;

    if (langChanged || translationTargetLang !== lang) {
      setTranslation(true, lang);
    }
  }, [lang, translationEnabled, translationTargetLang, setTranslation]);

  // Clear unread badge when the tab becomes active
  useEffect(() => {
    if (isActive) clearUnread();
  }, [isActive, clearUnread]);

  // Also clear immediately when new messages arrive and tab is already open
  useEffect(() => {
    if (isActive) clearUnread();
  }, [messages]); // eslint-disable-line react-hooks/exhaustive-deps

  // Bubble unread count up to ProfileDashboard for the tab badge
  const onUnreadChangeRef = useRef(onUnreadChange);
  onUnreadChangeRef.current = onUnreadChange;
  useEffect(() => {
    onUnreadChangeRef.current?.(unreadFromAdmin);
  }, [unreadFromAdmin]);

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || !connected) return;
    send(msg);
    setInput("");
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-1">
            {dict?.title ?? "Chat with Developer"}
          </h2>
          <p className="text-slate-400 text-sm">
            {dict?.subtitle ??
              "Send a message and we'll get back to you as soon as possible"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Translation toggle */}
          <button
            onClick={() => setTranslation(!translationEnabled, lang)}
            className={`flex flex-col gap-0.5 px-3 py-2 rounded-lg border transition-all text-left ${
              translationEnabled
                ? "bg-cyan-500/15 border-cyan-500/40 hover:bg-cyan-500/25"
                : "bg-slate-800 border-slate-700 hover:border-slate-600"
            }`}
          >
            <div
              className={`flex items-center gap-1.5 text-xs font-semibold ${
                translationEnabled ? "text-cyan-300" : "text-slate-400"
              }`}
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{dict?.translationLabel ?? "Translation"}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  translationEnabled
                    ? "bg-cyan-500/30 text-cyan-200"
                    : "bg-slate-700 text-slate-500"
                }`}
              >
                {translationEnabled ? "ON" : "OFF"}
              </span>
            </div>
            <p
              className={`text-[10px] leading-tight hidden sm:block ${
                translationEnabled ? "text-cyan-400/70" : "text-slate-500"
              }`}
            >
              {dict?.translationDesc ??
                "Auto-translate admin replies to your language"}
            </p>
          </button>
          <div
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${
              connected
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-slate-700/50 text-slate-500"
            }`}
          >
            {connected ? (
              <Wifi className="w-3 h-3" />
            ) : (
              <WifiOff className="w-3 h-3" />
            )}
            {connected
              ? (dict?.online ?? "Online")
              : (dict?.connecting ?? "Connecting…")}
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-150">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 [scrollbar-width:thin] [scrollbar-color:rgb(71_85_105)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb]:rounded-full">
          {isEmpty ? (
            /* ── Empty state with FAQ ── */
            <div className="flex flex-col items-center pt-4 pb-2">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-cyan-400" />
              </div>
              <p className="text-white font-semibold text-base mb-1">
                {dict?.emptyTitle ?? "How can we help you?"}
              </p>
              <p className="text-slate-400 text-sm text-center mb-6 max-w-xs">
                {dict?.emptySubtitle ??
                  "Choose a topic below to get started, or write your own message."}
              </p>

              {/* FAQ quick-reply chips */}
              <div className="w-full max-w-sm flex flex-col gap-2">
                {(dict?.faqSuggestions ?? DEFAULT_FAQ_SUGGESTIONS).map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    disabled={!connected}
                    className="w-full text-left px-4 py-3 rounded-xl border border-slate-700 bg-slate-800/60 hover:border-cyan-500/50 hover:bg-slate-800 text-slate-300 text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* ── Message thread ── */
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.senderRole === "user" ? "justify-start gap-2" : "justify-end gap-2"}`}
              >
                {/* Own (user) avatar — left */}
                {msg.senderRole === "user" && (
                  <div className="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center text-xs text-slate-200 font-bold shrink-0 mt-6">
                    {msg.senderName[0]?.toUpperCase() ?? "U"}
                  </div>
                )}

                <div
                  className={`flex flex-col gap-1 max-w-[75%] ${msg.senderRole === "user" ? "items-start" : "items-end"}`}
                >
                  {/* Name + role tag */}
                  <div className="flex items-center gap-1.5">
                    {msg.senderRole === "user" ? (
                      <>
                        <span className="text-[10px] bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded-full">
                          {dict?.userTag ?? "User"}
                        </span>
                        <span className="text-xs font-medium text-slate-300">
                          {formatName(msg.senderName)}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-xs font-medium text-slate-300">
                          {formatName(msg.senderName)}
                        </span>
                        <span className="text-[10px] bg-cyan-500/15 text-cyan-400 px-1.5 py-0.5 rounded-full">
                          {dict?.adminTag ?? "Admin"}
                        </span>
                        {translationEnabled && msg.translatedText && (
                          <span
                            className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.8)] shrink-0"
                            title={dict?.translationLabel ?? "Translated"}
                          />
                        )}
                      </>
                    )}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm ${
                      msg.senderRole === "user"
                        ? "bg-cyan-600 text-white rounded-bl-sm"
                        : "bg-slate-800 text-slate-200 rounded-br-sm"
                    }`}
                  >
                    {translationEnabled &&
                    msg.senderRole === "admin" &&
                    msg.translatedText
                      ? msg.translatedText
                      : msg.text}
                    <div className="text-[10px] mt-1 opacity-50">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>

                {/* Admin avatar — right */}
                {msg.senderRole === "admin" && (
                  <div className="w-6 h-6 rounded-full bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-xs text-cyan-400 font-bold shrink-0 mt-6">
                    {msg.senderName[0]?.toUpperCase() ?? "A"}
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-slate-800 px-4 py-3 flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={
              connected
                ? isEmpty
                  ? (dict?.inputPlaceholderEmpty ??
                    "Or write your own message…")
                  : (dict?.inputPlaceholderReply ?? "Reply to developer…")
                : (dict?.inputPlaceholderConnecting ?? "Connecting…")
            }
            disabled={!connected}
            className="flex-1 bg-slate-800 border border-slate-700 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-colors disabled:opacity-50"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || !connected}
            className="p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-white"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
