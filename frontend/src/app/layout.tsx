import "./global.css";
import { Geist } from "next/font/google";
import type { Metadata } from "next";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Root layout stays intentionally small for now.
    <html
      lang="en"
      suppressHydrationWarning
      className={`font-sans ${geist.variable}`}
    >
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
