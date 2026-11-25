import type { ReactNode } from "react";

import { cn } from "@/shared/lib";

type Tone = "neutral" | "success" | "warning" | "info";

const tones: Record<Tone, string> = {
  neutral: "border-border bg-card/70 text-muted",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  info: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
};

interface BadgeProps {
  tone?: Tone;
  dot?: boolean;
  className?: string;
  children: ReactNode;
}

export function Badge({ tone = "neutral", dot = false, className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[0.7rem] tracking-wide uppercase",
        tones[tone],
        className,
      )}
    >
      {dot && (
        <span aria-hidden className="relative flex size-1.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-60 motion-reduce:animate-none" />
          <span className="relative inline-flex size-1.5 rounded-full bg-current" />
        </span>
      )}
      {children}
    </span>
  );
}
