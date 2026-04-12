"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Input from "@/app/src/components/ui/Input";
import Button from "@/app/src/components/ui/Button";
import { persistSession, register } from "@/lib/auth-client";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    // Keep basic client-side validation close to the form for fast feedback.
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setIsLoading(true);
      // Registration immediately creates the account and starts the session.
      const result = await register({ fullName, email, password });
      persistSession(result.token, result.user);
      router.push("/dashboard");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Registration failed",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm">
        <h1 className="text-2xl font-bold mb-2 text-center">Create Account</h1>

        <p className="text-gray-500 text-center mb-6">
          {/* This is the current bridge between marketing and the protected app area. */}
          Continue chat and explore templates
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            placeholder="Full Name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            required
          />

          <Input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <Input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={8}
          />

          <Input
            placeholder="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            minLength={8}
          />

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <Button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Register"}
          </Button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
