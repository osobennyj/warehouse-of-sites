import { z } from "zod";
import type { HttpClient } from "../http/http-client";
import type { HolderDataSource } from "../types";

const TopHoldersSchema = z.object({
  holders: z.array(z.object({ address: z.string(), share: z.number() })),
});

/** Top holders of Ethereum ERC-20 tokens via Ethplorer (works with the public `freekey`). */
export function createEthplorer({
  http,
  apiKey = "freekey",
  baseUrl = "https://api.ethplorer.io",
}: {
  http: HttpClient;
  apiKey?: string;
  baseUrl?: string;
}): HolderDataSource {
  return {
    async getTopHolders(token, limit) {
      const contract = token.contracts.ethereum?.toLowerCase();
      if (!contract) return null;
      const url = `${baseUrl}/getTopTokenHolders/${contract}?apiKey=${apiKey}&limit=${limit}`;
      const { holders } = await http.getJson(url, TopHoldersSchema);
      return {
        sourceUrl: `https://ethplorer.io/address/${contract}#tab=tab-holders`,
        chain: "Ethereum",
        contract,
        holders: holders.map((h) => ({ address: h.address, sharePct: h.share })),
      };
    },
  };
}
