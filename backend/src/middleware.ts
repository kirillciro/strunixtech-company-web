import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "./auth.js";

// Express request extension populated after JWT validation succeeds.
export type AuthedRequest = Request & {
  userId?: number;
  userEmail?: string;
};

export function requireAuth(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
) {
  // Every protected route expects a standard Authorization: Bearer <token> header.
  const authHeader = req.header("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing bearer token" });
  }

  const token = authHeader.replace("Bearer ", "").trim();

  try {
    // The token payload becomes request context for downstream route handlers.
    const payload = verifyToken(token);
    req.userId = Number(payload.sub);
    req.userEmail = payload.email;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
