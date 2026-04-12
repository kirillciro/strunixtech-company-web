"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import Button from "@/app/src/components/ui/Button";
import Input from "@/app/src/components/ui/Input";
import { login, persistSession } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      setIsLoading(true);
      // Call the backend login endpoint and store the returned session locally.
      const result = await login({ email, password });
      persistSession(result.token, result.user);
      router.push("/dashboard");
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Login failed",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm">
        <h1 className="text-2xl font-bold mb-2 text-center">Welcome back</h1>

        <p className="text-gray-500 text-center mb-6">
          {/* Login unlocks the protected workspace shell. */}
          Sign in to continue with templates and chat
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
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

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <Button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Login"}
          </Button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
