import type { Report } from "../model/schema";
import { reportToMarkdown } from "../model/markdown";
import { ReportScoreBadge } from "./report-score-badge";
import { formatPct, formatSignedPct, formatUsd } from "@/shared/lib/format";

export function ReportView({ report }: { report: Report }) {
  const md = reportToMarkdown(report);
  return (
    <article className="mx-auto max-w-4xl space-y-8 px-4 py-10 text-zinc-100">
      <header className="space-y-4 border-b border-zinc-800 pb-6">
        <div className="flex flex-wrap items-center gap-3">
          {report.token.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={report.token.imageUrl}
              alt=""
              className="h-12 w-12 rounded-full ring-1 ring-zinc-700"
            />
          ) : null}
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {report.token.name}{" "}
              <span className="text-zinc-400">({report.token.symbol})</span>
            </h1>
            <p className="text-sm text-zinc-400">Query: {report.query}</p>
          </div>
          <ReportScoreBadge score={report.score} />
        </div>
        <p className="text-lg leading-relaxed text-zinc-200">{report.analysis.verdict}</p>
        <p className="rounded-lg border border-amber-900/40 bg-amber-950/30 px-3 py-2 text-sm text-amber-100/90">
          Static deploy: narrative sections below use a <strong className="text-amber-50">mock writer</strong>. The
          checklist score is formulaic from tool data, not live LLM analysis.
        </p>
        <div className="flex flex-wrap gap-2 text-xs text-zinc-500">
          <span>Sample writer: {report.meta.model} (mock)</span>
          <span>·</span>
          <span>Guard: {report.meta.guard.passed ? "passed" : "failed"}</span>
          <span>·</span>
          <span>{new Date(report.createdAt).toLocaleString("en-GB")}</span>
        </div>
      </header>

      <Section title="Summary" body={report.analysis.summary} />
      <MetricsGrid report={report} />
      <Section title="Tokenomics" body={report.analysis.tokenomics} />
      <Section title="Fundamentals" body={report.analysis.fundamentals} />
      <Section title="Distribution" body={report.analysis.distribution} />
      <BulletSection title="Catalysts" items={report.analysis.catalysts} />
      <BulletSection title="Risks" items={report.analysis.risks.map((r) => ({ ...r, title: `${r.title} (${r.severity})` }))} />
      <BulletSection title="Red flags" items={report.analysis.redFlags} />

      <section>
        <h2 className="mb-3 text-lg font-medium text-zinc-100">Score breakdown</h2>
        <ul className="space-y-2 text-sm text-zinc-300">
          {report.score.factors.map((f) => (
            <li key={f.key} className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2">
              <div className="flex justify-between gap-2 font-medium">
                <span>{f.label}</span>
                <span>{f.score ?? "—"}</span>
              </div>
              <p className="mt-1 text-zinc-400">{f.rationale}</p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium">Sources</h2>
        <ul className="space-y-1 text-sm">
          {report.sources.map((s) => (
            <li key={s.id}>
              <a className="text-sky-400 hover:underline" href={s.url} target="_blank" rel="noreferrer">
                {s.title}
              </a>{" "}
              <span className="text-zinc-500">
                ({s.tool}, {s.id})
              </span>
            </li>
          ))}
        </ul>
      </section>

      <details className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
        <summary className="cursor-pointer text-sm font-medium text-zinc-300">Export Markdown</summary>
        <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap text-xs text-zinc-400">{md}</pre>
      </details>

      <p className="text-xs text-zinc-500">Not financial advice.</p>
    </article>
  );
}

function Section({ title, body }: { title: string; body: string }) {
  return (
    <section>
      <h2 className="mb-2 text-lg font-medium">{title}</h2>
      <p className="leading-relaxed text-zinc-300">{body}</p>
    </section>
  );
}

function BulletSection({
  title,
  items,
}: {
  title: string;
  items: { title: string; detail: string; sourceIds: string[] }[];
}) {
  return (
    <section>
      <h2 className="mb-2 text-lg font-medium">{title}</h2>
      {items.length ? (
        <ul className="list-disc space-y-2 pl-5 text-zinc-300">
          {items.map((item) => (
            <li key={item.title}>
              <strong>{item.title}</strong>: {item.detail}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-zinc-500">None identified.</p>
      )}
    </section>
  );
}

function MetricsGrid({ report }: { report: Report }) {
  const m = report.facts.market;
  const p = report.facts.protocol;
  if (!m) return null;
  const cells = [
    ["Price", formatUsd(m.priceUsd)],
    ["Market cap", formatUsd(m.marketCapUsd)],
    ["FDV", formatUsd(m.fdvUsd)],
    ["30d", formatSignedPct(m.priceChange30dPct)],
    ["TVL", formatUsd(p?.tvlUsd)],
    ["Rev yield", formatPct(p?.revenueYieldPct)],
  ];
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {cells.map(([label, value]) => (
        <div key={label} className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3">
          <div className="text-xs uppercase tracking-wide text-zinc-500">{label}</div>
          <div className="mt-1 text-lg font-medium">{value}</div>
        </div>
      ))}
    </div>
  );
}