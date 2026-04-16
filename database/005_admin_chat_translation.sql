-- Separate translation target for admin reading direction.
-- target_language     = language the USER wants to receive admin messages in (set by user).
-- admin_target_language = language the ADMIN wants to receive user messages in (set by admin).
ALTER TABLE chat_translation_settings
  ADD COLUMN IF NOT EXISTS admin_target_language VARCHAR(10) NOT NULL DEFAULT 'en';
