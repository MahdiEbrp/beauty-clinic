import { describe, expect, it } from "vitest";
import { bulkSlotsSchema, listSlotsAdminQuerySchema } from "./booking-slots";
import en from "@/messages/en.json";
import fa from "@/messages/fa.json";

const filters = {
  search: "laser", status: "active", groupId: "00000000-0000-4000-8000-000000000001",
  from: "2026-11-01", to: "2026-11-30",
};

describe("slot admin filters", () => {
  it("accepts group and date filters for lists and filtered bulk operations", () => {
    expect(listSlotsAdminQuerySchema.parse(filters)).toMatchObject(filters);
    expect(bulkSlotsSchema.parse({ action: "delete", scope: "filtered", filters }).filters).toEqual(filters);
  });

  it("accepts open-ended and same-day ranges", () => {
    for (const range of [{ from: filters.from }, { to: filters.to }, { from: filters.from, to: filters.from }]) {
      expect(listSlotsAdminQuerySchema.safeParse(range).success).toBe(true);
      expect(bulkSlotsSchema.safeParse({ action: "activate", scope: "filtered", filters: range }).success).toBe(true);
    }
  });

  it("rejects reversed ranges on both read and mutation paths", () => {
    const reversed = { ...filters, from: filters.to, to: filters.from };
    expect(listSlotsAdminQuerySchema.safeParse(reversed).success).toBe(false);
    const parsed = bulkSlotsSchema.safeParse({ action: "delete", scope: "filtered", filters: reversed });
    expect(parsed.success).toBe(false);
    if (!parsed.success) expect(parsed.error.issues[0].path).toEqual(["filters", "to"]);
  });

  it("rejects invalid group IDs and unexpected filter fields", () => {
    for (const invalid of [{ groupId: "bad" }, { page: 1 }, { from: "bad" }]) {
      expect(bulkSlotsSchema.safeParse({ action: "activate", scope: "filtered", filters: invalid }).success).toBe(false);
    }
  });

  it("defines every filter label in the correct namespace in both languages", () => {
    for (const messages of [en, fa]) {
      for (const key of ["group", "from", "to"] as const) {
        expect(typeof messages.bookingSlots.filters[key]).toBe("string");
        expect(messages.bookingSlots.filters[key].length).toBeGreaterThan(0);
      }
    }
  });
});
