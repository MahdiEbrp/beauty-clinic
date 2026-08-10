import { randomUUID } from "node:crypto";

/* eslint-disable max-lines -- comprehensive test suite for service operations */

import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Row, MockDb } from "@/lib/test/mock-db";

vi.mock("@/src/db", async () => {
  const { createMockDb } = await import("@/lib/test/mock-db");
  return { db: createMockDb() };
});

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

beforeEach(() => {
  mockDb.reset();
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
    mockDb.seed("service_groups", [makeGroup({ id: "g1", name: "Laser", slug: "laser" })]);
    mockDb.seed("service_categories", [
      makeCategory({ id: "c1", groupId: "g1", name: "Laser Hair", slug: "laser-hair" }),
    ]);
    mockDb.seed("services", [makeService({ id: "s1", categoryId: "c1" })]);

    const result = await listServices({ page: 1, perPage: 20 });
    expect(result.items[0]).toMatchObject({
      categoryName: "Laser Hair",
      groupName: "Laser",
      groupId: "g1",
    });
  });

  it("searches by title and slug", async () => {
    mockDb.seed("services", [
      makeService({ id: "s1", title: "Botox Injection", slug: "botox-injection" }),
      makeService({ id: "s2", title: "Facial", slug: "specialized-facial" }),
    ]);

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
    mockDb.seed("service_groups", [makeGroup({ id: "g1", name: "Laser" })]);
    mockDb.seed("service_categories", [
      makeCategory({ id: "c1", groupId: "g1", name: "Laser Hair" }),
    ]);
    mockDb.seed("services", [makeService({ id: "s1", categoryId: "c1", price: 250 })]);
    mockDb.seed("service_images", [makeImage({ serviceId: "s1" })]);
    mockDb.seed("service_faqs", [makeFaq({ serviceId: "s1" })]);

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
    title: "Botox Injection",
    slug: "botox-injection",
    shortDesc: null,
    fullDesc: null,
    price: 150,
    priceType: "fixed" as const,
    durationMin: 30,
    sessionsCount: 1,
    coverImage: null,
    isActive: true,
    isFeatured: false,
    displayOrder: 0,
    images: [{ imageUrl: "/images/botox.webp", type: "gallery" as const, displayOrder: 1 }],
    faqs: [{ question: "Q?", answer: "A.", displayOrder: 1 }],
  };

  it("creates a service with nested images and faqs", async () => {
    mockDb.seed("service_categories", [makeCategory({ id: "c1" })]);

    const { id } = await createService(input);
    expect(id).toBeTruthy();
    expect(mockDb.data.services).toHaveLength(1);
    expect(mockDb.data.services[0]).toMatchObject({ title: "Botox Injection", slug: "botox-injection" });
    expect(mockDb.data.service_images).toHaveLength(1);
    expect(mockDb.data.service_images[0]).toMatchObject({ serviceId: id, imageUrl: "/images/botox.webp" });
    expect(mockDb.data.service_faqs).toHaveLength(1);
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
    await expect(updateService("missing", { title: "X" })).rejects.toThrow(
      new ApiError(404, "SERVICE_NOT_FOUND", "Service not found."),
    );
  });

  it("patches scalar fields", async () => {
    mockDb.seed("services", [makeService({ id: "s1" })]);
    await updateService("s1", { title: "New Title", isFeatured: true });

    expect(mockDb.data.services[0]).toMatchObject({ title: "New Title", isFeatured: true });
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
      name: "Peeling",
      slug: "peel",
      description: null,
      icon: "peel",
      image: null,
      displayOrder: 5,
      isActive: true,
      seoTitle: null,
      seoDescription: null,
    });
    expect(id).toBeTruthy();
    expect(mockDb.data.service_groups).toHaveLength(1);
  });

  it("maps a duplicate group slug to a 409", async () => {
    mockDb.failInsert = (table, values) =>
      table === "service_groups" && values.slug === "peel" ? { code: "23505" } : null;
    await expect(
      createGroup({ name: "Peeling", slug: "peel", displayOrder: 0, isActive: true }),
    ).rejects.toThrow(new ApiError(409, "SLUG_TAKEN", "A group with this slug already exists."));
  });

  it("updates a group", async () => {
    mockDb.seed("service_groups", [makeGroup({ id: "g1", slug: "laser" })]);
    await updateGroup("g1", { name: "Advanced Laser" });
    expect(mockDb.data.service_groups[0]).toMatchObject({ name: "Advanced Laser" });
  });

  it("throws GROUP_NOT_FOUND when updating or deleting a missing group", async () => {
    await expect(updateGroup("missing", { name: "X" })).rejects.toThrow(ApiError);
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
    mockDb.seed("service_groups", [makeGroup({ id: "g1", name: "Laser" })]);
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
    name: "HIFU Therapy",
    slug: "hifu",
    description: null,
    icon: "hifu",
    image: null,
    displayOrder: 1,
    isActive: true,
    seoTitle: null,
    seoDescription: null,
  };

  it("creates a category", async () => {
    mockDb.seed("service_groups", [makeGroup({ id: "g1" })]);
    const { id } = await createCategory(input);
    expect(id).toBeTruthy();
    expect(mockDb.data.service_categories).toHaveLength(1);
  });

  it("throws INVALID_GROUP for a missing group", async () => {
    await expect(createCategory(input)).rejects.toThrow(
      new ApiError(400, "INVALID_GROUP", "The selected group does not exist."),
    );
  });

  it("updates a category", async () => {
    mockDb.seed("service_groups", [makeGroup({ id: "g1" })]);
    mockDb.seed("service_categories", [makeCategory({ id: "c1", groupId: "g1" })]);
    await updateCategory("c1", { name: "Renamed" });
    expect(mockDb.data.service_categories[0]).toMatchObject({ name: "Renamed" });
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
    mockDb.seed("service_groups", [makeGroup({ id: "g1", name: "Laser" })]);
    mockDb.seed("service_categories", [makeCategory({ id: "c1", groupId: "g1", name: "HIFU" })]);
    mockDb.seed("services", [makeService({ id: "s1", categoryId: "c1" })]);
    const category = await getCategory("c1");
    expect(category).toMatchObject({ groupName: "Laser", serviceCount: 1 });
  });
});

describe("getCatalogSummary", () => {
  it("returns groups, categories and the total service count", async () => {
    mockDb.seed("service_groups", [makeGroup({ id: "g1", name: "Laser" })]);
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
