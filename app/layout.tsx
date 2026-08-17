import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./providers/ThemeProvider";
import DynamicCursorTrail from "./components/marketing/DynamicCursorTrail";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GEARIFY REMASTERED — Automotive Performance Management System",
  description:
    "Next-generation automotive service tracking, predictive maintenance, and digital receipts for workshop management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col selection:bg-zinc-900/15 selection:text-zinc-900 dark:selection:bg-[#C9A227]/25 dark:selection:text-[#E4C55E]">
        <ThemeProvider>
          <DynamicCursorTrail />
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
