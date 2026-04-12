# Content Translation Architecture

## Goal

Make English the single editable source of truth. All other languages should be generated from English after an editor changes content in the admin dashboard.

## Recommended Model

1. Store canonical English content in the database.
2. Keep every locale as a separate derived record, not as hand-edited JSON files.
3. Regenerate translated locale content whenever English changes.
4. Publish generated locale JSON payloads to the frontend cache or API response layer.

## Why This Is Better Than Editing JSON Files Directly

- The admin dashboard should edit structured content, not raw files.
- English becomes the only human-maintained version.
- AI translation can run asynchronously without blocking the editor.
- You can review, retry, or roll back a translation job per locale.
- The frontend stops depending on manual synchronization across multiple files.

## Suggested Database Tables

### content_documents

- `id`
- `content_key` — for example `marketing-homepage`
- `source_locale` — usually `en`
- `status` — `draft`, `published`, `archived`
- `version`
- `created_at`
- `updated_at`
- `published_at`
- `updated_by_user_id`

### content_localizations

- `id`
- `document_id`
- `locale`
- `is_source`
- `translation_status` — `up_to_date`, `pending`, `processing`, `failed`, `needs_review`
- `content_json` — the full structured payload
- `source_version`
- `translated_from_version`
- `last_translated_at`
- `last_error`

### content_translation_jobs

- `id`
- `document_id`
- `target_locale`
- `source_version`
- `status` — `queued`, `processing`, `completed`, `failed`
- `provider` — for example `openai`
- `model`
- `requested_at`
- `completed_at`
- `error_message`

## Update Flow

1. Admin edits English content in dashboard.
2. Backend validates the payload against the shared content schema.
3. Backend saves the new English version.
4. Backend marks all non-English locales as `pending`.
5. Backend creates one translation job per target locale.
6. Worker reads English content, converts it into path/value translation entries, and sends only the translatable strings to the AI model.
7. Worker rebuilds each locale payload from the translated entries.
8. Backend stores the translated locale payload and marks it `needs_review` or `up_to_date` depending on your QA preference.
9. Frontend reads published content from the API or server cache.

## Important Rule

Never let AI translate field names or structure. Only translate leaf string values.

That is why the shared schema and path-based entry helpers in [src/lib/content-schema.ts](src/lib/content-schema.ts) matter. They let you send data like this to the translation worker:

```json
[
  { "path": "hero.title", "value": "Build Your Website Fast" },
  { "path": "hero.description", "value": "Chat directly with a developer..." }
]
```

Then the translated strings can be re-applied into the exact same structure safely.

## Backend API Shape

Recommended endpoints:

- `GET /content/:contentKey?locale=en`
- `PUT /admin/content/:contentKey/source`
- `POST /admin/content/:contentKey/translate`
- `GET /admin/content/:contentKey/localizations`
- `POST /admin/content/:contentKey/publish`

## Admin Dashboard Phases

### Phase 1

- Build a content editor for English only.
- Use the shared schema for validation.
- Keep frontend reading static dictionaries until the editor is stable.

### Phase 2

- Move dictionary reads behind a content service.
- Prefer database content first.
- Fallback to local JSON files only if no published content exists.

### Phase 3

- Add translation jobs using OpenAI.
- Add status chips per locale in admin.
- Add retry and approve actions.

## Operational Notes

- Translation should run in a background worker, not inside the request that saves English.
- Keep a source version on every translation so stale locales are easy to detect.
- For marketing content, a review step is usually worth it before publish.
- Cache published locale payloads aggressively because they change rarely.
- Keep the current JSON files as seed data and fallback content, not as the final CMS.
