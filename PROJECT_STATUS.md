# Company Platform — Project Status

## Stack

| Layer    | Tech                                                         |
|----------|--------------------------------------------------------------|
| Frontend | Next.js 16.2.3 (App Router), React 19, TypeScript, Tailwind v4 |
| Backend  | Node.js, Express 5, TypeScript, pg (PostgreSQL client)       |
| Database | PostgreSQL (schema in `database/001_init.sql`)               |
| Images   | Cloudinary                                                   |
| Auth     | JWT + bcryptjs                                               |

---

## What Is Done

### Backend
- Express server with JWT auth, bcrypt password hashing, Zod validation
- PostgreSQL connection pool via `pg` in `backend/src/db.ts`
- `DATABASE_URL` env-based config — needs a running Postgres instance to activate
- Build and typecheck scripts ready (`npm run build`, `npm run dev`)

### Frontend — Routing & Localisation
- `[lang]` dynamic route with `generateStaticParams` covering 12 locales
- `generateStaticParams` outputs static pages for all locales at build time
- Middleware-based locale enforcement with `notFound()` fallback
- Dictionary-driven content loaded via `getDictionary.ts` (API-first, JSON fallback)
- Supported languages:
  - en, nl, de, fr, it, es (full JSON dictionaries)
  - pt, pl, ro, et, lv, fi (fallback to English until translated)
- `isSupportedLanguage` type guard used throughout
- `LanguageSwitcher` component with full dropdown

### Frontend — Homepage Sections
All sections are dictionary-driven (content comes from JSON / API, not hardcoded).

| Section | Status | Notes |
|---|---|---|
| `HeroSection` | ✅ Done | Lightweight tech background — grid + 2 moving strips, static CPU, no blur/glow. "Preview first" positioning. |
| `PositioningSection` | ✅ Done | New section below Hero. 3-card block: Risk Reversal, Perfect For, What Happens Next |
| `HowItWorksSection` | ✅ Done | 3 steps, one CTA button. Not duplicated with Hero anymore. |
| `TemplatesShowcaseSection` | ✅ Done | Shows 4 categories only + "+ View all templates" link |
| `DemoPreviewSection` | ✅ Done | Core offer block with Cloudinary image preview |
| `ServicesSection` | ✅ Done | 4 service groups in cards — compact one-line item style |
| `SocialProofSection` | ✅ Done | 4 reasons + animated counter stats (500+ projects, 50+ clients, 4-14 days, 98%) |
| `CallToActionSection` | ✅ Done | Lightweight — no reveal/gradient animations, flat background |
| `Header` | ✅ Done | Transparent → solid on scroll, auth state, language switcher, Chat CTA |
| `Footer` | ✅ Done | Brand, services, company, legal, contact columns |
| `ScrollReveal` | ✅ Done | Intersection observer for `.reveal` class |
| `CookieConsent` | ✅ Done | |

### Frontend — Performance
- Removed all glow/blur utility classes from homepage
- Removed `animate-gradient-shift` from all CTA buttons
- Removed decorative background blobs
- All section `reveal` animations are CSS-only (no JS per element)
- Added `.btn-soft-motion` utility — lightweight 180ms translateY(-1px) hover only
- Hero animation: 2 drifting strips (CSS `strip-drift` keyframe, 14s, very low opacity)
- `prefers-reduced-motion` global disable applied
- Tech circuit strips disabled on mobile via media query

### Frontend — SEO
- `metadataBase` set globally in `app/layout.tsx` via `NEXT_PUBLIC_SITE_URL`
- `generateMetadata` on `[lang]/page.tsx`:
  - Per-locale canonical URL
  - hreflang alternates for all 12 languages
  - `x-default` pointing to `/en`
  - Open Graph title/description/url
- `/landing` hub page: `noindex, follow`
- `/landing/[id]` variants: `noindex, follow` + per-campaign metadata (title, description, canonical, OG)

### Frontend — Landing Pages (Paid Traffic)
- `/landing` — internal campaign hub, noindexed
- `/landing/[id]` — 5 variants: `green`, `red`, `blue`, `enterprise`, `chat-boost`
  - Each has custom headline/description focused on preview-first positioning
  - Risk-reversal bullet points on every variant
  - "What happens next?" 4-step flow
  - CTA labels aligned: "Start Chat with Developer" / "See Templates"

### Content (English + Dutch)
Key messaging applied to `en.json` and `nl.json`:

| Element | Copy |
|---|---|
| Hero title | "Build Your Website in Days - Not Weeks" |
| Hero subtitle | "See Your Website Before You Pay" |
| Hero description | "No risk. No guessing. Just a real preview before we build." |
| Primary CTA | "Start Chat with Developer" |
| Secondary CTA | "See Templates" |
| Final CTA title | "Start Your Project Today" |
| Services framing | "We don't just build your website — we help you grow it" |
| Why Choose Us reasons | Benefit-focused: "Launch Faster Than Traditional Agencies", "Direct Communication with Your Developer" |

---

## What Is NOT Done Yet

### Backend / Database
- PostgreSQL instance not running yet — `DATABASE_URL` needs to be set
- Schema from `database/001_init.sql` not applied to a real database
- Backend server not started or tested against a live DB
- No seed data

### Frontend
- No translations for pt, pl, ro, et, lv, fi (currently fallback to English)
- `/landing/[id]` pages have placeholder layout — no real brand styling matching the main site
- No UTM parameter capture on landing pages
- No conversion event tracking (click on chat, template, register)
- No sticky mobile CTA bar
- Auth modal and dashboard pages exist but not reviewed/polished

### Infrastructure
- `NEXT_PUBLIC_SITE_URL` not configured (defaults to localhost)
- No deployment setup (Vercel, Railway, etc.)
- No CI/CD pipeline
- No sitemap.xml / robots.txt generated yet

---

## Next Steps (Suggested Order)

1. **PostgreSQL** — spin up instance, apply schema, set env, test backend
2. **Translations** — generate full JSON for pt, pl, ro, et, lv, fi
3. **Landing pages** — proper visual layout matching main brand + UTM capture
4. **Sitemap + robots.txt** — Next.js route-based generation
5. **Deployment** — choose host, configure env variables, set `NEXT_PUBLIC_SITE_URL`
6. **Conversion tracking** — chat click, template click, register click events
