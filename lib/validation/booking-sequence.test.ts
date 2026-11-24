import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { consecutiveDatesQuerySchema, consecutiveSlotsQuerySchema } from "./booking-sequence";
import { createBookingGroupSchema } from "./bookings";

const groupId = randomUUID();
const items = [{ groupId, quantity: 2 }, { groupId: randomUUID(), quantity: 1 }];
const query = { date: "2026-11-19", items: JSON.stringify(items) };
const input = {
  fullName: "Customer", phone: "09120000001", termsAccepted: true, sequential: true,
  items: [0, 1].map(() => ({ groupId, slotId: randomUUID(), quantity: 1 })),
};

describe("consecutive booking validation", () => {
  it("retains ordered group quantities without merging or sorting them", () => {
    expect(consecutiveSlotsQuerySchema.parse(query).items).toEqual(items);
  });

  it.each(["broken", "[]", JSON.stringify([{ groupId, quantity: 0 }]),
    JSON.stringify([{ groupId: "invalid", quantity: 1 }]),
    JSON.stringify(Array.from({ length: 11 }, () => items[0])), "x".repeat(4097),
  ])("rejects malformed or unbounded service query %s", (value) => {
    expect(consecutiveSlotsQuerySchema.safeParse({ ...query, items: value }).success).toBe(false);
  });

  it("applies the calendar's bounded date range to sequence queries", () => {
    expect(consecutiveDatesQuerySchema.safeParse({ from: "2026-11-19", to: "2027-01-17", items: query.items }).success).toBe(true);
    expect(consecutiveDatesQuerySchema.safeParse({ from: "2026-11-19", to: "2026-11-18", items: query.items }).success).toBe(false);
    expect(consecutiveDatesQuerySchema.safeParse({ from: "2026-11-19", to: "2027-11-18", items: query.items }).success).toBe(false);
  });

  it("accepts per-unit payloads, but not repeated slots or quantities in a single slot", () => {
    expect(createBookingGroupSchema.safeParse(input).success).toBe(true);
    expect(createBookingGroupSchema.safeParse({ ...input, items: [input.items[0], input.items[0]] }).success).toBe(false);
    expect(createBookingGroupSchema.safeParse({ ...input, items: [{ ...input.items[0], quantity: 2 }] }).success).toBe(false);
  });

  it("allows up to 100 sequential units, preserving the legacy 10-line limit", () => {
    const many = Array.from({ length: 100 }, () => ({ groupId, slotId: randomUUID(), quantity: 1 }));
    expect(createBookingGroupSchema.safeParse({ ...input, items: many }).success).toBe(true);
    expect(createBookingGroupSchema.safeParse({ ...input, sequential: false, items: many }).success).toBe(false);
    expect(createBookingGroupSchema.safeParse({ ...input, items: [...many, ...input.items] }).success).toBe(false);
  });
});
