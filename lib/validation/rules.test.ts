import { describe, expect, it } from "vitest";

import {
  bulkRulesSchema,
  createRuleSchema,
  listRulesQuerySchema,
  updateRuleSchema,
} from "./rules";

const UUID = "7f9c2f10-2f6b-4d4f-9e1f-5f2f3f4f5f6f";
const validTranslations = {
  fa: { name: "احترام به وقت", description: "شرح فارسی" },
  en: { name: "Respect Appointments", description: "English description" },
};

describe("createRuleSchema", () => {
  it("accepts a fully valid rule", () => {
    const result = createRuleSchema.safeParse({
      slug: "respect-appointments",
      icon: "clock",
      highlighted: true,
      displayOrder: 1,
      isActive: true,
      translations: validTranslations,
    });
    expect(result.success).toBe(true);
  });

  it("applies defaults for optional booleans", () => {
    const result = createRuleSchema.safeParse({
      slug: "parking-rules",
      translations: validTranslations,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.highlighted).toBe(false);
      expect(result.data.isActive).toBe(true);
      expect(result.data.displayOrder).toBe(0);
    }
  });

  it("rejects an invalid slug", () => {
    const result = createRuleSchema.safeParse({
      slug: "Not Kebab Case",
      translations: validTranslations,
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty translation names", () => {
    const result = createRuleSchema.safeParse({
      slug: "test",
      translations: {
        fa: { name: "", description: null },
        en: { name: "x", description: null },
      },
    });
    expect(result.success).toBe(false);
  });

  it("rejects unknown keys (strict)", () => {
    const result = createRuleSchema.safeParse({
      slug: "test",
      translations: validTranslations,
      extra: "no",
    });
    expect(result.success).toBe(false);
  });
});

describe("updateRuleSchema", () => {
  it("accepts a partial update", () => {
    expect(
      updateRuleSchema.safeParse({ isActive: false }).success,
    ).toBe(true);
  });

  it("accepts partial translations", () => {
    expect(
      updateRuleSchema.safeParse({
        translations: { en: { name: "Updated" } },
      }).success,
    ).toBe(true);
  });

  it("rejects unknown fields", () => {
    expect(
      updateRuleSchema.safeParse({ bad: true }).success,
    ).toBe(false);
  });
});

describe("listRulesQuerySchema", () => {
  it("applies defaults", () => {
    const result = listRulesQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        page: 1,
        perPage: 10,
        status: "all",
      });
    }
  });

  it("coerces numeric strings", () => {
    const result = listRulesQuerySchema.safeParse({
      page: "2",
      perPage: "20",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.perPage).toBe(20);
    }
  });

  it("rejects perPage over 50", () => {
    expect(listRulesQuerySchema.safeParse({ perPage: 51 }).success).toBe(false);
  });
});

describe("bulkRulesSchema", () => {
  it("accepts a page-scoped bulk action with ids", () => {
    expect(
      bulkRulesSchema.safeParse({
        action: "activate",
        scope: "page",
        ids: [UUID],
      }).success,
    ).toBe(true);
  });

  it("accepts filtered scope", () => {
    expect(
      bulkRulesSchema.safeParse({
        action: "delete",
        scope: "filtered",
        filters: { search: "park", status: "active" },
      }).success,
    ).toBe(true);
  });

  it("rejects page scope without ids", () => {
    expect(
      bulkRulesSchema.safeParse({
        action: "activate",
        scope: "page",
      }).success,
    ).toBe(false);
  });

  it("rejects invalid action", () => {
    expect(
      bulkRulesSchema.safeParse({
        action: "publish" as string,
        scope: "page",
        ids: [UUID],
      }).success,
    ).toBe(false);
  });

  it("rejects invalid uuids", () => {
    expect(
      bulkRulesSchema.safeParse({
        action: "activate",
        scope: "page",
        ids: ["not-a-uuid"],
      }).success,
    ).toBe(false);
  });
});
