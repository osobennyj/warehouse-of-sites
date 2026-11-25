import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { cn, isExternalUrl, withBasePath } from "@/shared/lib";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md";

const variants: Record<Variant, string> = {
  primary:
    "bg-fg text-bg hover:bg-fg/85 shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_8px_24px_-8px_rgb(var(--accent-rgb)/0.45)]",
  secondary: "border border-border bg-card/60 text-fg hover:border-fg/30 hover:bg-card",
  ghost: "text-muted hover:text-fg hover:bg-card",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm gap-1.5",
  md: "h-11 px-5 text-[0.95rem] gap-2",
};

export function buttonStyles({
  variant = "primary",
  size = "md",
  className,
}: { variant?: Variant; size?: Size; className?: string } = {}): string {
  return cn(
    "inline-flex items-center justify-center rounded-full font-medium whitespace-nowrap transition-[background-color,border-color,color,transform] duration-200 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
    variants[variant],
    sizes[size],
    className,
  );
}

interface ButtonLinkProps extends Omit<ComponentProps<"a">, "href"> {
  href: string;
  variant?: Variant;
  size?: Size;
  /** Static file in /public (e.g. a PDF): rendered as a plain anchor with the base path applied. */
  asset?: boolean;
  children: ReactNode;
}

export function ButtonLink({ href, variant, size, asset, className, children, ...rest }: ButtonLinkProps) {
  const classes = buttonStyles({ variant, size, className });

  if (isExternalUrl(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes} {...rest}>
        {children}
      </a>
    );
  }
  if (asset) {
    return (
      <a href={withBasePath(href)} className={classes} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={classes} {...rest}>
      {children}
    </Link>
  );
}
