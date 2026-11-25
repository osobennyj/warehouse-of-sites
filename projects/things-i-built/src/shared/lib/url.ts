import { siteConfig } from "@/shared/config";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Prefixes static asset paths; `next/link` handles basePath on its own, plain `<a>`/`<img>` do not. */
export function withBasePath(path: string): string {
  return path.startsWith("/") ? `${basePath}${path}` : path;
}

/** `siteConfig.url` already includes the deployment base path. */
export function absoluteUrl(path = "/"): string {
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}

export function isExternalUrl(href: string): boolean {
  return /^https?:\/\//.test(href);
}
