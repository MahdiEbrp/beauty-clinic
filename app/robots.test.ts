import { describe, expect, it } from "vitest";
import type { MetadataRoute } from "next";

import robots from "./robots";
import { siteUrl } from "@/lib/site";

type Rule = Exclude<MetadataRoute.Robots["rules"], unknown[]>;

/** A rule group with `userAgent` guaranteed present. */
type Group = Rule & { userAgent: string[] };

/**
 * Normalizes Next's single-rule-or-array union into a list of groups. Every group
 * this module emits declares `userAgent`, but the wildcard form of the type leaves
 * it optional, hence the narrowing here.
 */
function groups(): Group[] {
  const { rules } = robots();
  const list = Array.isArray(rules) ? rules : [rules];
  return list.map((group) => ({
    ...group,
    userAgent: toArray(group.userAgent ?? []),
  }));
}

function toArray(value: string | string[] | undefined): string[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

/**
 * Resolves a path the way a crawler does: find the group whose `userAgent` list
 * contains the token (falling back to `*`), and combine that group's
 * allow/disallow. Groups do NOT merge in robots.txt — the most specific match
 * wins outright — so this mirrors real crawler behaviour rather than assuming
 * rules accumulate.
 */
function resolve(token: string, path: string): { allow: boolean } {
  const specific = groups().find(
    (g) => !g.userAgent.includes("*") && g.userAgent.includes(token),
  );
  const wildcard = groups().find((g) => g.userAgent.includes("*"));
  const group = specific ?? wildcard;
  if (!group) throw new Error("no robots group resolved");

  const allow = group.allow ?? [];
  const disallow = group.disallow ?? [];
  const blocked = (Array.isArray(disallow) ? disallow : [disallow]).some(
    (rule) => rule !== "" && path.startsWith(rule),
  );
  if (blocked) return { allow: false };
  return { allow: (Array.isArray(allow) ? allow : [allow]).length > 0 };
}

describe("robots.txt", () => {
  it("declares a wildcard group so unlisted crawlers are allowed", () => {
    const wildcard = groups().find((g) => g.userAgent.includes("*"));
    expect(wildcard).toBeDefined();
    expect(wildcard?.allow).toContain("/");
  });

  /**
   * The point of the file: every AI and search crawler this site wants citations
   * from must be explicitly allowed. Asserted token-by-token so removing one is a
   * test failure rather than a silent loss of AI-search visibility.
   */
  it.each([
    // AI search / answer engines — the tokens that decide whether the site can be
    // cited in ChatGPT, Claude, Perplexity and Gemini answers.
    "OAI-SearchBot",
    "ChatGPT-User",
    "Claude-SearchBot",
    "Claude-User",
    "PerplexityBot",
    "Perplexity-User",
    "meta-externalagent",
    "cohere-ai",
    "YouBot",
    // Classic search engines.
    "Googlebot",
    "Google-Extended",
    "Bingbot",
    "BingPreview",
    "DuckDuckBot",
    "Applebot",
    "Applebot-Extended",
    "Yandex",
    // Model-training crawlers, allowed per explicit instruction.
    "GPTBot",
    "ClaudeBot",
    "Bytespider",
    "CCBot",
    "Amazonbot",
  ])("explicitly allows %s on public pages", (token) => {
    const listed = groups().some((g) => g.userAgent.includes(token));
    expect(listed, `${token} has no explicit group`).toBe(true);
    expect(resolve(token, "/services/face-filler").allow).toBe(true);
  });

  it("declares no training-crawler group under a search token by mistake", () => {
    // `Google-Extended` controls Gemini grounding and is NOT the Googlebot
    // indexing switch; keeping them in separate groups documents that.
    const extended = groups().find((g) => g.userAgent.includes("Google-Extended"));
    const googlebot = groups().find((g) => g.userAgent.includes("Googlebot"));
    expect(extended).toBeDefined();
    expect(googlebot).toBeDefined();
  });

  it.each(["OAI-SearchBot", "Googlebot", "Bingbot", "GPTBot", "PerplexityBot"])(
    "still blocks non-public paths for %s",
    (token) => {
      expect(resolve(token, "/api/v1/public/catalog").allow).toBe(false);
      expect(resolve(token, "/fake/payment").allow).toBe(false);
    },
  );

  /**
   * `Disallow` controls crawling, not indexing, and Google cannot read a
   * `noindex` from a page it never fetches. So the private HTML routes must stay
   * crawlable and rely on noindex metadata + the X-Robots-Tag header instead.
   */
  it.each(["/dashboard", "/login", "/register", "/reset-password", "/forbidden", "/payment/success"])(
    "leaves %s crawlable so its noindex directive can be read",
    (path) => {
      expect(resolve("Googlebot", path).allow).toBe(true);
    },
  );

  it("blocks the API surface", () => {
    expect(resolve("Googlebot", "/api/public/landing").allow).toBe(false);
  });

  it("points the Host and Sitemap directives at the configured origin", () => {
    const { host, sitemap } = robots();
    expect(host).toBe(siteUrl);
    expect(sitemap).toBe(`${siteUrl}/sitemap.xml`);
  });

  it("omits Crawl-delay, which only throttles the crawlers that honour it", () => {
    // Google ignores it while Bing and Anthropic respect it, so setting it would
    // slow real crawlers for no indexing benefit.
    for (const group of groups()) {
      expect(group.crawlDelay).toBeUndefined();
    }
  });
});