import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

import TenantSwitcher from "@/components/tenant-switcher";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EngageNinja",
  description: "Multi-tenant WA/email engagement with guardrails and audit-aware auth.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50`}
      >
        <div className="min-h-screen">
          <header className="border-b border-slate-200/80 bg-white/80 px-6 py-4 shadow-sm shadow-slate-900/5 backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/80">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
              <Link href="/" className="text-sm font-semibold uppercase tracking-[0.5em] text-slate-600 dark:text-slate-300">
                EngageNinja
              </Link>
              <TenantSwitcher />
            </div>
          </header>

          <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
