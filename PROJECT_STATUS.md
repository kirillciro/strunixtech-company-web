# Company Platform — Project Status

Last updated: April 12, 2026 (evening)

## Stack

| Layer    | Tech                                                                 |
| -------- | -------------------------------------------------------------------- |
| Frontend | Next.js 16.2.3 (App Router), React 19, TypeScript, Tailwind v4       |
| Backend  | Node.js, Express 5, TypeScript, pg (PostgreSQL client)               |
| Database | PostgreSQL hosted on Supabase (session pooler, eu-west-1)            |
| Images   | Cloudinary                                                           |
| Auth     | JWT (access 15m / refresh 7d) + bcryptjs + Google + Facebook + Apple |
| Email    | Resend (transactional — verification, password reset)                |
| Repo     | github.com/kirillciro/strunixtech-company-web                        |

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

Base URL (local dev via Next.js proxy): `https://localhost:3000/api`
Base URL (backend direct): `http://localhost:4000`

### Health

| Method | Route      | Auth | Description                                             |
| ------ | ---------- | ---- | ------------------------------------------------------- |
| GET    | `/health`  | —    | Returns `{ status: "ok" }` + DB ping                    |
| GET    | `/test-db` | —    | Returns `{ ok: true, time: "..." }` — live DB timestamp |

### Auth

| Method | Route                   | Auth   | Description                                           |
| ------ | ----------------------- | ------ | ----------------------------------------------------- |
| POST   | `/auth/register`        | —      | Create account, sends verification email              |
| POST   | `/auth/login`           | —      | Login → `{ accessToken, user }`, sets refresh cookie  |
| GET    | `/auth/me`              | JWT    | Returns current user from token                       |
| POST   | `/auth/refresh`         | Cookie | Rotates refresh token, returns new access token       |
| POST   | `/auth/logout`          | Cookie | Clears refresh cookie, invalidates token in DB        |
| GET    | `/auth/verify`          | —      | Email verification via token query param              |
| POST   | `/auth/resend-verify`   | —      | Resend email verification link                        |
| POST   | `/auth/forgot-password` | —      | Send password reset email                             |
| POST   | `/auth/reset-password`  | —      | Reset password via token                              |
| POST   | `/auth/google`          | —      | Google OAuth — verifies access token via userinfo API |
| POST   | `/auth/facebook`        | —      | Facebook OAuth — verifies token via Graph API         |
| POST   | `/auth/apple`           | —      | Apple OAuth — verifies ID token via JWKS (RS256)      |

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

### `users` (applied ✅ — `003_users_auth.sql`)

| Column              | Type         | Notes                                      |
| ------------------- | ------------ | ------------------------------------------ |
| id                  | BIGSERIAL    | PK                                         |
| full_name           | VARCHAR(100) |                                            |
| email               | VARCHAR(200) | UNIQUE                                     |
| password_hash       | TEXT         | bcrypt (empty string for OAuth-only users) |
| role                | VARCHAR(20)  | default 'user'                             |
| is_verified         | BOOLEAN      | default false                              |
| provider            | VARCHAR(20)  | 'email', 'google', 'facebook', 'apple'     |
| provider_id         | TEXT         | OAuth provider user ID                     |
| refresh_token_hash  | TEXT         | hashed refresh token for rotation          |
| verification_token  | TEXT         | email verification token                   |
| reset_token         | TEXT         | password reset token                       |
| reset_token_expires | TIMESTAMPTZ  |                                            |
| created_at          | TIMESTAMPTZ  |                                            |

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
- `users` table created and live in Supabase (full auth schema via `003_users_auth.sql`)
- Backend running locally on `http://localhost:4000`
- `/test-db` confirmed returning live DB timestamp
- GitHub repo pushed: `kirillciro/strunixtech-company-web`
- `.gitignore` covers `.env`, `node_modules`, build outputs
- **HTTPS local dev** — `mkcert localhost` certs + `--experimental-https` in Next.js dev script
- **Next.js API proxy** — `/api/:path*` → `http://localhost:4000/:path*` (solves mixed-content HTTPS→HTTP)

### Backend — Auth

- Full JWT auth: access token (15 min) + refresh token (7 days, httpOnly cookie, rotation)
- `bcryptjs` password hashing
- Email/password: register, login, logout, `/auth/me`, token refresh
- **Email verification** via Resend — token stored in DB, verified on GET `/auth/verify`
- Resend verification email with dark-themed HTML template
- **Forgot password / reset password** — time-limited token, dark-themed reset email
- **Google OAuth** — verifies access token via Google userinfo endpoint, upserts user
- **Facebook OAuth** — verifies access token via Graph API (`/me?fields=id,name,email`), upserts user
- **Apple OAuth** — decodes ID token header, fetches Apple JWKS, verifies RS256 signature, handles email-only-on-first-sign-in edge case
- Dynamic CORS allowing both `http://localhost:3000` and `https://localhost:3000` + `FRONTEND_URL`

### Backend — Content

- Express server with full content management API
- PostgreSQL connection pool via `pg` in `backend/src/db.ts`
- SSL auto-enabled when `DATABASE_URL` contains "supabase"
- All content routes: `GET /content/:key?lang=`, source update, localizations, status listing
- `languageSchema` covers all 12 locales: en, nl, de, fr, it, es, pt, pl, ro, et, lv, fi

### CMS — Live ✅

