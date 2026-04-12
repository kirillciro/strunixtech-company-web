import "./global.css";
import { Geist } from "next/font/google";
import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import AuthModal from "@/app/src/components/ui/AuthModal";

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
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const content = (
    <AuthProvider>
      {children}
      <AuthModal />
    </AuthProvider>
  );

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`font-sans ${geist.variable}`}
    >
      <body suppressHydrationWarning>
        {googleClientId ? (
          <GoogleOAuthProvider clientId={googleClientId}>
            {content}
          </GoogleOAuthProvider>
        ) : (
          content
        )}
      </body>
    </html>
  );
}
