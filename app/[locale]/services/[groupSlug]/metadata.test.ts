import { readFileSync } from "node:fs";
import { IntlMessageFormat } from "intl-messageformat";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getGroupPage = vi.fn();
const getCategoryPage = vi.fn();

vi.mock("@/lib/services/group-page", () => ({ getGroupPage }));
vi.mock("@/lib/services/category-page", () => ({ getCategoryPage }));

// The page modules import their view components, which pull next-intl's ESM
// navigation build — not loadable outside the Next runtime. Only
// `generateMetadata` is under test here, so the components are stubbed out.
vi.mock("@/components/group-page/GroupPage", () => ({ default: () => null }));
vi.mock("@/components/category-page/CategoryPage", () => ({ default: () => null }));

/**
 * Real messages resolved from the shipped JSON, formatted with the same ICU
 * engine next-intl uses. Testing against the real catalog and a real plural
 * implementation is what makes these assertions meaningful — a hand-written
 * stub would pass regardless of whether the pages do the right thing.
 */
const catalog = JSON.parse(
  readFileSync(new URL("../../../../messages/fa.json", import.meta.url), "utf8"),
) as Record<string, unknown>;

type Params = Record<string, string | number>;

function lookup(namespace: string, key: string): string {
  let node: unknown = catalog;
  for (const part of `${namespace}.${key}`.split(".")) {
    node = (node as Record<string, unknown>)?.[part];
  }
  if (typeof node !== "string") throw new Error(`missing message ${namespace}.${key}`);
  return node;
}

// The pages `await` this; returning a resolved promise keeps the mock faithful
// to next-intl's async signature.
vi.mock("next-intl/server", () => ({
  getTranslations: ({ namespace }: { namespace: string }) =>
    Promise.resolve((key: string, params?: Params) =>
      new IntlMessageFormat(lookup(namespace, key), "fa").format(params ?? {}),
    ),
}));

const { generateMetadata: groupMetadata } = await import("./page");
const { generateMetadata: categoryMetadata } = await import(
  "./[categorySlug]/page"
);

/** Minimal view-model shaped like the real `GroupPageData`. */
function groupData(overrides: Record<string, unknown> = {}) {
  return {
    currency: "تومان",
    group: {
      slug: "face-filler",
      icon: null,
      title: "فیلر صورت",
      description: "توضیح گروه",
      seoTitle: null,
      seoDescription: null,
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      ...overrides,
    },
    categories: [{ slug: "c1", title: "c1", serviceCount: 3 }],
    featured: [],
    faqs: [],
  };
}

function categoryData(overrides: Record<string, unknown> = {}) {
  return {
    currency: "تومان",
    category: {
      slug: "face-filler-cheek",
      icon: null,
      title: "ناحیه گونه",
      description: "توضیح دسته",
      seoTitle: null,
      seoDescription: null,
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      services: [],
      ...overrides,
    },
    group: { slug: "face-filler", icon: null, title: "فیلر صورت", description: null },
    siblings: [],
  };
}

beforeEach(() => {
  getGroupPage.mockReset();
  getCategoryPage.mockReset();
});

describe("group page metadata", () => {
  it("prefers the hand-authored seoTitle over a generated pattern", async () => {
    getGroupPage.mockResolvedValue(
      groupData({ seoTitle: "فیلر صورت در تهران | قیمت و نوبت" }),
    );
    const meta = await groupMetadata({
      params: Promise.resolve({ locale: "fa", groupSlug: "face-filler" }),
    });
    expect(meta.title).toBe("فیلر صورت در تهران | قیمت و نوبت");
  });

  it("prefers the hand-authored seoDescription", async () => {
    getGroupPage.mockResolvedValue(
      groupData({ seoDescription: "قیمت و توضیحات کامل فیلر صورت." }),
    );
    const meta = (await groupMetadata({
      params: Promise.resolve({ locale: "fa", groupSlug: "face-filler" }),
    }));
    expect(meta.description).toBe("قیمت و توضیحات کامل فیلر صورت.");
  });

  it("falls back to the entity description, then the localized count sentence", async () => {
    getGroupPage.mockResolvedValue(groupData());
    const withDesc = (await groupMetadata({
      params: Promise.resolve({ locale: "fa", groupSlug: "face-filler" }),
    }));
    expect(withDesc.description).toBe("توضیح گروه");

    getGroupPage.mockResolvedValue(groupData({ description: null }));
    const fallback = (await groupMetadata({
      params: Promise.resolve({ locale: "en", groupSlug: "face-filler" }),
    }));
    // Must be a translated sentence with a correctly pluralised, Persian-digit
    // count — never the previous hardcoded English `${count} category/categories`.
    expect(fallback.description).toBe("فیلر صورت — ۱ دسته‌بندی");
  });

  it("never emits a /fa-prefixed canonical or hreflang alternate", async () => {
    getGroupPage.mockResolvedValue(groupData());
    const meta = (await groupMetadata({
      params: Promise.resolve({ locale: "fa", groupSlug: "face-filler" }),
    }));
    expect(meta.alternates?.canonical).toBe(
      "https://example.com/services/face-filler",
    );
    expect(meta.alternates?.languages?.fa).toBe(
      "https://example.com/services/face-filler",
    );
    expect(meta.alternates?.languages?.["x-default"]).toBe(
      "https://example.com/services/face-filler",
    );
  });

  it("refuses to index an unknown slug instead of inheriting the layout metadata", async () => {
    getGroupPage.mockResolvedValue(null);
    const meta = (await groupMetadata({
      params: Promise.resolve({ locale: "fa", groupSlug: "does-not-exist" }),
    }));
    // The old `return {}` made these URLs advertise the homepage's title and
    // canonical while responding 200.
    expect(meta.robots).toMatchObject({ index: false, follow: false });
    expect(meta.alternates).toBeUndefined();
    expect(meta.title).toBeUndefined();
  });
});

describe("category page metadata", () => {
  it("prefers the hand-authored seo copy", async () => {
    getCategoryPage.mockResolvedValue(
      categoryData({
        seoTitle: "فیلر گونه | قیمت",
        seoDescription: "هزینه فیلر گونه در کلینیک نفس.",
      }),
    );
    const meta = (await categoryMetadata({
      params: Promise.resolve({
        locale: "fa",
        groupSlug: "face-filler",
        categorySlug: "face-filler-cheek",
      }),
    }));
    expect(meta.title).toBe("فیلر گونه | قیمت");
    expect(meta.description).toBe("هزینه فیلر گونه در کلینیک نفس.");
  });

  it("builds the full three-segment path for canonical and hreflang", async () => {
    getCategoryPage.mockResolvedValue(categoryData());
    const meta = (await categoryMetadata({
      params: Promise.resolve({
        locale: "en",
        groupSlug: "face-filler",
        categorySlug: "face-filler-cheek",
      }),
    }));
    expect(meta.alternates?.canonical).toBe(
      "https://example.com/en/services/face-filler/face-filler-cheek",
    );
    expect(meta.alternates?.languages?.fa).toBe(
      "https://example.com/services/face-filler/face-filler-cheek",
    );
  });

  it("refuses to index an unknown slug", async () => {
    getCategoryPage.mockResolvedValue(null);
    const meta = (await categoryMetadata({
      params: Promise.resolve({
        locale: "fa",
        groupSlug: "face-filler",
        categorySlug: "nope",
      }),
    }));
    expect(meta.robots).toMatchObject({ index: false, follow: false });
  });
});