- `002_content.sql` applied — `content_documents`, `content_localizations`, `content_translation_jobs` tables exist in Supabase
- `marketing-homepage` document seeded with full English dictionary (`database/seed_marketing_homepage.sql`)
- `getDictionary()` fetches from DB first (`cache: 'no-store'` in dev, `revalidate: 300` in prod), falls back to local JSON
- Server-side fetch uses `INTERNAL_API_URL=http://localhost:4000` to bypass HTTPS self-signed cert
- Live tested: updating `content_json` in pgAdmin → page reflects change on next load ✅
- `content_json` structure matches frontend `MarketingDictionary` type exactly

### Frontend — Auth

- `AuthContext` — global auth state with `login`, `register`, `logout`, `loginWithGoogle`, `loginWithFacebook`, `loginWithApple`
- `auth-client.ts` — typed API helpers for all auth endpoints
- Access token stored in memory (not localStorage), refresh via httpOnly cookie on page load
- `global.d.ts` — TypeScript types for `window.FB` and `window.AppleID`
- **Facebook JS SDK** loaded dynamically when `NEXT_PUBLIC_FACEBOOK_APP_ID` is set
- **Apple JS SDK** loaded dynamically when `NEXT_PUBLIC_APPLE_CLIENT_ID` is set
- Facebook login end-to-end tested and working ✅
- Apple OAuth code complete — Apple developer setup deferred

### Frontend — AuthModal

- **Full dark redesign** matching app design language:
  - `bg-slate-900` card, `bg-slate-800` inputs/tabs, `from-cyan-500 to-blue-600` gradient CTAs
  - CP gradient logo badge, tab switcher with active cyan highlight
  - Error/info feedback banners (`red-500/10`, `cyan-500/10`)
- Login, Register, Forgot Password flows in one modal
- Email verification pending state with resend link
- **Google, Facebook, Apple** all rendered as uniform `SocialBtn` with fixed-width icon slot (logos vertically aligned)
- `useGoogleLogin` hook replaces `<GoogleLogin>` component for consistent styling

### Frontend — Routing & Localisation

- `[lang]` dynamic route with `generateStaticParams` covering 12 locales
- Middleware-based locale enforcement with `notFound()` fallback
- Dictionary-driven content loaded via `getDictionary.ts`
- Supported languages: en, nl, de, fr, it, es (full JSON); pt, pl, ro, et, lv, fi (fallback to English)
- `LanguageSwitcher` component with full dropdown

### Frontend — Homepage Sections

| Section                    | Status | Notes                                                               |
| -------------------------- | ------ | ------------------------------------------------------------------- |
| `HeroSection`              | ✅     | Lightweight background, "Preview first" positioning                 |
| `PositioningSection`       | ✅     | Risk Reversal, Perfect For, What Happens Next                       |
| `HowItWorksSection`        | ✅     | 3 steps, CTA                                                        |
| `TemplatesShowcaseSection` | ✅     | 4 categories + "View all" link                                      |
| `DemoPreviewSection`       | ✅     | Core offer block with Cloudinary preview                            |
| `ServicesSection`          | ✅     | 4 service groups, compact style                                     |
| `SocialProofSection`       | ✅     | 4 reasons + animated counters                                       |
| `CallToActionSection`      | ✅     | Flat, no animations                                                 |
| `Header`                   | ✅     | Transparent→solid scroll, auth state, language switcher             |
| `Footer`                   | ✅     | Full columns, sliding cyan underline link animations, no reveal lag |

### Frontend — SEO

- `metadataBase` set in root layout via `NEXT_PUBLIC_SITE_URL`
- `generateMetadata` on `[lang]/page.tsx`: per-locale canonical, hreflang all 12 langs, x-default=/en, OG
- `/landing` and `/landing/[id]` variants: `noindex, follow` + per-campaign metadata

### Frontend — Scroll Animations

- `ScrollReveal` component — IntersectionObserver activates `.reveal` → `.reveal-visible` (opacity + translateY)
- `prefers-reduced-motion` media query disables all transitions
- Footer removed from reveal to prevent bottom-of-page pop-in lag

---

## What Is NOT Done Yet ❌

### Frontend

- No translations for pt, pl, ro, et, lv, fi in DB (fallback to local English JSON)
- `(admin)/` folder exists but is empty — admin panel not built
- No sitemap.xml / robots.txt
- `NEXT_PUBLIC_SITE_URL` not configured for production (defaults to localhost)

### Auth

- Apple Sign In developer setup pending (Service ID, domain/redirect in Apple Developer Portal)
- Facebook app in Development mode (need Live mode for public users)

### Infrastructure

- Not deployed (Vercel + Railway setup pending)
- No CI/CD pipeline

### Content

- Only English (`en`) seeded in DB — other locales still use local JSON fallback
- No admin UI for editing content (SQL-only for now)

---

## Next Steps (Suggested Order)

1. **Admin panel** — build `/admin/content/homepage` UI: JSON editor, save button, locale switch
2. **Stage 1 (NEXT_STAGES_PLAN)** — `004_templates_messages.sql`, templates + messages APIs, wire up frontend
3. **Apple Sign In setup** — Apple Developer Portal Service ID
4. **Translations** — seed other locales into `content_localizations` (nl, de, fr, it, es)
5. **Deploy** — Vercel (frontend) + Railway (backend), `INTERNAL_API_URL` → Railway URL
6. **Sitemap + robots.txt**
7. **Facebook app** → Live mode for production
