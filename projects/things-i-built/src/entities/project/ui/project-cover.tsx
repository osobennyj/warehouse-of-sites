import { cn, withBasePath } from "@/shared/lib";

import type { Project, ProjectAccent } from "../model/types";

const accentGradients: Record<ProjectAccent, string> = {
  teal: "from-teal-400/35 via-emerald-500/10",
  violet: "from-violet-400/35 via-fuchsia-500/10",
  amber: "from-amber-300/35 via-orange-500/10",
  sky: "from-sky-400/35 via-blue-500/10",
  rose: "from-rose-400/35 via-pink-500/10",
  lime: "from-lime-300/35 via-green-500/10",
};

const accentStroke: Record<ProjectAccent, string> = {
  teal: "text-teal-300",
  violet: "text-violet-300",
  amber: "text-amber-300",
  sky: "text-sky-300",
  rose: "text-rose-300",
  lime: "text-lime-300",
};

/** Deterministic pseudo-random series so every generated cover is unique yet stable between builds. */
function sparkline(seed: string, points = 24): string {
  let state = [...seed].reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0, 7);
  let value = 50;
  return Array.from({ length: points }, (_, i) => {
    state = (state * 1664525 + 1013904223) >>> 0;
    value = Math.min(88, Math.max(12, value + ((state % 1000) / 1000 - 0.45) * 22));
    return `${((i / (points - 1)) * 400).toFixed(1)},${(100 - value).toFixed(1)}`;
  }).join(" ");
}

type CoverProps = Pick<Project, "slug" | "title" | "cover" | "accent"> & { className?: string; priority?: boolean };

export function ProjectCover({ slug, title, cover, accent, className, priority = false }: CoverProps) {
  if (cover) {
    return (
      <div className={cn("relative aspect-[16/9] overflow-hidden bg-card", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element -- static export serves images as-is */}
        <img
          src={withBasePath(cover.src)}
          alt={cover.alt}
          width={1280}
          height={720}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className="size-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
        />
      </div>
    );
  }

  return (
    <div
      aria-hidden
      className={cn(
        "relative aspect-[16/9] overflow-hidden bg-gradient-to-br to-transparent",
        accentGradients[accent],
        className,
      )}
    >
      <div className="bg-grid absolute inset-0 opacity-60" />
      <svg
        viewBox="0 0 400 100"
        preserveAspectRatio="none"
        className={cn("absolute inset-x-0 bottom-6 h-1/2 w-full", accentStroke[accent])}
      >
        <polyline
          points={sparkline(slug)}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
        />
      </svg>
      <div className="absolute top-4 left-4 flex items-center gap-2 font-mono text-[0.7rem] tracking-widest text-fg/70 uppercase">
        <span className="size-2 rounded-full bg-current" />
        {title}
      </div>
    </div>
  );
}
