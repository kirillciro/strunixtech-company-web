"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, type Socket } from "socket.io-client";
import { getAccessToken } from "@/lib/auth-client";

export interface ChatMessage {
  id: number;
  userId: number;
  senderRole: "user" | "admin";
  senderName: string;
  text: string;
  translatedText: string | null;
  createdAt: string;
}

export interface ChatUser {
  id: number;
  fullName: string;
  email: string;
  lastMessage: string;
  lastMessageAt: string | null;
  unreadCount: number;
}

function getSocketOrigin(): string {
  // http://localhost is always a secure context in browsers (MDN spec),
  // so connecting from https://localhost:3000 → http://localhost:4000 is allowed.
  // This is simpler and more reliable than proxying through Next.js.
  return process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:4000";
}

// ── Shared admin socket singleton ──────────────────────────────────────────
// All admin hooks share ONE socket connection so we don't create duplicates.

type AdminSocketListener = {
  onUserList?: (list: ChatUser[]) => void;
  onUnreadCounts?: (counts: Record<number, number>) => void;
  onHistory?: (msgs: ChatMessage[]) => void;
  onMessage?: (msg: ChatMessage) => void;
  onTranslationState?: (state: { userId: number; enabled: boolean }) => void;
  onConversationDeleted?: (data: { userId: number }) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
};

let adminSocket: Socket | null = null;
let adminRefCount = 0;
let adminIsAuthenticated = false;
let adminCachedUserList: ChatUser[] = [];
let adminCachedUnreadCounts: Record<number, number> = {};
const adminListeners = new Set<AdminSocketListener>();

function emitToListeners(event: keyof AdminSocketListener, payload: unknown) {
  for (const l of adminListeners) {
    (l[event] as ((p: unknown) => void) | undefined)?.(payload);
  }
}

function connectAdminSocket() {
  // If socket exists AND is either connected or still connecting, don't recreate.
  if (adminSocket && (adminSocket.connected || adminSocket.active)) {
    return adminSocket;
  }

  // Clean up a broken/disconnected stale socket before recreating.
  if (adminSocket && !adminSocket.connected && !adminSocket.active) {
    adminSocket.disconnect();
    adminSocket = null;
    adminIsAuthenticated = false;
  }

  if (adminSocket) return adminSocket;

  const token = getAccessToken();
  if (!token) return null;

  adminSocket = io(getSocketOrigin(), {
    // polling-only: Next.js rewrites proxy HTTP but not WebSocket upgrades.
    // socket.io will automatically upgrade to WebSocket in production
    // when running behind Nginx or another WS-capable reverse proxy.
    transports: ["polling"],
    autoConnect: true,
  });

  adminSocket.on("connect", () => {
    adminSocket!.emit("authenticate", getAccessToken());
  });

  adminSocket.on("authenticated", () => {
    adminIsAuthenticated = true;
    emitToListeners("onConnected", undefined);
  });

  adminSocket.on("chat:user_list", (list: ChatUser[]) => {
    adminCachedUserList = list;
    emitToListeners("onUserList", list);
  });

  adminSocket.on("chat:unread_counts", (counts: Record<number, number>) => {
    adminCachedUnreadCounts = counts;
    emitToListeners("onUnreadCounts", counts);
  });

  adminSocket.on("chat:history", (msgs: ChatMessage[]) => {
    emitToListeners("onHistory", msgs);
  });

  adminSocket.on("chat:message", (msg: ChatMessage) => {
    emitToListeners("onMessage", msg);
  });

  adminSocket.on(
    "chat:translation_state",
    (state: { userId: number; enabled: boolean }) => {
      emitToListeners("onTranslationState", state);
    },
  );

  adminSocket.on("chat:conversation_deleted", (data: { userId: number }) => {
    emitToListeners("onConversationDeleted", data);
  });

  adminSocket.on("disconnect", () => {
    adminIsAuthenticated = false;
    emitToListeners("onDisconnected", undefined);
  });

  adminSocket.on("connect_error", () => {
    // Let the socket fully settle before the retry loop recreates it.
    adminIsAuthenticated = false;
  });

  adminSocket.on("auth_error", () => {
    adminIsAuthenticated = false;
    adminSocket?.disconnect();
    adminSocket = null;
  });

  return adminSocket;
}

