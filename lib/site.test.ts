import { afterEach, describe, expect, it, vi } from "vitest";

import {
  buildAlternates,
  canonicalUrl,
  dirForLocale,
  hreflangLanguages,
  localePath,
  localizedHref,
  pageUrl,
  siteUrl,
} from "./site";

describe("siteUrl", () => {
  it("reads NEXT_PUBLIC_SITE_URL without a trailing slash", () => {
    // eslint-disable-next-line no-secrets/no-secrets -- test comment mentioning env var
    // vitest.config.mts sets NEXT_PUBLIC_SITE_URL=https://example.com
    expect(siteUrl).toBe("https://example.com");
  });

  it("strips trailing slashes from the configured URL", async () => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.com/");
    const fresh = await import("./site");
    expect(fresh.siteUrl).toBe("https://example.com");
  });

  it("falls back to localhost when unset outside production", async () => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    const fresh = await import("./site");
    expect(fresh.siteUrl).toBe("http://localhost:3000");
  });

  it("refuses to boot in production without a configured origin", async () => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("NODE_ENV", "production");
    // A wrong canonical origin is unrecoverable SEO damage (Google indexes the
    // origin named in the canonical, not the origin being served), so this must
    // fail the deploy rather than silently emit a preview URL.
    await expect(import("./site")).rejects.toThrow(/NEXT_PUBLIC_SITE_URL/);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });
});

describe("localePath", () => {
  it("serves the default locale (fa) at the root", () => {
    expect(localePath("fa")).toBe("/");
  });

  it("prefixes non-default locales", () => {
    expect(localePath("en")).toBe("/en");
  });
});

describe("canonicalUrl", () => {
  it("returns the root URL for the default locale", () => {
    expect(canonicalUrl("fa")).toBe("https://example.com/");
  });

  it("prefixes the locale path for non-default locales", () => {
    expect(canonicalUrl("en")).toBe("https://example.com/en");
  });
});

describe("dirForLocale", () => {
  it("maps fa to rtl", () => {
    expect(dirForLocale("fa")).toBe("rtl");
  });

  it("maps everything else to ltr", () => {
    expect(dirForLocale("en")).toBe("ltr");
  });
});

describe("localizedHref", () => {
  it("leaves default-locale paths unprefixed", () => {
    expect(localizedHref("fa", "/pricing")).toBe("/pricing");
  });

  it("prefixes non-default-locale paths", () => {
    expect(localizedHref("en", "/pricing")).toBe("/en/pricing");
  });

  it("maps the home path to the locale root", () => {
    expect(localizedHref("fa", "/")).toBe("/");
    expect(localizedHref("en", "/")).toBe("/en");
  });

  it("adds a leading slash when missing", () => {
    expect(localizedHref("en", "pricing")).toBe("/en/pricing");
    expect(localizedHref("fa", "pricing")).toBe("/pricing");
  });
});

describe("pageUrl", () => {
  it("never emits the /fa prefix, which permanently redirects to /", () => {
    expect(pageUrl("fa", "/rules")).toBe("https://example.com/rules");
    expect(pageUrl("fa", "/")).toBe("https://example.com/");
  });

  it("prefixes non-default locales", () => {
    expect(pageUrl("en", "/rules")).toBe("https://example.com/en/rules");
  });
});

describe("buildAlternates", () => {
  it("self-references the canonical to the requested locale", () => {
    const { canonical } = buildAlternates("en", "/rules");
    expect(canonical).toBe("https://example.com/en/rules");
  });

  it("resolves the fa alternate to the unprefixed root, not /fa/rules", () => {
    // Regression guard: the hand-rolled version of this block emitted
    // `${siteUrl}/${locale}/rules`, so the fa self-canonical pointed at a 301.
    const { canonical, languages } = buildAlternates("fa", "/rules");
    expect(canonical).toBe("https://example.com/rules");
    expect(languages.fa).toBe("https://example.com/rules");
  });

  it("covers every locale plus x-default", () => {
    const { languages } = buildAlternates("fa", "/pricing");
    expect(Object.keys(languages).sort()).toEqual(["en", "fa", "x-default"]);
    expect(languages["x-default"]).toBe("https://example.com/pricing");
  });
});

describe("hreflangLanguages", () => {
  it("returns the same cluster as buildAlternates for one path", () => {
    expect(hreflangLanguages("/care")).toEqual(buildAlternates("fa", "/care").languages);
  });
});
