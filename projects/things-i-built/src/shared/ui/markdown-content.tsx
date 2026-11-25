"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";

import { cn } from "@/shared/lib";

const MERMAID_SELECTOR = "pre[data-mermaid], pre:has(> code.language-mermaid)";

/** Renders trusted, build-time generated HTML; Mermaid is loaded lazily only when a diagram is present. */
export function MarkdownContent({ html, className }: { html: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const blocks = Array.from(ref.current?.querySelectorAll<HTMLPreElement>(MERMAID_SELECTOR) ?? []);
    if (blocks.length === 0) return;

    let cancelled = false;
    void import("mermaid").then(async ({ default: mermaid }) => {
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "strict",
        theme: resolvedTheme === "light" ? "neutral" : "dark",
        fontFamily: "inherit",
      });
      for (const [index, pre] of blocks.entries()) {
        if (cancelled) return;
        const source = pre.dataset.mermaid ?? pre.textContent ?? "";
        pre.dataset.mermaid = source;
        const { svg } = await mermaid.render(`diagram-${index}-${Date.now()}`, source);
        if (cancelled) return;
        pre.setAttribute("role", "img");
        pre.setAttribute("aria-label", "Architecture diagram");
        pre.innerHTML = svg;
      }
    });
    return () => {
      cancelled = true;
    };
  }, [html, resolvedTheme]);

  return (
    <div
      ref={ref}
      className={cn("prose-content", className)}
      // HTML comes from repository-owned markdown rendered at build time.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
