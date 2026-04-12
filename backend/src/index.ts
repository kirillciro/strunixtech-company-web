import bcrypt from "bcryptjs";
import cors from "cors";
import express from "express";
import { z } from "zod";
import { pool } from "./db.js";
import { requireAuth, type AuthedRequest } from "./middleware.js";
import { signToken } from "./auth.js";
import type { SafeUser } from "./types.js";

const app = express();

// Allow the frontend app to call this API during local development.
app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
  }),
);

// Parse JSON bodies for auth requests.
app.use(express.json());

// Validation schemas keep invalid request payloads out of the database layer.
const registerSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.email().max(200),
  password: z.string().min(8).max(100),
});

const loginSchema = z.object({
  email: z.email().max(200),
  password: z.string().min(8).max(100),
});

const languageSchema = z.enum(["en", "nl", "de", "fr", "it", "es"]);

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

// Convert snake_case database rows into the frontend-friendly response shape.
function mapUser(row: {
  id: number;
  full_name: string;
  email: string;
  created_at: Date;
}): SafeUser {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    createdAt: row.created_at.toISOString(),
  };
}

// Simple health check for confirming the API and database are both reachable.
app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok" });
  } catch {
    res.status(500).json({ status: "db_error" });
  }
});

// Registration creates a new user and immediately returns a JWT session token.
app.post("/auth/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    return res
      .status(400)
      .json({ message: "Invalid input", issues: parsed.error.issues });
  }

  const { fullName, email, password } = parsed.data;

  try {
    // Prevent duplicate accounts before attempting the insert.
    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1 LIMIT 1",
      [email],
    );

    if (existing.rowCount && existing.rowCount > 0) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Passwords are stored as hashes only.
    const passwordHash = await bcrypt.hash(password, 10);

    const inserted = await pool.query(
      `INSERT INTO users (full_name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, full_name, email, created_at`,
      [fullName, email, passwordHash],
    );

    const user = mapUser(inserted.rows[0]);
    // The JWT becomes the client-side session used by the frontend app.
    const token = signToken({ sub: String(user.id), email: user.email });

    return res.status(201).json({ token, user });
  } catch {
    return res.status(500).json({ message: "Could not create account" });
  }
});

// Login validates credentials and returns the same session shape as registration.
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
      "SELECT id, full_name, email, password_hash, created_at FROM users WHERE email = $1 LIMIT 1",
      [email],
    );

    if (!result.rowCount || result.rowCount === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const userRow = result.rows[0] as {
      id: number;
      full_name: string;
      email: string;
      password_hash: string;
      created_at: Date;
    };

    // Compare the submitted password against the stored password hash.
    const validPassword = await bcrypt.compare(password, userRow.password_hash);

    if (!validPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = mapUser(userRow);
    const token = signToken({ sub: String(user.id), email: user.email });

    return res.json({ token, user });
  } catch {
    return res.status(500).json({ message: "Could not log in" });
  }
});

// /auth/me is the frontend's session re-validation endpoint for protected pages.
app.get("/auth/me", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await pool.query(
      "SELECT id, full_name, email, created_at FROM users WHERE id = $1 LIMIT 1",
      [userId],
    );

    if (!result.rowCount || result.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Current API scope is auth-only, but this server will later host templates, chat, projects, and payments.
    return res.json({ user: mapUser(result.rows[0]) });
  } catch {
    return res.status(500).json({ message: "Could not fetch user" });
  }
});

// Public localized content endpoint for frontend dictionary reads.
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

// Update canonical source content (English) and mark all other locales pending.
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
        const insertedDoc = await client.query(
          `INSERT INTO content_documents (content_key, source_locale, status)
           VALUES ($1, 'en', 'draft')
           RETURNING id, version`,
          [contentKey],
        );
        documentId = insertedDoc.rows[0].id as number;
        nextVersion = insertedDoc.rows[0].version as number;
      } else {
        documentId = existingDoc.rows[0].id as number;
        nextVersion = Number(existingDoc.rows[0].version) + 1;

        await client.query(
          `UPDATE content_documents
           SET version = $1, updated_at = NOW()
           WHERE id = $2`,
          [nextVersion, documentId],
        );
      }

      await client.query(
        `INSERT INTO content_localizations (
          document_id,
          locale,
          is_source,
          translation_status,
          content_json,
          source_version,
          translated_from_version,
          last_translated_at,
          updated_at
        )
        VALUES ($1, 'en', TRUE, 'up_to_date', $2::jsonb, $3, $3, NOW(), NOW())
        ON CONFLICT (document_id, locale)
        DO UPDATE SET
          is_source = TRUE,
          translation_status = 'up_to_date',
          content_json = EXCLUDED.content_json,
          source_version = EXCLUDED.source_version,
          translated_from_version = EXCLUDED.translated_from_version,
          last_translated_at = NOW(),
          updated_at = NOW(),
          last_error = NULL`,
        [documentId, JSON.stringify(parsed.data.content), nextVersion],
      );

      await client.query(
        `UPDATE content_localizations
         SET translation_status = 'pending',
             source_version = $1,
             updated_at = NOW()
         WHERE document_id = $2
           AND locale <> 'en'`,
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

// Save a localized payload for a specific language.
app.put(
  "/admin/content/:contentKey/localizations/:locale",
  requireAuth,
  async (req, res) => {
    const { contentKey, locale } = req.params;
    const parsedLocale = languageSchema.safeParse(locale);
    const parsedBody = localizationContentSchema.safeParse(req.body);

    if (!parsedLocale.success) {
      return res.status(400).json({ message: "Unsupported locale" });
    }

    if (!parsedBody.success) {
      return res
        .status(400)
        .json({ message: "Invalid input", issues: parsedBody.error.issues });
    }

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
        `INSERT INTO content_localizations (
          document_id,
          locale,
          is_source,
          translation_status,
          content_json,
          source_version,
          translated_from_version,
          last_translated_at,
          last_error,
          updated_at
        )
        VALUES ($1, $2, FALSE, $3, $4::jsonb, $5, $5, NOW(), $6, NOW())
        ON CONFLICT (document_id, locale)
        DO UPDATE SET
          translation_status = EXCLUDED.translation_status,
          content_json = EXCLUDED.content_json,
          source_version = EXCLUDED.source_version,
          translated_from_version = EXCLUDED.translated_from_version,
          last_translated_at = NOW(),
          last_error = EXCLUDED.last_error,
          updated_at = NOW()`,
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

// List localization status for admin dashboard progress chips.
app.get(
  "/admin/content/:contentKey/localizations",
  requireAuth,
  async (req, res) => {
    const { contentKey } = req.params;

    try {
      const rows = await pool.query(
        `SELECT l.locale,
                l.translation_status,
                l.source_version,
                l.translated_from_version,
                l.updated_at,
                l.last_error
         FROM content_documents d
         JOIN content_localizations l ON l.document_id = d.id
         WHERE d.content_key = $1
         ORDER BY l.locale ASC`,
        [contentKey],
      );

      return res.json({
        contentKey,
        localizations: rows.rows,
      });
    } catch {
      return res.status(500).json({ message: "Could not fetch localizations" });
    }
  },
);

const port = Number(process.env.PORT ?? 4000);

app.listen(port, () => {
  console.log(`Auth API listening on http://localhost:${port}`);
});
