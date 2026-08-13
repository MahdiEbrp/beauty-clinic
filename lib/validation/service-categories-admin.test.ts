import { describe, expect, it } from "vitest";

import {
  bulkServiceCategoriesSchema,
  listServiceCategoriesQuerySchema,
} from "./service-categories-admin";

const UUID = "7f9c2f10-2f6b-4d4f-9e1f-5f2f3f4f5f6f";

describe("listServiceCategoriesQuerySchema", () => {
  it("applies defaults for page, perPage and status", () => {
    const result = listServiceCategoriesQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ page: 1, perPage: 10, status: "all" });
    }
  });

  it("coerces numeric query strings", () => {
    const result = listServiceCategoriesQuerySchema.safeParse({
      page: "3",
      perPage: "25",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.perPage).toBe(25);
    }
  });

  it("trims search and accepts valid status filters", () => {
    const result = listServiceCategoriesQuerySchema.safeParse({
      search: "  laser  ",
      status: "inactive",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.search).toBe("laser");
      expect(result.data.status).toBe("inactive");
    }
  });

  it("rejects an unknown status value", () => {
    expect(
      listServiceCategoriesQuerySchema.safeParse({ status: "archived" }).success,
    ).toBe(false);
  });

  it("rejects perPage above the maximum", () => {
    expect(listServiceCategoriesQuerySchema.safeParse({ perPage: 51 }).success).toBe(
      false,
    );
  });

  it("rejects unknown fields", () => {
    expect(listServiceCategoriesQuerySchema.safeParse({ sort: "name" }).success).toBe(
      false,
    );
  });
});

describe("bulkServiceCategoriesSchema", () => {
  it("accepts a page-scoped bulk delete with ids", () => {
    const result = bulkServiceCategoriesSchema.safeParse({
      action: "delete",
      scope: "page",
      ids: [UUID],
    });
    expect(result.success).toBe(true);
  });

  it("accepts a filtered-scoped bulk action without ids", () => {
    const result = bulkServiceCategoriesSchema.safeParse({
      action: "activate",
      scope: "filtered",
      filters: { search: "laser", status: "active" },
    });
    expect(result.success).toBe(true);
  });

  it("rejects a page scope with no ids", () => {
    const result = bulkServiceCategoriesSchema.safeParse({
      action: "deactivate",
      scope: "page",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown action", () => {
    expect(
      bulkServiceCategoriesSchema.safeParse({
        action: "archive",
        scope: "page",
        ids: [UUID],
      }).success,
    ).toBe(false);
  });

  it("rejects invalid ids and more than 100 ids", () => {
    expect(
      bulkServiceCategoriesSchema.safeParse({
        action: "delete",
        scope: "page",
        ids: ["not-a-uuid"],
      }).success,
    ).toBe(false);
    const ids = Array.from({ length: 101 }, () => UUID);
    expect(
      bulkServiceCategoriesSchema.safeParse({
        action: "delete",
        scope: "page",
        ids,
      }).success,
    ).toBe(false);
  });

  it("rejects unknown fields", () => {
    expect(
      bulkServiceCategoriesSchema.safeParse({
        action: "delete",
        scope: "page",
        ids: [UUID],
        admin: true,
      }).success,
    ).toBe(false);
  });
});
