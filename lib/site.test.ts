import { afterEach, describe, expect, it, vi } from "vitest";

import {
  canonicalUrl,
  dirForLocale,
  localePath,
  localizedHref,
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

  it("falls back to the production URL when unset", async () => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    const fresh = await import("./site");
    expect(fresh.siteUrl).toBe("https://beauty-clinic-puce-five.vercel.app");
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
