"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { siteConfig, withBasePath } from "@/shared/config/site";

export function SampleSearchForm() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const staticDemo = process.env.NEXT_PUBLIC_STATIC_DEMO === "true";

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const id = query.trim().toLowerCase();
  const match = siteConfig.sampleTokens.find(
      (t) => t === id || t.startsWith(id),
    );
    if (match) router.push(withBasePath(`/reports/${match}/`));
    else router.push(withBasePath(`/gallery/?q=${encodeURIComponent(query)}`));
  };

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 sm:flex-row"
    >
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ticker or CoinGecko id (e.g. ARB, ethena, aave)"
        className="flex-1 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none ring-sky-500/40 focus:ring-2"
      />
      <button
        type="submit"
        className="rounded-xl bg-sky-500 px-5 py-3 font-medium text-zinc-950 hover:bg-sky-400"
      >
        View report
      </button>
      {staticDemo ? (
        <p className="text-xs text-zinc-500 sm:col-span-2">
          Static demo: pre-generated reports only. Deploy with API keys for live agent runs.
        </p>
      ) : null}
    </form>
  );
}