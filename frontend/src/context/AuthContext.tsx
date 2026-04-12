"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import {
  apiMe,
  apiLogin,
  apiRegister,
  apiLogout,
  apiGoogleAuth,
  apiFacebookAuth,
  apiAppleAuth,
  getAccessToken,
  clearAccessToken,
  type AuthUser,
} from "@/lib/auth-client";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  openAuth: (tab?: "login" | "register") => void;
  closeAuth: () => void;
  authOpen: boolean;
  authTab: "login" | "register";
  login: (email: string, password: string) => Promise<void>;
  register: (
    fullName: string,
    email: string,
    password: string,
  ) => Promise<{ needsVerification: boolean }>;
  loginWithGoogle: (credential: string) => Promise<void>;
  loginWithFacebook: (accessToken: string) => Promise<void>;
  loginWithApple: (idToken: string, fullName?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");

  // Listen for session expiry dispatched by fetchWithAuth
  useEffect(() => {
    const handler = () => setUser(null);
    window.addEventListener("auth:session-expired", handler);
    return () => window.removeEventListener("auth:session-expired", handler);
  }, []);

  // Bootstrap: restore session from access token in localStorage
  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const token = getAccessToken();
        if (!token) {
          setUser(null);
          return;
        }
        const me = await apiMe();
        if (!cancelled) setUser(me);
      } catch {
        clearAccessToken();
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    init();
    return () => {
      cancelled = true;
    };
  }, []);

  const openAuth = useCallback((tab: "login" | "register" = "login") => {
    setAuthTab(tab);
    setAuthOpen(true);
  }, []);

  const closeAuth = useCallback(() => setAuthOpen(false), []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await apiLogin({ email, password });
    setUser(result.user);
    setAuthOpen(false);
  }, []);

  const register = useCallback(
    async (fullName: string, email: string, password: string) => {
      const result = await apiRegister({ fullName, email, password });
      setUser(result.user);
      if (!result.needsVerification) setAuthOpen(false);
      return { needsVerification: result.needsVerification };
    },
    [],
  );

  const loginWithGoogle = useCallback(async (credential: string) => {
    const result = await apiGoogleAuth(credential);
    setUser(result.user);
    setAuthOpen(false);
  }, []);

  const loginWithFacebook = useCallback(async (accessToken: string) => {
    const result = await apiFacebookAuth(accessToken);
    setUser(result.user);
    setAuthOpen(false);
  }, []);

  const loginWithApple = useCallback(
    async (idToken: string, fullName?: string) => {
      const result = await apiAppleAuth({ idToken, fullName });
      setUser(result.user);
      setAuthOpen(false);
    },
    [],
  );

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const me = await apiMe();
      setUser(me);
    } catch {
      clearAccessToken();
      setUser(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      openAuth,
      closeAuth,
      authOpen,
      authTab,
      login,
      register,
      loginWithGoogle,
      loginWithFacebook,
      loginWithApple,
      logout,
      refreshUser,
    }),
    [
      user,
      loading,
      openAuth,
      closeAuth,
      authOpen,
      authTab,
      login,
      register,
      loginWithGoogle,
      loginWithFacebook,
      loginWithApple,
      logout,
      refreshUser,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
