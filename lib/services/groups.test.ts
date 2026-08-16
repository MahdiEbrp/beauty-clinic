import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api/errors";

vi.mock("@/src/db", async () => {
  const { createMockDb } = await import("@/lib/test/mock-db");
  return { db: createMockDb() };
});

vi.mock("server-only", () => ({}));

import { makeCategory, makeGroup, mockDb, resetServiceDb } from "./service-test-fixtures";
import {
  createGroup,
  deleteGroup,
  getGroup,
  listGroups,
  updateGroup,
} from "./service";

beforeEach(() => {
  resetServiceDb();
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
