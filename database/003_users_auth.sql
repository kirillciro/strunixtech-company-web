-- Adds auth columns to users table for access/refresh JWT + email verification + OAuth.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS refresh_token_hash TEXT,
  ADD COLUMN IF NOT EXISTS email_verify_token TEXT,
  ADD COLUMN IF NOT EXISTS email_verify_expires TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reset_token TEXT,
  ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS provider VARCHAR(20) NOT NULL DEFAULT 'email',
  ADD COLUMN IF NOT EXISTS provider_id VARCHAR(200);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_provider
  ON users(provider, provider_id)
  WHERE provider_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_email_verify_token
  ON users(email_verify_token)
  WHERE email_verify_token IS NOT NULL;
