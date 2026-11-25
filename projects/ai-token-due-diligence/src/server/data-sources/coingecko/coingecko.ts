import { z } from "zod";
import type { TokenRef } from "@/entities/report";
import type { HttpClient } from "../http/http-client";
import { HttpError } from "../http/http-client";
import {
  TokenNotFoundError,
  type MarketDataSource,
  type MarketSnapshot,
  type TokenResolver,
} from "../types";

const usd = z.object({ usd: z.number().nullable().optional() }).partial();
const num = z.number().nullable().optional();

const CoinSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  name: z.string(),
  categories: z.array(z.string().nullable()).nullable().optional(),
  platforms: z.record(z.string(), z.string().nullable()).nullable().optional(),
  image: z.object({ large: z.string().optional() }).nullable().optional(),
  links: z.object({ homepage: z.array(z.string()).optional() }).nullable().optional(),
  market_cap_rank: z.number().nullable().optional(),
  market_data: z
    .object({
      current_price: usd,
      market_cap: usd,
      fully_diluted_valuation: usd,
      total_volume: usd,
      ath: usd,
      ath_change_percentage: usd,
      price_change_percentage_24h: num,
      price_change_percentage_30d: num,
      price_change_percentage_1y: num,
      circulating_supply: num,
      total_supply: num,
      max_supply: num,
    })
    .optional(),
});
type Coin = z.infer<typeof CoinSchema>;

const SearchSchema = z.object({
  coins: z.array(
    z.object({
      id: z.string(),
      symbol: z.string(),
      name: z.string(),
      market_cap_rank: z.number().nullable().optional(),
    }),
  ),
});

const EVM_ADDRESS = /^0x[a-fA-F0-9]{40}$/;
const COIN_QUERY =
  "localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false";

interface CoinGeckoOptions {
  http: HttpClient;
  apiKey?: string;
  baseUrl?: string;
}

export function createCoinGecko({
  http,
  apiKey,
  baseUrl = "https://api.coingecko.com/api/v3",
}: CoinGeckoOptions): TokenResolver & MarketDataSource {
  const headers = apiKey ? { "x-cg-demo-api-key": apiKey } : undefined;
  const coinUrl = (id: string) => `${baseUrl}/coins/${encodeURIComponent(id)}?${COIN_QUERY}`;
  const getCoin = (url: string) => http.getJson(url, CoinSchema, { headers });

  const findCoinId = async (query: string): Promise<string> => {
    if (/^[a-z0-9-]+$/i.test(query)) {
      try {
        await getCoin(coinUrl(query.toLowerCase()));
        return query.toLowerCase();
      } catch (error) {
        if (!(error instanceof HttpError) || error.status !== 404) throw error;
      }
    }
    const url = `${baseUrl}/search?query=${encodeURIComponent(query)}`;
    const { coins } = await http.getJson(url, SearchSchema, { headers });
    const needle = query.toLowerCase();
    const exact = coins.filter(
      (c) => c.id === needle || c.symbol.toLowerCase() === needle || c.name.toLowerCase() === needle,
    );
    const byRank = (exact.length ? exact : coins.slice(0, 1)).sort(
      (a, b) => (a.market_cap_rank ?? Infinity) - (b.market_cap_rank ?? Infinity),
    );
    const best = byRank[0];
    if (!best) throw new TokenNotFoundError(query);
    return best.id;
  };

  return {
    async resolve(rawQuery) {
      const query = rawQuery.trim();
      try {
        const coin = EVM_ADDRESS.test(query)
          ? await getCoin(`${baseUrl}/coins/ethereum/contract/${query.toLowerCase()}`)
          : await getCoin(coinUrl(await findCoinId(query)));
        return toTokenRef(coin);
      } catch (error) {
        if (error instanceof HttpError && error.status === 404) throw new TokenNotFoundError(query);
        throw error;
      }
    },

    async getMarketData(tokenId) {
      const coin = await getCoin(coinUrl(tokenId));
      return toMarketSnapshot(coin, `https://www.coingecko.com/en/coins/${coin.id}`);
    },
  };
}

function toTokenRef(coin: Coin): TokenRef {
  const contracts = Object.fromEntries(
    Object.entries(coin.platforms ?? {}).filter(
      (entry): entry is [string, string] => Boolean(entry[0]) && Boolean(entry[1]),
    ),
  );
  const homepage = coin.links?.homepage?.find((link) => link.startsWith("http")) ?? null;
  return {
    id: coin.id,
    symbol: coin.symbol.toUpperCase(),
    name: coin.name,
    imageUrl: coin.image?.large?.startsWith("http") ? coin.image.large : null,
    homepage,
    categories: (coin.categories ?? []).filter((c): c is string => Boolean(c)).slice(0, 6),
    contracts,
  };
}

function toMarketSnapshot(coin: Coin, sourceUrl: string): MarketSnapshot {
  const m = coin.market_data;
  const price = m?.current_price?.usd;
  if (!m || price == null) throw new Error(`CoinGecko has no market data for ${coin.id}`);
  const positive = (value: number | null | undefined) => (value && value > 0 ? value : null);
  return {
    sourceUrl,
    priceUsd: price,
    marketCapUsd: positive(m.market_cap?.usd),
    fdvUsd: positive(m.fully_diluted_valuation?.usd),
    volume24hUsd: m.total_volume?.usd ?? null,
    marketCapRank: coin.market_cap_rank ?? null,
    circulatingSupply: positive(m.circulating_supply),
    totalSupply: positive(m.total_supply),
    maxSupply: positive(m.max_supply),
    athUsd: m.ath?.usd ?? null,
    athChangePct: m.ath_change_percentage?.usd ?? null,
    priceChange24hPct: m.price_change_percentage_24h ?? null,
    priceChange30dPct: m.price_change_percentage_30d ?? null,
    priceChange1yPct: m.price_change_percentage_1y ?? null,
  };
}
