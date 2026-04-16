"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
