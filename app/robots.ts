import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

/**
 * Paths that must never be crawled or indexed.
 *
 * Deliberately limited to non-HTML and dev-only surfaces. Private pages
 * (`/dashboard`, `/login`, `/register`, `/reset-password`, `/forbidden`,
 * `/payment/*`) are intentionally *not* listed here: Google honours
 * `Disallow` for crawling but not for indexing, and it cannot read a `noindex`
 * on a page it never fetches. Those routes therefore stay crawlable and carry
 * `robots: { index: false }` in their metadata plus an `X-Robots-Tag` header
 * (see next.config.js), which is the combination Google actually respects.
 */
const DISALLOWED = ["/api/", "/fake/"];

/**
 * Crawler tokens grouped by what they do.
 *
 * Every token is explicitly allowed. `User-agent: * / Allow: /` would already
 * permit them all, so these groups are about intent and insurance against a
 * future `*` rule being narrowed — but note the trap they create: robots.txt
 * groups do NOT merge. The most specific matching group wins outright, so a
 * token listed here with a bare `Allow: /` would silently lose `DISALLOWED`.
 * That is why every group is generated from the same disallow list.
 */
const SEARCH_ENGINES = [
  "Googlebot",
  "Google-Extended",
  "Bingbot",
  "BingPreview",
  "DuckDuckBot",
  "Applebot",
  "Applebot-Extended",
  "Yandex",
  "Yahoo",
  "Baiduspider",
  "NaverBot",
  "SeznamBot",
  "PetalBot",
];

/**
 * Answer engines and AI search. These are the tokens that decide whether the
 * site can be cited in AI answers, and they are the ones most often blocked by
 * over-eager hardening, so they are listed explicitly and first.
 *
 * `Claude-User`, `ChatGPT-User` and `Perplexity-User` are user-triggered
 * fetches rather than crawls: their operators state that robots.txt generally
 * does not apply, but allowing them costs nothing and avoids relying on that.
 */
const AI_SEARCH_AND_ANSWER = [
  "OAI-SearchBot",
  "ChatGPT-User",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "meta-externalagent",
  "cohere-ai",
  "YouBot",
];

/**
 * Model-training crawlers, allowed per explicit instruction.
 *
 * This is the one group with a real trade-off: allowing it means the site's
 * copy may be used to train third-party models. Nothing on the site depends on
 * that crawl for discovery — ChatGPT, Claude and Gemini search results come
 * from the *_SearchBot / OAI-SearchBot tokens above — so this group can be
 * removed on its own at any time without affecting AI visibility.
 *
 * `meta-externalagent` is intentionally absent here rather than duplicated:
 * Meta's crawler changed name from FacebookBot and user-agent matching is
 * case-insensitive (RFC 9309), so a second spelling would be dead weight.
 */
const AI_TRAINING = [
  "GPTBot",
  "ClaudeBot",
  "Bytespider",
  "CCBot",
  "Amazonbot",
  "Diffbot",
  "Timpibot",
  "omgili",
  "omgilibot",
];

/** Ad landing-page validators (ChatGPT ads). */
const ADS = ["OAI-AdsBot", "AdsBot-Google", "AdsBot-Bing", "Amazonbot-ads"];

const ALLOWED_GROUPS: string[][] = [
  AI_SEARCH_AND_ANSWER,
  SEARCH_ENGINES,
  AI_TRAINING,
  ADS,
];

/**
 * No `Crawl-delay` is emitted on purpose. Google ignores it outright, while
 * Bing and Anthropic honour it — so setting it would slow the two crawlers it
 * can actually throttle in exchange for nothing. If the origin ever comes under
 * crawl pressure, add it here rather than throttling at the network edge.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOWED },
      ...ALLOWED_GROUPS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: DISALLOWED,
      })),
    ],
    host: siteUrl,
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}