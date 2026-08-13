import { randomUUID } from "node:crypto";

import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Row, MockDb } from "@/lib/test/mock-db";
import { resetCacheForTests } from "@/lib/cache";

vi.mock("@/src/db", async () => {
  const { createMockDb } = await import("@/lib/test/mock-db");
  return { db: createMockDb() };
});

vi.mock("server-only", () => ({}));

import { db } from "@/src/db";
import {
  findCategoryIds,
  listServiceCategories,
} from "./categories-admin";
import { listGroupOptions } from "./groups";

const mockDb = db as unknown as MockDb;

const UUID = () => randomUUID();

function makeCategory(overrides: Partial<Row> = {}): Row {
  return {
    id: UUID(),
    groupId: "g1",
    name: "Laser Hair Removal",
    slug: "laser-hair-removal",
    description: null,
    icon: null,
    image: null,
    displayOrder: 1,
    isActive: true,
    seoTitle: null,
    seoDescription: null,
    createdAt: new Date(2024, 0, 1),
    updatedAt: new Date(2024, 0, 1),
    ...overrides,
  };
}

function makeGroup(overrides: Partial<Row> = {}): Row {
  return {
    id: "g1",
    name: "Laser",
    slug: "laser",
    description: null,
    icon: null,
    image: null,
    displayOrder: 1,
    isActive: true,
    seoTitle: null,
    seoDescription: null,
    createdAt: new Date(2024, 0, 1),
    updatedAt: new Date(2024, 0, 1),
    ...overrides,
  };
}

function makeService(overrides: Partial<Row> = {}): Row {
  return {
    id: UUID(),
    categoryId: "c1",
    title: "Laser Hair Removal",
    slug: "laser-hair-removal",
    shortDesc: null,
    fullDesc: null,
    price: 100,
    priceType: "fixed",
    durationMin: 30,
    sessionsCount: 1,
    coverImage: null,
    isActive: true,
    isFeatured: false,
    displayOrder: 0,
    createdAt: new Date(2024, 0, 1),
    updatedAt: new Date(2024, 0, 1),
    ...overrides,
  };
}

/** Seeds a category plus its fa/en translations (names resolve via i18n). */
function seedCategory(overrides: Partial<Row> = {}): Row {
  const row = makeCategory(overrides);
  mockDb.seed("service_categories", [row]);
  mockDb.seed("service_categories_i18n", [
    { categoryId: row.id, locale: "fa", name: row.name, description: row.description, seoTitle: row.seoTitle, seoDescription: row.seoDescription },
    { categoryId: row.id, locale: "en", name: row.name, description: row.description, seoTitle: row.seoTitle, seoDescription: row.seoDescription },
  ]);
  return row;
}

beforeEach(() => {
  mockDb.reset();
  resetCacheForTests();
});

