"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearSession } from "@/lib/auth-client";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const pathSegments = pathname.split("/").filter(Boolean);
  const routeLang = pathSegments.length > 0 ? pathSegments[0] : "en";

  function handleLogout() {
    // Logout is currently client-side only because sessions live in localStorage.
    clearSession();
    router.push(`/${routeLang}/login`);
  }

  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white p-6 flex flex-col">
      {/* Primary navigation for the protected app section. */}
      <h2 className="text-xl font-bold mb-8">Platform</h2>

      <nav className="space-y-4 flex-1">
        <Link
          href={`/${routeLang}/dashboard`}
          className="block hover:text-gray-300"
        >
          Dashboard
        </Link>
        <Link
          href={`/${routeLang}/templates`}
          className="block hover:text-gray-300"
        >
          Templates
        </Link>
        <Link
          href={`/${routeLang}/messages`}
          className="block hover:text-gray-300"
        >
          Messages
        </Link>
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="mt-8 w-full px-4 py-2 bg-white/10 rounded-xl hover:bg-white/20 transition"
      >
        Logout
      </button>
    </aside>
  );
}
