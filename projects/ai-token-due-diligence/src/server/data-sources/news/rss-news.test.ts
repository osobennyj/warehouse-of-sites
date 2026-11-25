import { describe, expect, it } from "vitest";
import { buildMentionMatcher, parseRss } from "./rss-news";

const sample = `<?xml version="1.0"?><rss><channel>
<item><title>Arbitrum launches upgrade</title><link>https://example.com/a</link><pubDate>Wed, 25 Nov 2026 10:00:00 GMT</pubDate></item>
</channel></rss>`;

describe("rss news", () => {
  it("parses items", () => {
    const items = parseRss(sample, "Test");
    expect(items).toHaveLength(1);
    expect(items[0]?.title).toContain("Arbitrum");
  });

  it("matches token mentions", () => {
    const matcher = buildMentionMatcher({
      id: "arbitrum",
      symbol: "ARB",
      name: "Arbitrum",
      imageUrl: null,
      homepage: null,
      categories: [],
      contracts: {},
    });
    expect(matcher("Arbitrum launches")).toBe(true);
    expect(matcher("Random headline")).toBe(false);
  });
});