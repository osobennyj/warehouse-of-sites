import { Link } from "react-router-dom";
import { INVESTIGATION_MANIFEST, shortenAddress } from "@/entities/investigation";
import { siteConfig } from "@/shared/config/site";

export function GalleryView() {
  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-10">
      <header className="space-y-4">
        <h1 className="text-4xl font-semibold text-white">{siteConfig.title}</h1>
        <p className="max-w-2xl text-lg text-slate-300">{siteConfig.pitch}</p>
        <p className="text-sm text-slate-500">
          Attribution is probabilistic — public on-chain data only. Not an accusation.
        </p>
      </header>
      <section className="grid gap-4 md:grid-cols-2">
        {INVESTIGATION_MANIFEST.map((item) => (
          <article
            key={item.slug}
            className="flex flex-col justify-between rounded-xl border border-surface-border bg-surface-raised p-5"
          >
            <div className="space-y-2">
              <h2 className="text-xl font-medium text-white">{item.title}</h2>
              <p className="text-sm text-slate-400">{item.summary}</p>
              <p className="font-mono text-xs text-slate-500">
                {item.chain} · seed {shortenAddress(item.seedAddress)}
              </p>
            </div>
            <Link
              to={`/investigation/${item.slug}`}
              className="mt-4 inline-flex w-fit rounded-md bg-accent/20 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/30"
            >
              Open investigation
            </Link>
          </article>
        ))}
      </section>
    </div>
  );
}