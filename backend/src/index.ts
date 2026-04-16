import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import cors from "cors";
import crypto from "crypto";
import express from "express";
import { createServer } from "http";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { pool } from "./db.js";
import { generateTokens, hashToken, verifyRefreshToken } from "./auth.js";
import { requireAuth, requireAdmin, type AuthedRequest } from "./middleware.js";
import { OAuth2Client } from "google-auth-library";
import { sendVerificationEmail, sendPasswordResetEmail } from "./email.js";
import type { SafeUser } from "./types.js";
import { initChatSocket } from "./chat.js";

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL ?? "https://localhost:3000",
  "http://localhost:3000",
  "https://localhost:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (server-to-server, curl, etc.)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true, // needed for httpOnly refresh cookie
  }),
);
app.use(express.json());
app.use(cookieParser());

// ── Helpers ────────────────────────────────────────────────────────────────

const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

function setRefreshCookie(res: express.Response, token: string) {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: REFRESH_COOKIE_MAX_AGE,
    path: "/",
  });
}

function clearRefreshCookie(res: express.Response) {
  res.clearCookie("refreshToken", { path: "/" });
}

function mapUser(row: {
  id: number;
  full_name: string;
  email: string;
  role: string;
  is_verified: boolean;
  provider: string;
  created_at: Date;
}): SafeUser {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    role: row.role,
    isVerified: row.is_verified,
    provider: row.provider,
    createdAt: row.created_at.toISOString(),
  };
}

// ── Validation schemas ─────────────────────────────────────────────────────

const registerSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email().max(200),
  password: z.string().min(8).max(100),
});

const loginSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(8).max(100),
});

const languageSchema = z.enum([
  "en",
  "nl",
  "de",
  "fr",
  "it",
  "es",
  "pt",
  "pl",
  "ro",
  "et",
  "lv",
  "fi",
  "sv",
  "da",
  "no",
  "cs",
  "hu",
  "el",
]);

const sourceContentSchema = z.object({
  content: z.record(z.string(), z.unknown()),
});

const localizationContentSchema = z.object({
  content: z.record(z.string(), z.unknown()),
  status: z
    .enum(["up_to_date", "needs_review", "failed", "pending"])
    .optional(),
  error: z.string().max(1000).optional(),
});

// ── Health ─────────────────────────────────────────────────────────────────

app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok" });
  } catch {
    res.status(500).json({ status: "db_error" });
  }
});

app.get("/test-db", async (_req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS now");
    res.json({ ok: true, time: result.rows[0].now });
  } catch (err) {
    console.error("[test-db] DB connection error:", err);
    res.status(500).json({ ok: false, error: "DB connection failed" });
  }
});

// ── Auth: Register ─────────────────────────────────────────────────────────

app.post("/auth/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ message: "Invalid input", issues: parsed.error.issues });
  }

  const { fullName, email, password } = parsed.data;

  try {
    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1 LIMIT 1",
      [email.toLowerCase()],
    );
    if (existing.rowCount && existing.rowCount > 0) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verifyToken = crypto.randomBytes(32).toString("hex");
    const verifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const inserted = await pool.query(
      `INSERT INTO users
         (full_name, email, password_hash, is_verified, email_verify_token, email_verify_expires)
       VALUES ($1, $2, $3, FALSE, $4, $5)
       RETURNING id, full_name, email, role, is_verified, provider, created_at`,
      [fullName, email.toLowerCase(), passwordHash, verifyToken, verifyExpires],
    );

    const user = mapUser(inserted.rows[0]);
    const tokens = generateTokens({
      sub: String(user.id),
      email: user.email,
      role: user.role,
    });

    await pool.query("UPDATE users SET refresh_token_hash = $1 WHERE id = $2", [
      hashToken(tokens.refreshToken),
      user.id,
    ]);

    setRefreshCookie(res, tokens.refreshToken);

    // Fire-and-forget verification email
    const clientUrl = process.env.FRONTEND_URL ?? "http://localhost:3000";
    const verifyUrl = `${clientUrl}/verify?token=${verifyToken}`;
    sendVerificationEmail(user.email, verifyUrl).catch((err) =>
      console.error("[email] sendVerificationEmail failed:", err),
    );

    return res.status(201).json({
      accessToken: tokens.accessToken,
      user,
      needsVerification: true,
      message: "Account created! Please verify your email.",
    });
  } catch {
    return res.status(500).json({ message: "Could not create account" });
  }
});

// ── Auth: Login ────────────────────────────────────────────────────────────

app.post("/auth/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ message: "Invalid input", issues: parsed.error.issues });
  }

  const { email, password } = parsed.data;

  try {
    const result = await pool.query(
      `SELECT id, full_name, email, password_hash, role, is_verified, provider, created_at
       FROM users WHERE email = $1 AND provider = 'email' LIMIT 1`,
      [email.toLowerCase()],
    );

    if (!result.rowCount || result.rowCount === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const row = result.rows[0] as {
      id: number;
      full_name: string;
      email: string;
      password_hash: string;
      role: string;
      is_verified: boolean;
      provider: string;
      created_at: Date;
    };

    const validPassword = await bcrypt.compare(password, row.password_hash);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!row.is_verified) {
      return res.status(403).json({
        message: "Please verify your email before signing in.",
        code: "EMAIL_NOT_VERIFIED",
      });
    }

    const user = mapUser(row);
    const tokens = generateTokens({
      sub: String(user.id),
      email: user.email,
      role: user.role,
    });

    await pool.query("UPDATE users SET refresh_token_hash = $1 WHERE id = $2", [
      hashToken(tokens.refreshToken),
      user.id,
    ]);

    setRefreshCookie(res, tokens.refreshToken);

    return res.json({
      accessToken: tokens.accessToken,
      user,
    });
  } catch {
    return res.status(500).json({ message: "Could not log in" });
  }
});

