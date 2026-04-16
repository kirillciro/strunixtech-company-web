-- Chat messages table for user ↔ admin live chat.
-- Each row belongs to a "conversation" identified by user_id
-- (users always chat with admin; admin chats with individual users).
CREATE TABLE IF NOT EXISTS chat_messages (
  id              BIGSERIAL PRIMARY KEY,
  user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_role     VARCHAR(10) NOT NULL CHECK (sender_role IN ('user', 'admin')),
  text            TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_by_admin   BOOLEAN NOT NULL DEFAULT FALSE,
  read_by_user    BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS chat_messages_user_id_created_at_idx
  ON chat_messages (user_id, created_at);

CREATE INDEX IF NOT EXISTS chat_messages_unread_admin_idx
  ON chat_messages (user_id, read_by_admin)
  WHERE read_by_admin = FALSE;
