import { Download, Menu } from "lucide-react";
import Link from "next/link";

import { ThemeToggle } from "@/features/theme-toggle";
import { navigation, siteConfig } from "@/shared/config";
import { withBasePath } from "@/shared/lib";
import { ButtonLink, Container } from "@/shared/ui";

export function SiteHeader() {
  return (
    <header className="border-border/60 bg-bg/75 supports-[backdrop-filter]:bg-bg/60 sticky top-0 z-40 border-b backdrop-blur-xl">
      <Container className="flex h-16 items-center justify-between gap-4">
        <ButtonLink href="/" size="sm" className="shrink-0">
          {siteConfig.shortName}
          <span className="sr-only">, {siteConfig.name}, home</span>
        </ButtonLink>

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-muted hover:text-fg focus-visible:outline-accent rounded-full px-3.5 py-2 text-sm transition-colors focus-visible:outline-2"
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
              className="text-muted hover:bg-card hover:text-fg flex size-9 cursor-pointer list-none items-center justify-center rounded-full [&::-webkit-details-marker]:hidden"
            >
              <Menu aria-hidden className="size-5" />
            </summary>
            <nav
              aria-label="Mobile"
              className="border-border bg-bg/95 absolute right-0 mt-2 w-56 rounded-2xl border p-2 shadow-2xl backdrop-blur-xl"
            >
              <ul>
                {navigation.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="hover:bg-card block rounded-xl px-3 py-2.5 text-sm">
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <a
                    href={withBasePath(siteConfig.cvPath)}
                    download
                    className="text-accent hover:bg-card block rounded-xl px-3 py-2.5 text-sm"
                  >
                    Download CV
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