// ── Auth: Refresh token rotation ───────────────────────────────────────────

app.post("/auth/refresh", async (req, res) => {
  const rawToken = req.cookies?.refreshToken as string | undefined;
  if (!rawToken) {
    return res.status(401).json({ message: "Refresh token missing" });
  }

  try {
    const decoded = verifyRefreshToken(rawToken);

    const result = await pool.query(
      `SELECT id, full_name, email, role, is_verified, provider, created_at, refresh_token_hash
       FROM users WHERE id = $1 LIMIT 1`,
      [decoded.sub],
    );

    if (!result.rowCount || result.rowCount === 0) {
      clearRefreshCookie(res);
      return res.status(401).json({ message: "User not found" });
    }

    const row = result.rows[0] as {
      id: number;
      full_name: string;
      email: string;
      role: string;
      is_verified: boolean;
      provider: string;
      created_at: Date;
      refresh_token_hash: string | null;
    };

    const incomingHash = hashToken(rawToken);
    if (!row.refresh_token_hash || row.refresh_token_hash !== incomingHash) {
      // Token reuse detected — wipe stored token
      await pool.query(
        "UPDATE users SET refresh_token_hash = NULL WHERE id = $1",
        [row.id],
      );
      clearRefreshCookie(res);
      return res.status(401).json({ message: "Refresh token reuse detected" });
    }

    const user = mapUser(row);
    const tokens = generateTokens({
      sub: String(user.id),
      email: user.email,
      role: user.role,
    });

    await pool.query("UPDATE users SET refresh_token_hash = $1 WHERE id = $2", [
      hashToken(tokens.refreshToken),
      user.id,
    ]);

    setRefreshCookie(res, tokens.refreshToken);
    return res.json({ accessToken: tokens.accessToken, user });
  } catch {
    clearRefreshCookie(res);
    return res
      .status(401)
      .json({ message: "Invalid or expired refresh token" });
  }
});

// ── Auth: Logout ───────────────────────────────────────────────────────────

app.post("/auth/logout", async (req, res) => {
  const rawToken = req.cookies?.refreshToken as string | undefined;

  if (rawToken) {
    try {
      const decoded = verifyRefreshToken(rawToken);
      await pool.query(
        "UPDATE users SET refresh_token_hash = NULL WHERE id = $1",
        [decoded.sub],
      );
    } catch {
      // Expired/invalid — clear anyway
    }
  }

  clearRefreshCookie(res);
  return res.json({ success: true });
});

// ── Auth: Me ───────────────────────────────────────────────────────────────

app.get("/auth/me", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const result = await pool.query(
      `SELECT id, full_name, email, role, is_verified, provider, created_at
       FROM users WHERE id = $1 LIMIT 1`,
      [req.userId],
    );
    if (!result.rowCount || result.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json({ user: mapUser(result.rows[0]) });
  } catch {
    return res.status(500).json({ message: "Could not fetch user" });
  }
});

// ── Auth: Verify email ─────────────────────────────────────────────────────

// GET /auth/verify?token=... — email link clicks land here, verify and redirect
app.get("/auth/verify", async (req, res) => {
  const { token } = req.query as { token?: string };
  const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:3000";

  if (!token || typeof token !== "string") {
    return res.redirect(`${frontendUrl}/verify?error=invalid`);
  }

  try {
    const result = await pool.query(
      `UPDATE users
       SET is_verified = TRUE, email_verify_token = NULL, email_verify_expires = NULL
       WHERE email_verify_token = $1
         AND email_verify_expires > NOW()
       RETURNING id`,
      [token],
    );

    if (!result.rowCount || result.rowCount === 0) {
      return res.redirect(`${frontendUrl}/verify?error=expired`);
    }

    return res.redirect(`${frontendUrl}/verify?success=1`);
  } catch {
    return res.redirect(`${frontendUrl}/verify?error=server`);
  }
});

// POST /auth/verify-email — called by the frontend verify page as fallback
app.post("/auth/verify-email", async (req, res) => {
  const { token } = req.body as { token?: string };
  if (!token || typeof token !== "string") {
    return res.status(400).json({ message: "Token required" });
  }

  try {
    const result = await pool.query(
      `UPDATE users
       SET is_verified = TRUE, email_verify_token = NULL, email_verify_expires = NULL
       WHERE email_verify_token = $1
         AND email_verify_expires > NOW()
       RETURNING id`,
      [token],
    );

    if (!result.rowCount || result.rowCount === 0) {
      return res
        .status(400)
        .json({ message: "Verification link is expired or invalid" });
    }

    return res.json({
      success: true,
      message: "Email verified! You can now sign in.",
    });
  } catch {
    return res.status(500).json({ message: "Could not verify email" });
  }
});

// ── Auth: Resend verification email ───────────────────────────────────────

