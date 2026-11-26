import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { QueryProvider } from "@/app/query-provider";
import { PortfolioTopBar } from "@/widgets/portfolio-chrome/ui/portfolio-top-bar";
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
  description: "Compares perpetual funding rates across Binance, Bybit, OKX and Hyperliquid and ranks spreads by net profit after fees.",
  openGraph: {
    title: "Funding Rate Radar",
    description: "Funding spreads across four exchanges, ranked by net yield after fees.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-zinc-950 pt-16 font-sans text-zinc-100">
        <PortfolioTopBar title="Funding Rate Radar" />
        <QueryProvider>
          <div className="mx-auto min-h-[calc(100vh-4rem)] w-full max-w-6xl px-4 pb-12 sm:px-6">{children}</div>
        </QueryProvider>
      </body>
    </html>
  );
}