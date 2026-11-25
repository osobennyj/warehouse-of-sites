import type { TokenRef } from "@/entities/report";
import type { HttpClient } from "../http/http-client";
import type { NewsArticle, NewsSource } from "../types";

export const DEFAULT_FEEDS = [
  { outlet: "Cointelegraph", url: "https://cointelegraph.com/rss" },
  { outlet: "Decrypt", url: "https://decrypt.co/feed" },
] as const;

interface Feed {
  outlet: string;
  url: string;
}

/** Keyless news source: filters public RSS feeds for headlines mentioning the token. */
export function createRssNews({
  http,
  feeds = DEFAULT_FEEDS,
}: {
  http: HttpClient;
  feeds?: readonly Feed[];
}): NewsSource {
  return {
    async getRecentNews(token, limit) {
      const results = await Promise.allSettled(
        feeds.map(async (feed) => parseRss(await http.getText(feed.url), feed.outlet)),
      );
      const articles = results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
      const mentions = buildMentionMatcher(token);
      const unique = new Map(articles.filter((a) => mentions(a.title)).map((a) => [a.url, a]));
      return [...unique.values()]
        .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
        .slice(0, limit);
    },
  };
}

export function parseRss(xml: string, outlet: string): NewsArticle[] {
  const items = xml.match(/<item\b[\s\S]*?<\/item>/g) ?? [];
  return items.flatMap((item) => {
    const title = readTag(item, "title");
    const url = readTag(item, "link");
    const date = new Date(readTag(item, "pubDate") ?? "");
    if (!title || !url?.startsWith("http") || Number.isNaN(date.getTime())) return [];
    return [{ title, url, outlet, publishedAt: date.toISOString() }];
  });
}

export function buildMentionMatcher(token: TokenRef): (text: string) => boolean {
  const name = token.name.replace(/\s+(dao|finance|protocol|network|token)$/i, "");
  const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const nameRe = new RegExp(`\\b${escape(name)}\\b`, "i");
  const symbolRe = token.symbol.length >= 3 ? new RegExp(`\\b${escape(token.symbol)}\\b`) : null;
  return (text) => nameRe.test(text) || Boolean(symbolRe?.test(text));
}

function readTag(xml: string, tag: string): string | null {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  if (!match?.[1]) return null;
  return decodeEntities(match[1].replace(/^<!\[CDATA\[|\]\]>$/g, "").trim());
}

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
};

const decodeEntities = (text: string) =>
  text
    .replace(/&(amp|lt|gt|quot|#39|apos);/g, (entity) => ENTITIES[entity] ?? entity)
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)));
