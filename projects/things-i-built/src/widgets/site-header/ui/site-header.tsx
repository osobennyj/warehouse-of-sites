import { Download, Menu } from "lucide-react";
import Link from "next/link";

import { ThemeToggle } from "@/features/theme-toggle";
import { navigation, siteConfig } from "@/shared/config";
import { withBasePath } from "@/shared/lib";
import { ButtonLink, Container } from "@/shared/ui";

function Logo() {
  return (
    <Link
      href="/"
      className="group rounded-md font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
    >
      {siteConfig.shortName}
      <span className="sr-only">, {siteConfig.name}, home</span>
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-bg/75 backdrop-blur-xl supports-[backdrop-filter]:bg-bg/60">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-full px-3.5 py-2 text-sm text-muted transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-accent"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <ButtonLink href={siteConfig.cvPath} asset download size="sm" className="hidden sm:inline-flex">
            <Download aria-hidden className="size-4" /> CV
          </ButtonLink>
          <details className="group relative md:hidden">
            <summary
              aria-label="Open menu"
              className="flex size-9 cursor-pointer list-none items-center justify-center rounded-full text-muted hover:bg-card hover:text-fg [&::-webkit-details-marker]:hidden"
            >
              <Menu aria-hidden className="size-5" />
            </summary>
            <nav
              aria-label="Mobile"
              className="absolute right-0 mt-2 w-56 rounded-2xl border border-border bg-bg/95 p-2 shadow-2xl backdrop-blur-xl"
            >
              <ul>
                {navigation.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="block rounded-xl px-3 py-2.5 text-sm hover:bg-card">
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <a
                    href={withBasePath(siteConfig.cvPath)}
                    download
                    className="block rounded-xl px-3 py-2.5 text-sm text-accent hover:bg-card"
                  >
                    Download CV (PDF)
                  </a>
                </li>
              </ul>
            </nav>
          </details>
        </div>
      </Container>
    </header>
  );
}
