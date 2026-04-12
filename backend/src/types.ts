// Public user shape returned to the frontend.
// Sensitive fields like password_hash are intentionally excluded.
export type SafeUser = {
  id: number;
  fullName: string;
  email: string;
  role: string;
  isVerified: boolean;
  provider: string;
  createdAt: string;
};

// Minimal JWT payload required to identify the logged-in user.
export type AuthTokenPayload = {
  sub: string;
  email: string;
  role: string;
};
