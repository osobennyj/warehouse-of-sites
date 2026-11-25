import { ImageResponse } from "next/og";

import { siteConfig } from "@/shared/config";

export const ogImageSize = { width: 1200, height: 630 };
export const ogImageContentType = "image/png";

interface OgImageInput {
  eyebrow: string;
  title: string;
  subtitle: string;
  tags?: readonly string[];
}

export function renderOgImage({ eyebrow, title, subtitle, tags = [] }: OgImageInput): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "#09090b",
          backgroundImage:
            "radial-gradient(circle at 85% 10%, rgba(45,212,191,0.28), transparent 45%), radial-gradient(circle at 10% 100%, rgba(139,92,246,0.25), transparent 50%)",
          color: "#fafafa",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 26, letterSpacing: 4, color: "#5eead4", textTransform: "uppercase" }}>
          {eyebrow}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2 }}>
            {title}
          </div>
          <div style={{ display: "flex", fontSize: 32, color: "#a1a1aa", lineHeight: 1.35, maxWidth: 980 }}>
            {subtitle}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 24 }}>
          <div style={{ display: "flex", gap: 12 }}>
            {tags.slice(0, 4).map((tag) => (
              <div
                key={tag}
                style={{
                  display: "flex",
                  padding: "6px 18px",
                  borderRadius: 999,
                  border: "1px solid #3f3f46",
                  color: "#d4d4d8",
                }}
              >
                {tag}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", color: "#a1a1aa" }}>{siteConfig.name}</div>
        </div>
      </div>
    ),
    ogImageSize,
  );
}
