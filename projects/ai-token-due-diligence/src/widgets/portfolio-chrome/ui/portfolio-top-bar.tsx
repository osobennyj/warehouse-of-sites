import { withBasePath } from "@/shared/config/site";

const portfolioHome = process.env.NEXT_PUBLIC_PORTFOLIO_HOME ?? "/warehouse-of-sites/";

export function PortfolioTopBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a
          href={portfolioHome}
          className="inline-flex h-9 shrink-0 items-center justify-center rounded-full bg-zinc-50 px-3.5 text-sm font-medium text-zinc-950 transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400"
        >
          Things I Built
        </a>
        <nav className="flex items-center gap-4 text-sm text-zinc-400">
          <a href={withBasePath("/gallery/")} className="transition hover:text-zinc-100">
            Gallery
          </a>
        </nav>
      </div>
    </header>
  );
}