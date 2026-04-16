import { Server as SocketIOServer, type Socket } from "socket.io";
import type { Server as HttpServer } from "http";
import { pool } from "./db.js";
import { verifyToken } from "./auth.js";

// ── Types ──────────────────────────────────────────────────────────────────

interface AuthedSocket extends Socket {
  userId?: number;
  userRole?: string;
}

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

// ── Helpers ────────────────────────────────────────────────────────────────

async function getUnreadCounts(): Promise<Record<number, number>> {
  const result = await pool.query(
    `SELECT user_id, COUNT(*)::int AS count
     FROM chat_messages
     WHERE read_by_admin = FALSE AND sender_role = 'user'
     GROUP BY user_id`,
  );
  const counts: Record<number, number> = {};
  for (const row of result.rows) {
    counts[row.user_id] = row.count;
  }
  return counts;
}

async function getChatUserList(): Promise<ChatUser[]> {
  const result = await pool.query(
    `SELECT
       u.id,
       u.full_name,
       u.email,
       lm.text        AS last_message,
       lm.created_at  AS last_message_at,
       COALESCE(uc.unread_count, 0) AS unread_count
     FROM users u
     JOIN LATERAL (
       SELECT text, created_at
       FROM chat_messages
       WHERE user_id = u.id
       ORDER BY created_at DESC
       LIMIT 1
     ) lm ON TRUE
     LEFT JOIN (
       SELECT user_id, COUNT(*)::int AS unread_count
       FROM chat_messages
       WHERE read_by_admin = FALSE AND sender_role = 'user'
       GROUP BY user_id
     ) uc ON uc.user_id = u.id
     ORDER BY lm.created_at DESC`,
  );
  return result.rows.map((row) => ({
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    lastMessage: row.last_message ?? "",
    lastMessageAt: row.last_message_at ?? null,
    unreadCount: row.unread_count,
  }));
}

function mapMsgRow(row: {
  id: number;
  user_id: number;
  sender_role: "user" | "admin";
  sender_name: string;
  text: string;
  translated_text?: string | null;
  created_at: Date;
}): ChatMessage {
  return {
    id: row.id,
    userId: row.user_id,
    senderRole: row.sender_role,
    senderName: row.sender_name,
    text: row.text,
    translatedText: row.translated_text ?? null,
    createdAt: row.created_at.toISOString(),
  };
}

// node-postgres returns BIGINT/BIGSERIAL columns as strings (safe 64-bit
// serialization). Socket.io then sends them as JSON strings too. Accept both
// string and number so the handlers don't silently bail out.
function parseId(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return Math.trunc(v);
  if (typeof v === "string" && /^\d+$/.test(v)) return parseInt(v, 10);
  return null;
}

// ── Language code → full name map (used in multiple places) ──────────────
const LANG_NAMES: Record<string, string> = {
  en: "English",
  nl: "Dutch",
  de: "German",
  fr: "French",
  it: "Italian",
  es: "Spanish",
  pt: "Portuguese",
  pl: "Polish",
  ro: "Romanian",
  et: "Estonian",
  lv: "Latvian",
  fi: "Finnish",
  sv: "Swedish",
  da: "Danish",
  no: "Norwegian",
  cs: "Czech",
  hu: "Hungarian",
  el: "Greek",
};

// ── Translation helper ─────────────────────────────────────────────────────

async function translateText(
  text: string,
  targetLang: string,
): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a translator. Translate the user's message to ${targetLang}. Return ONLY the translated text, nothing else. If the message is already in ${targetLang}, return it unchanged.`,
          },
          { role: "user", content: text },
        ],
        temperature: 0.2,
        max_tokens: 500,
      }),
    });
    const json = (await response.json()) as {
      choices: { message: { content: string } }[];
    };
    return json.choices?.[0]?.message?.content?.trim() ?? null;
  } catch (err) {
    console.error("[chat:translate]", err);
    return null;
  }
}

// In-memory fallback used when the DB migration hasn't been run yet.
const translationMemory = new Map<
  number,
  { enabled: boolean; targetLang: string; adminTargetLang: string }
>();

