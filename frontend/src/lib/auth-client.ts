// Shared frontend auth types and helpers.
// This file is the bridge between the Next.js UI and the Express auth API.
export type AuthUser = {
  id: number;
  fullName: string;
  email: string;
  createdAt: string;
};

type AuthResponse = {
  token: string;
  user: AuthUser;
};

const AUTH_TOKEN_KEY = "techsol_auth_token";
const AUTH_USER_KEY = "techsol_auth_user";

function getApiBaseUrl(): string {
  // Allows local development and later deployment to use different API URLs.
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
}

export async function register(payload: {
  fullName: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  // Registration returns both the JWT token and the newly created public user record.
  const response = await fetch(`${getApiBaseUrl()}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message ?? "Registration failed");
  }

  return (await response.json()) as AuthResponse;
}

export async function login(payload: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  // Login uses the same response contract as registration so both pages can reuse session logic.
  const response = await fetch(`${getApiBaseUrl()}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message ?? "Login failed");
  }

  return (await response.json()) as AuthResponse;
}

export async function fetchMe(token: string): Promise<AuthUser> {
  // Protected app routes use this to confirm the stored token is still valid.
  const response = await fetch(`${getApiBaseUrl()}/auth/me`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Unauthorized");
  }

  const data = (await response.json()) as { user: AuthUser };
  return data.user;
}

export function persistSession(token: string, user: AuthUser): void {
  // Session state is currently stored in localStorage for simplicity.
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

export function getStoredToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  // Reading from localStorage needs a safe JSON parse because the value can be missing or malformed.
  const user = localStorage.getItem(AUTH_USER_KEY);

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user) as AuthUser;
  } catch {
    return null;
  }
}