describe("listServiceCategories", () => {
  it("returns an empty result for an empty database", async () => {
    const result = await listServiceCategories({ page: 1, perPage: 10 });
    expect(result).toEqual({
      items: [],
      total: 0,
      page: 1,
      perPage: 10,
      totalPages: 0,
    });
  });

  it("paginates and orders by displayOrder then createdAt", async () => {
    mockDb.seed("service_groups", [makeGroup()]);
    seedCategory({ id: "c1", slug: "a", displayOrder: 2 });
    seedCategory({ id: "c2", slug: "b", displayOrder: 1 });
    seedCategory({ id: "c3", slug: "c", displayOrder: 1, createdAt: new Date(2024, 0, 2) });
    seedCategory({ id: "c4", slug: "d", displayOrder: 0 });

    const page1 = await listServiceCategories({ page: 1, perPage: 2 });
    expect(page1.total).toBe(4);
    expect(page1.totalPages).toBe(2);
    expect(page1.items.map((item) => item.slug)).toEqual(["d", "b"]);

    const page2 = await listServiceCategories({ page: 2, perPage: 2 });
    expect(page2.items.map((item) => item.slug)).toEqual(["c", "a"]);
  });

  it("attaches the fa group name and service counts", async () => {
    mockDb.seed("service_groups", [makeGroup({ id: "g1", name: "Laser" })]);
    mockDb.seed("service_groups_i18n", [
      { groupId: "g1", locale: "fa", name: "لیزر", description: null, seoTitle: null, seoDescription: null },
      { groupId: "g1", locale: "en", name: "Laser", description: null, seoTitle: null, seoDescription: null },
    ]);
    seedCategory({ id: "c1", groupId: "g1", name: "Laser Hair" });
    seedCategory({ id: "c2", groupId: "g1", name: "HIFU" });
    mockDb.seed("services", [
      makeService({ id: "s1", categoryId: "c1" }),
      makeService({ id: "s2", categoryId: "c1" }),
      makeService({ id: "s3", categoryId: "c2" }),
    ]);

    const result = await listServiceCategories({ page: 1, perPage: 10 });
    const byId = new Map(result.items.map((item) => [item.id, item]));
    expect(byId.get("c1")).toMatchObject({ groupName: "لیزر", serviceCount: 2 });
    expect(byId.get("c2")).toMatchObject({ groupName: "لیزر", serviceCount: 1 });
  });

  it("filters by active and inactive status", async () => {
    seedCategory({ id: "c1", slug: "a", isActive: true });
    seedCategory({ id: "c2", slug: "b", isActive: false });

    const active = await listServiceCategories({ page: 1, perPage: 10, status: "active" });
    expect(active.items.map((item) => item.id)).toEqual(["c1"]);

    const inactive = await listServiceCategories({ page: 1, perPage: 10, status: "inactive" });
    expect(inactive.items.map((item) => item.id)).toEqual(["c2"]);
  });

  it("searches by slug and translated name", async () => {
    seedCategory({ id: "c1", slug: "hifu-therapy", name: "HIFU Therapy" });
    seedCategory({ id: "c2", slug: "gel-botox", name: "Filler & Botox" });
    seedCategory({ id: "c3", slug: "other", name: "HIFU Face" });

    const bySlug = await listServiceCategories({ page: 1, perPage: 10, search: "hifu-therapy" });
    expect(bySlug.items.map((item) => item.id)).toEqual(["c1"]);

    const byName = await listServiceCategories({ page: 1, perPage: 10, search: "botox" });
    expect(byName.items.map((item) => item.id)).toEqual(["c2"]);
  });
});

describe("findCategoryIds", () => {
  it("returns all matching ids with no filters", async () => {
    seedCategory({ id: "c1", slug: "a" });
    seedCategory({ id: "c2", slug: "b" });
    expect(await findCategoryIds({})).toEqual(["c1", "c2"]);
  });

  it("respects search and status filters", async () => {
    seedCategory({ id: "c1", slug: "laser-hair", name: "Laser Hair" });
    seedCategory({ id: "c2", slug: "facial", name: "Facial", isActive: false });
    const ids = await findCategoryIds({ search: "laser", status: "active" });
    expect(ids).toEqual(["c1"]);
  });
});

describe("listGroupOptions", () => {
  it("returns id and fa name for every group in display order", async () => {
    mockDb.seed("service_groups", [
      makeGroup({ id: "g1", displayOrder: 2 }),
      makeGroup({ id: "g2", displayOrder: 1 }),
    ]);
    mockDb.seed("service_groups_i18n", [
      { groupId: "g1", locale: "fa", name: "لیزر", description: null, seoTitle: null, seoDescription: null },
      { groupId: "g1", locale: "en", name: "Laser", description: null, seoTitle: null, seoDescription: null },
      { groupId: "g2", locale: "fa", name: "فیشیال", description: null, seoTitle: null, seoDescription: null },
      { groupId: "g2", locale: "en", name: "Facial", description: null, seoTitle: null, seoDescription: null },
    ]);

    const options = await listGroupOptions();
    expect(options).toEqual([
      { id: "g2", name: "فیشیال" },
      { id: "g1", name: "لیزر" },
    ]);
  });

  it("returns an empty array when no groups exist", async () => {
    expect(await listGroupOptions()).toEqual([]);
  });
});
