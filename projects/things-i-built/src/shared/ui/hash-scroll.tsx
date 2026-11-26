"use client";

import { useEffect } from "react";

/**
 * Scrolls to same-page #anchors itself. Next's built-in hash scrolling stops short
 * on the static export (it is cut off by smooth scrolling and layout shifts).
 */
export function HashScroll() {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
      const anchor = (event.target as Element | null)?.closest?.("a");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const url = new URL(anchor.href, window.location.href);
      const trim = (path: string) => path.replace(/\/$/, "");
      if (!url.hash || url.origin !== window.location.origin || trim(url.pathname) !== trim(window.location.pathname))
        return;

      const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!target) return;

      event.preventDefault();
      event.stopPropagation();
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      window.history.pushState(null, "", url.hash);
      anchor.closest("details")?.removeAttribute("open");
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
