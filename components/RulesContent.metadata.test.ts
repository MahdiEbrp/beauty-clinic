import { beforeEach, describe, expect, it, vi } from "vitest";

const getRulesForPublic = vi.fn();

vi.mock("@/lib/services/rules-admin", () => ({ getRulesForPublic }));
// The component renders cards/icons; only the exported metadata is under test.
vi.mock("@/components/RuleCard", () => ({ default: () => null }));

vi.mock("next-intl/server", () => ({
  getTranslations: () =>
    Promise.resolve((key: string) => `rules:${key}`),
}));

const { generateMetadata } = await import("./RulesContent");

beforeEach(() => {
  getRulesForPublic.mockReset();
});

describe("RulesContent.generateMetadata", () => {
  /**
   * Regression guard. This block used to be built as
   * `${siteUrl}/${locale}/rules`, so for the default locale it emitted a
   * self-canonical pointing at `/fa/rules`. Under `localePrefix: "as-needed"`
   * `/fa/*` permanently redirects to the unprefixed path, so the page was
   * canonicalising itself to a 301 — the exact signal that tells a crawler the
   * page has moved. The fa hreflang entry had the same defect.
   */
  it("never emits the /fa-prefixed path that redirects to the root", async () => {
    const meta = await generateMetadata({
      params: Promise.resolve({ locale: "fa" }),
    });

    expect(meta.alternates?.canonical).toBe("https://example.com/rules");
    expect(meta.alternates?.languages?.fa).toBe("https://example.com/rules");
    expect(JSON.stringify(meta.alternates)).not.toContain("/fa/rules");
  });

  it("prefixes non-default locales", async () => {
    const meta = await generateMetadata({
      params: Promise.resolve({ locale: "en" }),
    });

    expect(meta.alternates?.canonical).toBe("https://example.com/en/rules");
    expect(meta.alternates?.languages?.en).toBe("https://example.com/en/rules");
  });

  it("declares x-default pointing at the unprefixed default locale", async () => {
    const meta = await generateMetadata({
      params: Promise.resolve({ locale: "en" }),
    });

    expect(meta.alternates?.languages?.["x-default"]).toBe(
      "https://example.com/rules",
    );
  });

  it("carries translated title and description", async () => {
    const meta = await generateMetadata({
      params: Promise.resolve({ locale: "fa" }),
    });

    expect(meta.title).toBe("rules:meta.title");
    expect(meta.description).toBe("rules:meta.description");
  });

  /**
   * The rules page is a public, crawlable page and deliberately omits a `robots`
   * key so it inherits `index: true` from app/[locale]/layout.tsx. Asserted as
   * "absent, not false" so a future `index: false` cannot slip in unnoticed.
   */
  it("does not opt out of indexing", async () => {
    const meta = await generateMetadata({
      params: Promise.resolve({ locale: "fa" }),
    });

    expect(meta.robots).toBeUndefined();
  });
});