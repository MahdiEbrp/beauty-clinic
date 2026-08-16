import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api/errors";

vi.mock("@/src/db", async () => {
  const { createMockDb } = await import("@/lib/test/mock-db");
  return { db: createMockDb() };
});

vi.mock("server-only", () => ({}));

import { makeCategory, makeGroup, makeService, mockDb, resetServiceDb, seedCategory, seedGroup, seedService } from "./service-test-fixtures";
import { createCategory, deleteCategory, getCategory, listCategories, updateCategory } from "./service";

beforeEach(() => {
  resetServiceDb();
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
