# Company Platform — Project Status

Last updated: April 12, 2026

## Stack

| Layer    | Tech                                                           |
| -------- | -------------------------------------------------------------- |
| Frontend | Next.js 16.2.3 (App Router), React 19, TypeScript, Tailwind v4 |
| Backend  | Node.js, Express 5, TypeScript, pg (PostgreSQL client)         |
| Database | PostgreSQL hosted on Supabase (session pooler, eu-west-1)      |
| Images   | Cloudinary                                                     |
| Auth     | JWT + bcryptjs                                                 |
| Repo     | github.com/kirillciro/strunixtech-company-web                  |

---

## Architecture

```
Browser
  └── Next.js (Vercel) — frontend
        └── Express API (Railway) — backend
              └── PostgreSQL (Supabase) — database
```

- Frontend never talks to the DB directly
- All data flows through the Express backend API
- Cloudinary for image storage (direct from backend)
- `database/` folder = SQL migration files (version control for schema, safe to be public)

---

## Backend API Routes

Base URL (local): `http://localhost:4000`

### Health

| Method | Route      | Auth | Description                                             |
| ------ | ---------- | ---- | ------------------------------------------------------- |
| GET    | `/health`  | —    | Returns `{ status: "ok" }` + DB ping                    |
| GET    | `/test-db` | —    | Returns `{ ok: true, time: "..." }` — live DB timestamp |

### Auth

| Method | Route            | Auth | Description                                |
| ------ | ---------------- | ---- | ------------------------------------------ |
| POST   | `/auth/register` | —    | Create account → returns `{ token, user }` |
| POST   | `/auth/login`    | —    | Login → returns `{ token, user }`          |
| GET    | `/auth/me`       | JWT  | Returns current user from token            |

**Register/Login body:**

```json
{ "fullName": "...", "email": "...", "password": "..." }
```

### Public Content

| Method | Route                          | Auth | Description                                        |
| ------ | ------------------------------ | ---- | -------------------------------------------------- |
| GET    | `/content/:contentKey?lang=en` | —    | Returns localized content JSON, falls back to `en` |

### Admin Content (JWT required)

| Method | Route                                              | Auth | Description                                                         |
| ------ | -------------------------------------------------- | ---- | ------------------------------------------------------------------- |
| PUT    | `/admin/content/:contentKey/source`                | JWT  | Update English source content, marks all other locales as `pending` |
| PUT    | `/admin/content/:contentKey/localizations/:locale` | JWT  | Save translated content for a specific locale                       |
| GET    | `/admin/content/:contentKey/localizations`         | JWT  | List all locale statuses for a content key                          |

---

## Database Schema

### `users` (applied ✅)

| Column        | Type         | Notes  |
| ------------- | ------------ | ------ |
| id            | BIGSERIAL    | PK     |
| full_name     | VARCHAR(100) |        |
| email         | VARCHAR(200) | UNIQUE |
| password_hash | TEXT         | bcrypt |
| created_at    | TIMESTAMPTZ  |        |

### `content_documents` (pending — `002_content.sql`)

Stores one record per content key (e.g. `homepage`, `services`).

### `content_localizations` (pending — `002_content.sql`)

Stores translated JSON per document + locale pair. Tracks translation status.

### `content_translation_jobs` (pending — `002_content.sql`)

Queue table for automated translation jobs.

---

## What Is Done ✅

### Infrastructure

- Supabase PostgreSQL connected via session pooler (IPv4-compatible, eu-west-1)
- pgAdmin 4 connected — tables visible and queryable
- `users` table created and live in Supabase
- Backend running locally on `http://localhost:4000`
- `/test-db` confirmed returning live DB timestamp
- GitHub repo pushed: `kirillciro/strunixtech-company-web` (94 files, initial commit)
- `.gitignore` covers `.env`, `node_modules`, build outputs

### Backend

- Express server with JWT auth, bcrypt password hashing, Zod validation
- PostgreSQL connection pool via `pg` in `backend/src/db.ts`
- SSL auto-enabled when `DATABASE_URL` contains "supabase"
- All auth routes implemented: register, login, `/auth/me`
- Full content management API implemented (source + localizations + status listing)
- `languageSchema` covers all 12 locales: en, nl, de, fr, it, es, pt, pl, ro, et, lv, fi

### Frontend — Routing & Localisation

- `[lang]` dynamic route with `generateStaticParams` covering 12 locales
- Middleware-based locale enforcement with `notFound()` fallback
- Dictionary-driven content loaded via `getDictionary.ts`
- Supported languages: en, nl, de, fr, it, es (full JSON dictionaries); pt, pl, ro, et, lv, fi (fallback to English)
- `LanguageSwitcher` component with full dropdown

### Frontend — Homepage Sections

| Section                    | Status | Notes                                                   |
| -------------------------- | ------ | ------------------------------------------------------- |
| `HeroSection`              | ✅     | Lightweight background, "Preview first" positioning     |
| `PositioningSection`       | ✅     | Risk Reversal, Perfect For, What Happens Next           |
| `HowItWorksSection`        | ✅     | 3 steps, CTA                                            |
| `TemplatesShowcaseSection` | ✅     | 4 categories + "View all" link                          |
| `DemoPreviewSection`       | ✅     | Core offer block with Cloudinary preview                |
| `ServicesSection`          | ✅     | 4 service groups, compact style                         |
| `SocialProofSection`       | ✅     | 4 reasons + animated counters                           |
| `CallToActionSection`      | ✅     | Flat, no animations                                     |
| `Header`                   | ✅     | Transparent→solid scroll, auth state, language switcher |
| `Footer`                   | ✅     | Full columns                                            |

### Frontend — SEO

- `metadataBase` set in root layout via `NEXT_PUBLIC_SITE_URL`
- `generateMetadata` on `[lang]/page.tsx`: per-locale canonical, hreflang all 12 langs, x-default=/en, OG
- `/landing` and `/landing/[id]` variants: `noindex, follow` + per-campaign metadata

---

## What Is NOT Done Yet ❌

### Database

- `002_content.sql` not yet applied (content_documents, content_localizations, content_translation_jobs tables missing)

### Frontend

- No translations for pt, pl, ro, et, lv, fi (fallback to English)
- Auth register/login forms not tested end-to-end against live backend
- `(admin)/` folder exists but is empty — admin panel not built
- No sitemap.xml / robots.txt
- `NEXT_PUBLIC_SITE_URL` not configured (defaults to localhost)

### Infrastructure

- Not deployed (Vercel + Railway setup pending)
- No CI/CD pipeline

---

## Next Steps (Suggested Order)

1. **Apply `002_content.sql`** — run in Supabase SQL Editor or pgAdmin, creates content tables
2. **Auth end-to-end** — test register/login from frontend form → backend → DB → JWT
3. **Admin panel** — build dashboard UI in `frontend/src/app/(admin)/`
4. **Translations** — generate full JSON for pt, pl, ro, et, lv, fi
5. **Deploy** — Vercel (frontend) + Railway (backend), set env vars
6. **Sitemap + robots.txt**
