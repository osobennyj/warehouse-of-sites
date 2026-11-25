import { z } from "zod";

const envSchema = z.object({
  binanceApiUrl: z.url(),
  bybitApiUrl: z.url(),
  okxApiUrl: z.url(),
  hyperliquidInfoUrl: z.url(),
  repositoryUrl: z.url(),
});

export type AppEnv = z.infer<typeof envSchema>;

// NEXT_PUBLIC_* values are inlined at build time, so each one must be referenced explicitly.
export const env: AppEnv = envSchema.parse({
  binanceApiUrl: process.env.NEXT_PUBLIC_BINANCE_API_URL || "https://www.binance.com",
  bybitApiUrl: process.env.NEXT_PUBLIC_BYBIT_API_URL || "https://api.bybit.com",
  okxApiUrl: process.env.NEXT_PUBLIC_OKX_API_URL || "https://www.okx.com",
  hyperliquidInfoUrl: process.env.NEXT_PUBLIC_HYPERLIQUID_INFO_URL || "https://api.hyperliquid.xyz/info",
  repositoryUrl: process.env.NEXT_PUBLIC_REPOSITORY_URL || "https://github.com/osobennyj/funding-rate-radar",
});
