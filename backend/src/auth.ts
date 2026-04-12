import crypto from "crypto";
import jwt, { type SignOptions } from "jsonwebtoken";
import type { AuthTokenPayload } from "./types.js";

function requireEnv(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`${name} is required but not set`);
  return val;
}

// ── Token generation ────────────────────────────────────────────────────────

export function generateTokens(payload: {
  sub: string;
  email: string;
  role: string;
}) {
  const accessSecret = requireEnv("JWT_ACCESS_SECRET");
  const refreshSecret = requireEnv("JWT_REFRESH_SECRET");

  const accessExpiresIn = (process.env.JWT_ACCESS_EXPIRY ??
    "15m") as SignOptions["expiresIn"];
  const refreshExpiresIn = (process.env.JWT_REFRESH_EXPIRY ??
    "7d") as SignOptions["expiresIn"];

  const accessToken = jwt.sign(
    { sub: payload.sub, email: payload.email, role: payload.role },
    accessSecret,
    { expiresIn: accessExpiresIn },
  );

  const refreshToken = jwt.sign(
    { sub: payload.sub, email: payload.email, role: payload.role },
    refreshSecret,
    { expiresIn: refreshExpiresIn },
  );

  return { accessToken, refreshToken };
}

// Backwards-compatible single-token signer used by content routes (access token).
export function signToken(payload: AuthTokenPayload): string {
  return generateTokens({
    sub: payload.sub,
    email: payload.email,
    role: "user",
  }).accessToken;
}

// ── Token verification ───────────────────────────────────────────────────────

export function verifyToken(token: string): AuthTokenPayload {
  const decoded = jwt.verify(token, requireEnv("JWT_ACCESS_SECRET"));

  if (
    typeof decoded !== "object" ||
    !decoded ||
    !("sub" in decoded) ||
    !("email" in decoded)
  ) {
    throw new Error("Invalid token payload");
  }

  return {
    sub: String(decoded.sub),
    email: String(decoded.email),
    role: String((decoded as any).role ?? "user"),
  };
}

export function verifyRefreshToken(token: string): AuthTokenPayload {
  const decoded = jwt.verify(token, requireEnv("JWT_REFRESH_SECRET"));

  if (typeof decoded !== "object" || !decoded || !("sub" in decoded)) {
    throw new Error("Invalid refresh token payload");
  }

  return {
    sub: String(decoded.sub),
    email: String((decoded as any).email ?? ""),
    role: String((decoded as any).role ?? "user"),
  };
}

// ── Token hashing ────────────────────────────────────────────────────────────

export function hashToken(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}
