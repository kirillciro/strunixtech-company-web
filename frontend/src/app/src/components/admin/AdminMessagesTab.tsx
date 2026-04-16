"use client";

import {
  Send,
  Bell,
  MessageCircle,
  Wifi,
  WifiOff,
  Search,
  Languages,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAdminChat, type ChatUser } from "@/lib/useChatSocket";
import type { AdminDictionary } from "@/lib/content-schema";

function formatName(full: string): string {
  const [first, second] = full.trim().split(/\s+/);
  return second ? `${first} ${second[0]}.` : first;
}

interface AdminMessagesTabProps {
  dict?: AdminDictionary["messages"];
  lang?: string;
}

export default function AdminMessagesTab({
  dict,
  lang = "en",
}: AdminMessagesTabProps) {
  const {
    connected,
    userList,
    unreadCounts,
    messages,
    selectedUserId,
    selectUser,
    send,
    totalUnread,
    translationEnabled,
    setTranslation,
    deleteConversation,
  } = useAdminChat();

  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [prevSelectedUserId, setPrevSelectedUserId] = useState<number | null>(
    null,
  );
  const prevLangRef = useRef<string>(lang);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Reset input when switching users (React "derived state" pattern)
  if (prevSelectedUserId !== selectedUserId) {
    setPrevSelectedUserId(selectedUserId);
    setInput("");
  }

  // Auto-scroll when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // When the admin's UI language changes while translation is ON for the selected
  // conversation, re-sync the target language with the backend.
  useEffect(() => {
    const langChanged = lang !== prevLangRef.current;
    prevLangRef.current = lang;
    if (!langChanged || !translationEnabled || !selectedUserId) return;
    setTranslation(selectedUserId, true, lang);
  }, [lang, translationEnabled, selectedUserId, setTranslation]);

  function handleSend() {
    const text = input.trim();
    if (!text || !connected || !selectedUserId) return;
    send(text);
    setInput("");
  }

  const filtered = userList.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  const selectedUser = userList.find((u) => u.id === selectedUserId);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-1 flex items-center gap-2">
            {dict?.title ?? "Messages"}
            {totalUnread > 0 && (
              <span className="inline-flex items-center gap-1 text-xs bg-cyan-500/15 text-cyan-400 px-2 py-0.5 rounded-full font-medium">
                <Bell className="w-3 h-3" />
                {totalUnread} {dict?.newBadge ?? "new"}
              </span>
            )}
          </h2>
          <p className="text-slate-400 text-sm">
            {dict?.subtitle ?? "Live chat with users"}
          </p>
        </div>
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
            ? (dict?.live ?? "Live")
            : (dict?.connecting ?? "Connecting…")}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex h-150">
        {/* ── Left: user list ── */}
        <div className="w-72 shrink-0 border-r border-slate-800 flex flex-col">
          {/* Search */}
          <div className="p-3 border-b border-slate-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={dict?.searchPlaceholder ?? "Search users…"}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          {/* Users */}
          <div className="flex-1 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:rgb(71_85_105)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb]:rounded-full">
            {filtered.length === 0 && (
              <div className="p-4 text-center text-slate-500 text-xs mt-4">
                {userList.length === 0
                  ? (dict?.noConversations ?? "No conversations yet")
                  : (dict?.noUsersMatch ?? "No users match your search")}
              </div>
            )}
            {filtered.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                unread={unreadCounts[user.id] ?? 0}
                selected={selectedUserId === user.id}
                onClick={() => selectUser(user.id)}
                onDelete={() => setConfirmDeleteId(user.id)}
                confirmingDelete={confirmDeleteId === user.id}
                onConfirmDelete={() => {
                  deleteConversation(user.id);
                  setConfirmDeleteId(null);
                }}
                onCancelDelete={() => setConfirmDeleteId(null)}
                deleteLabel={dict?.deleteConversation}
                deleteConfirmLabel={dict?.deleteConfirm}
                deleteCancelLabel={dict?.deleteCancel}
              />
            ))}
          </div>
        </div>

        {/* ── Right: chat area ── */}
        <div className="flex-1 flex flex-col min-w-0">
          {!selectedUserId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-3">
              <MessageCircle className="w-10 h-10 opacity-30" />
              <p className="text-sm">
                {dict?.selectConversation ?? "Select a conversation"}
              </p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="px-5 py-3 border-b border-slate-800 flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-semibold text-white shrink-0">
                  {selectedUser?.fullName?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">
                    {selectedUser?.fullName}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {selectedUser?.email}
                  </p>
                </div>
                {/* Translation toggle */}
                <button
                  onClick={() =>
                    setTranslation(selectedUserId!, !translationEnabled, lang)
                  }
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
                    className={`text-[10px] leading-tight ${
                      translationEnabled ? "text-cyan-400/70" : "text-slate-500"
                    }`}
                  >
                    {dict?.translationDesc ??
                      "Auto-translate user messages to your language"}
                  </p>
                </button>
                {/* Delete conversation */}
                {confirmDeleteId === selectedUserId ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-red-400 font-semibold">
                      {dict?.deleteConfirm ?? "Delete?"}
                    </span>
                    <button
                      onClick={() => {
                        deleteConversation(selectedUserId!);
                        setConfirmDeleteId(null);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-colors"
                    >
                      {dict?.deleteConversation ?? "Delete"}
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-semibold transition-colors"
                    >
                      {dict?.deleteCancel ?? "Cancel"}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(selectedUserId!)}
                    title={dict?.deleteConversation ?? "Delete conversation"}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3 [scrollbar-width:thin] [scrollbar-color:rgb(71_85_105)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb]:rounded-full">
                {messages.length === 0 && (
                  <p className="text-slate-500 text-sm text-center mt-8">
                    {dict?.noMessages ??
                      "No messages yet in this conversation."}
                  </p>
                )}
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderRole === "admin" ? "justify-start gap-2" : "justify-end gap-2"}`}
                  >
                    {/* Own (admin) avatar — left */}
                    {msg.senderRole === "admin" && (
                      <div className="w-6 h-6 rounded-full bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-xs text-cyan-400 font-bold shrink-0 mt-6">
                        {msg.senderName[0]?.toUpperCase() ?? "A"}
                      </div>
                    )}

                    <div
                      className={`flex flex-col gap-1 max-w-[75%] ${msg.senderRole === "admin" ? "items-start" : "items-end"}`}
                    >
                      {/* Name + role tag */}
                      <div className="flex items-center gap-1.5">
                        {msg.senderRole === "admin" ? (
                          <>
                            <span className="text-[10px] bg-cyan-500/15 text-cyan-400 px-1.5 py-0.5 rounded-full">
                              {dict?.adminTag ?? "Admin"}
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
                            <span className="text-[10px] bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded-full">
                              {dict?.userTag ?? "User"}
                            </span>
                            {translationEnabled &&
                              msg.senderRole === "user" &&
                              msg.translatedText && (
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
                          msg.senderRole === "admin"
                            ? "bg-cyan-600 text-white rounded-bl-sm"
                            : "bg-slate-800 text-slate-200 rounded-br-sm"
                        }`}
                      >
                        {translationEnabled &&
                        msg.senderRole === "user" &&
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

                    {/* User avatar — right */}
                    {msg.senderRole === "user" && (
                      <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white shrink-0 mt-6">
                        {msg.senderName[0]?.toUpperCase() ?? "U"}
                      </div>
                    )}
                  </div>
                ))}
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
                      ? `Reply to ${selectedUser?.fullName ?? "user"}…`
                      : (dict?.connecting ?? "Connecting…")
                  }
                  disabled={!connected}
                  className="flex-1 bg-slate-800 border border-slate-700 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-colors disabled:opacity-50"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || !connected}
                  className="p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-white"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── User row sub-component ─────────────────────────────────────────────────