app.post("/auth/resend-verification", async (req, res) => {
  const { email } = req.body as { email?: string };
  if (!email || typeof email !== "string") {
    return res.status(400).json({ message: "Email required" });
  }

  try {
    const result = await pool.query(
      "SELECT id, is_verified FROM users WHERE email = $1 LIMIT 1",
      [email.toLowerCase()],
    );

    // Always return 200 — don't reveal whether the email exists
    if (
      !result.rowCount ||
      result.rowCount === 0 ||
      result.rows[0].is_verified
    ) {
      return res.json({ success: true });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await pool.query(
      "UPDATE users SET email_verify_token = $1, email_verify_expires = $2 WHERE id = $3",
      [rawToken, expires, result.rows[0].id],
    );

    const clientUrl = process.env.FRONTEND_URL ?? "http://localhost:3000";
    const verifyUrl = `${clientUrl}/verify?token=${rawToken}`;
    sendVerificationEmail(email.toLowerCase(), verifyUrl).catch((err) =>
      console.error("[email] resend verification failed:", err),
    );

    return res.json({ success: true });
  } catch {
    return res
      .status(500)
      .json({ message: "Could not resend verification email" });
  }
});

// ── Auth: Forgot password ──────────────────────────────────────────────────

app.post("/auth/forgot-password", async (req, res) => {
  const { email } = req.body as { email?: string };
  if (!email || typeof email !== "string") {
    return res.status(400).json({ message: "Email required" });
  }

  try {
    const result = await pool.query(
      "SELECT id FROM users WHERE email = $1 AND provider = 'email' LIMIT 1",
      [email.toLowerCase()],
    );

    // Always 200 — never reveal account existence
    if (!result.rowCount || result.rowCount === 0) {
      return res.json({ success: true });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashed = hashToken(rawToken);
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    await pool.query(
      "UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3",
      [hashed, expires, result.rows[0].id],
    );

    const clientUrl = process.env.FRONTEND_URL ?? "http://localhost:3000";
    const resetUrl = `${clientUrl}/reset-password?token=${rawToken}`;
    await sendPasswordResetEmail(email.toLowerCase(), resetUrl);

    return res.json({ success: true });
  } catch {
    return res.status(500).json({ message: "Could not send reset email" });
  }
});

// ── Auth: Reset password ───────────────────────────────────────────────────

app.post("/auth/reset-password", async (req, res) => {
  const { token, password } = req.body as { token?: string; password?: string };
  if (
    !token ||
    !password ||
    typeof token !== "string" ||
    typeof password !== "string"
  ) {
    return res.status(400).json({ message: "Token and new password required" });
  }
  if (password.length < 8) {
    return res
      .status(400)
      .json({ message: "Password must be at least 8 characters" });
  }

  const hashed = hashToken(token);

  try {
    const result = await pool.query(
      "SELECT id FROM users WHERE reset_token = $1 AND reset_token_expires > NOW() LIMIT 1",
      [hashed],
    );

    if (!result.rowCount || result.rowCount === 0) {
      return res
        .status(400)
        .json({ message: "Reset link is expired or invalid" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await pool.query(
      `UPDATE users
       SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL, refresh_token_hash = NULL
       WHERE id = $2`,
      [passwordHash, result.rows[0].id],
    );

    return res.json({
      success: true,
      message: "Password reset successfully. You can now log in.",
    });
  } catch {
    return res.status(500).json({ message: "Could not reset password" });
  }
});

// ── Auth: Google OAuth ─────────────────────────────────────────────────────
// Frontend uses <GoogleLogin> component which POSTs the ID token (credential).
// We verify it directly with google-auth-library — no extra round-trip needed.

app.post("/auth/google", async (req, res) => {
  const { accessToken } = req.body as { accessToken?: string };
  if (!accessToken || typeof accessToken !== "string") {
    return res.status(400).json({ message: "Google access token required" });
  }

  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  if (!googleClientId) {
    return res.status(500).json({ message: "Google OAuth not configured" });
  }

  try {
    const userinfoRes = await fetch(
      `https://www.googleapis.com/oauth2/v3/userinfo`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    if (!userinfoRes.ok) {
      return res.status(401).json({ message: "Invalid Google access token" });
    }
    const payload = (await userinfoRes.json()) as {
      sub?: string;
      email?: string;
      name?: string;
      email_verified?: boolean;
    };

    if (!payload?.sub || !payload?.email) {
      return res.status(401).json({ message: "Invalid Google token" });
    }

    const { sub: googleId, email, name, email_verified } = payload;

    // Find existing user by provider + provider_id or by email
    const existing = await pool.query(
      `SELECT id, full_name, email, role, is_verified, provider, created_at
       FROM users WHERE (provider = 'google' AND provider_id = $1) OR email = $2
       LIMIT 1`,
      [googleId, email.toLowerCase()],
    );

    let user: SafeUser;

    if (existing.rowCount && existing.rowCount > 0) {
      // Update provider info if they previously registered with email
      await pool.query(
        `UPDATE users SET provider = 'google', provider_id = $1, is_verified = TRUE WHERE id = $2`,
        [googleId, existing.rows[0].id],
      );
      user = mapUser({
        ...existing.rows[0],
        is_verified: true,
        provider: "google",
      });
    } else {
      // Create new user from Google account
      const inserted = await pool.query(
        `INSERT INTO users (full_name, email, password_hash, is_verified, provider, provider_id)
         VALUES ($1, $2, '', $3, 'google', $4)
         RETURNING id, full_name, email, role, is_verified, provider, created_at`,
        [
          name ?? email.split("@")[0],
          email.toLowerCase(),
          email_verified ?? true,
          googleId,
        ],
      );
      user = mapUser(inserted.rows[0]);
    }

    const tokens = generateTokens({
      sub: String(user.id),
      email: user.email,
      role: user.role,
    });
    await pool.query("UPDATE users SET refresh_token_hash = $1 WHERE id = $2", [
      hashToken(tokens.refreshToken),
      user.id,
    ]);

    setRefreshCookie(res, tokens.refreshToken);
    return res.json({ accessToken: tokens.accessToken, user });
  } catch (err) {
    console.error("[auth/google]", err);
    return res.status(401).json({ message: "Google authentication failed" });
  }
});

// ── Auth: Facebook OAuth ───────────────────────────────────────────────────
// Frontend calls FB.login() via the JS SDK and POSTs the short-lived accessToken.
// We verify it by calling the Facebook Graph API — no extra npm package needed.

app.post("/auth/facebook", async (req, res) => {
  const { accessToken } = req.body as { accessToken?: string };
  if (!accessToken || typeof accessToken !== "string") {
    return res.status(400).json({ message: "Facebook access token required" });
  }

  try {
    const graphRes = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email&access_token=${encodeURIComponent(accessToken)}`,
    );
    const fbUser = (await graphRes.json()) as {
      id?: string;
      name?: string;
      email?: string;
      error?: unknown;
    };

    if (!graphRes.ok || !fbUser.id) {
      return res.status(401).json({ message: "Invalid Facebook token" });
    }

    const { id: facebookId, name, email } = fbUser;

    if (!email) {
      return res.status(400).json({
        message:
          "Email permission is required. Please allow email access when signing in with Facebook.",
      });
    }

    const existing = await pool.query(
      `SELECT id, full_name, email, role, is_verified, provider, created_at
       FROM users WHERE (provider = 'facebook' AND provider_id = $1) OR email = $2
       LIMIT 1`,
      [facebookId, email.toLowerCase()],
    );

    let user: SafeUser;

    if (existing.rowCount && existing.rowCount > 0) {
      await pool.query(
        `UPDATE users SET provider = 'facebook', provider_id = $1, is_verified = TRUE WHERE id = $2`,
        [facebookId, existing.rows[0].id],
      );
      user = mapUser({
        ...existing.rows[0],
        is_verified: true,
        provider: "facebook",
      });
    } else {
      const inserted = await pool.query(
        `INSERT INTO users (full_name, email, password_hash, is_verified, provider, provider_id)
         VALUES ($1, $2, '', TRUE, 'facebook', $3)
         RETURNING id, full_name, email, role, is_verified, provider, created_at`,
        [name ?? email.split("@")[0], email.toLowerCase(), facebookId],
      );
      user = mapUser(inserted.rows[0]);
    }

    const tokens = generateTokens({
      sub: String(user.id),
      email: user.email,
      role: user.role,
    });
    await pool.query("UPDATE users SET refresh_token_hash = $1 WHERE id = $2", [
      hashToken(tokens.refreshToken),
      user.id,
    ]);

    setRefreshCookie(res, tokens.refreshToken);
    return res.json({ accessToken: tokens.accessToken, user });
  } catch (err) {
    console.error("[auth/facebook]", err);
    return res.status(401).json({ message: "Facebook authentication failed" });
  }
});

// ── Auth: Apple Sign In ────────────────────────────────────────────────────
// Frontend calls AppleID.auth.signIn() (popup mode) and POSTs the id_token.
// We verify using Apple's public JWKS endpoint + Node.js built-in crypto.
// No extra npm package needed — jsonwebtoken is already installed.

app.post("/auth/apple", async (req, res) => {
  const { idToken, fullName } = req.body as {
    idToken?: string;
    fullName?: string;
  };
  if (!idToken || typeof idToken !== "string") {
    return res.status(400).json({ message: "Apple ID token required" });
  }

  try {
    // Decode to get key ID from header
    const decoded = jwt.decode(idToken, { complete: true }) as {
      header: { kid?: string; alg?: string };
      payload: { sub?: string; email?: string; iss?: string };
    } | null;

    if (!decoded?.header?.kid) {
      return res.status(401).json({ message: "Invalid Apple ID token" });
    }

    // Fetch Apple's public JWKS
    const jwksRes = await fetch("https://appleid.apple.com/auth/keys");
    const jwks = (await jwksRes.json()) as {
      keys: Array<Record<string, unknown>>;
    };
    const jwk = jwks.keys.find((k) => k.kid === decoded.header.kid);

    if (!jwk) {
      return res.status(401).json({ message: "Apple signing key not found" });
    }

    // Convert JWK → PEM using Node.js built-in crypto (no extra package needed)
    const publicKey = crypto.createPublicKey({
      key: jwk as JsonWebKey,
      format: "jwk",
    } as import("crypto").JsonWebKeyInput);
    const pem = publicKey.export({ type: "spki", format: "pem" }) as string;

    const payload = jwt.verify(idToken, pem, {
      algorithms: ["RS256"],
      issuer: "https://appleid.apple.com",
    }) as jwt.JwtPayload;

    const { sub: appleId, email } = payload;

    if (!appleId) {
      return res.status(401).json({ message: "Invalid Apple token payload" });
    }

    // Apple only sends email on the very first sign-in.
    // If we already know this Apple user, we can look them up by provider_id.
    if (!email) {
      const byId = await pool.query(
        `SELECT id, full_name, email, role, is_verified, provider, created_at
         FROM users WHERE provider = 'apple' AND provider_id = $1 LIMIT 1`,
        [appleId],
      );
      if (byId.rowCount && byId.rowCount > 0) {
        const user = mapUser({
          ...byId.rows[0],
          is_verified: true,
          provider: "apple",
        });
        const tokens = generateTokens({
          sub: String(user.id),
          email: user.email,
          role: user.role,
        });
        await pool.query(
          "UPDATE users SET refresh_token_hash = $1 WHERE id = $2",
          [hashToken(tokens.refreshToken), user.id],
        );
        setRefreshCookie(res, tokens.refreshToken);
        return res.json({ accessToken: tokens.accessToken, user });
      }
      return res.status(400).json({
        message:
          "Email permission is required for new Apple accounts. Please sign in again.",
      });
    }

    const existing = await pool.query(
      `SELECT id, full_name, email, role, is_verified, provider, created_at
       FROM users WHERE (provider = 'apple' AND provider_id = $1) OR email = $2
       LIMIT 1`,
      [appleId, email.toLowerCase()],
    );

    let user: SafeUser;

    if (existing.rowCount && existing.rowCount > 0) {
      await pool.query(
        `UPDATE users SET provider = 'apple', provider_id = $1, is_verified = TRUE WHERE id = $2`,
        [appleId, existing.rows[0].id],
      );
      user = mapUser({
        ...existing.rows[0],
        is_verified: true,
        provider: "apple",
      });
    } else {
      const displayName = fullName ?? email.split("@")[0];
      const inserted = await pool.query(
        `INSERT INTO users (full_name, email, password_hash, is_verified, provider, provider_id)
         VALUES ($1, $2, '', TRUE, 'apple', $3)
         RETURNING id, full_name, email, role, is_verified, provider, created_at`,
        [displayName, email.toLowerCase(), appleId],
      );
      user = mapUser(inserted.rows[0]);
    }

    const tokens = generateTokens({
      sub: String(user.id),
      email: user.email,
      role: user.role,
    });
    await pool.query("UPDATE users SET refresh_token_hash = $1 WHERE id = $2", [
      hashToken(tokens.refreshToken),
      user.id,
    ]);

    setRefreshCookie(res, tokens.refreshToken);
    return res.json({ accessToken: tokens.accessToken, user });
  } catch (err) {
    console.error("[auth/apple]", err);
    return res.status(401).json({ message: "Apple authentication failed" });
  }
});

// ── Content: Public ────────────────────────────────────────────────────────

app.get("/content/:contentKey", async (req, res) => {
  const { contentKey } = req.params;
  const parsedLocale = languageSchema.safeParse(req.query.lang ?? "en");

  if (!parsedLocale.success) {
    return res.status(400).json({ message: "Unsupported locale" });
  }

  const requestedLocale = parsedLocale.data;

  try {
    const localized = await pool.query(
      `SELECT d.content_key, d.version, l.locale, l.translation_status, l.content_json
       FROM content_documents d
       JOIN content_localizations l ON l.document_id = d.id
       WHERE d.content_key = $1 AND l.locale = $2
       LIMIT 1`,
      [contentKey, requestedLocale],
    );

    if (localized.rowCount && localized.rowCount > 0) {
      const row = localized.rows[0] as {
        content_key: string;
        version: number;
        locale: string;
        translation_status: string;
        content_json: unknown;
      };
      return res.json({
        contentKey: row.content_key,
        locale: row.locale,
        fallback: false,
        sourceVersion: row.version,
        translationStatus: row.translation_status,
        content: row.content_json,
      });
    }

    const fallback = await pool.query(
      `SELECT d.content_key, d.version, l.locale, l.translation_status, l.content_json
       FROM content_documents d
       JOIN content_localizations l ON l.document_id = d.id
       WHERE d.content_key = $1 AND l.locale = 'en'
       LIMIT 1`,
      [contentKey],
    );

    if (!fallback.rowCount || fallback.rowCount === 0) {
      return res.status(404).json({ message: "Content not found" });
    }

    const row = fallback.rows[0] as {
      content_key: string;
      version: number;
      locale: string;
      translation_status: string;
      content_json: unknown;
    };
    return res.json({
      contentKey: row.content_key,
      locale: row.locale,
      fallback: requestedLocale !== "en",
      sourceVersion: row.version,
      translationStatus: row.translation_status,
      content: row.content_json,
    });
  } catch {
    return res.status(500).json({ message: "Could not fetch content" });
  }
});

// ── Content: Admin ─────────────────────────────────────────────────────────

app.put(
  "/admin/content/:contentKey/source",
  requireAuth,
  async (req: AuthedRequest, res) => {
    const { contentKey } = req.params;
    const parsed = sourceContentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ message: "Invalid input", issues: parsed.error.issues });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const existingDoc = await client.query(
        "SELECT id, version FROM content_documents WHERE content_key = $1 LIMIT 1",
        [contentKey],
      );

      let documentId: number;
      let nextVersion: number;

      if (!existingDoc.rowCount || existingDoc.rowCount === 0) {
        const ins = await client.query(
          `INSERT INTO content_documents (content_key, source_locale, status) VALUES ($1, 'en', 'draft') RETURNING id, version`,
          [contentKey],
        );
        documentId = ins.rows[0].id as number;
        nextVersion = ins.rows[0].version as number;
      } else {
        documentId = existingDoc.rows[0].id as number;
        nextVersion = Number(existingDoc.rows[0].version) + 1;
        await client.query(
          "UPDATE content_documents SET version = $1, updated_at = NOW() WHERE id = $2",
          [nextVersion, documentId],
        );
      }

      await client.query(
        `INSERT INTO content_localizations
         (document_id, locale, is_source, translation_status, content_json, source_version, translated_from_version, last_translated_at, updated_at)
       VALUES ($1, 'en', TRUE, 'up_to_date', $2::jsonb, $3, $3, NOW(), NOW())
       ON CONFLICT (document_id, locale) DO UPDATE SET
         is_source = TRUE, translation_status = 'up_to_date', content_json = EXCLUDED.content_json,
         source_version = EXCLUDED.source_version, translated_from_version = EXCLUDED.translated_from_version,
         last_translated_at = NOW(), updated_at = NOW(), last_error = NULL`,
        [documentId, JSON.stringify(parsed.data.content), nextVersion],
      );

      await client.query(
        `UPDATE content_localizations SET translation_status = 'pending', source_version = $1, updated_at = NOW()
       WHERE document_id = $2 AND locale <> 'en'`,
        [nextVersion, documentId],
      );

      await client.query("COMMIT");
      return res.json({
        contentKey,
        sourceLocale: "en",
        sourceVersion: nextVersion,
        message: "Source content updated",
      });
    } catch {
      await client.query("ROLLBACK");
      return res
        .status(500)
        .json({ message: "Could not update source content" });
    } finally {
      client.release();
    }
  },
);

app.put(
  "/admin/content/:contentKey/localizations/:locale",
  requireAuth,
  async (req, res) => {
    const { contentKey, locale } = req.params;
    const parsedLocale = languageSchema.safeParse(locale);
    const parsedBody = localizationContentSchema.safeParse(req.body);

    if (!parsedLocale.success)
      return res.status(400).json({ message: "Unsupported locale" });
    if (!parsedBody.success)
      return res
        .status(400)
        .json({ message: "Invalid input", issues: parsedBody.error.issues });

    try {
      const doc = await pool.query(
        "SELECT id, version FROM content_documents WHERE content_key = $1 LIMIT 1",
        [contentKey],
      );
      if (!doc.rowCount || doc.rowCount === 0) {
        return res.status(404).json({ message: "Content document not found" });
      }

      const documentId = doc.rows[0].id as number;
      const currentVersion = doc.rows[0].version as number;
      const status = parsedBody.data.status ?? "up_to_date";

      await pool.query(
        `INSERT INTO content_localizations
         (document_id, locale, is_source, translation_status, content_json, source_version, translated_from_version, last_translated_at, last_error, updated_at)
       VALUES ($1, $2, FALSE, $3, $4::jsonb, $5, $5, NOW(), $6, NOW())
       ON CONFLICT (document_id, locale) DO UPDATE SET
         translation_status = EXCLUDED.translation_status, content_json = EXCLUDED.content_json,
         source_version = EXCLUDED.source_version, translated_from_version = EXCLUDED.translated_from_version,
         last_translated_at = NOW(), last_error = EXCLUDED.last_error, updated_at = NOW()`,
        [
          documentId,
          parsedLocale.data,
          status,
          JSON.stringify(parsedBody.data.content),
          currentVersion,
          parsedBody.data.error ?? null,
        ],
      );

      return res.json({
        contentKey,
        locale: parsedLocale.data,
        sourceVersion: currentVersion,
        translationStatus: status,
        message: "Localization updated",
      });
    } catch {
      return res.status(500).json({ message: "Could not update localization" });
    }
  },
);

app.get(
  "/admin/content/:contentKey/localizations",
  requireAuth,
  async (req, res) => {
    const { contentKey } = req.params;
    try {
      const rows = await pool.query(
        `SELECT l.locale, l.translation_status, l.source_version, l.translated_from_version, l.updated_at, l.last_error
       FROM content_documents d
       JOIN content_localizations l ON l.document_id = d.id
       WHERE d.content_key = $1 ORDER BY l.locale ASC`,
        [contentKey],
      );
      return res.json({ contentKey, localizations: rows.rows });
    } catch {
      return res.status(500).json({ message: "Could not fetch localizations" });
    }
  },
);

// ── Admin: Stats ───────────────────────────────────────────────────────────

app.get(
  "/admin/stats",
  requireAuth,
  requireAdmin,
  async (_req: AuthedRequest, res) => {
    try {
      const [users, docs, locs] = await Promise.all([
        pool.query("SELECT COUNT(*) AS count FROM users"),
        pool.query("SELECT COUNT(*) AS count FROM content_documents"),
        pool.query(
          "SELECT COUNT(DISTINCT locale) AS count FROM content_localizations WHERE translation_status = 'up_to_date'",
        ),
      ]);
      return res.json({
        totalUsers: Number(users.rows[0].count),
        totalContent: Number(docs.rows[0].count),
        liveLocales: Number(locs.rows[0].count),
      });
    } catch {
      return res.status(500).json({ message: "Could not fetch stats" });
    }
  },
);

// ── Admin: List users ──────────────────────────────────────────────────────

app.get(
  "/admin/users",
  requireAuth,
  requireAdmin,
  async (req: AuthedRequest, res) => {
    const search = (req.query.search as string) ?? "";
    try {
      const result = await pool.query(
        `SELECT id, full_name, email, role, is_verified, provider, created_at
         FROM users
         WHERE ($1 = '' OR full_name ILIKE $2 OR email ILIKE $2)
         ORDER BY created_at DESC LIMIT 100`,
        [search, `%${search}%`],
      );
      return res.json({ users: result.rows.map(mapUser) });
    } catch {
      return res.status(500).json({ message: "Could not fetch users" });
    }
  },
);

// ── Admin: Update user role ────────────────────────────────────────────────

const roleUpdateSchema = z.object({ role: z.enum(["admin", "user"]) });

app.patch(
  "/admin/users/:id/role",
  requireAuth,
  requireAdmin,
  async (req: AuthedRequest, res) => {
    const userId = Number(req.params.id);
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    const parsed = roleUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid role" });
    }
    try {
      const result = await pool.query(
        `UPDATE users SET role = $1 WHERE id = $2
         RETURNING id, full_name, email, role, is_verified, provider, created_at`,
        [parsed.data.role, userId],
      );
      if (!result.rowCount || result.rowCount === 0) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.json({ success: true, user: mapUser(result.rows[0]) });
    } catch {
      return res.status(500).json({ message: "Could not update role" });
    }
  },
);

app.delete(
  "/admin/users/:id",
  requireAuth,
  requireAdmin,
  async (req: AuthedRequest, res) => {
    const userId = Number(req.params.id);
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    // Prevent an admin from deleting themselves
    if (userId === req.userId) {
      return res
        .status(400)
        .json({ message: "Cannot delete your own account" });
    }
    try {
      const result = await pool.query(
        "DELETE FROM users WHERE id = $1 RETURNING id",
        [userId],
      );
      if (!result.rowCount || result.rowCount === 0) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.json({ success: true });
    } catch {
      return res.status(500).json({ message: "Could not delete user" });
    }
  },
);

// ── Admin: Content section editor + AI translation ─────────────────────────

const sectionUpdateSchema = z.object({
  sectionKey: z.string().min(1).max(80),
  data: z.record(z.string(), z.unknown()),
});

const TRANSLATION_LOCALES = [
  "nl",
  "de",
  "fr",
  "it",
  "es",
  "pt",
  "pl",
  "ro",
  "et",
  "lv",
  "fi",
  "sv",
  "da",
  "no",
  "cs",
  "hu",
  "el",
];

const LOCALE_NAMES: Record<string, string> = {
  nl: "Dutch",
  de: "German",
  fr: "French",
  it: "Italian",
  es: "Spanish",
  pt: "Portuguese",
  pl: "Polish",
  ro: "Romanian",
  et: "Estonian",
  lv: "Latvian",
  fi: "Finnish",
  sv: "Swedish",
  da: "Danish",
  no: "Norwegian",
  cs: "Czech",
  hu: "Hungarian",
  el: "Greek",
};

function flattenContent(obj: unknown, prefix = ""): Record<string, string> {
  const result: Record<string, string> = {};
  if (typeof obj === "string") {
    if (prefix) result[prefix] = obj;
    return result;
  }
  if (Array.isArray(obj)) {
    obj.forEach((item, i) => {
      Object.assign(
        result,
        flattenContent(item, prefix ? `${prefix}.${i}` : String(i)),
      );
    });
    return result;
  }
  if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      Object.assign(result, flattenContent(v, prefix ? `${prefix}.${k}` : k));
    }
  }
  return result;
}

function reconstructContent(
  original: unknown,
  flatMap: Record<string, string>,
  prefix = "",
): unknown {
  if (typeof original === "string") return flatMap[prefix] ?? original;
  if (Array.isArray(original)) {
    return original.map((item, i) =>
      reconstructContent(item, flatMap, prefix ? `${prefix}.${i}` : String(i)),
    );
  }
  if (original && typeof original === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(original as Record<string, unknown>)) {
      out[k] = reconstructContent(v, flatMap, prefix ? `${prefix}.${k}` : k);
    }
    return out;
  }
  return original;
}

async function translateFlatContent(
  flatContent: Record<string, string>,
  targetLocale: string,
  apiKey: string,
): Promise<Record<string, string>> {
  const lang = LOCALE_NAMES[targetLocale] ?? targetLocale;
  const keys = Object.keys(flatContent);
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a professional website translator. You will receive a flat JSON object where keys use dot-notation (e.g. "hero.title", "companies.0") and values are English strings. Translate every value into ${lang}. Rules:\n- Return a flat JSON object with the EXACT same keys — do NOT nest them\n- Keep all ${keys.length} keys present in the output\n- Do not translate proper nouns, brand names, or URLs\n- Return valid JSON only, no extra text`,
        },
        { role: "user", content: JSON.stringify(flatContent) },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    }),
  });
  if (!response.ok) throw new Error(`OpenAI ${response.status}`);
  const r = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
  };
  return JSON.parse(r.choices[0].message.content) as Record<string, string>;
}

async function translateLocale(
  locale: string,
  englishContent: Record<string, unknown>,
  documentId: number,
  sourceVersion: number,
  apiKey: string,
): Promise<void> {
  const translatedContent: Record<string, unknown> = {};
  for (const [sectionKey, sectionData] of Object.entries(englishContent)) {
    const flat = flattenContent(sectionData);
    if (Object.keys(flat).length === 0) {
      translatedContent[sectionKey] = sectionData;
      continue;
    }
    const translated = await translateFlatContent(flat, locale, apiKey);
    const missing = Object.keys(flat).filter((k) => !(k in translated));
    if (missing.length > 0) {
      console.warn(
        `[cms] ${locale}/${sectionKey}: GPT missing keys — ${missing.join(", ")}. Using English fallback for those.`,
      );
    }
    translatedContent[sectionKey] = reconstructContent(sectionData, translated);
  }
  await pool.query(
    `INSERT INTO content_localizations
       (document_id, locale, is_source, translation_status, content_json,
        source_version, translated_from_version, last_translated_at, updated_at)
     VALUES ($1, $2, FALSE, 'up_to_date', $3::jsonb, $4, $4, NOW(), NOW())
     ON CONFLICT (document_id, locale) DO UPDATE SET
       translation_status = 'up_to_date', content_json = EXCLUDED.content_json,
       source_version = EXCLUDED.source_version,
       translated_from_version = EXCLUDED.translated_from_version,
       last_translated_at = NOW(), last_error = NULL, updated_at = NOW()`,
    [documentId, locale, JSON.stringify(translatedContent), sourceVersion],
  );
  console.log(`[cms] ✓ ${locale}`);
}

async function triggerTranslations(
  documentId: number,
  sourceVersion: number,
  englishContent: Record<string, unknown>,
): Promise<void> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn("[cms] OPENAI_API_KEY not set — translations skipped");
    return;
  }
  // Translate all locales in parallel so no locale is blocked by another
  const results = await Promise.allSettled(
    TRANSLATION_LOCALES.map((locale) =>
      translateLocale(
        locale,
        englishContent,
        documentId,
        sourceVersion,
        apiKey,
      ),
    ),
  );
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const locale = TRANSLATION_LOCALES[i];
    if (result.status === "rejected") {
      const errMsg =
        result.reason instanceof Error
          ? result.reason.message
          : String(result.reason);
      console.error(`[cms] ✗ ${locale}:`, errMsg);
      await pool
        .query(
          `INSERT INTO content_localizations
             (document_id, locale, is_source, translation_status, source_version, updated_at, last_error)
           VALUES ($1, $2, FALSE, 'failed', $3, NOW(), $4)
           ON CONFLICT (document_id, locale) DO UPDATE SET
             translation_status = 'failed', last_error = EXCLUDED.last_error, updated_at = NOW()`,
          [documentId, locale, sourceVersion, errMsg],
        )
        .catch(() => {});
    }
  }
}

