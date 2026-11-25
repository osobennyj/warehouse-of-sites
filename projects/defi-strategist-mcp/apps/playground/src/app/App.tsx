import { useCallback, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { runTool } from '@/features/run-tool/lib';
import { toolList, type ToolId } from '@/shared/config/tools';
import transcripts from '@/views/transcripts/data.json';

function toolFromHash(): ToolId {
  const h = window.location.hash.replace('#', '');
  return (toolList.find((t) => t.id === h)?.id ?? 'find_yields') as ToolId;
}

export function App() {
  const [tab, setTab] = useState<'tools' | 'transcripts'>('tools');
  const [tool, setTool] = useState<ToolId>(toolFromHash);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<unknown>(null);

  const [params, setParams] = useState({
    stablecoinOnly: true,
    minTvlUsd: 1_000_000,
    limit: 8,
    capitalUsd: 10_000,
    asset: 'USDC',
    market: 'wstETH',
    supplyApyPct: 3.5,
    borrowApyPct: 2.2,
    ltv: 0.72,
    liq: 0.82,
    loops: 3,
    fundingAsset: 'BTC',
    ptApy: 4.8,
    fundingRate: 0.00001,
  });

  const selectTool = (id: ToolId) => {
    setTool(id);
    window.location.hash = id;
  };

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload =
        tool === 'find_yields'
          ? {
              stablecoinOnly: params.stablecoinOnly,
              minTvlUsd: params.minTvlUsd,
              limit: params.limit,
              asset: params.asset,
            }
          : tool === 'analyze_pendle'
            ? { market: params.market }
            : tool === 'simulate_loop'
              ? {
                  supplyApyPct: params.supplyApyPct,
                  borrowApyPct: params.borrowApyPct,
                  ltv: params.ltv,
                  liq: params.liq,
                  loops: params.loops,
                }
              : tool === 'funding_carry'
                ? { asset: params.fundingAsset }
                : { ptApy: params.ptApy, fundingRate: params.fundingRate };

      setResult(await runTool(tool, payload));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Run failed');
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, [params, tool]);

  useEffect(() => {
    void run();
  }, [run]);

  const chartData = useMemo(() => {
    if (tool === 'find_yields' && result && typeof result === 'object' && result !== null) {
      const pools = (result as { pools?: { symbol: string; riskAdjustedScore: number }[] }).pools;
      return pools?.map((p) => ({ name: p.symbol, score: p.riskAdjustedScore })) ?? [];
    }
    if (tool === 'simulate_loop' && result && typeof result === 'object') {
      const steps = (result as { steps?: { loop: number; leverage: number }[] }).steps;
      return steps?.map((s) => ({ name: `L${s.loop}`, score: s.leverage })) ?? [];
    }
    return [];
  }, [result, tool]);

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-800 bg-slate-900/80 px-4 py-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-emerald-400">Portfolio demo</p>
            <h1 className="text-2xl font-semibold text-white">DeFi Strategist MCP</h1>
            <p className="max-w-2xl text-sm text-slate-400">
              Playground on fixture/snapshot data. Live MCP + fresh DefiLlama runs need the server locally or in Claude.
              Not financial advice.
            </p>
          </div>
          <nav className="flex gap-2 text-sm">
            <button
              type="button"
              className={`rounded px-3 py-1 ${tab === 'tools' ? 'bg-emerald-600 text-white' : 'bg-slate-800'}`}
              onClick={() => setTab('tools')}
            >
              Tools
            </button>
            <button
              type="button"
              className={`rounded px-3 py-1 ${tab === 'transcripts' ? 'bg-emerald-600 text-white' : 'bg-slate-800'}`}
              onClick={() => setTab('transcripts')}
            >
              Agent transcripts
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {tab === 'transcripts' ? (
          <section className="space-y-4">
            {transcripts.map((t) => (
              <article key={t.title} className="rounded-lg border border-slate-800 bg-slate-900 p-4">
                <h2 className="font-medium text-emerald-300">{t.title}</h2>
                <p className="text-xs text-slate-500">{t.toolChain}</p>
                <pre className="mt-3 whitespace-pre-wrap text-sm text-slate-300">{t.excerpt}</pre>
              </article>
            ))}
          </section>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
            <aside className="space-y-2">
              {toolList.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => selectTool(t.id)}
                  className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${
                    tool === t.id
                      ? 'border-emerald-500 bg-emerald-950/40'
                      : 'border-slate-800 bg-slate-900 hover:border-slate-600'
                  }`}
                >
                  <Box className="font-medium">{t.label}</Box>
                  <div className="text-xs text-slate-400">{t.blurb}</div>
                </button>
              ))}
            </aside>

            <section className="space-y-4">
              <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
                <ToolForm tool={tool} params={params} setParams={setParams} onRun={() => void run()} loading={loading} />
              </div>

              {error && (
                <p className="rounded border border-rose-900 bg-rose-950/40 p-3 text-sm text-rose-200">
                  {error}
                </p>
              )}

              {chartData.length > 0 && (
                <div className="h-56 rounded-lg border border-slate-800 bg-slate-900 p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155' }} />
                      <Bar dataKey="score" fill="#10b981" radius={4} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              <RecommendationSummary tool={tool} result={result} capitalUsd={params.capitalUsd} asset={params.asset} />
              <details className="rounded-lg border border-slate-800 bg-black/20 p-3 text-xs text-slate-500">
                <summary className="cursor-pointer text-slate-400">Raw tool output (debug)</summary>
                <pre className="mt-2 overflow-x-auto text-emerald-100/80">
                  {result ? JSON.stringify(result, null, 2) : 'empty'}
                </pre>
              </details>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

function Box({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

function RecommendationSummary({
  tool,
  result,
  capitalUsd,
  asset,
}: {
  tool: ToolId;
  result: unknown;
  capitalUsd: number;
  asset: string;
}) {
  if (!result || typeof result !== 'object') {
    return <p className="text-sm text-slate-500">Run a tool to see a plain-language recommendation.</p>;
  }

  if (tool === 'find_yields') {
    const pools = (result as { pools?: { symbol: string; apy: number; riskAdjustedScore: number; tvlUsd: number }[] })
      .pools;
    const top = pools?.[0];
    if (!top) {
      return <p className="text-sm text-slate-400">No pools matched your filters in this snapshot.</p>;
    }
    const yearly = capitalUsd * (top.apy / 100);
    return (
      <article className="rounded-lg border border-emerald-900/50 bg-emerald-950/20 p-5 text-sm leading-relaxed text-slate-200">
        <h2 className="text-lg font-medium text-emerald-300">Recommendation</h2>
        <p className="mt-2">
          For <strong className="text-white">${capitalUsd.toLocaleString()}</strong> in{' '}
          <strong className="text-white">{asset}</strong> yield exposure, the highest risk-adjusted score in this
          snapshot is <strong className="text-white">{top.symbol}</strong> (score {top.riskAdjustedScore}/100, APY{' '}
          {top.apy.toFixed(2)}%, TVL about ${Math.round(top.tvlUsd).toLocaleString()} in fixture data).
        </p>
        <p className="mt-2 text-slate-400">
          Illustrative interest at the stated APY: about ${yearly.toFixed(0)} per year before gas, IL, and protocol
          risk. This is not a forecast.
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Live: install the MCP server for agents. Not live here: fresh pool pulls (this page may use snapshots).
        </p>
      </article>
    );
  }

  if (tool === 'simulate_loop' && 'netApyPct' in (result as object)) {
    const r = result as { netApyPct: number; healthFactor: number; loops: number };
    const yearly = capitalUsd * (r.netApyPct / 100);
    return (
      <article className="rounded-lg border border-slate-800 bg-slate-900/80 p-5 text-sm text-slate-200">
        <h2 className="text-lg font-medium text-white">Loop summary</h2>
        <p className="mt-2">
          At ${capitalUsd.toLocaleString()} with {r.loops} loops, model net APY {r.netApyPct.toFixed(2)}% and health
          factor {r.healthFactor.toFixed(2)}. Illustrative yearly: about ${yearly.toFixed(0)} before liquidation risk.
        </p>
      </article>
    );
  }

  return (
    <p className="text-sm text-slate-400">
      Open the debug panel for numbers. Prefer <strong className="text-slate-200">find_yields</strong> for a sized
      stablecoin recommendation.
    </p>
  );
}

type FormParams = {
  stablecoinOnly: boolean;
  minTvlUsd: number;
  limit: number;
  capitalUsd: number;
  asset: string;
  market: string;
  supplyApyPct: number;
  borrowApyPct: number;
  ltv: number;
  liq: number;
  loops: number;
  fundingAsset: string;
  ptApy: number;
  fundingRate: number;
};

function ToolForm({
  tool,
  params,
  setParams,
  onRun,
  loading,
}: {
  tool: ToolId;
  params: FormParams;
  setParams: Dispatch<SetStateAction<FormParams>>;
  onRun: () => void;
  loading: boolean;
}) {
  const field = (
    label: string,
    key: keyof FormParams,
    type: 'number' | 'text' | 'checkbox' = 'text',
  ) => (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-slate-400">{label}</span>
      {type === 'checkbox' ? (
        <input
          type="checkbox"
          checked={Boolean(params[key])}
          onChange={(e) => setParams((p) => ({ ...p, [key]: e.target.checked }))}
        />
      ) : (
        <input
          className="rounded border border-slate-700 bg-slate-950 px-2 py-1"
          type={type}
          value={String(params[key])}
          onChange={(e) =>
            setParams((p) => ({
              ...p,
              [key]: type === 'number' ? Number(e.target.value) : e.target.value,
            }))
          }
        />
      )}
    </label>
  );

  return (
    <Box className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {tool === 'find_yields' && (
          <>
            {field('Your size (USD)', 'capitalUsd', 'number')}
            {field('Asset filter', 'asset')}
            {field('Min TVL USD', 'minTvlUsd', 'number')}
            {field('Limit', 'limit', 'number')}
            {field('Stablecoin only', 'stablecoinOnly', 'checkbox')}
          </>
        )}
        {tool === 'analyze_pendle' && field('Market', 'market')}
        {tool === 'simulate_loop' && (
          <>
            {field('Supply APY %', 'supplyApyPct', 'number')}
            {field('Borrow APY %', 'borrowApyPct', 'number')}
            {field('LTV', 'ltv', 'number')}
            {field('Liq threshold', 'liq', 'number')}
            {field('Loops', 'loops', 'number')}
          </>
        )}
        {tool === 'funding_carry' && field('Asset', 'fundingAsset')}
        {tool === 'compare' && (
          <>
            {field('Illustrative PT APY %', 'ptApy', 'number')}
            {field('Funding rate (hourly)', 'fundingRate', 'number')}
          </>
        )}
      </div>
      <button
        type="button"
        disabled={loading}
        onClick={onRun}
        className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading ? 'Running…' : 'Run tool'}
      </button>
    </Box>
  );
}