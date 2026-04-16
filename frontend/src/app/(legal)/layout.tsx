import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import LegalNav from "./LegalNav";
import Image from "next/image";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Sticky top bar */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between gap-6">
          {/* Logo / brand */}
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/StrunixTechLogo.svg"
              alt="Strunix Tech"
              width={120}
              height={32}
              className="h-8 object-contain"
              style={{ width: "auto" }}
            />
          </Link>

          {/* Legal page links */}
          <LegalNav />

          {/* Back to site */}
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back to site</span>
          </Link>
        </div>
      </header>

      {children}
    </>
  );
}
