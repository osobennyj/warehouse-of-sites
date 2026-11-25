import type { HttpClient } from "../http";
import { createBinanceSource } from "./binance/binance-source";
import { createBybitSource } from "./bybit/bybit-source";
import { createHyperliquidSource } from "./hyperliquid/hyperliquid-source";
import { createOkxSource } from "./okx/okx-source";
import type { ExchangeFundingSource, ExchangeId } from "./types";

export interface ExchangeEndpoints {
  binanceApiUrl: string;
  bybitApiUrl: string;
  okxApiUrl: string;
  hyperliquidInfoUrl: string;
}

export type ExchangeSources = Readonly<Record<ExchangeId, ExchangeFundingSource>>;

export function createExchangeSources(http: HttpClient, endpoints: ExchangeEndpoints): ExchangeSources {
  return {
    binance: createBinanceSource(http, endpoints.binanceApiUrl),
    bybit: createBybitSource(http, endpoints.bybitApiUrl),
    okx: createOkxSource(http, endpoints.okxApiUrl),
    hyperliquid: createHyperliquidSource(http, endpoints.hyperliquidInfoUrl),
  };
}
