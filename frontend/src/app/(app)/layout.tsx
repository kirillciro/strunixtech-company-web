"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/app/src/components/layout/sidebar";
import { useAuth } from "@/context/AuthContext";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();

  const pathSegments = pathname.split("/").filter(Boolean);
  const routeLang = pathSegments.length > 0 ? pathSegments[0] : "en";

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/${routeLang}`);
    }
  }, [loading, user, routeLang, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6 bg-gray-50 min-h-screen">{children}</main>
    </div>
  );
}