function deepMerge(
  base: Record<string, unknown>,
  patch: Record<string, unknown>,
): Record<string, unknown> {
  const result = { ...base };
  for (const [k, v] of Object.entries(patch)) {
    if (
      v &&
      typeof v === "object" &&
      !Array.isArray(v) &&
      result[k] &&
      typeof result[k] === "object" &&
      !Array.isArray(result[k])
    ) {
      result[k] = deepMerge(
        result[k] as Record<string, unknown>,
        v as Record<string, unknown>,
      );
    } else {
      result[k] = v;
    }
  }
  return result;
}

app.put(
  "/admin/content/:contentKey/section",
  requireAuth,
  requireAdmin,
  async (req: AuthedRequest, res) => {
    const { contentKey } = req.params;
    const parsed = sectionUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ message: "Invalid input", issues: parsed.error.issues });
    }
    const { sectionKey, data } = parsed.data;
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const docResult = await client.query(
        "SELECT id, version FROM content_documents WHERE content_key = $1 LIMIT 1",
        [contentKey],
      );
      let documentId: number;
      let nextVersion: number;
      let currentContent: Record<string, unknown> = {};
      if (!docResult.rowCount || docResult.rowCount === 0) {
        const ins = await client.query(
          `INSERT INTO content_documents (content_key, source_locale, status) VALUES ($1, 'en', 'published') RETURNING id, version`,
          [contentKey],
        );
        documentId = ins.rows[0].id as number;
        nextVersion = ins.rows[0].version as number;
      } else {
        documentId = docResult.rows[0].id as number;
        nextVersion = Number(docResult.rows[0].version) + 1;
        const locResult = await client.query(
          "SELECT content_json FROM content_localizations WHERE document_id = $1 AND locale = 'en' LIMIT 1",
          [documentId],
        );
        if (locResult.rowCount && locResult.rowCount > 0) {
          currentContent = locResult.rows[0].content_json as Record<
            string,
            unknown
          >;
        }
        await client.query(
          "UPDATE content_documents SET version = $1, updated_at = NOW() WHERE id = $2",
          [nextVersion, documentId],
        );
      }
      const existing =
        (currentContent[sectionKey] as Record<string, unknown> | undefined) ??
        {};
      const updatedContent: Record<string, unknown> = {
        ...currentContent,
        [sectionKey]: deepMerge(existing, data),
      };
      await client.query(
        `INSERT INTO content_localizations
           (document_id, locale, is_source, translation_status, content_json,
            source_version, translated_from_version, last_translated_at, updated_at)
         VALUES ($1, 'en', TRUE, 'up_to_date', $2::jsonb, $3, $3, NOW(), NOW())
         ON CONFLICT (document_id, locale) DO UPDATE SET
           is_source = TRUE, translation_status = 'up_to_date',
           content_json = EXCLUDED.content_json, source_version = EXCLUDED.source_version,
           translated_from_version = EXCLUDED.translated_from_version,
           last_translated_at = NOW(), updated_at = NOW(), last_error = NULL`,
        [documentId, JSON.stringify(updatedContent), nextVersion],
      );
      await client.query(
        `UPDATE content_localizations SET translation_status = 'pending', source_version = $1, updated_at = NOW()
         WHERE document_id = $2 AND locale <> 'en'`,
        [nextVersion, documentId],
      );
      await client.query("COMMIT");
      triggerTranslations(documentId, nextVersion, updatedContent).catch(
        (err) => console.error("[cms] triggerTranslations:", err),
      );
      return res.json({
        contentKey,
        sectionKey,
        sourceVersion: nextVersion,
        translating: true,
      });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("[cms] section update:", err);
      return res.status(500).json({ message: "Could not update section" });
    } finally {
      client.release();
    }
  },
);

