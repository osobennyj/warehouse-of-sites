import Link from "next/link";
import { ReportGallery } from "@/widgets/report-gallery/ui/report-gallery";
import { siteConfig } from "@/shared/config/site";
import { getReportSummaries } from "@/shared/lib/reports";

export async function HomeView() {
  const reports = await getReportSummaries();
  const featured = reports.slice(0, 3);

  return (
    <main className="mx-auto max-w-6xl space-y-12 px-4 py-10">
      <section className="space-y-5">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-400">Checklist demo</p>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-zinc-50 md:text-5xl">
          {siteConfig.tagline}
        </h1>
        <p className="max-w-2xl text-lg text-zinc-400">{siteConfig.description}</p>
        <div className="rounded-xl border border-amber-900/40 bg-amber-950/25 p-4 text-sm leading-relaxed text-amber-100/90">
          <strong className="text-amber-50">Does not run a live LLM in this static deploy.</strong> Narrative text in
          the gallery uses a <strong className="text-amber-50">mock writer</strong>. The part that works without keys is
          the deterministic checklist, tool adapters, and the 0 to 100 score rules (see methodology in each report).
          Add <code className="text-zinc-300">ANTHROPIC_API_KEY</code> or <code className="text-zinc-300">OPENAI_API_KEY</code>{" "}
          locally for real model runs.
        </div>
        <div className="flex flex-wrap gap-2 text-sm text-zinc-500">
          Example checklists:
          {siteConfig.sampleTokens.map((token) => (
            <Link key={token} href={`/reports/${token}/`} className="text-sky-400 hover:underline">
              {token}
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium text-zinc-100">Sample outputs (mock narrative)</h2>
          <Link href="/gallery/" className="text-sm text-sky-400 hover:underline">
            View all
          </Link>
        </div>
        <ReportGallery reports={featured} />
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {[
          ["Checklist + score", "Numbers come from tools (CoinGecko, DefiLlama, vesting seeds). Score is formulaic."],
          ["Mock memo", 'Prose sections say "mock" unless you wire a real LLM locally.'],
          ["Not advice", "No price targets or invented returns."],
        ].map(([title, body]) => (
          <div key={title} className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <h3 className="font-medium text-zinc-100">{title}</h3>
            <p className="mt-2 text-sm text-zinc-400">{body}</p>
          </div>
        ))}
      </section>
    </main>
  );
}