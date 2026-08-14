import { randomUUID } from "node:crypto";

/* eslint-disable max-lines -- comprehensive test suite for service operations */

import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Row, MockDb } from "@/lib/test/mock-db";
import { resetCacheForTests } from "@/lib/cache";

vi.mock("@/src/db", async () => {
  const { createMockDb } = await import("@/lib/test/mock-db");
  return { db: createMockDb() };
});

// `server-only` throws when imported outside a Server Component runtime, so
// stub it out so this suite can run against the mock database.
vi.mock("server-only", () => ({}));

import { db } from "@/src/db";
import { ApiError } from "@/lib/api/errors";
import {
  createCategory,
  createGroup,
  createService,
  deleteCategory,
  deleteGroup,
  deleteService,
  getCatalogSummary,
  getCategory,
  getGroup,
  getPublicCatalog,
  getService,
  listCategories,
  listGroups,
  listServices,
  updateCategory,
  updateGroup,
  updateService,
} from "./service";

const mockDb = db as unknown as MockDb;

const UUID = () => randomUUID();

function makeGroup(overrides: Partial<Row> = {}): Row {
  return {
    id: UUID(),
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

function makeImage(overrides: Partial<Row> = {}): Row {
  return {
    id: UUID(),
    serviceId: "s1",
    imageUrl: "/images/laser.webp",
    type: "gallery",
    displayOrder: 0,
    createdAt: new Date(2024, 0, 1),
    ...overrides,
  };
}

function makeFaq(overrides: Partial<Row> = {}): Row {
  return {
    id: UUID(),
    serviceId: "s1",
    question: "Does it hurt?",
    answer: "No.",
    displayOrder: 0,
    createdAt: new Date(2024, 0, 1),
    ...overrides,
  };
}

/** Seeds a group plus its fa/en translations (names resolve through i18n). */
function seedGroup(overrides: Partial<Row> = {}): Row {
  const row = makeGroup(overrides);
  mockDb.seed("service_groups", [row]);
  mockDb.seed("service_groups_i18n", [
    { groupId: row.id, locale: "fa", name: row.name, description: row.description, seoTitle: row.seoTitle, seoDescription: row.seoDescription },
    { groupId: row.id, locale: "en", name: row.name, description: row.description, seoTitle: row.seoTitle, seoDescription: row.seoDescription },
  ]);
  return row;
}

/** Seeds a category plus its fa/en translations. */
function seedCategory(overrides: Partial<Row> = {}): Row {
  const row = makeCategory(overrides);
  mockDb.seed("service_categories", [row]);
  mockDb.seed("service_categories_i18n", [
    { categoryId: row.id, locale: "fa", name: row.name, description: row.description, seoTitle: row.seoTitle, seoDescription: row.seoDescription },
    { categoryId: row.id, locale: "en", name: row.name, description: row.description, seoTitle: row.seoTitle, seoDescription: row.seoDescription },
  ]);
  return row;
}

/** Seeds a service plus its fa/en translations. */
function seedService(overrides: Partial<Row> = {}): Row {
  const row = makeService(overrides);
  mockDb.seed("services", [row]);
  mockDb.seed("services_i18n", [
    { serviceId: row.id, locale: "fa", title: row.title, shortDesc: row.shortDesc, fullDesc: row.fullDesc },
    { serviceId: row.id, locale: "en", title: row.title, shortDesc: row.shortDesc, fullDesc: row.fullDesc },
  ]);
  return row;
}

/** Seeds a faq plus its fa/en translations. */
function seedFaq(overrides: Partial<Row> = {}): Row {
  const row = makeFaq(overrides);
  mockDb.seed("service_faqs", [row]);
  mockDb.seed("service_faqs_i18n", [
    { faqId: row.id, locale: "fa", question: row.question, answer: row.answer },
    { faqId: row.id, locale: "en", question: row.question, answer: row.answer },
  ]);
  return row;
}

beforeEach(() => {
  mockDb.reset();
  resetCacheForTests();
});

describe("listServices", () => {
  it("returns an empty result for an empty database", async () => {
    const result = await listServices({ page: 1, perPage: 20 });
    expect(result).toEqual({
      items: [],
      total: 0,
      page: 1,
      perPage: 20,
      totalPages: 0,
    });
  });

  it("paginates and orders newest services first", async () => {
    const seeded = [
      makeService({ id: "s1", createdAt: new Date(2024, 0, 1, 10) }),
      makeService({ id: "s2", createdAt: new Date(2024, 0, 1, 11) }),
      makeService({ id: "s3", createdAt: new Date(2024, 0, 1, 12) }),
      makeService({ id: "s4", createdAt: new Date(2024, 0, 1, 13) }),
      makeService({ id: "s5", createdAt: new Date(2024, 0, 1, 14) }),
    ];
    mockDb.seed("services", seeded);

    const page1 = await listServices({ page: 1, perPage: 2 });
    expect(page1.total).toBe(5);
    expect(page1.totalPages).toBe(3);
    expect(page1.items.map((s) => s.id)).toEqual(["s5", "s4"]);

    const page3 = await listServices({ page: 3, perPage: 2 });
    expect(page3.items.map((s) => s.id)).toEqual(["s1"]);
  });

  it("attaches category and group names from the join", async () => {
    seedGroup({ id: "g1", name: "Laser", slug: "laser" });
    seedCategory({ id: "c1", groupId: "g1", name: "Laser Hair", slug: "laser-hair" });
    seedService({ id: "s1", categoryId: "c1" });

    const result = await listServices({ page: 1, perPage: 20 });
    expect(result.items[0]).toMatchObject({
      categoryName: "Laser Hair",
      groupName: "Laser",
      groupId: "g1",
    });
  });

  it("searches by title and slug", async () => {
    seedService({ id: "s1", title: "Botox Injection", slug: "botox-injection" });
    seedService({ id: "s2", title: "Facial", slug: "specialized-facial" });

    const byTitle = await listServices({ page: 1, perPage: 20, search: "botox" });
    expect(byTitle.items.map((s) => s.id)).toEqual(["s1"]);

    const bySlug = await listServices({ page: 1, perPage: 20, search: "specialized-facial" });
    expect(bySlug.items.map((s) => s.id)).toEqual(["s2"]);
  });

  it("filters by categoryId", async () => {
    mockDb.seed("services", [
      makeService({ id: "s1", categoryId: "c1" }),
      makeService({ id: "s2", categoryId: "c2" }),
    ]);
    const result = await listServices({ page: 1, perPage: 20, categoryId: "c2" });
    expect(result.items.map((s) => s.id)).toEqual(["s2"]);
  });

  it("filters by status and featured flags", async () => {
    mockDb.seed("services", [
      makeService({ id: "s1", createdAt: new Date(2024, 0, 1, 10), isActive: true, isFeatured: false }),
      makeService({ id: "s2", createdAt: new Date(2024, 0, 1, 11), isActive: false, isFeatured: false }),
      makeService({ id: "s3", createdAt: new Date(2024, 0, 1, 12), isActive: true, isFeatured: true }),
    ]);

    const active = await listServices({ page: 1, perPage: 20, status: "active" });
    expect(active.items.map((s) => s.id)).toEqual(["s3", "s1"]);

    const inactive = await listServices({ page: 1, perPage: 20, status: "inactive" });
    expect(inactive.items.map((s) => s.id)).toEqual(["s2"]);

    const featured = await listServices({ page: 1, perPage: 20, featured: "yes" });
    expect(featured.items.map((s) => s.id)).toEqual(["s3"]);

    const notFeatured = await listServices({ page: 1, perPage: 20, featured: "no" });
    expect(notFeatured.items.map((s) => s.id)).toEqual(["s2", "s1"]);
  });
});

describe("getService", () => {
  it("throws SERVICE_NOT_FOUND for a missing service", async () => {
    await expect(getService("missing")).rejects.toThrow(
      new ApiError(404, "SERVICE_NOT_FOUND", "Service not found."),
    );
  });

  it("returns a service with names, images and faqs", async () => {
    seedGroup({ id: "g1", name: "Laser" });
    seedCategory({ id: "c1", groupId: "g1", name: "Laser Hair" });
    seedService({ id: "s1", categoryId: "c1", price: 250 });
    mockDb.seed("service_images", [makeImage({ serviceId: "s1" })]);
    seedFaq({ serviceId: "s1" });

    const service = await getService("s1");
    expect(service).toMatchObject({
      id: "s1",
      categoryName: "Laser Hair",
      groupName: "Laser",
      groupId: "g1",
      price: 250,
    });
    expect(service.images).toHaveLength(1);
    expect(service.images[0]).toMatchObject({ imageUrl: "/images/laser.webp", type: "gallery" });
    expect(service.faqs).toHaveLength(1);
    expect(service.faqs[0].answer).toBe("No.");
  });
});

describe("createService", () => {
  const input = {
    categoryId: "c1",
    slug: "botox-injection",
    price: 150,
    priceType: "fixed" as const,
    durationMin: 30,
    sessionsCount: 1,
    coverImage: null,
    isActive: true,
    isFeatured: false,
    displayOrder: 0,
    translations: {
      fa: { title: "Botox Injection", shortDesc: null, fullDesc: null, seoTitle: null, seoDescription: null },
      en: { title: "Botox Injection", shortDesc: null, fullDesc: null, seoTitle: null, seoDescription: null },
    },
    images: [{ imageUrl: "/images/botox.webp", type: "gallery" as const, displayOrder: 1 }],
    faqs: [
      {
        displayOrder: 1,
        translations: {
          fa: { question: "Q?", answer: "A." },
          en: { question: "Q?", answer: "A." },
        },
      },
    ],
  };

  it("creates a service with nested translations, images and faqs", async () => {
    mockDb.seed("service_categories", [makeCategory({ id: "c1" })]);

    const { id } = await createService(input);
    expect(id).toBeTruthy();
    expect(mockDb.data.services).toHaveLength(1);
    expect(mockDb.data.services[0]).toMatchObject({ slug: "botox-injection" });
    expect(mockDb.data.services_i18n).toHaveLength(2);
    expect(
      mockDb.data.services_i18n.some((r) => r.locale === "fa" && r.title === "Botox Injection"),
    ).toBe(true);
    expect(mockDb.data.service_images).toHaveLength(1);
    expect(mockDb.data.service_images[0]).toMatchObject({ serviceId: id, imageUrl: "/images/botox.webp" });
    expect(mockDb.data.service_faqs).toHaveLength(1);
    expect(mockDb.data.service_faqs_i18n).toHaveLength(2);
  });

  it("throws INVALID_CATEGORY for a missing category", async () => {
    await expect(createService(input)).rejects.toThrow(
      new ApiError(400, "INVALID_CATEGORY", "The selected category does not exist."),
    );
  });

  it("maps a duplicate slug to a 409", async () => {
    mockDb.seed("service_categories", [makeCategory({ id: "c1" })]);
    mockDb.failInsert = (table, values) =>
      table === "services" && values.slug === "botox-injection"
        ? { code: "23505" }
        : null;

    await expect(createService(input)).rejects.toThrow(
      new ApiError(409, "SLUG_TAKEN", "A service with this slug already exists."),
    );
  });
});

describe("updateService", () => {
  it("throws SERVICE_NOT_FOUND for a missing service", async () => {
    await expect(
      updateService("missing", { isFeatured: true }),
    ).rejects.toThrow(
      new ApiError(404, "SERVICE_NOT_FOUND", "Service not found."),
    );
  });

  it("patches scalar fields and translations", async () => {
    mockDb.seed("services", [makeService({ id: "s1" })]);
    await updateService("s1", {
      isFeatured: true,
      translations: { fa: { title: "New Title" }, en: { title: "New Title" } },
    });

    expect(mockDb.data.services[0]).toMatchObject({ isFeatured: true });
    expect(mockDb.data.services_i18n).toHaveLength(2);
    expect(
      mockDb.data.services_i18n.some((r) => r.locale === "fa" && r.title === "New Title"),
    ).toBe(true);
  });

  it("replaces images and faqs when provided", async () => {
    mockDb.seed("services", [makeService({ id: "s1" })]);
    mockDb.seed("service_images", [makeImage({ serviceId: "s1" })]);
    mockDb.seed("service_faqs", [makeFaq({ serviceId: "s1" })]);

    await updateService("s1", {
      images: [{ imageUrl: "/new.webp", type: "after", displayOrder: 1 }],
      faqs: [],
    });

    expect(mockDb.data.service_images).toHaveLength(1);
    expect(mockDb.data.service_images[0]).toMatchObject({ imageUrl: "/new.webp", type: "after" });
    expect(mockDb.data.service_faqs).toHaveLength(0);
  });

  it("throws INVALID_CATEGORY when reparenting to a missing category", async () => {
    mockDb.seed("services", [makeService({ id: "s1" })]);
    await expect(updateService("s1", { categoryId: "missing" })).rejects.toThrow(ApiError);
  });

  it("maps a duplicate slug to a 409", async () => {
    mockDb.seed("services", [
      makeService({ id: "s1", slug: "original" }),
      makeService({ id: "s2", slug: "taken" }),
    ]);

    await expect(updateService("s1", { slug: "taken" })).rejects.toThrow(
      new ApiError(409, "SLUG_TAKEN", "A service with this slug already exists."),
    );
  });
});

describe("deleteService", () => {
  it("throws SERVICE_NOT_FOUND for a missing service", async () => {
    await expect(deleteService("missing")).rejects.toThrow(ApiError);
  });

  it("deletes an existing service", async () => {
    mockDb.seed("services", [makeService({ id: "s1" })]);
    await deleteService("s1");
    expect(mockDb.data.services).toHaveLength(0);
  });
});

describe("listGroups", () => {
  it("returns groups with category counts", async () => {
    mockDb.seed("service_groups", [
      makeGroup({ id: "g1", slug: "laser", displayOrder: 1 }),
      makeGroup({ id: "g2", slug: "facial", displayOrder: 2 }),
    ]);
    mockDb.seed("service_categories", [
      makeCategory({ id: "c1", groupId: "g1" }),
      makeCategory({ id: "c2", groupId: "g1" }),
      makeCategory({ id: "c3", groupId: "g2" }),
    ]);

    const groups = await listGroups();
    const byId = new Map(groups.map((g) => [g.id, g]));
    expect(byId.get("g1")?.categoryCount).toBe(2);
    expect(byId.get("g2")?.categoryCount).toBe(1);
  });
});

describe("group CRUD", () => {
  it("creates a group", async () => {
    const { id } = await createGroup({
      slug: "peel",
      icon: "peel",
      image: null,
      displayOrder: 5,
      isActive: true,
      translations: {
        fa: { name: "Peeling", description: null, seoTitle: null, seoDescription: null },
        en: { name: "Peeling", description: null, seoTitle: null, seoDescription: null },
      },
    });
    expect(id).toBeTruthy();
    expect(mockDb.data.service_groups).toHaveLength(1);
    expect(mockDb.data.service_groups_i18n).toHaveLength(2);
  });

  it("maps a duplicate group slug to a 409", async () => {
    mockDb.failInsert = (table, values) =>
      table === "service_groups" && values.slug === "peel" ? { code: "23505" } : null;
    const input = {
      slug: "peel",
      displayOrder: 0,
      isActive: true,
      translations: {
        fa: { name: "Peeling", description: null, seoTitle: null, seoDescription: null },
        en: { name: "Peeling", description: null, seoTitle: null, seoDescription: null },
      },
    };
    await expect(createGroup(input)).rejects.toThrow(
      new ApiError(409, "SLUG_TAKEN", "A group with this slug already exists."),
    );
  });

  it("updates a group", async () => {
    mockDb.seed("service_groups", [makeGroup({ id: "g1", slug: "laser" })]);
    await updateGroup("g1", {
      translations: {
        fa: { name: "Advanced Laser" },
        en: { name: "Advanced Laser" },
      },
    });
    expect(mockDb.data.service_groups_i18n).toHaveLength(2);
    expect(
      mockDb.data.service_groups_i18n.some((r) => r.locale === "fa" && r.name === "Advanced Laser"),
    ).toBe(true);
  });

  it("throws GROUP_NOT_FOUND when updating or deleting a missing group", async () => {
    await expect(
      updateGroup("missing", { isActive: false }),
    ).rejects.toThrow(ApiError);
    await expect(deleteGroup("missing")).rejects.toThrow(ApiError);
  });

  it("deletes a group", async () => {
    mockDb.seed("service_groups", [makeGroup({ id: "g1" })]);
    await deleteGroup("g1");
    expect(mockDb.data.service_groups).toHaveLength(0);
  });

  it("returns a single group with its count", async () => {
    mockDb.seed("service_groups", [makeGroup({ id: "g1" })]);
    mockDb.seed("service_categories", [
      makeCategory({ id: "c1", groupId: "g1" }),
      makeCategory({ id: "c2", groupId: "g1" }),
    ]);
    const group = await getGroup("g1");
    expect(group.categoryCount).toBe(2);
  });
});

describe("listCategories", () => {
  it("returns categories with group names and service counts", async () => {
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

    const categories = await listCategories();
    const byId = new Map(categories.map((c) => [c.id, c]));
    expect(byId.get("c1")).toMatchObject({ groupName: "Laser", serviceCount: 2 });
    expect(byId.get("c2")).toMatchObject({ groupName: "Laser", serviceCount: 1 });
  });
});

describe("category CRUD", () => {
  const input = {
    groupId: "g1",
    slug: "hifu",
    icon: "hifu",
    image: null,
    displayOrder: 1,
    isActive: true,
    translations: {
      fa: { name: "HIFU Therapy", description: null, seoTitle: null, seoDescription: null },
      en: { name: "HIFU Therapy", description: null, seoTitle: null, seoDescription: null },
    },
  };

  it("creates a category", async () => {
    mockDb.seed("service_groups", [makeGroup({ id: "g1" })]);
    const { id } = await createCategory(input);
    expect(id).toBeTruthy();
    expect(mockDb.data.service_categories).toHaveLength(1);
    expect(mockDb.data.service_categories_i18n).toHaveLength(2);
  });

  it("throws INVALID_GROUP for a missing group", async () => {
    await expect(createCategory(input)).rejects.toThrow(
      new ApiError(400, "INVALID_GROUP", "The selected group does not exist."),
    );
  });

  it("updates a category", async () => {
    mockDb.seed("service_groups", [makeGroup({ id: "g1" })]);
    mockDb.seed("service_categories", [makeCategory({ id: "c1", groupId: "g1" })]);
    await updateCategory("c1", {
      translations: {
        fa: { name: "Renamed" },
        en: { name: "Renamed" },
      },
    });
    expect(mockDb.data.service_categories_i18n).toHaveLength(2);
    expect(
      mockDb.data.service_categories_i18n.some((r) => r.locale === "fa" && r.name === "Renamed"),
    ).toBe(true);
  });

  it("rejects reparenting to a missing group", async () => {
    mockDb.seed("service_categories", [makeCategory({ id: "c1", groupId: "g1" })]);
    await expect(updateCategory("c1", { groupId: "missing" })).rejects.toThrow(ApiError);
  });

  it("throws CATEGORY_NOT_FOUND when deleting a missing category", async () => {
    await expect(deleteCategory("missing")).rejects.toThrow(ApiError);
  });

  it("deletes a category", async () => {
    mockDb.seed("service_categories", [makeCategory({ id: "c1" })]);
    await deleteCategory("c1");
    expect(mockDb.data.service_categories).toHaveLength(0);
  });

  it("returns a single category with its names and count", async () => {
    seedGroup({ id: "g1", name: "Laser" });
    seedCategory({ id: "c1", groupId: "g1", name: "HIFU" });
    seedService({ id: "s1", categoryId: "c1" });
    const category = await getCategory("c1");
    expect(category).toMatchObject({ groupName: "Laser", serviceCount: 1 });
  });
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