async function getTranslationSettings(
  userId: number,
): Promise<{ enabled: boolean; targetLang: string; adminTargetLang: string }> {
  try {
    const result = await pool.query(
      `SELECT translation_enabled, target_language,
              COALESCE(admin_target_language, 'en') AS admin_target_language
       FROM chat_translation_settings WHERE user_id = $1`,
      [userId],
    );
    return {
      enabled: result.rows[0]?.translation_enabled === true,
      targetLang: result.rows[0]?.target_language ?? "en",
      adminTargetLang: result.rows[0]?.admin_target_language ?? "en",
    };
  } catch {
    const mem = translationMemory.get(userId);
    return {
      enabled: mem?.enabled ?? false,
      targetLang: mem?.targetLang ?? "en",
      adminTargetLang: mem?.adminTargetLang ?? "en",
    };
  }
}

// Keep backward-compat alias used by chat:history
async function isTranslationEnabled(userId: number): Promise<boolean> {
  return (await getTranslationSettings(userId)).enabled;
}

/** Re-translate all admin messages for a user to the new target language, updating the DB in-place. */
async function retranslateAdminMessages(
  userId: number,
  targetLangName: string,
): Promise<void> {
  try {
    const { rows } = await pool.query<{ id: number; text: string }>(
      `SELECT id, text FROM chat_messages WHERE user_id = $1 AND sender_role = 'admin' ORDER BY created_at DESC LIMIT 100`,
      [userId],
    );
    await Promise.allSettled(
      rows.map(async (row) => {
        const translated = await translateText(row.text, targetLangName);
        const finalTranslated = translated === row.text ? null : translated;
        await pool.query(
          `UPDATE chat_messages SET translated_text = $1 WHERE id = $2`,
          [finalTranslated, row.id],
        );
      }),
    );
  } catch {
    // DB not yet migrated or other error — skip silently
  }
}

/** Re-translate all user messages for a conversation to the admin's reading language. */
async function retranslateUserMessages(
  userId: number,
  adminTargetLangName: string,
): Promise<void> {
  try {
    const { rows } = await pool.query<{ id: number; text: string }>(
      `SELECT id, text FROM chat_messages WHERE user_id = $1 AND sender_role = 'user' ORDER BY created_at DESC LIMIT 100`,
      [userId],
    );
    await Promise.allSettled(
      rows.map(async (row) => {
        const translated = await translateText(row.text, adminTargetLangName);
        const finalTranslated = translated === row.text ? null : translated;
        await pool.query(
          `UPDATE chat_messages SET translated_text = $1 WHERE id = $2`,
          [finalTranslated, row.id],
        );
      }),
    );
  } catch {
    // DB not yet migrated or other error — skip silently
  }
}

/** Fetch message history for a user and return mapped ChatMessage array. */
async function fetchHistoryRows(userId: number): Promise<ChatMessage[]> {
  try {
    const result = await pool.query(
      `SELECT cm.id, cm.user_id, cm.sender_role, cm.text, cm.translated_text, cm.created_at,
              u.full_name AS sender_name
       FROM chat_messages cm
       JOIN users u ON u.id = (
         CASE cm.sender_role
           WHEN 'user'  THEN cm.user_id
           ELSE (SELECT id FROM users WHERE role = 'admin' LIMIT 1)
         END
       )
       WHERE cm.user_id = $1
       ORDER BY cm.created_at ASC
       LIMIT 200`,
      [userId],
    );
    return (result.rows as Parameters<typeof mapMsgRow>[0][]).map(mapMsgRow);
  } catch {
    // translated_text column not yet migrated
    const result = await pool.query(
      `SELECT cm.id, cm.user_id, cm.sender_role, cm.text, NULL AS translated_text, cm.created_at,
              u.full_name AS sender_name
       FROM chat_messages cm
       JOIN users u ON u.id = (
         CASE cm.sender_role
           WHEN 'user'  THEN cm.user_id
           ELSE (SELECT id FROM users WHERE role = 'admin' LIMIT 1)
         END
       )
       WHERE cm.user_id = $1
       ORDER BY cm.created_at ASC
       LIMIT 200`,
      [userId],
    );
    return (result.rows as Parameters<typeof mapMsgRow>[0][]).map(mapMsgRow);
  }
}

