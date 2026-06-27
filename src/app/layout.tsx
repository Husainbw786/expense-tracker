import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk, Spectral } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import { getCurrentUser } from "@/lib/auth";
import { logout } from "@/app/auth/actions";

const hanken = Hanken_Grotesk({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-hanken",
});
const spectral = Spectral({
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-spectral",
});

export const metadata: Metadata = {
  title: "Trip Splitter",
  description: "Split family trip expenses and settle up",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#C5663F",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  const initial = user?.name?.trim()?.[0]?.toUpperCase() ?? "·";
  return (
    <html
      lang="en"
      className={`${hanken.variable} ${spectral.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <div className="mx-auto w-full max-w-md ts-app-col">
          {/* top bar — logo tile + avatar */}
          <header className="sticky top-0 z-30 flex h-[60px] items-center justify-between gap-4 bg-[rgba(244,242,234,0.94)] px-5 backdrop-blur-xl">
            <span className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-[9px] bg-rose">
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 7h18M6 7V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2M5 7l1 13a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1l1-13"></path>
                </svg>
              </span>
              <span className="ts-wordmark">Trip Splitter</span>
            </span>
            {user ? (
              <form action={logout} className="shrink-0">
                <button
                  className="grid h-[33px] w-[33px] place-items-center rounded-full bg-surface-accent text-[0.82rem] font-bold text-rose"
                  title={`Logged in as ${user.email} — tap to log out`}
                >
                  {initial}
                </button>
              </form>
            ) : (
              <span className="h-[33px] w-[33px] shrink-0"></span>
            )}
          </header>
          {children}
        </div>
        {user && <BottomNav />}
      </body>
    </html>
  );
}
