import { describe, expect, it } from "vitest";

import {
  deleteSettingsQuerySchema,
  settingsQuerySchema,
  upsertSettingSchema,
} from "./settings";

describe("upsertSettingSchema", () => {
  const valid = { key: "theme.color", value: "dark" };

  it("accepts a valid setting", () => {
    expect(upsertSettingSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts a setting with explicit type", () => {
    const result = upsertSettingSchema.safeParse({ ...valid, type: "string", value: "dark" });
    expect(result.success).toBe(true);
  });

  it("accepts an admin-level userId field", () => {
    const result = upsertSettingSchema.safeParse({
      ...valid,
      userId: "550e8400-e29b-41d4-a716-446655440001",
    });
    expect(result.success).toBe(true);
  });

  it("accepts scope field", () => {
    const result = upsertSettingSchema.safeParse({ ...valid, scope: "system" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid scope", () => {
    const result = upsertSettingSchema.safeParse({ ...valid, scope: "global" });
    expect(result.success).toBe(false);
  });

  it("rejects a key with uppercase first letter", () => {
    const result = upsertSettingSchema.safeParse({ ...valid, key: "Theme.Color" });
    expect(result.success).toBe(false);
  });

  it("rejects a key with hyphens", () => {
    const result = upsertSettingSchema.safeParse({ ...valid, key: "theme-color" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty key", () => {
    const result = upsertSettingSchema.safeParse({ ...valid, key: "" });
    expect(result.success).toBe(false);
  });

  it("rejects unknown fields", () => {
    const result = upsertSettingSchema.safeParse({ ...valid, role: "admin" });
    expect(result.success).toBe(false);
  });

  it("rejects null value (column is NOT NULL)", () => {
    const result = upsertSettingSchema.safeParse({ ...valid, value: null });
    expect(result.success).toBe(false);
  });

  it("rejects a string value > 10 KB", () => {
    const result = upsertSettingSchema.safeParse({
      ...valid,
      value: "a".repeat(10_001),
    });
    expect(result.success).toBe(false);
  });

  it("rejects type mismatch: declared number but given string", () => {
    const result = upsertSettingSchema.safeParse({
      ...valid,
      type: "number",
      value: "not-a-number",
    });
    expect(result.success).toBe(false);
  });

  it("accepts type match: declared boolean with false value", () => {
    const result = upsertSettingSchema.safeParse({
      ...valid,
      type: "boolean",
      value: false,
    });
    expect(result.success).toBe(true);
  });

  it("accepts array values", () => {
    const result = upsertSettingSchema.safeParse({
      ...valid,
      value: ["a", "b", "c"],
      type: "array",
    });
    expect(result.success).toBe(true);
  });

  it("accepts object values", () => {
    const result = upsertSettingSchema.safeParse({
      ...valid,
      value: { nested: true },
      type: "object",
    });
    expect(result.success).toBe(true);
  });
});

describe("settingsQuerySchema", () => {
  it("defaults page to 1 and limit to 20", () => {
    const result = settingsQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("parses explicit page and limit", () => {
    const result = settingsQuerySchema.safeParse({ page: "3", limit: "50" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(50);
    }
  });

  it("clamps negative page to 1", () => {
    const result = settingsQuerySchema.safeParse({ page: "-5" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.page).toBe(1);
  });

  it("clamps limit above 100 to 20", () => {
    const result = settingsQuerySchema.safeParse({ limit: "200" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.limit).toBe(20);
  });

  it("accepts an optional userId", () => {
    const result = settingsQuerySchema.safeParse({
      userId: "550e8400-e29b-41d4-a716-446655440001",
    });
    expect(result.success).toBe(true);
  });

  it("accepts scope param", () => {
    const result = settingsQuerySchema.safeParse({ scope: "system" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid userId format", () => {
    const result = settingsQuerySchema.safeParse({ userId: "not-a-uuid" });
    expect(result.success).toBe(false);
  });
});

describe("deleteSettingsQuerySchema", () => {
  it("requires key", () => {
    const result = deleteSettingsQuerySchema.safeParse({ key: "ui.theme" });
    expect(result.success).toBe(true);
  });

  it("rejects missing key", () => {
    const result = deleteSettingsQuerySchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("accepts optional userId", () => {
    const result = deleteSettingsQuerySchema.safeParse({
      key: "ui.theme",
      userId: "550e8400-e29b-41d4-a716-446655440001",
    });
    expect(result.success).toBe(true);
  });

  it("accepts scope param", () => {
    const result = deleteSettingsQuerySchema.safeParse({ key: "ui.theme", scope: "system" });
    expect(result.success).toBe(true);
  });
});