import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/src/db", async () => {
  const { createMockDb } = await import("@/lib/test/mock-db");
  return { db: createMockDb() };
});

vi.mock("server-only", () => ({}));

import { makeCategory, makeGroup, makeService, mockDb, resetServiceDb, seedGroup } from "./service-test-fixtures";
import { getCatalogSummary, getPublicCatalog } from "./service";

beforeEach(() => {
  resetServiceDb();
});

describe("getCatalogSummary", () => {
  it("returns groups, categories and the total service count", async () => {
    seedGroup({ id: "g1", name: "Laser", slug: "laser" });
    mockDb.seed("service_categories", [
      makeCategory({ id: "c1", groupId: "g1", name: "Laser Hair" }),
      makeCategory({ id: "c2", groupId: "g1", name: "HIFU" }),
    ]);
    mockDb.seed("services", [
      makeService({ id: "s1", categoryId: "c1" }),
      makeService({ id: "s2", categoryId: "c1" }),
      makeService({ id: "s3", categoryId: "c2" }),
    ]);

    const summary = await getCatalogSummary();
    expect(summary.totalServices).toBe(3);
    expect(summary.groups).toHaveLength(1);
    expect(summary.groups[0]).toMatchObject({ name: "Laser", categoryCount: 2 });
    const byId = new Map(summary.categories.map((c) => [c.id, c]));
    expect(byId.get("c1")).toMatchObject({ groupName: "Laser", serviceCount: 2 });
  });
});

describe("getPublicCatalog", () => {
  it("returns active groups and categories localized for the requested locale", async () => {
    const group = makeGroup({ id: "g1", slug: "facial", icon: "facial", displayOrder: 1, name: "Facial" });
    mockDb.seed("service_groups", [group]);
    mockDb.seed("service_groups_i18n", [
      { groupId: group.id, locale: "fa", name: "فیشیال", description: null, seoTitle: null, seoDescription: null },
      { groupId: group.id, locale: "en", name: "Facial", description: null, seoTitle: null, seoDescription: null },
    ]);
    const category = makeCategory({
      id: "c1",
      groupId: "g1",
      slug: "gel-botox",
      icon: "gelBotox",
      displayOrder: 1,
      name: "Filler & Botox",
    });
    mockDb.seed("service_categories", [category]);
    mockDb.seed("service_categories_i18n", [
      { categoryId: category.id, locale: "fa", name: "ژل و بوتاکس", description: null, seoTitle: null, seoDescription: null },
      { categoryId: category.id, locale: "en", name: "Filler & Botox", description: null, seoTitle: null, seoDescription: null },
    ]);

    const en = await getPublicCatalog("en");
    const fa = await getPublicCatalog("fa");

    expect(en.groups).toEqual([{ slug: "facial", icon: "facial", displayOrder: 1, title: "Facial", description: null }]);
    expect(en.categories).toEqual([{ slug: "gel-botox", icon: "gelBotox", displayOrder: 1, title: "Filler & Botox", description: null }]);
    expect(fa.groups[0].title).toBe("فیشیال");
    expect(fa.categories[0].title).toBe("ژل و بوتاکس");
  });

  it("skips inactive rows and orders by displayOrder", async () => {
    seedGroup({ id: "g1", slug: "laser", displayOrder: 2 });
    seedGroup({ id: "g2", slug: "facial", displayOrder: 1 });
    seedGroup({ id: "g3", slug: "hidden", displayOrder: 0, isActive: false });

    const catalog = await getPublicCatalog("fa");
    expect(catalog.groups.map((group) => group.slug)).toEqual(["facial", "laser"]);
  });
});
