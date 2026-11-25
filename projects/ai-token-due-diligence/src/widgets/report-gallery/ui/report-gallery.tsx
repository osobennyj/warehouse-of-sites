import Link from "next/link";
import type { ReportSummary } from "@/entities/report";
import { ReportScoreBadge } from "@/entities/report/ui/report-score-badge";
import { withBasePath } from "@/shared/config/site";

export function ReportGallery({ reports }: { reports: ReportSummary[] }) {
  if (!reports.length) {
    return (
      <p className="rounded-xl border border-dashed border-zinc-700 p-8 text-center text-zinc-400">
        No sample reports yet. Run <code className="text-zinc-200">pnpm generate:samples</code>.
      </p>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {reports.map((report) => (
        <li key={report.id}>
          <Link
            href={withBasePath(`/reports/${report.id}/`)}
            className="block h-full rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 transition hover:border-sky-500/40 hover:bg-zinc-900"
          >
            <TokenHeader report={report} />
            <p className="line-clamp-3 text-sm text-zinc-400">{report.headline}</p>
            <p className="mt-3 text-xs text-zinc-500">
              {report.model} · {new Date(report.createdAt).toLocaleDateString("en-GB")}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function TokenHeader({ report }: { report: ReportSummary }) {
  return (
    <div className="mb-3 flex items-start justify-between gap-2">
      <div className="flex items-center gap-2">
        {report.token.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={report.token.imageUrl} alt="" className="h-8 w-8 rounded-full" />
        ) : null}
        <div>
          <span className="font-semibold text-zinc-100">{report.token.symbol}</span>
          <span className="block text-xs text-zinc-500">{report.token.name}</span>
        </div>
      </div>
      <ReportScoreBadge score={report.score} />
    </div>
  );
}