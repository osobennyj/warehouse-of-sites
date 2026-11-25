const portfolioHome = import.meta.env.VITE_PORTFOLIO_HOME ?? "/warehouse-of-sites/";

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
        <p className="truncate text-sm text-zinc-400">DeFi Strategist MCP</p>
      </div>
    </header>
  );
}