async function setTranslationEnabled(
  userId: number,
  enabled: boolean,
  targetLang = "en",
  adminTargetLang?: string,
): Promise<void> {
  const current = translationMemory.get(userId);
  const resolvedAdminTargetLang =
    adminTargetLang ?? current?.adminTargetLang ?? "en";
  translationMemory.set(userId, {
    enabled,
    targetLang,
    adminTargetLang: resolvedAdminTargetLang,
  });
  try {
    await pool.query(
      `INSERT INTO chat_translation_settings
         (user_id, translation_enabled, target_language, admin_target_language, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (user_id) DO UPDATE
         SET translation_enabled = EXCLUDED.translation_enabled,
             target_language = EXCLUDED.target_language,
             admin_target_language = EXCLUDED.admin_target_language,
             updated_at = NOW()`,
      [userId, enabled, targetLang, resolvedAdminTargetLang],
    );
  } catch {
    // Possibly missing admin_target_language column (migration 005 not yet run)
    try {
      await pool.query(
        `INSERT INTO chat_translation_settings (user_id, translation_enabled, target_language, updated_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (user_id) DO UPDATE
           SET translation_enabled = EXCLUDED.translation_enabled,
               target_language = EXCLUDED.target_language,
               updated_at = NOW()`,
        [userId, enabled, targetLang],
      );
    } catch {
      // Table not yet migrated — state is kept in-memory only
    }
  }
}

// ── Init ───────────────────────────────────────────────────────────────────

