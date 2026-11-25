import type { AgentEventListener } from "@/entities/report";
import type { TokenRef } from "@/entities/report";
import {
  compileFacts,
  type ResearchBundle,
} from "@/entities/report/model/compile-facts";
import type { DataSources } from "@/server/data-sources/types";
import type { ToolName } from "@/entities/report";

export async function runResearch(
  token: TokenRef,
  sources: DataSources,
  onEvent?: AgentEventListener,
) {
  const emitTool = async <T>(
    tool: ToolName,
    summary: string,
    load: () => Promise<T>,
  ): Promise<T | null> => {
    const started = Date.now();
    onEvent?.({ type: "tool-start", tool });
    try {
      const value = await load();
      onEvent?.({
        type: "tool-end",
        tool,
        ok: true,
        durationMs: Date.now() - started,
        summary,
      });
      return value;
    } catch {
      onEvent?.({
        type: "tool-end",
        tool,
        ok: false,
        durationMs: Date.now() - started,
        summary: `${summary} — skipped`,
      });
      return null;
    }
  };

  onEvent?.({
    type: "stage",
    stage: "researching",
    message: `Gathering on-chain and market data for ${token.symbol}…`,
  });

  const [market, protocol, unlockSchedule, holders, news] = await Promise.all([
    emitTool("getMarketData", "CoinGecko market data", () =>
      sources.market.getMarketData(token.id),
    ),
    emitTool("getProtocolMetrics", "DefiLlama protocol metrics", () =>
      sources.protocol.getProtocolMetrics(token),
    ),
    emitTool("getTokenUnlocks", "Vesting schedule seed", () =>
      sources.unlocks.getSchedule(token.id),
    ),
    emitTool("getHolderConcentration", "Top token holders", () =>
      sources.holders.getTopHolders(token, 10),
    ),
    emitTool("getRecentNews", "Recent headlines", () => sources.news.getRecentNews(token, 5)),
  ]);

  if (!market) {
    throw new Error(`Market data is required to produce a report for ${token.symbol}`);
  }

  const bundle: ResearchBundle = {
    market,
    protocol,
    unlockSchedule,
    holders,
    news: news ?? [],
  };

  onEvent?.({ type: "stage", stage: "scoring", message: "Computing risk score…" });
  return compileFacts(token, bundle);
}