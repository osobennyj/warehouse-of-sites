import type { ExchangeId } from "@/shared/api";

export interface ExchangeMeta {
  id: ExchangeId;
  label: string;
  /** Default taker fee (decimal) for the net-yield calculator. */
  defaultTakerFee: number;
  accentClass: string;
}

export const EXCHANGE_CATALOG: Record<ExchangeId, ExchangeMeta> = {
  binance: { id: "binance", label: "Binance", defaultTakerFee: 0.0005, accentClass: "text-amber-300" },
  bybit: { id: "bybit", label: "Bybit", defaultTakerFee: 0.00055, accentClass: "text-orange-300" },
  okx: { id: "okx", label: "OKX", defaultTakerFee: 0.0005, accentClass: "text-slate-200" },
  hyperliquid: { id: "hyperliquid", label: "Hyperliquid", defaultTakerFee: 0.00035, accentClass: "text-emerald-300" },
};

export const exchangeLabel = (id: ExchangeId) => EXCHANGE_CATALOG[id].label;