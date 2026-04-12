# Auth.js Implementation — Questions Before We Start

> Answer each question so I can implement Auth.js exactly the way you want.
> No wrong answers — just helps me decide architecture.

---

## ⚠️ Important Notice First

Auth.js (next-auth v5) was recently announced to be **joining/merging with [Better Auth](https://better-auth.com)**.  
The Auth.js docs now show a "Migrate to Better Auth" banner at the top.

**Q0 — Which library do you actually want?**

- [ ] Auth.js / next-auth v5 (current, will eventually merge into Better Auth)
- [ ] Better Auth (the new replacement they're merging into)
- [ ] Doesn't matter, just pick the best one for this stack

---

## 1. Architecture — What happens to the Express backend auth?

Right now we have a fully working Express backend with:
`/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/me`, `/auth/verify`, `/auth/google`, `/auth/forgot-password`, `/auth/reset-password`

Auth.js runs **inside Next.js** (as API route handlers), not in Express.

**Q1 — What do you want to do with the Express auth routes?**

- [ ] **Keep them** — Auth.js on frontend only, Express backend stays (hybrid)
- [ ] **Replace them** — Migrate all auth to Auth.js, remove backend auth routes
- [ ] **Keep both** — Auth.js for OAuth (Google/Facebook/Apple), Express for email+password

---

## 2. Database Adapter

Auth.js can manage users/sessions directly in your database using an adapter.  
You have Supabase PostgreSQL.

**Q2 — Which database approach?**

- [ ] **`@auth/pg-adapter`** — connects directly to your existing `pg` pool (no ORM needed)
- [ ] **`@auth/supabase-adapter`** — uses Supabase's own client
- [ ] **No adapter / JWT only** — sessions stored in cookies, no DB writes for sessions

> Note: If you use an adapter, Auth.js will create its own tables (`users`, `accounts`, `sessions`, `verification_tokens`). This may conflict with your existing `users` table.

---

## 3. Providers — Which ones to configure now?

- [ ] **Google** (need `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`)
- [ ] **Facebook** (need `FACEBOOK_CLIENT_ID` + `FACEBOOK_CLIENT_SECRET`)
- [ ] **Apple** (need Apple Developer account, more complex setup)
- [ ] **Credentials** (email + password, calls your existing backend or handles it directly)
- [ ] **Magic Links via Resend** (passwordless — user gets email link, no password needed)

---

## 4. Session Strategy

**Q4 — How should sessions be stored?**

- [ ] **JWT** — session encoded in a cookie, stateless, no DB needed
- [ ] **Database** — session record stored in DB, requires adapter (Q2)

> If you keep the Express backend JWT system, JWT sessions make more sense.  
> If you fully migrate to Auth.js, database sessions are more robust.

---

## 5. Email Verification

You already have a working Resend-based verification flow (token sent on register, `/verify` page).

**Q5 — Who handles email verification?**

- [ ] **Keep our custom flow** — Resend + `/auth/register` + `/verify` page (already working ✅)
- [ ] **Auth.js Magic Links** — Auth.js sends the email, no password needed at all
- [ ] **Auth.js + keep password** — Auth.js handles OAuth, we keep custom email verification for credentials

---

## 6. UI — The Auth Modal

You have a fully built `AuthModal.tsx` popup (sign in / register tabs, Google button, forgot password).

**Q6 — What do you want to do with the UI?**

- [ ] **Keep the modal** — wire Auth.js `signIn()` / `signOut()` calls into the existing modal
- [ ] **Replace with Auth.js custom pages** — build new `/auth/signin` and `/auth/register` pages using Auth.js
- [ ] **Use Auth.js default pages** — fastest, but unstyled (not recommended for production)

---

## 7. What credentials do you have ready?

Check what's already available:

| Credential                            | Status                                  |
| ------------------------------------- | --------------------------------------- |
| `RESEND_API_KEY`                      | ✅ Already set                          |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID`        | ❌ Missing                              |
| `GOOGLE_CLIENT_SECRET`                | ❌ Missing                              |
| `FACEBOOK_CLIENT_ID`                  | ❓ Do you have this?                    |
| `FACEBOOK_CLIENT_SECRET`              | ❓ Do you have this?                    |
| `APPLE_*` credentials                 | ❓ Do you have Apple Developer account? |
| `AUTH_SECRET` (Auth.js requires this) | ❌ Need to generate                     |

---

## 8. Protected Routes

**Q8 — How should protected pages work?**

- [ ] **Middleware** — `middleware.ts` at Next.js root checks session on every request (recommended)
- [ ] **Per-page** — each protected page checks session itself (current approach with `useAuth`)
- [ ] **Both** — middleware for hard protection, `useAuth` for UI state

---

## My Recommendation (read before answering)

Based on your stack, I'd suggest:

> **Better Auth** over Auth.js (it's where Auth.js is heading anyway, more actively maintained)  
> **`@auth/pg-adapter`** with your existing Supabase pool  
> **Keep the modal UI**, wire `signIn()`/`signOut()` into it  
> **Keep Resend email verification** (already working)  
> **JWT sessions** to stay compatible with the Express backend  
> **Middleware** for route protection

But it's your call — answer above and I'll implement exactly what you choose.
