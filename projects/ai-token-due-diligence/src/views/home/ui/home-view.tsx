import Link from "next/link";
import { SampleSearchForm } from "@/features/sample-search/ui/sample-search";
import { ReportGallery } from "@/widgets/report-gallery/ui/report-gallery";
import { siteConfig } from "@/shared/config/site";
import { getReportSummaries } from "@/shared/lib/reports";

export async function HomeView() {
  const reports = await getReportSummaries();
  const featured = reports.slice(0, 3);

  return (
    <main className="mx-auto max-w-6xl space-y-12 px-4 py-10">
      <section className="space-y-5">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-400">Portfolio demo</p>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-zinc-50 md:text-5xl">
          {siteConfig.tagline}
        </h1>
        <p className="max-w-2xl text-lg text-zinc-400">{siteConfig.description}</p>
        <SampleSearchForm />
        <div className="flex flex-wrap gap-2 text-sm text-zinc-500">
          Try:
          {siteConfig.sampleTokens.map((token) => (
            <Link key={token} href={`/reports/${token}/`} className="text-sky-400 hover:underline">
              {token}
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium text-zinc-100">Example reports</h2>
          <Link href="/gallery/" className="text-sm text-sky-400 hover:underline">
            View all
          </Link>
        </div>
        <ReportGallery reports={featured} />
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {[
          ["Composable agent", "Parallel tool calls → scored facts → guarded LLM memo."],
          ["Sourced numbers", "Every metric ties to CoinGecko / DefiLlama / vesting seeds."],
          ["Keyless demo", "Mock LLM + recorded fixtures; swap in Anthropic/OpenAI via .env."],
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