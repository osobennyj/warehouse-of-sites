import "./globals.css";

import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Discipline Calendar",
  description: "Trading journal that colors each day by whether every trade followed the plan. Demo on sample data.",
};

interface RootLayoutProps {
  children: ReactNode;
}

const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("theme");var l=t==="light"||(t==="system"&&matchMedia("(prefers-color-scheme: light)").matches);document.documentElement.dataset.theme=l?"light":"dark"}catch(e){}})()`;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