function UserRow({
  user,
  unread,
  selected,
  onClick,
  onDelete,
  confirmingDelete,
  onConfirmDelete,
  onCancelDelete,
  deleteLabel,
  deleteConfirmLabel,
  deleteCancelLabel,
}: {
  user: ChatUser;
  unread: number;
  selected: boolean;
  onClick: () => void;
  onDelete: () => void;
  confirmingDelete: boolean;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
  deleteLabel?: string;
  deleteConfirmLabel?: string;
  deleteCancelLabel?: string;
}) {
  return (
    <div
      className={`group relative flex items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-800/60 cursor-pointer ${
        selected ? "bg-slate-800 border-r-2 border-cyan-500" : ""
      }`}
      onClick={onClick}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-semibold text-white">
          {user.fullName[0]?.toUpperCase() ?? "?"}
        </div>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-500 flex items-center justify-center text-[9px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1">
          <p
            className={`text-sm truncate ${unread > 0 ? "font-semibold text-white" : "font-medium text-slate-300"}`}
          >
            {user.fullName}
          </p>
          {user.lastMessageAt && (
            <span className="text-[10px] text-slate-600 shrink-0">
              {new Date(user.lastMessageAt).toLocaleDateString([], {
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 truncate mt-0.5">
          {user.lastMessage || user.email}
        </p>
      </div>

      {/* Delete button — visible on hover or while confirming */}
      {confirmingDelete ? (
        <div
          className="absolute inset-0 flex items-center justify-center gap-2 bg-slate-900/95 px-3"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-xs text-red-400 font-semibold shrink-0">
            {deleteConfirmLabel ?? "Delete?"}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onConfirmDelete();
            }}
            className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-colors"
          >
            {deleteLabel ?? "Delete"}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCancelDelete();
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-semibold transition-colors"
          >
            {deleteCancelLabel ?? "Cancel"}
          </button>
        </div>
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          title={deleteLabel ?? "Delete conversation"}
          className="shrink-0 p-1 rounded text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
