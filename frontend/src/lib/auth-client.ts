// Frontend auth layer — bridges Next.js UI with the Express auth API.
// Access token stored in localStorage; refresh token lives in httpOnly cookie (managed by backend).

export type AuthUser = {
  id: number;
  fullName: string;
  email: string;
  role: string;
  isVerified: boolean;
  provider: string;
  createdAt: string;
};

const ACCESS_TOKEN_KEY = "st_access_token";

function getApiBase(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
}

// ── Token storage ──────────────────────────────────────────────────────────

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAccessToken(token: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
  } catch {
    /* ignore */
  }
}

export function clearAccessToken(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

// ── Refresh access token via httpOnly cookie ───────────────────────────────

export async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await fetch(`${getApiBase()}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { accessToken?: string };
    if (data.accessToken) {
      setAccessToken(data.accessToken);
      return data.accessToken;
    }
    return null;
  } catch {
    return null;
  }
}

// ── Fetch wrapper — retries once after 401 with fresh token ───────────────

export async function fetchWithAuth(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = getAccessToken();

  const makeHeaders = (t: string | null) => {
    const h = new Headers(options.headers);
    if (t) h.set("Authorization", `Bearer ${t}`);
    h.set("Content-Type", "application/json");
    return h;
  };

  const res = await fetch(url, {
    ...options,
    headers: makeHeaders(token),
    credentials: "include",
  });

  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return fetch(url, {
        ...options,
        headers: makeHeaders(newToken),
        credentials: "include",
      });
    }
    clearAccessToken();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("auth:session-expired"));
    }
  }

  return res;
}

// ── Auth API calls ─────────────────────────────────────────────────────────

export async function apiRegister(payload: {
  fullName: string;
  email: string;
  password: string;
}): Promise<{
  accessToken: string;
  user: AuthUser;
  needsVerification: boolean;
}> {
  const res = await fetch(`${getApiBase()}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message ?? "Registration failed");
  setAccessToken(data.accessToken);
  return data;
}

export async function apiLogin(payload: {
  email: string;
  password: string;
}): Promise<{ accessToken: string; user: AuthUser }> {
  const res = await fetch(`${getApiBase()}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message ?? "Login failed");
  setAccessToken(data.accessToken);
  return data;
}

export async function apiGoogleAuth(
  accessToken: string,
): Promise<{ accessToken: string; user: AuthUser }> {
  const res = await fetch(`${getApiBase()}/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accessToken }),
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message ?? "Google sign-in failed");
  setAccessToken(data.accessToken);
  return data;
}

export async function apiFacebookAuth(
  accessToken: string,
): Promise<{ accessToken: string; user: AuthUser }> {
  const res = await fetch(`${getApiBase()}/auth/facebook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accessToken }),
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message ?? "Facebook sign-in failed");
  setAccessToken(data.accessToken);
  return data;
}

export async function apiAppleAuth(payload: {
  idToken: string;
  fullName?: string;
}): Promise<{ accessToken: string; user: AuthUser }> {
  const res = await fetch(`${getApiBase()}/auth/apple`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message ?? "Apple sign-in failed");
  setAccessToken(data.accessToken);
  return data;
}

export async function apiLogout(): Promise<void> {
  try {
    await fetch(`${getApiBase()}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } finally {
    clearAccessToken();
  }
}

export async function apiMe(): Promise<AuthUser> {
  const res = await fetchWithAuth(`${getApiBase()}/auth/me`);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message ?? "Failed to fetch user");
  return data.user;
}

export async function apiForgotPassword(email: string): Promise<void> {
  const res = await fetch(`${getApiBase()}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message ?? "Failed to send reset email");
  }
}

export async function apiVerifyEmail(token: string): Promise<void> {
  const res = await fetch(`${getApiBase()}/auth/verify-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message ?? "Verification failed");
}

export async function apiResendVerification(email: string): Promise<void> {
  await fetch(`${getApiBase()}/auth/resend-verification`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
}

// ── Legacy compat ──────────────────────────────────────────────────────────
// Kept so existing pages don't break while they're migrated to the modal flow.

export const login = apiLogin;
export const register = apiRegister;
export function persistSession(token: string): void {
  setAccessToken(token);
}

export async function fetchMe(token: string): Promise<AuthUser> {
  const response = await fetch(`${getApiBase()}/auth/me`, {
    headers: { authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Unauthorized");
  const data = (await response.json()) as { user: AuthUser };
  return data.user;
}