export function initChatSocket(
  httpServer: HttpServer,
  allowedOrigins: string[],
) {
  const io = new SocketIOServer(httpServer, {
    cors: { origin: allowedOrigins, credentials: true },
    // polling listed first — in dev the client uses polling-only through
    // the Next.js proxy. WebSocket is still available for direct connections
    // (e.g. production behind Nginx).
    transports: ["polling", "websocket"],
  });

  io.on("connection", (rawSocket: Socket) => {
    const socket = rawSocket as AuthedSocket;

    // Require authentication within 5 s or kick
    const authTimeout = setTimeout(() => socket.disconnect(true), 5000);

    // ── authenticate ──────────────────────────────────────────────────────
    socket.on("authenticate", async (token: unknown) => {
      clearTimeout(authTimeout);

      if (typeof token !== "string") {
        socket.emit("auth_error", { message: "Token must be a string" });
        socket.disconnect(true);
        return;
      }

      try {
        const payload = verifyToken(token);
        socket.userId = Number(payload.sub);
        socket.userRole = payload.role;

        // Every user (including admin) joins their personal room so we can
        // target them with messages addressed to that user_id.
        socket.join(`user:${socket.userId}`);

        if (payload.role === "admin") {
          socket.join("admin");
          // Greet admin with current state
          const [unreadCounts, userList] = await Promise.all([
            getUnreadCounts(),
            getChatUserList(),
          ]);
          socket.emit("chat:unread_counts", unreadCounts);
          socket.emit("chat:user_list", userList);
        } else {
          // Greet user with their own unread count (admin messages not yet read)
          const result = await pool.query(
            `SELECT COUNT(*)::int AS count
             FROM chat_messages
             WHERE user_id = $1
               AND sender_role = 'admin'
               AND read_by_user = FALSE`,
            [socket.userId],
          );
          socket.emit("chat:unread_count", result.rows[0].count as number);
        }

        socket.emit("authenticated", {
          userId: socket.userId,
          role: socket.userRole,
        });
      } catch {
        socket.emit("auth_error", { message: "Invalid or expired token" });
        socket.disconnect(true);
      }
    });

    // ── chat:send ─────────────────────────────────────────────────────────
    socket.on(
      "chat:send",
      async (data: { text?: unknown; targetUserId?: unknown }) => {
        if (!socket.userId || !socket.userRole) {
          socket.emit("error", { message: "Not authenticated" });
          return;
        }

        const text =
          typeof data?.text === "string" ? data.text.trim().slice(0, 2000) : "";
        if (!text) return;

        // The conversation is always keyed by the non-admin user's id.
        const userId =
          socket.userRole === "admin"
            ? parseId(data.targetUserId)
            : socket.userId;

        if (!userId) return;

        try {
          // Get translation settings for this conversation (enabled + target languages)
          const {
            enabled: translationOn,
            targetLang,
            adminTargetLang,
          } = await getTranslationSettings(userId);

          // Determine what to translate and to which language
          let translatedText: string | null = null;
          if (translationOn) {
            if (socket.userRole === "user") {
              // User sent a message → translate to the admin's reading language
              const adminLangName = LANG_NAMES[adminTargetLang] ?? "English";
              translatedText = await translateText(text, adminLangName);
            } else {
              // Admin replied → translate to the user's stored target language
              const targetLangName = LANG_NAMES[targetLang] ?? targetLang;
              translatedText = await translateText(text, targetLangName);
            }
            // If translated == original (already in target language), drop it
            if (translatedText === text) translatedText = null;
          }

          // Try inserting with translated_text (requires migration); fall back without it
          let insertResult: { rows: Record<string, unknown>[] };
          try {
            insertResult = await pool.query(
              `INSERT INTO chat_messages
                 (user_id, sender_role, text, translated_text, read_by_admin, read_by_user)
               VALUES ($1, $2, $3, $4, $5, $6)
               RETURNING id, user_id, sender_role, text, translated_text, created_at`,
              [
                userId,
                socket.userRole,
                text,
                translatedText,
                socket.userRole === "admin",
                socket.userRole === "user",
              ],
            );
          } catch {
            // translated_text column not yet migrated — insert without it
            insertResult = await pool.query(
              `INSERT INTO chat_messages
                 (user_id, sender_role, text, read_by_admin, read_by_user)
               VALUES ($1, $2, $3, $4, $5)
               RETURNING id, user_id, sender_role, text, NULL AS translated_text, created_at`,
              [
                userId,
                socket.userRole,
                text,
                socket.userRole === "admin",
                socket.userRole === "user",
              ],
            );
          }
          const result = insertResult;

          // Fetch the sender's full name to embed in the message event.
          const senderRow = await pool.query(
            `SELECT full_name FROM users WHERE id = $1`,
            [socket.userId],
          );
          const senderName: string = senderRow.rows[0]?.full_name ?? "Unknown";

          const msg = mapMsgRow({
            ...(result.rows[0] as Parameters<typeof mapMsgRow>[0]),
            sender_name: senderName,
          });

          // Broadcast to the user's room AND the admin room
          io.to(`user:${userId}`).emit("chat:message", msg);
          io.to("admin").emit("chat:message", msg);

          // Refresh admin's unread counts + user list
          const [unreadCounts, userList] = await Promise.all([
            getUnreadCounts(),
            getChatUserList(),
          ]);
          io.to("admin").emit("chat:unread_counts", unreadCounts);
          io.to("admin").emit("chat:user_list", userList);
        } catch (err) {
          console.error("[chat:send]", err);
        }
      },
    );

    // ── chat:history ──────────────────────────────────────────────────────
    socket.on("chat:history", async (data: { userId?: unknown }) => {
      if (!socket.userId || !socket.userRole) return;

      const userId =
        socket.userRole === "admin" ? parseId(data?.userId) : socket.userId;

      if (!userId) return;

      try {
        const msgs = await fetchHistoryRows(userId);
        socket.emit("chat:history", msgs);

        // Send translation toggle state back — send the caller's relevant target lang
        const {
          enabled: translationOn,
          targetLang: storedLang,
          adminTargetLang: storedAdminLang,
        } = await getTranslationSettings(userId);
        const relevantLang =
          socket.userRole === "admin" ? storedAdminLang : storedLang;
        socket.emit("chat:translation_state", {
          userId,
          enabled: translationOn,
          targetLang: relevantLang,
        });
      } catch (err) {
        console.error("[chat:history]", err);
      }
    });

    // ── chat:mark_read ────────────────────────────────────────────────────
    socket.on("chat:mark_read", async (data: { userId?: unknown }) => {
      if (socket.userRole !== "admin") return;

      const userId = parseId(data?.userId);
      if (!userId) return;

      try {
        await pool.query(
          `UPDATE chat_messages
           SET read_by_admin = TRUE
           WHERE user_id = $1 AND read_by_admin = FALSE`,
          [userId],
        );

        const unreadCounts = await getUnreadCounts();
        io.to("admin").emit("chat:unread_counts", unreadCounts);
      } catch (err) {
        console.error("[chat:mark_read]", err);
      }
    });

    // ── chat:mark_read_by_user ─────────────────────────────────────────────
    socket.on("chat:mark_read_by_user", async () => {
      if (socket.userRole !== "user" || !socket.userId) return;
      try {
        await pool.query(
          `UPDATE chat_messages
           SET read_by_user = TRUE
           WHERE user_id = $1 AND read_by_user = FALSE`,
          [socket.userId],
        );
      } catch (err) {
        console.error("[chat:mark_read_by_user]", err);
      }
    });

    // ── chat:user_list (admin refresh) ────────────────────────────────────
    socket.on("chat:user_list", async () => {
      if (socket.userRole !== "admin") return;
      try {
        const userList = await getChatUserList();
        socket.emit("chat:user_list", userList);
      } catch (err) {
        console.error("[chat:user_list]", err);
      }
    });

    // ── chat:delete_conversation (admin only) ─────────────────────────────
    socket.on(
      "chat:delete_conversation",
      async (data: { userId?: unknown }) => {
        if (socket.userRole !== "admin") return;

        const userId = parseId(data?.userId);
        if (!userId) return;

        try {
          await pool.query(`DELETE FROM chat_messages WHERE user_id = $1`, [
            userId,
          ]);
          // Also clear translation settings so state is clean if chat restarts
          await pool
            .query(`DELETE FROM chat_translation_settings WHERE user_id = $1`, [
              userId,
            ])
            .catch(() => {}); // ignore if table doesn't exist

          // Notify admin: refresh user list and signal that this conversation is cleared
          const [unreadCounts, userList] = await Promise.all([
            getUnreadCounts(),
            getChatUserList(),
          ]);
          io.to("admin").emit("chat:conversation_deleted", { userId });
          io.to("admin").emit("chat:unread_counts", unreadCounts);
          io.to("admin").emit("chat:user_list", userList);
          // Notify the user if they're online — their history is now empty
          io.to(`user:${userId}`).emit("chat:history", []);
        } catch (err) {
          console.error("[chat:delete_conversation]", err);
        }
      },
    );

    // ── chat:set_translation (admin OR user toggles translation) ─────────
    socket.on(
      "chat:set_translation",
      async (data: {
        userId?: unknown;
        enabled?: unknown;
        targetLang?: unknown;
      }) => {
        if (!socket.userId || !socket.userRole) return;

        // Admin can toggle for any user; users can only toggle their own.
        const userId =
          socket.userRole === "admin" ? parseId(data?.userId) : socket.userId;
        if (!userId) return;

        const enabled = data?.enabled === true;
        const incomingLang =
          typeof data?.targetLang === "string" && data.targetLang.length <= 10
            ? data.targetLang
            : "en";
        try {
          const current = await getTranslationSettings(userId);

          if (socket.userRole === "admin") {
            // Admin sets their reading language (user messages → admin direction)
            await setTranslationEnabled(
              userId,
              enabled,
              current.targetLang,
              incomingLang,
            );
            if (enabled) {
              const adminLangName = LANG_NAMES[incomingLang] ?? incomingLang;
              await retranslateUserMessages(userId, adminLangName);
              // Push updated history with fresh translations to the admin
              const updatedMsgs = await fetchHistoryRows(userId);
              socket.emit("chat:history", updatedMsgs);
            }
            const stateForAdmin = { userId, enabled, targetLang: incomingLang };
            socket.emit("chat:translation_state", stateForAdmin);
            io.to("admin").emit("chat:translation_state", stateForAdmin);
          } else {
            // User sets their reading language (admin messages → user direction)
            await setTranslationEnabled(
              userId,
              enabled,
              incomingLang,
              current.adminTargetLang,
            );
            if (enabled) {
              const targetLangName = LANG_NAMES[incomingLang] ?? incomingLang;
              await retranslateAdminMessages(userId, targetLangName);
              // Push updated history with fresh translations to the user
              const updatedMsgs = await fetchHistoryRows(userId);
              io.to(`user:${userId}`).emit("chat:history", updatedMsgs);
            }
            socket.emit("chat:translation_state", {
              userId,
              enabled,
              targetLang: incomingLang,
            });
            io.to("admin").emit("chat:translation_state", {
              userId,
              enabled,
              targetLang: current.adminTargetLang,
            });
          }
        } catch (err) {
          console.error("[chat:set_translation]", err);
          socket.emit("chat:translation_state", {
            userId,
            enabled,
            targetLang: incomingLang,
          });
        }
      },
    );
  });

  return io;
}
