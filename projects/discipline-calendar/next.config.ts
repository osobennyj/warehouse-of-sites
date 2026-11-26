import type { NextConfig } from "next";

const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined;

// Demo build is a static export served under /demos/discipline-calendar on GitHub Pages.
const nextConfig: NextConfig = isDemo
  ? { output: "export", basePath, trailingSlash: true, images: { unoptimized: true } }
  : {};

export default nextConfig;
