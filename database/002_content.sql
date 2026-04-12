-- Content management foundation for admin-edited English and derived locale payloads.

CREATE TABLE IF NOT EXISTS content_documents (
  id BIGSERIAL PRIMARY KEY,
  content_key VARCHAR(120) NOT NULL UNIQUE,
  source_locale VARCHAR(10) NOT NULL DEFAULT 'en',
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS content_localizations (
  id BIGSERIAL PRIMARY KEY,
  document_id BIGINT NOT NULL REFERENCES content_documents(id) ON DELETE CASCADE,
  locale VARCHAR(10) NOT NULL,
  is_source BOOLEAN NOT NULL DEFAULT FALSE,
  translation_status VARCHAR(20) NOT NULL DEFAULT 'up_to_date',
  content_json JSONB NOT NULL,
  source_version INTEGER NOT NULL DEFAULT 1,
  translated_from_version INTEGER,
  last_translated_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(document_id, locale)
);

CREATE TABLE IF NOT EXISTS content_translation_jobs (
  id BIGSERIAL PRIMARY KEY,
  document_id BIGINT NOT NULL REFERENCES content_documents(id) ON DELETE CASCADE,
  target_locale VARCHAR(10) NOT NULL,
  source_version INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'queued',
  provider VARCHAR(40),
  model VARCHAR(80),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_content_localizations_document_id
  ON content_localizations(document_id);

CREATE INDEX IF NOT EXISTS idx_content_translation_jobs_document_id
  ON content_translation_jobs(document_id);

CREATE INDEX IF NOT EXISTS idx_content_translation_jobs_status
  ON content_translation_jobs(status);