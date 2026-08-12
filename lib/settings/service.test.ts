import { randomUUID } from "node:crypto";

import { beforeEach, describe, expect, it, vi } from "vitest";

import type { MockDb } from "@/lib/test/mock-db";

vi.mock("@/src/db", async () => {
  const { createMockDb } = await import("@/lib/test/mock-db");
  return { db: createMockDb() };
});

import { db } from "@/src/db";
import {
  deleteSetting,
  getAllSettings,
  getSystemSettings,
  getUserSettings,
  upsertSetting,
} from "./service";

const mockDb = db as unknown as MockDb;

const USER_ID = "u1";

beforeEach(() => {
  mockDb.reset();
});

describe("upsertSetting", () => {
  it("inserts a system-scoped setting and infers its type", async () => {
    const row = await upsertSetting("site.name", "Glow Clinic", { scope: "system" });

    expect(row).toMatchObject({
      scope: "system",
      key: "site.name",
      value: "Glow Clinic",
      type: "string",
    });
    expect(row.id).toBeTruthy();
  });

  it("upserts an existing system setting in place", async () => {
    await upsertSetting("site.name", "Glow Clinic", { scope: "system" });
    const updated = await upsertSetting("site.name", "Radiant", { scope: "system" });

    expect(mockDb.data.settings).toHaveLength(1);
    expect(updated).toMatchObject({ key: "site.name", value: "Radiant", type: "string" });
  });

  it("keys user-scoped settings by (userId, key)", async () => {
    const first = await upsertSetting("theme", "dark", { userId: USER_ID });
    const second = await upsertSetting("theme", "light", { userId: USER_ID });
    await upsertSetting("theme", "dark", { userId: "u2" });

    expect(first).toMatchObject({ scope: "user", userId: USER_ID, key: "theme" });
    expect(mockDb.data.settings).toHaveLength(2);
    expect(second.value).toBe("light");
  });

  it("keeps user settings for different users separate", async () => {
    await upsertSetting("theme", "dark", { userId: "u1" });
    await upsertSetting("theme", "light", { userId: "u2" });
    const rows = mockDb.data.settings.filter((s) => s.key === "theme");
    expect(rows).toHaveLength(2);
  });

    it.each([
    [42, "number"],
    [true, "boolean"],
    [["a", "b"], "array"],
    [{ nested: true }, "object"],
    ["hello", "string"],
  ])("infers type %s as %s", async (value, type) => {
    const row = await upsertSetting("k", value, { scope: "system" });
    expect(row.type).toBe(type);
  });

      it("rejects null value (column is NOT NULL)", async () => {
    await expect(upsertSetting("k", null, { scope: "system" })).rejects.toThrow(
      "cannot be null",
    );
  });

  it("honors an explicit type override", async () => {
    const row = await upsertSetting("k", "42", { scope: "system", type: "number" });
    expect(row.type).toBe("number");
  });
});

describe("getUserSettings", () => {
  it("returns only user-scoped rows for the given user, ordered by key", async () => {
    mockDb.seed("settings", [
      { id: randomUUID(), scope: "user", userId: USER_ID, key: "b", value: 2, type: "number" },
      { id: randomUUID(), scope: "user", userId: USER_ID, key: "a", value: 1, type: "number" },
      { id: randomUUID(), scope: "user", userId: "u2", key: "a", value: 9, type: "number" },
      { id: randomUUID(), scope: "system", userId: null, key: "x", value: "y", type: "string" },
    ]);

    const rows = await getUserSettings(USER_ID);

    expect(rows.map((r) => r.key)).toEqual(["a", "b"]);
    expect(rows.every((r) => r.scope === "user" && r.userId === USER_ID)).toBe(true);
  });
});

describe("getSystemSettings", () => {
  it("returns only system-scoped rows, ordered by key", async () => {
    mockDb.seed("settings", [
      { id: randomUUID(), scope: "system", key: "z", value: 1, type: "number" },
      { id: randomUUID(), scope: "system", key: "a", value: 2, type: "number" },
      { id: randomUUID(), scope: "user", userId: USER_ID, key: "u", value: 3, type: "number" },
    ]);

    const rows = await getSystemSettings();

    expect(rows.map((r) => r.key)).toEqual(["a", "z"]);
    expect(rows.every((r) => r.scope === "system")).toBe(true);
  });
});

describe("getAllSettings", () => {
  it("paginates and reports totals", async () => {
    for (let i = 1; i <= 5; i += 1) {
      mockDb.seed("settings", [
        { id: randomUUID(), scope: "user", userId: USER_ID, key: `k${i}`, value: i, type: "number" },
      ]);
    }

    const page1 = await getAllSettings(1, 2);
    expect(page1.total).toBe(5);
    expect(page1.totalPages).toBe(3);
    expect(page1.items).toHaveLength(2);

    const page3 = await getAllSettings(3, 2);
    expect(page3.items).toHaveLength(1);
  });

  it("filters by scope", async () => {
    mockDb.seed("settings", [
      { id: randomUUID(), scope: "user", userId: USER_ID, key: "a", value: 1, type: "number" },
      { id: randomUUID(), scope: "system", key: "b", value: 2, type: "number" },
    ]);

    const system = await getAllSettings(1, 10, { scope: "system" });
    expect(system.total).toBe(1);
    expect(system.items[0].key).toBe("b");
  });

  it("filters by userId", async () => {
    mockDb.seed("settings", [
      { id: randomUUID(), scope: "user", userId: "u1", key: "a", value: 1, type: "number" },
      { id: randomUUID(), scope: "user", userId: "u2", key: "a", value: 2, type: "number" },
    ]);

    const rows = await getAllSettings(1, 10, { userId: "u2" });
    expect(rows.items.map((r) => r.userId)).toEqual(["u2"]);
  });
});

describe("deleteSetting", () => {
  it("deletes a system setting by key", async () => {
    mockDb.seed("settings", [
      { id: randomUUID(), scope: "system", key: "site.name", value: "x", type: "string" },
      { id: randomUUID(), scope: "user", userId: USER_ID, key: "site.name", value: "y", type: "string" },
    ]);

    await deleteSetting("site.name", { scope: "system" });

    expect(mockDb.data.settings).toHaveLength(1);
    expect(mockDb.data.settings[0].scope).toBe("user");
  });

  it("throws when a userId is missing for user-scoped deletes", async () => {
    await expect(deleteSetting("theme")).rejects.toThrow(
      "userId is required for user-scoped delete",
    );
  });

  it("deletes only the matching user setting", async () => {
    mockDb.seed("settings", [
      { id: randomUUID(), scope: "user", userId: "u1", key: "theme", value: "dark", type: "string" },
      { id: randomUUID(), scope: "user", userId: "u2", key: "theme", value: "light", type: "string" },
    ]);

    await deleteSetting("theme", { userId: "u1" });

    expect(mockDb.data.settings).toHaveLength(1);
    expect(mockDb.data.settings[0].userId).toBe("u2");
  });
});
