import { siteConfig } from "@/shared/config";

export const dynamic = "force-static";
import { ogImageContentType, ogImageSize, renderOgImage } from "@/shared/seo";

export const alt = siteConfig.title;
export const size = ogImageSize;
export const contentType = ogImageContentType;

export default function Image() {
  return renderOgImage({
    eyebrow: siteConfig.shortName,
    title: "On-chain research → working tools",
    subtitle: siteConfig.description,
    tags: ["Research", "DeFi", "AI"],
  });
}