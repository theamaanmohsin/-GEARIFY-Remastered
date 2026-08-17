import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { ThemeProvider } from "./providers/ThemeProvider";
import DynamicCursorTrail from "./components/marketing/DynamicCursorTrail";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GEARIFY REMASTERED — Automotive Performance Management System",
  description:
    "Next-generation automotive service tracking, predictive maintenance, and digital receipts for workshop management.",
  verification: {
    google: "Kb2UUpc_TViE-xEI-1brx8GKM6lu7r4xN0JIjILPyO0",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col selection:bg-zinc-900/15 selection:text-zinc-900 dark:selection:bg-[#C9A227]/25 dark:selection:text-[#E4C55E]">
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-XWF2BN06VG" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XWF2BN06VG');
          `}
        </Script>
        <ThemeProvider>
          <DynamicCursorTrail />
          {children}
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
