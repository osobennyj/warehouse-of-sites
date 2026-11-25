/**
 * Records trimmed, real API responses into adapter test fixtures.
 * Usage: pnpm fixtures:record
 * Exchanges that are unreachable from the current region are skipped and keep their existing fixtures.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../src/shared/api/exchanges");
const KEEP = ["BTC", "ETH", "SOL", "PEPE", "DOGE"];
const DAY_MS = 86_400_000;

type Json = unknown;
type Recorder = () => Promise<Record<string, Json>>;

async function get(url: string): Promise<Json> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.json();
}

async function post(url: string, body: Json): Promise<Json> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.json();
}

const keepUsdtSymbol = (symbol: string) =>
  KEEP.some((asset) => symbol === `${asset}USDT` || symbol === `1000${asset}USDT`) ||
  symbol === "BTCUSDT_261225";

function withRows<T>(payload: Json, key: string, keep: (row: T) => boolean): Json {
  const record = payload as Record<string, unknown>;
  return { ...record, [key]: (record[key] as T[]).filter(keep) };
}

const recorders: Record<string, Recorder> = {
  async binance() {
    const base = "https://www.binance.com/fapi/v1";
    const bySymbol = (row: { symbol: string }) => keepUsdtSymbol(row.symbol);
    return {
      "premium-index": ((await get(`${base}/premiumIndex`)) as { symbol: string }[]).filter(bySymbol),
      "ticker-24hr": ((await get(`${base}/ticker/24hr`)) as { symbol: string }[]).filter(bySymbol),
      "funding-info": ((await get(`${base}/fundingInfo`)) as { symbol: string }[]).filter(
        (row) => bySymbol(row) || row.symbol === "LPTUSDT",
      ),
      "open-interest-btc": await get(`${base}/openInterest?symbol=BTCUSDT`),
      "funding-history-btc": await get(
        `${base}/fundingRate?symbol=BTCUSDT&startTime=${Date.now() - 2 * DAY_MS}&limit=1000`,
      ),
    };
  },
  async bybit() {
    const base = "https://api.bybit.com/v5/market";
    const now = Date.now();
    const keep = (row: { symbol: string }) => keepUsdtSymbol(row.symbol) || row.symbol === "BTCPERP";
    const tickers = await get(`${base}/tickers?category=linear`);
    const instruments = await get(`${base}/instruments-info?category=linear&limit=1000`);
    const trim = (payload: Json) => {
      const record = payload as { result: Record<string, unknown> };
      return { ...record, result: withRows(record.result, "list", keep) };
    };
    return {
      tickers: trim(tickers),
      instruments: trim(instruments),
      "funding-history-btc": await get(
        `${base}/funding/history?category=linear&symbol=BTCUSDT&startTime=${now - 2 * DAY_MS}&endTime=${now}&limit=200`,
      ),
    };
  },
  async okx() {
    const base = "https://www.okx.com/api/v5";
    const keep = (row: { instId: string }) =>
      KEEP.some((asset) => row.instId === `${asset}-USDT-SWAP`) || row.instId === "BTC-USD-SWAP";
    return {
      "funding-rates": withRows(await get(`${base}/public/funding-rate?instId=ANY`), "data", keep),
      tickers: withRows(await get(`${base}/market/tickers?instType=SWAP`), "data", keep),
      "open-interest": withRows(await get(`${base}/public/open-interest?instType=SWAP`), "data", keep),
      "mark-prices": withRows(await get(`${base}/public/mark-price?instType=SWAP`), "data", keep),
      "funding-history-btc": await get(`${base}/public/funding-rate-history?instId=BTC-USDT-SWAP&limit=6`),
    };
  },
  async hyperliquid() {
    const url = "https://api.hyperliquid.xyz/info";
    const [meta, contexts] = (await post(url, { type: "metaAndAssetCtxs" })) as [
      { universe: { name: string }[] },
      unknown[],
    ];
    const keepNames = new Set([...KEEP, "kPEPE"]);
    const indexes = meta.universe.flatMap((asset, index) => (keepNames.has(asset.name) ? [index] : []));
    return {
      "meta-and-asset-ctxs": [
        { ...meta, universe: indexes.map((index) => meta.universe[index]) },
        indexes.map((index) => contexts[index]),
      ],
      "funding-history-btc": await post(url, {
        type: "fundingHistory",
        coin: "BTC",
        startTime: Date.now() - 6 * 3_600_000,
      }),
    };
  },
};

for (const [exchange, record] of Object.entries(recorders)) {
  try {
    const fixtures = await record();
    const dir = path.join(ROOT, exchange, "__fixtures__");
    await mkdir(dir, { recursive: true });
    for (const [name, payload] of Object.entries(fixtures)) {
      await writeFile(path.join(dir, `${name}.json`), `${JSON.stringify(payload, null, 2)}\n`);
    }
    console.log(`recorded ${exchange}: ${Object.keys(fixtures).join(", ")}`);
  } catch (error) {
    console.warn(`skipped ${exchange}: ${(error as Error).message}`);
  }
}
