"use client";

import React, { useEffect, useRef, useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/context/AuthContext";
import { apiForgotPassword, apiResendVerification } from "@/lib/auth-client";
import Link from "next/link";

export default function AuthModal() {
  const {
    authOpen,
    authTab,
    closeAuth,
    login,
    register,
    loginWithGoogle,
    loginWithFacebook,
    loginWithApple,
  } = useAuth();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [verificationPending, setVerificationPending] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Sync tab from context
  useEffect(() => {
    setTab(authTab);
  }, [authTab]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (authOpen) {
      setError(null);
      setInfo(null);
      setLoading(false);
      setVerificationPending(false);
      setShowForgot(false);
      setForgotSent(false);
    }
  }, [authOpen]);

  // Close on Escape
  useEffect(() => {
    if (!authOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAuth();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [authOpen, closeAuth]);

  // Google login
  const hasGoogleAuth = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
  const hasFacebookAuth = Boolean(process.env.NEXT_PUBLIC_FACEBOOK_APP_ID);
  const hasAppleAuth = Boolean(process.env.NEXT_PUBLIC_APPLE_CLIENT_ID);

  // Load Facebook JS SDK when app ID is configured
  useEffect(() => {
    if (!hasFacebookAuth) return;
    if (document.getElementById("fb-sdk")) return;
    window.fbAsyncInit = () => {
      window.FB.init({
        appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID!,
        cookie: true,
        xfbml: true,
        version: "v19.0",
      });
    };
    const script = document.createElement("script");
    script.id = "fb-sdk";
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }, [hasFacebookAuth]);

  // Load Apple ID JS SDK when client ID is configured
  useEffect(() => {
    if (!hasAppleAuth) return;
    if (document.getElementById("apple-sdk")) return;
    const script = document.createElement("script");
    script.id = "apple-sdk";
    script.src =
      "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";
    script.async = true;
    script.onload = () => {
      window.AppleID.auth.init({
        clientId: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID!,
        scope: "name email",
        redirectURI:
          process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI ?? window.location.origin,
        usePopup: true,
      });
    };
    document.head.appendChild(script);
  }, [hasAppleAuth]);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError(null);
      setLoading(true);
      try {
        await loginWithGoogle(tokenResponse.access_token);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Google sign-in failed");
      } finally {
        setLoading(false);
      }
    },
    onError: () => setError("Google sign-in was cancelled or failed"),
  });

  function handleFacebookLogin() {
    if (!window.FB) {
      setError("Facebook SDK not loaded yet. Please try again.");
      return;
    }
    setError(null);
    window.FB.login(
      (response) => {
        if (!response.authResponse?.accessToken) {
          setError("Facebook sign-in was cancelled or failed");
          return;
        }
        setLoading(true);
        loginWithFacebook(response.authResponse.accessToken)
          .catch((err: unknown) => {
            setError(
              err instanceof Error ? err.message : "Facebook sign-in failed",
            );
          })
          .finally(() => setLoading(false));
      },
      { scope: "email" },
    );
  }

  async function handleAppleLogin() {
    if (!window.AppleID) {
      setError("Apple SDK not loaded yet. Please try again.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const response = await window.AppleID.auth.signIn();
      const idToken = response.authorization.id_token;
      const firstName = response.user?.name?.firstName;
      const lastName = response.user?.name?.lastName;
      const fullName =
        firstName && lastName
          ? `${firstName} ${lastName}`
          : (firstName ?? lastName);
      await loginWithApple(idToken, fullName);
    } catch {
      setError("Apple sign-in was cancelled or failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("password") as string;
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login failed";
      if (msg.includes("verify your email")) {
        setVerificationPending(true);
        setInfo(
          "Please verify your email before signing in. Check your inbox or resend below.",
        );
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const fullName = form.get("fullName") as string;
    const email = form.get("email") as string;
    const password = form.get("password") as string;
    const confirm = form.get("confirm") as string;

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const result = await register(fullName, email, password);
      if (result.needsVerification) {
        setVerificationPending(true);
        setInfo(
          `We've sent a verification email to ${email}. Please check your inbox.`,
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgot(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      await apiForgotPassword(forgotEmail);
      setForgotSent(true);
    } catch {
      setForgotSent(true); // Never reveal whether email exists
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    const emailInput = document.querySelector<HTMLInputElement>(
      'input[name="email"]',
    );
    const email = emailInput?.value ?? "";
    if (!email) return;
    await apiResendVerification(email);
    setInfo("Verification email resent! Check your inbox.");
  }

  if (!authOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === overlayRef.current) closeAuth();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Authentication"
    >
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* ── Header ── */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <img
                src="/StrunixTechLogo.svg"
                alt="Strunix Tech"
                className="h-9 w-auto object-contain shrink-0"
              />
            </div>
            <button
              onClick={closeAuth}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
              aria-label="Close"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-1 bg-slate-800 rounded-xl p-1">
            <button
              onClick={() => {
                setTab("login");
                setError(null);
                setShowForgot(false);
              }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === "login"
                  ? "bg-linear-to-r from-cyan-500/20 to-blue-600/20 text-white border border-cyan-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Sign in
            </button>
            <button
              onClick={() => {
                setTab("register");
                setError(null);
                setShowForgot(false);
              }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === "register"
                  ? "bg-linear-to-r from-cyan-500/20 to-blue-600/20 text-white border border-cyan-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Create account
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="px-6 pb-6">
          {/* Feedback banners */}
          {error && (
            <div className="mb-4 px-3 py-2.5 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
              {error}
            </div>
          )}
          {info && (
            <div className="mb-4 px-3 py-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-sm text-cyan-400">
              {info}
              {verificationPending && (
                <button
                  onClick={handleResend}
                  className="ml-2 underline text-cyan-300 hover:text-cyan-100"
                >
                  Resend email
                </button>
              )}
            </div>
          )}

          {/* ── Forgot password ── */}
          {showForgot ? (
            forgotSent ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-5 h-5 text-cyan-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="text-sm text-slate-400 mb-4">
                  If that email is registered, we&apos;ve sent a reset link.
                  Check your inbox.
                </p>
                <button
                  onClick={() => {
                    setShowForgot(false);
                    setForgotSent(false);
                  }}
                  className="text-sm text-cyan-400 hover:text-cyan-300"
                >
                  Back to sign in
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgot} className="space-y-4">
                <p className="text-sm text-slate-400">
                  Enter your email and we&apos;ll send you a reset link.
                </p>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg bg-linear-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {loading ? "Sending…" : "Send reset link"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForgot(false)}
                  className="w-full text-sm text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Back to sign in
                </button>
              </form>
            )
          ) : tab === "login" ? (
            <>
              <div className="space-y-2 mb-5">
                {hasGoogleAuth ? (
                  <SocialBtn
                    icon={<GoogleIcon />}
                    label="Continue with Google"
                    onClick={() => googleLogin()}
                    disabled={loading}
                  />
                ) : (
                  <SocialBtn
                    icon={<GoogleIcon />}
                    label="Continue with Google"
                    disabled
                    soon
                  />
                )}
                {hasFacebookAuth ? (
                  <SocialBtn
                    icon={<FacebookIcon />}
                    label="Continue with Facebook"
                    onClick={handleFacebookLogin}
                    disabled={loading}
                  />
                ) : (
                  <SocialBtn
                    icon={<FacebookIcon />}
                    label="Continue with Facebook"
                    disabled
                    soon
                  />
                )}
                {hasAppleAuth ? (
                  <SocialBtn
                    icon={<AppleIcon />}
                    label="Continue with Apple"
                    onClick={handleAppleLogin}
                    disabled={loading}
                  />
                ) : (
                  <SocialBtn
                    icon={<AppleIcon />}
                    label="Continue with Apple"
                    disabled
                    soon
                  />
                )}
              </div>

              <Divider />

              <form onSubmit={handleLogin} className="space-y-3">
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="Email address"
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                />
                <input
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="Password"
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowForgot(true)}
                    className="text-xs text-cyan-400 hover:text-cyan-300"
                  >
                    Forgot password?
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg bg-linear-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {loading ? "Signing in…" : "Sign in"}
                </button>
              </form>

              <p className="mt-4 text-center text-sm text-slate-500">
                No account?{" "}
                <button
                  onClick={() => setTab("register")}
                  className="text-cyan-400 hover:text-cyan-300 font-medium"
                >
                  Create one free
                </button>
              </p>
            </>
          ) : (
            <>
              <div className="space-y-2 mb-5">
                {hasGoogleAuth ? (
                  <SocialBtn
                    icon={<GoogleIcon />}
                    label="Sign up with Google"
                    onClick={() => googleLogin()}
                    disabled={loading}
                  />
                ) : (
                  <SocialBtn
                    icon={<GoogleIcon />}
                    label="Sign up with Google"
                    disabled
                    soon
                  />
                )}
                {hasFacebookAuth ? (
                  <SocialBtn
                    icon={<FacebookIcon />}
                    label="Sign up with Facebook"
                    onClick={handleFacebookLogin}
                    disabled={loading}
                  />
                ) : (
                  <SocialBtn
                    icon={<FacebookIcon />}
                    label="Sign up with Facebook"
                    disabled
                    soon
                  />
                )}
                {hasAppleAuth ? (
                  <SocialBtn
                    icon={<AppleIcon />}
                    label="Sign up with Apple"
                    onClick={handleAppleLogin}
                    disabled={loading}
                  />
                ) : (
                  <SocialBtn
                    icon={<AppleIcon />}
                    label="Sign up with Apple"
                    disabled
                    soon
                  />
                )}
              </div>

              <Divider />

              {!verificationPending && (
                <form onSubmit={handleRegister} className="space-y-3">
                  <input
                    name="fullName"
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="Full name"
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                  />
                  <input
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="Email address"
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                  />
                  <input
                    name="password"
                    type="password"
                    required
                    autoComplete="new-password"
                    placeholder="Password (min 8 characters)"
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                  />
                  <input
                    name="confirm"
                    type="password"
                    required
                    autoComplete="new-password"
                    placeholder="Confirm password"
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-lg bg-linear-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
                  >
                    {loading ? "Creating account…" : "Create account"}
                  </button>
                  <p className="text-xs text-slate-500 text-center">
                    By creating an account you agree to our{" "}
                    <Link
                      href="/privacy"
                      className="text-cyan-400 hover:text-cyan-300 underline"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </form>
              )}

              <p className="mt-4 text-center text-sm text-slate-500">
                Already have an account?{" "}
                <button
                  onClick={() => setTab("login")}
                  className="text-cyan-400 hover:text-cyan-300 font-medium"
                >
                  Sign in
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

function Divider() {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="flex-1 h-px bg-slate-800" />
      <span className="text-xs text-slate-600">or</span>
      <div className="flex-1 h-px bg-slate-800" />
    </div>
  );
}

function SocialBtn({
  icon,
  label,
  onClick,
  disabled,
  soon,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  soon?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full relative flex items-center px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors
        ${
          soon || (disabled && !onClick)
            ? "border-slate-800 text-slate-600 cursor-not-allowed opacity-50"
            : "border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
        }`}
    >
      <span className="w-5 flex items-center justify-center shrink-0">
        {icon}
      </span>
      <span className="flex-1 text-center">{label}</span>
      {soon && (
        <span className="w-5 text-right text-xs text-slate-600 shrink-0">
          Soon
        </span>
      )}
    </button>
  );
}

// ── SVG Icons ──────────────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.56-1.32 3.1-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}
