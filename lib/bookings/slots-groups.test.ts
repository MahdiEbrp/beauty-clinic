import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MockDb } from "@/lib/test/mock-db";
import { db } from "@/src/db";
import { bulkSlotsSchema } from "@/lib/validation/bookings";
import { setSlotsGroups } from "./slots-admin";

vi.mock("server-only", () => ({}));
vi.mock("@/src/db", async () => {
  const { createMockDb } = await import("@/lib/test/mock-db");
  return { db: createMockDb() };
});

const mockDb = db as unknown as MockDb;
beforeEach(() => mockDb.reset());

describe("bulk slot group validation", () => {
  const id = randomUUID();
  const groupId = randomUUID();
  const input = { action: "groups", scope: "page", ids: [id], groupIds: [groupId] };

  it("accepts group assignment and clearing all restrictions", () => {
    expect(bulkSlotsSchema.safeParse(input).success).toBe(true);
    expect(bulkSlotsSchema.safeParse({ ...input, groupIds: [] }).success).toBe(true);
  });

  it("requires an explicit group selection to avoid accidental clearing", () => {
    expect(bulkSlotsSchema.safeParse({ ...input, groupIds: undefined }).success).toBe(false);
  });

  it("validates UUIDs and caps selected groups", () => {
    expect(bulkSlotsSchema.safeParse({ ...input, groupIds: ["bad-id"] }).success).toBe(false);
    expect(bulkSlotsSchema.safeParse({ ...input, groupIds: Array.from({ length: 51 }, () => randomUUID()) }).success).toBe(false);
  });

  it("requires IDs for page scope but accepts filtered scope without IDs", () => {
    expect(bulkSlotsSchema.safeParse({ ...input, ids: [] }).success).toBe(false);
    expect(bulkSlotsSchema.safeParse({ ...input, ids: undefined, scope: "filtered", filters: { search: "laser", status: "active" } }).success).toBe(true);
  });
});

describe("setSlotsGroups", () => {
  it("replaces only targeted slot links and deduplicates groups in one transaction", async () => {
    mockDb.seed("service_groups", [{ id: "new" }]);
    mockDb.seed("booking_slot_groups", [
      { slotId: "target", groupId: "old" },
      { slotId: "untouched", groupId: "old" },
    ]);
    await setSlotsGroups(["target"], ["new", "new"]);
    expect(mockDb.data.booking_slot_groups).toEqual(expect.arrayContaining([
      expect.objectContaining({ slotId: "target", groupId: "new" }),
      expect.objectContaining({ slotId: "untouched", groupId: "old" }),
    ]));
    expect(mockDb.data.booking_slot_groups).toHaveLength(2);
    expect(mockDb.log.filter((entry) => entry.type === "transaction")).toHaveLength(1);
  });

  it("rejects unknown groups before deleting existing restrictions", async () => {
    mockDb.seed("booking_slot_groups", [{ slotId: "target", groupId: "old" }]);
    await expect(setSlotsGroups(["target"], ["missing"])).rejects.toThrow("INVALID_SERVICE_GROUP");
    expect(mockDb.data.booking_slot_groups).toEqual([{ slotId: "target", groupId: "old" }]);
    expect(mockDb.log.some((entry) => entry.type === "delete")).toBe(false);
  });

  it("an empty group list removes restrictions only from selected slots", async () => {
    mockDb.seed("booking_slot_groups", [
      { slotId: "target", groupId: "old" },
      { slotId: "untouched", groupId: "old" },
    ]);
    await setSlotsGroups(["target"], []);
    expect(mockDb.data.booking_slot_groups).toEqual([{ slotId: "untouched", groupId: "old" }]);
  });

  it("does not query for an empty slot selection", async () => {
    await setSlotsGroups([], ["group"]);
    expect(mockDb.log).toEqual([]);
  });
});