// ── Admin: Retranslate all languages ────────────────────────────────────────

app.post(
  "/admin/content/:contentKey/retranslate",
  requireAuth,
  requireAdmin,
  async (req: AuthedRequest, res) => {
    const { contentKey } = req.params;
    try {
      const docResult = await pool.query(
        `SELECT d.id, d.version, l.content_json
         FROM content_documents d
         JOIN content_localizations l ON l.document_id = d.id AND l.locale = 'en'
         WHERE d.content_key = $1 LIMIT 1`,
        [contentKey],
      );
      if (!docResult.rowCount || docResult.rowCount === 0) {
        return res
          .status(404)
          .json({ message: "No content found. Save content first." });
      }
      const documentId = docResult.rows[0].id as number;
      const version = Number(docResult.rows[0].version);
      const englishContent = docResult.rows[0].content_json as Record<
        string,
        unknown
      >;

      triggerTranslations(documentId, version, englishContent).catch((err) =>
        console.error("[cms] retranslate:", err),
      );

      return res.json({
        message: "Retranslation started for all languages",
        locales: TRANSLATION_LOCALES,
      });
    } catch (err) {
      console.error("[cms] retranslate error:", err);
      return res.status(500).json({ message: "Could not start retranslation" });
    }
  },
);

// ── Start server ───────────────────────────────────────────────────────────

const port = Number(process.env.PORT ?? 4000);
const server = createServer(app);

initChatSocket(server, allowedOrigins);

server.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
