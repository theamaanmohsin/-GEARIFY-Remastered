import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./providers/ThemeProvider";
import Navbar from "./components/Navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GEARIFY — Automotive Performance Management System",
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
      <body className="antialiased min-h-screen flex flex-col selection:bg-indigo-500 selection:text-white">
        <ThemeProvider>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16">
            {children}
          </main>
          <footer className="py-6 border-t border-white/10 text-center text-xs text-gray-500">
            GEARIFY APMS v2.0 — Built for Automotive Workshop Performance
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
