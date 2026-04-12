"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/app/src/components/layout/sidebar";
import {
  clearSession,
  fetchMe,
  getStoredToken,
  persistSession,
} from "@/lib/auth-client";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  const pathSegments = pathname.split("/").filter(Boolean);
  const routeLang = pathSegments.length > 0 ? pathSegments[0] : "en";
  const localizedLoginPath = `/${routeLang}/login`;

  useEffect(() => {
    let mounted = true;

    async function validateSession() {
      // Protected pages depend on a stored JWT token.
      const token = getStoredToken();

      if (!token) {
        router.replace(localizedLoginPath);
        return;
      }

      try {
        // Re-hydrate the user from the API so stale or invalid tokens are rejected.
        const user = await fetchMe(token);

        if (mounted) {
          persistSession(token, user);
          setIsCheckingSession(false);
        }
      } catch {
        clearSession();
        router.replace(localizedLoginPath);
      }
    }

    validateSession();

    return () => {
      mounted = false;
    };
  }, [localizedLoginPath, router]);

  if (isCheckingSession) {
    // Prevent protected content from flashing before auth has been checked.
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6 bg-gray-50 min-h-screen">{children}</main>
    </div>
  );
}
