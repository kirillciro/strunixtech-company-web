"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

// Auth now lives in the global modal popup.
// Anyone visiting /[lang]/login is redirected to the homepage and the modal opens automatically.
export default function LoginPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { openAuth } = useAuth();

  useEffect(() => {
    const lang = pathname.split("/")[1] ?? "en";
    router.replace(`/${lang}`);
    const t = setTimeout(() => openAuth("login"), 300);
    return () => clearTimeout(t);
  }, [pathname, router, openAuth]);

  return null;
}