function registerAdminListener(listener: AdminSocketListener) {
  adminRefCount++;
  adminListeners.add(listener);

  // If already authenticated, deliver cached state immediately so late-
  // registering hooks (e.g. AdminMessagesTab mounted after the socket was
  // already connected by useAdminUnreadCount) don't miss the initial events.
  if (adminIsAuthenticated) {
    listener.onConnected?.();
    if (adminCachedUserList.length > 0)
      listener.onUserList?.(adminCachedUserList);
    if (Object.keys(adminCachedUnreadCounts).length > 0)
      listener.onUnreadCounts?.(adminCachedUnreadCounts);
  }

  // Attempt connection now (token may not have been ready on first call).
  connectAdminSocket();

  // Keep retrying until the socket is fully authenticated.
  const retryInterval = setInterval(() => {
    if (adminIsAuthenticated) {
      clearInterval(retryInterval);
    } else {
      connectAdminSocket();
    }
  }, 1000);

  return () => {
    clearInterval(retryInterval);
    adminListeners.delete(listener);
    adminRefCount--;
    if (adminRefCount <= 0) {
      adminSocket?.disconnect();
      adminSocket = null;
      adminIsAuthenticated = false;
      adminCachedUserList = [];
      adminCachedUnreadCounts = {};
      adminRefCount = 0;
    }
  };
}

// ── Lightweight unread-count-only hook (for tab badge) ─────────────────────

export function useAdminUnreadCount(): number {
  const [totalUnread, setTotalUnread] = useState(0);

  useEffect(() => {
    return registerAdminListener({
      onUnreadCounts: (counts) => {
        const total = Object.values(counts as Record<number, number>).reduce(
          (a, b) => a + b,
          0,
        );
        setTotalUnread(total);
      },
    });
  }, []);

  return totalUnread;
}

// ── Full admin chat hook ───────────────────────────────────────────────────

export function useAdminChat() {
  const [connected, setConnected] = useState(false);
  const [userList, setUserList] = useState<ChatUser[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<number, number>>({});
  const [messagesByUser, setMessagesByUser] = useState<
    Record<number, ChatMessage[]>
  >({});
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [translationEnabledByUser, setTranslationEnabledByUser] = useState<
    Record<number, boolean>
  >({});
  const selectedUserIdRef = useRef<number | null>(null);

  useEffect(() => {
    return registerAdminListener({
      onConnected: () => setConnected(true),
      onDisconnected: () => setConnected(false),
      onUserList: (list) => setUserList(list as ChatUser[]),
      onUnreadCounts: (counts) =>
        setUnreadCounts(counts as Record<number, number>),
      onHistory: (msgs) => {
        const arr = msgs as ChatMessage[];
        const uid = arr[0]?.userId;
        if (uid === undefined) return;
        setMessagesByUser((prev) => {
          const existing = prev[uid] ?? [];
          // Merge: history may arrive after real-time messages — keep all,
          // deduplicate by id, then sort chronologically.
          const combined = [...arr];
          for (const m of existing) {
            if (!combined.some((x) => x.id === m.id)) combined.push(m);
          }
          combined.sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          );
          return { ...prev, [uid]: combined };
        });
      },
      onMessage: (msg) => {
        const m = msg as ChatMessage;
        setMessagesByUser((prev) => {
          const existing = prev[m.userId] ?? [];
          if (existing.some((x) => x.id === m.id)) return prev;
          return { ...prev, [m.userId]: [...existing, m] };
        });
      },
      onTranslationState: (state) => {
        const s = state as { userId: number; enabled: boolean };
        setTranslationEnabledByUser((prev) => ({
          ...prev,
          [s.userId]: s.enabled,
        }));
      },
      onConversationDeleted: (data) => {
        const { userId } = data as { userId: number };
        setMessagesByUser((prev) => {
          const next = { ...prev };
          delete next[userId];
          return next;
        });
        setTranslationEnabledByUser((prev) => {
          const next = { ...prev };
          delete next[userId];
          return next;
        });
        setSelectedUserId((prev) => (prev === userId ? null : prev));
        if (selectedUserIdRef.current === userId) {
          selectedUserIdRef.current = null;
        }
      },
    });
  }, []);

  const selectUser = useCallback((userId: number) => {
    selectedUserIdRef.current = userId;
    setSelectedUserId(userId);
    if (!adminSocket) return;
    // Always fetch fresh history (merges with any real-time messages already received).
    // Emitted directly — not inside a state updater — to avoid React Strict Mode
    // double-invocation causing two concurrent history requests.
    adminSocket.emit("chat:history", { userId });
    adminSocket.emit("chat:mark_read", { userId });
  }, []);

  const send = useCallback((text: string) => {
    const uid = selectedUserIdRef.current;
    if (!uid) return;
    adminSocket?.emit("chat:send", { text, targetUserId: uid });
  }, []);

  const setTranslation = useCallback(
    (userId: number, enabled: boolean, adminLang = "en") => {
      // Optimistic update so the button feels instant
      setTranslationEnabledByUser((prev) => ({ ...prev, [userId]: enabled }));
      adminSocket?.emit("chat:set_translation", {
        userId,
        enabled,
        targetLang: adminLang,
      });
    },
    [],
  );

  const deleteConversation = useCallback((userId: number) => {
    // Optimistic: clear messages immediately
    setMessagesByUser((prev) => {
      const next = { ...prev };
      delete next[userId];
      return next;
    });
    setSelectedUserId((prev) => (prev === userId ? null : prev));
    if (selectedUserIdRef.current === userId) selectedUserIdRef.current = null;
    adminSocket?.emit("chat:delete_conversation", { userId });
  }, []);

  const messages = selectedUserId ? (messagesByUser[selectedUserId] ?? []) : [];
  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);
  const translationEnabled = selectedUserId
    ? (translationEnabledByUser[selectedUserId] ?? false)
    : false;

  return {
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
  };
}

