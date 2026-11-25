import { shortenAddress } from "@/entities/investigation";
import { siteConfig } from "@/shared/config/site";

type Props = {
  title: string;
  summary: string;
  referenceUrl: string;
  chain: string;
  seedAddress: string;
  generatedAt: string;
};

export function InvestigationHeader({
  title,
  summary,
  referenceUrl,
  chain,
  seedAddress,
  generatedAt,
}: Props) {
  return (
    <header className="space-y-3">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{siteConfig.title}</p>
      <h1 className="text-3xl font-semibold text-white">{title}</h1>
      <p className="max-w-3xl text-slate-300">{summary}</p>
      <dl className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-400">
        <MetaItem label="Chain" value={chain} />
        <MetaItem label="Seed" value={shortenAddress(seedAddress)} mono />
        <MetaItem label="Generated" value={new Date(String(generatedAt)).toLocaleString()} />
        <div>
          <dt className="sr-only">Reference</dt>
          <dd>
            <a href={referenceUrl} className="text-accent hover:underline" target="_blank" rel="noreferrer">
              Public write-up
            </a>
          </dd>
        </div>
      </dl>
    </header>
  );
}

function MetaItem({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs uppercase text-slate-500">{label}</dt>
      <dd className={mono ? "font-mono text-slate-200" : "text-slate-200"}>{value}</dd>
    </div>
  );
}