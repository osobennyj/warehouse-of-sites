import { loadEnv } from "@/server/config/env";
import { createCoinGecko } from "./coingecko/coingecko";
import { createDefiLlama } from "./defillama/defillama";
import { createEthplorer } from "./ethplorer/ethplorer";
import { createFetchHttpClient, withTtlCache } from "./http/http-client";
import { createRssNews } from "./news/rss-news";
import { createSeedUnlocks } from "./unlocks/seed-schedules";
import type { DataSources } from "./types";

export function createDataSources(env = loadEnv()): DataSources {
  const http = withTtlCache(createFetchHttpClient(), 60_000);
  const coingecko = createCoinGecko({ http, apiKey: env.COINGECKO_API_KEY });
  return {
    tokens: coingecko,
    market: coingecko,
    protocol: createDefiLlama({ http }),
    unlocks: createSeedUnlocks(),
    holders: createEthplorer({ http, apiKey: env.ETHPLORER_API_KEY }),
    news: createRssNews({ http }),
  };
}