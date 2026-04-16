"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LEGAL_LINKS = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-of-service", label: "Terms of Service" },
  { href: "/cookie-policy", label: "Cookie Policy" },
];

export default function LegalNav() {
  const pathname = usePathname();
  // Strip leading lang segment if present (e.g. /en/privacy-policy → /privacy-policy)
  const normalized = pathname.replace(/^\/[a-z]{2}(?=\/)/, "");

  return (
    <nav className="flex items-center gap-1 overflow-x-auto">
      {LEGAL_LINKS.map(({ href, label }) => {
        const active = normalized === href;
        return (
          <Link
            key={href}
            href={href}
            className={`px-3 py-1.5 text-xs whitespace-nowrap rounded-md transition-colors ${
              active
                ? "bg-cyan-500/15 text-cyan-400 font-medium"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
