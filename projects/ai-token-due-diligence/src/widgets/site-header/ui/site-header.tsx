import Link from "next/link";
import { siteConfig } from "@/shared/config/site";

export function SiteHeader() {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="font-semibold text-zinc-100">
          {siteConfig.name}
        </Link>
        <nav className="flex gap-4 text-sm text-zinc-400">
          <Link href="/gallery/" className="hover:text-zinc-100">
            Gallery
          </Link>
          <a
            href={siteConfig.repoUrl}
            className="hover:text-zinc-100"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}