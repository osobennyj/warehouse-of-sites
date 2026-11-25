import type { ReactNode } from "react";

import { cn } from "@/shared/lib";

export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-6xl px-5 sm:px-8", className)}>{children}</div>;
}

interface PageIntroProps {
  eyebrow: string;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
}

export function PageIntro({ eyebrow, title, description, children }: PageIntroProps) {
  return (
    <header className="relative overflow-hidden pt-16 pb-10 sm:pt-24">
      <div aria-hidden className="hero-glow pointer-events-none absolute inset-0 -z-10 opacity-70" />
      <Container>
        <p className="mb-3 font-mono text-xs tracking-[0.2em] text-accent uppercase">{eyebrow}</p>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">{title}</h1>
        {description && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">{description}</p>}
        {children}
      </Container>
    </header>
  );
}

interface SectionProps {
  id?: string;
  eyebrow: string;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function Section({ id, eyebrow, title, description, action, className, children }: SectionProps) {
  const headingId = id ? `${id}-title` : undefined;
  return (
    <section id={id} aria-labelledby={headingId} className={cn("scroll-mt-24 py-20 sm:py-28", className)}>
      <Container>
        <div className="mb-10 flex flex-col gap-4 sm:mb-14 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="mb-3 font-mono text-xs tracking-[0.2em] text-accent uppercase">{eyebrow}</p>
            <h2 id={headingId} className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              {title}
            </h2>
            {description && <p className="mt-4 text-lg leading-relaxed text-muted">{description}</p>}
          </div>
          {action}
        </div>
        {children}
      </Container>
    </section>
  );
}
