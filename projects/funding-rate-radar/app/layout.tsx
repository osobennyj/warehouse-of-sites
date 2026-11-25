import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { QueryProvider } from "@/app/query-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Funding Rate Radar",
  description: "Cross-exchange perpetual funding arbitrage scanner for Binance, Bybit, OKX and Hyperliquid.",
  openGraph: {
    title: "Funding Rate Radar",
    description: "Live funding spreads, history and net-yield calculator.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full font-sans text-slate-100">
        <QueryProvider>
          <div className="mx-auto min-h-screen w-full max-w-6xl px-4 pb-12 sm:px-6">{children}</div>
        </QueryProvider>
      </body>
    </html>
  );
}