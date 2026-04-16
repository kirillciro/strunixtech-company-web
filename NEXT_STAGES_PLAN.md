# Next Stages Plan

## Current Status — April 12, 2026 (evening)

**We are at Stage 1 — starting now.**

Stage 0 (auth + design + CMS pipeline) is fully complete and live-tested.

---

## What is already working ✅

- Next.js frontend with `[lang]` routing for 12 locales, full homepage sections
- Express backend with complete auth system (email, Google, Facebook, Apple OAuth)
- **Live CMS pipeline**: `getDictionary()` → `GET /content/marketing-homepage?lang=en` → DB → page
  - Verified: edit `content_json` in pgAdmin → page reflects change immediately
  - `cache: 'no-store'` in dev, `revalidate: 300` in prod
  - Server-side fetch uses `INTERNAL_API_URL` (bypasses HTTPS proxy)
- `002_content.sql` applied — content tables live in Supabase
- `marketing-homepage` seeded with full English dictionary
- Dark-themed AuthModal with Google, Facebook, Apple social buttons
- `AuthContext` global state, full token rotation, email verification, password reset
- HTTPS local dev with mkcert + Next.js API proxy

## What is still placeholder-only

- chat UI (static)
- templates data (static)
- template preview flow (static)
- dashboard data (static)
- project tracking (not started)
- scheduling (not started)
- payments (not started)
- uploads (not started)
- AI generation (not started)
- Apple Sign In (dev portal setup pending)

---

## Recommended Build Order

### Stage 0: Auth & Design Foundation ✅ COMPLETE

Completed:

- Full JWT auth with email verification and password reset
- Google, Facebook, Apple OAuth
- Dark AuthModal matching app design
- Complete homepage with animations and SEO
- HTTPS local dev environment
- **Live CMS pipeline** — DB → API → Next.js → page (live tested ✅)
- `content_documents` + `content_localizations` seeded with full English dictionary

---

### Stage 1: Finish MVP Foundation ← **CURRENT STAGE**

Goal: make the existing app screens real instead of mocked.

Build next:

1. Expand the database schema
2. Add backend APIs for templates and messages
3. Replace static frontend data with API data
4. Turn the dashboard into a real client workspace

Database tables to add first:

- templates
- template_assets or template_previews
- conversations
- messages
- projects
- project_status_history

Why this stage comes first:

- chat depends on persisted users and conversations
- templates depend on real records and detail pages
- dashboard depends on projects and message counts

---

### Stage 2: Real-Time Chat

Goal: make live chat the main trust feature of the product.

Build:

1. REST endpoints to load conversations and message history
2. Socket.io for real-time send/receive
3. Developer and client conversation states
4. Unread message tracking

Definition of done:

- landing/chat entry creates or attaches to a conversation
- logged-in users can continue the conversation in /messages
- messages persist after refresh

### Stage 3: Template Marketplace

Goal: make templates the first real product surface.

Build:

1. templates API
2. template detail API
3. preview/demo route per template
4. basic customization controls for colors, fonts, and layout presets

Definition of done:

- templates are loaded from the backend
- each template has a detail page
- Preview Demo opens a working preview state

### Stage 4: Demo Request Pipeline

Goal: turn template interest into qualified leads.

Build:

1. form for logo, company name, description, and images
2. Cloudinary uploads
3. demo request records in the database
4. generated preview variants placeholder flow

Important note:

The AI UI generation can start as a guided placeholder workflow first. Do not block the funnel on full AI generation quality.

### Stage 5: Scheduling

Goal: convert qualified leads into booked calls.

Build:

1. availability model in the database
2. schedule selection page
3. booking confirmation flow
4. notification hooks for developer and client

Definition of done:

- users can book a time slot
- bookings are saved and unavailable slots cannot be double-booked

### Stage 6: Payments

Goal: start the commercial workflow.

Build:

1. Mollie payment creation endpoint
2. deposit payment page
3. webhook handler
4. payment status tracking in PostgreSQL

Definition of done:

- 25% deposit link is generated
- webhook marks payment as successful
- user is moved into the next project stage after successful payment

### Stage 7: Project Tracking Workspace

Goal: keep clients informed during delivery.

Build:

1. project detail page
2. progress timeline
3. milestone updates
4. final approval and remaining 75% payment flow

### Stage 8: Advanced Systems

Build later:

- admin dashboard for content editing (`/admin/content/homepage` — JSON editor, locale switch, save)
- seed other locales into `content_localizations` (nl, de, fr, it, es)
- multi-language landing pages (AI-assisted translation)
- notifications (email + in-app)
- mobile app for chat and progress
- full AI UI generation system
- Apple Sign In (complete developer portal setup)
- Facebook app Live mode (for public users)

---

## Immediate Next Task List

1. Create `004_templates_messages.sql` migration (templates, conversations, messages, projects tables)
2. Add backend routes: `GET /templates`, `GET /templates/:id`, `GET /conversations`, `POST /messages`
3. Refactor frontend templates page to load from API
4. Refactor frontend messages page to load from API
5. Upgrade dashboard to show real counts and recent activity
6. Admin panel: `/admin/content/homepage` — simple JSON editor + locale switcher
