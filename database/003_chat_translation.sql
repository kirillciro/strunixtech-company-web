-- Translation support for chat conversations.
-- translated_text stores the auto-translated version of the message.
-- translation_enabled is per-conversation (user_id) preference (admin OR user can toggle).
-- target_language is the BCP-47 language code to translate admin messages into for this user.

ALTER TABLE chat_messages
  ADD COLUMN IF NOT EXISTS translated_text TEXT DEFAULT NULL;

-- Per-conversation translation settings (shared by admin + user toggle)
CREATE TABLE IF NOT EXISTS chat_translation_settings (
  user_id             BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  translation_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  target_language     VARCHAR(10) NOT NULL DEFAULT 'en',
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add target_language if table already existed without it
ALTER TABLE chat_translation_settings
  ADD COLUMN IF NOT EXISTS target_language VARCHAR(10) NOT NULL DEFAULT 'en';
