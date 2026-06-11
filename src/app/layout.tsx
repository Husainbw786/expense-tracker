import type { Metadata, Viewport } from "next";
import { Libre_Baskerville, Josefin_Sans, Sacramento } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import { getCurrentUser } from "@/lib/auth";
import { logout } from "@/app/auth/actions";

const libre = Libre_Baskerville({
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-libre",
});
const josefin = Josefin_Sans({
  subsets: ["latin"],
  variable: "--font-josefin",
});
const sacramento = Sacramento({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-sacramento",
});

export const metadata: Metadata = {
  title: "Trip Splitter",
  description: "Split family trip expenses and settle up",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#B85C72",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  return (
    <html
      lang="en"
      className={`${libre.variable} ${josefin.variable} ${sacramento.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <div className="mx-auto w-full max-w-md ts-app-col">
          {/* top bar — script wordmark, quiet logout */}
          <header className="sticky top-0 z-30 flex h-[58px] items-center justify-between gap-4 border-b border-hairline bg-[rgba(254,253,251,0.94)] px-4 backdrop-blur-xl">
            <span className="w-16 shrink-0"></span>
            <span className="ts-wordmark -translate-y-0.5">Trip Splitter</span>
            {user ? (
              <form action={logout} className="w-16 shrink-0 text-right">
                <button className="ts-textlink" title={`Logged in as ${user.email}`}>
                  Log out
                </button>
              </form>
            ) : (
              <span className="w-16 shrink-0"></span>
            )}
          </header>
          {children}
        </div>
        {user && <BottomNav />}
      </body>
    </html>
  );
}
