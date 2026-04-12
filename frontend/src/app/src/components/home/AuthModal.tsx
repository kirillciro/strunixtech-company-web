"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { CircleX, LoaderCircle, LogIn, UserPlus } from "lucide-react";
import { login, persistSession, register } from "@/lib/auth-client";

type AuthModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: (email: string) => void;
};

export default function AuthModal({
  open,
  onClose,
  onSuccess,
}: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "register") {
        if (password.length < 8) {
          throw new Error("Password must be at least 8 characters long.");
        }

        if (password !== confirmPassword) {
          throw new Error("Password confirmation does not match.");
        }

        if (!dateOfBirth) {
          throw new Error("Date of birth is required.");
        }

        const dob = new Date(dateOfBirth);
        const now = new Date();
        let age = now.getFullYear() - dob.getFullYear();
        const monthDelta = now.getMonth() - dob.getMonth();
        if (
          monthDelta < 0 ||
          (monthDelta === 0 && now.getDate() < dob.getDate())
        ) {
          age -= 1;
        }

        if (age < 18) {
          throw new Error("You must be at least 18 years old to register.");
        }
      }

      const result =
        mode === "register"
          ? await register({ fullName, email, password })
          : await login({ email, password });

      persistSession(result.token, result.user);
      window.dispatchEvent(new Event("auth:changed"));
      onSuccess(result.user.email);
      onClose();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Authentication failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-80 grid place-items-center p-4">
      <div className="absolute inset-0 bg-slate-950/85" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-cyan-400/25 bg-slate-900/95 p-6 animate-fadeInUp">
        <button
          onClick={onClose}
          aria-label="Close auth modal"
          className="absolute right-4 top-4 text-slate-400 transition hover:text-white"
        >
          <CircleX className="h-5 w-5" />
        </button>

        <h3 className="text-2xl font-semibold text-white">
          {mode === "login" ? "Welcome Back" : "Create Account"}
        </h3>
        <p className="mt-2 text-sm text-slate-400">
          {mode === "login"
            ? "Log in to continue your project pipeline."
            : "Register to start your project pipeline and progress tracking."}
        </p>

        <div className="mt-5 grid grid-cols-2 rounded-lg border border-slate-700 bg-slate-800/60 p-1">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
              setConfirmPassword("");
              setDateOfBirth("");
            }}
            className={`rounded-md px-3 py-2 text-sm transition ${
              mode === "login"
                ? "bg-cyan-500/20 text-cyan-200"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError(null);
            }}
            className={`rounded-md px-3 py-2 text-sm transition ${
              mode === "register"
                ? "bg-cyan-500/20 text-cyan-200"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {mode === "register" && (
            <>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wide text-slate-400">
                  Full Name
                </label>
                <input
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-400"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs uppercase tracking-wide text-slate-400">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(event) => setDateOfBirth(event.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-400"
                />
              </div>
            </>
          )}

          <div>
            <label className="mb-1 block text-xs uppercase tracking-wide text-slate-400">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-400"
              placeholder="you@company.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs uppercase tracking-wide text-slate-400">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-400"
              placeholder="••••••••"
            />
          </div>

          {mode === "register" && (
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-slate-400">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-400"
                placeholder="Repeat password"
              />
            </div>
          )}

          {error && <p className="text-sm text-rose-300">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:from-cyan-400 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : mode === "login" ? (
              <>
                <LogIn className="h-4 w-4" />
                Login
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Register
              </>
            )}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-400">
          {mode === "login"
            ? "Don\'t have an account?"
            : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              const nextMode = mode === "login" ? "register" : "login";
              setMode(nextMode);
              setError(null);
              if (nextMode === "login") {
                setConfirmPassword("");
                setDateOfBirth("");
              }
            }}
            className="text-cyan-300 hover:text-cyan-200"
          >
            {mode === "login" ? "Register here" : "Login here"}
          </button>
        </p>
      </div>
    </div>,
    document.body,
  );
}
