import jwt from "jsonwebtoken";
import type { AuthTokenPayload } from "./types.js";

function getJwtSecret(): string {
  // JWT signing must fail fast if the secret is missing.
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is required");
  }

  return jwtSecret;
}

export function signToken(payload: AuthTokenPayload): string {
  // Tokens currently last 7 days, which is enough for the first MVP pass.
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
}

export function verifyToken(token: string): AuthTokenPayload {
  // Verify signature + expiry, then normalize the payload into our own type.
  const decoded = jwt.verify(token, getJwtSecret());

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
  };
}
