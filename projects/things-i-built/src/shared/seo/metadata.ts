import type { Metadata } from "next";

import { siteConfig } from "@/shared/config";

interface PageMetadataInput {
  title: string;
  description: string;
  /** Route path starting with "/" (without the deployment base path). */
  path: string;
  type?: "website" | "article";
}

export function buildPageMetadata({ title, description, path, type = "website" }: PageMetadataInput): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, type, siteName: siteConfig.shortName, locale: siteConfig.locale },
    twitter: { card: "summary_large_image", title, description },
  };
}