// ── User-side hook ─────────────────────────────────────────────────────────

export function useUserChat() {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [unreadFromAdmin, setUnreadFromAdmin] = useState(0);
  const [translationEnabled, setTranslationEnabledState] = useState(false);
  const [translationTargetLang, setTranslationTargetLang] = useState("en");

  useEffect(() => {
    let socket: ReturnType<typeof io> | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let destroyed = false;

    function scheduleRetry() {
      if (destroyed) return;
      retryTimer = setTimeout(connect, 2000);
    }

    function connect() {
      if (destroyed) return;
      const token = getAccessToken();
      if (!token) {
        scheduleRetry();
        return;
      }
      if (socket?.connected || socket?.active) return;

      // Clean up any stale socket before reconnecting
      if (socket) {
        socket.removeAllListeners();
        socket.disconnect();
        socket = null;
      }

      socket = io(getSocketOrigin(), {
        transports: ["polling"],
        autoConnect: true,
      });
      socketRef.current = socket;

      socket.on("connect", () => {
        // Always get the freshest token on (re)connect
        socket!.emit("authenticate", getAccessToken());
      });

      socket.on("authenticated", () => {
        setConnected(true);
        socket!.emit("chat:history", {});
      });

      socket.on("auth_error", () => {
        // Token rejected — wait briefly then retry (token may need refresh)
        socket!.disconnect();
        socket = null;
        socketRef.current = null;
        scheduleRetry();
      });

      socket.on("chat:unread_count", (count: number) => {
        setUnreadFromAdmin(count);
      });

      socket.on("chat:history", (msgs: ChatMessage[]) => {
        setMessages(msgs);
      });

      socket.on("chat:message", (msg: ChatMessage) => {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        if (msg.senderRole === "admin") {
          setUnreadFromAdmin((n) => n + 1);
        }
      });

      socket.on(
        "chat:translation_state",
        (state: { enabled: boolean; targetLang?: string }) => {
          setTranslationEnabledState(state.enabled);
          if (state.targetLang) setTranslationTargetLang(state.targetLang);
        },
      );

      socket.on("disconnect", () => {
        setConnected(false);
        socketRef.current = null;
        // socket.io has built-in reconnect, but schedule a manual retry as fallback
        scheduleRetry();
      });

      socket.on("connect_error", () => {
        scheduleRetry();
      });
    }

    connect();

    return () => {
      destroyed = true;
      if (retryTimer) clearTimeout(retryTimer);
      socket?.removeAllListeners();
      socket?.disconnect();
      socket = null;
      socketRef.current = null;
    };
  }, []);

  const send = useCallback((text: string) => {
    socketRef.current?.emit("chat:send", { text });
  }, []);

  const clearUnread = useCallback(() => {
    setUnreadFromAdmin(0);
    socketRef.current?.emit("chat:mark_read_by_user");
  }, []);

  const setTranslation = useCallback((enabled: boolean, targetLang: string) => {
    socketRef.current?.emit("chat:set_translation", { enabled, targetLang });
  }, []);

  return {
    connected,
    messages,
    send,
    unreadFromAdmin,
    clearUnread,
    translationEnabled,
    translationTargetLang,
    setTranslation,
  };
}
