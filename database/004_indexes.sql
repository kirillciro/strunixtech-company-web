-- Performance indexes for chat unread counts and user lookups.
-- Safe to run multiple times (IF NOT EXISTS).

-- Speed up unread count queries for users (messages tab badge)
CREATE INDEX IF NOT EXISTS chat_messages_unread_user_idx
  ON chat_messages (user_id, read_by_user)
  WHERE read_by_user = FALSE;

-- Speed up fetching admin messages for a user (translation retranslate queries)
CREATE INDEX IF NOT EXISTS chat_messages_admin_sender_idx
  ON chat_messages (user_id, sender_role, created_at DESC)
  WHERE sender_role = 'admin';
