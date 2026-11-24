import { describe, expect, it } from "vitest";
import { consecutiveOptions, type ConsecutiveSlot } from "./consecutive-slots";

const now = new Date("2026-11-18T08:00:00").getTime();
function slot(start: string, end: string, overrides: Partial<ConsecutiveSlot> = {}): ConsecutiveSlot {
  return {
    id: start, slotDate: "2026-11-19", startTime: start, endTime: end,
    groupIds: [], capacity: 1, bookedCount: 0, isActive: true, available: true, ...overrides,
  };
}
const rows = [slot("13:00", "13:15"), slot("13:15", "13:30"), slot("13:30", "13:45"), slot("13:45", "14:00")];
const request = (quantity: number) => [{ groupId: "a", quantity }];

describe("consecutive service start choices", () => {
  it.each([1, 2, 3, 4])("offers every possible sliding start for %i services", (quantity) => {
    const options = consecutiveOptions(rows, request(quantity), now);
    expect(options.map((o) => o.startTime)).toEqual(rows.slice(0, 5 - quantity).map((r) => r.startTime));
    expect(options.every((o) => o.assignments.length === quantity)).toBe(true);
    expect(options.every((o) => new Set(o.assignments.map((a) => a.slot.id)).size === quantity)).toBe(true);
  });

  it("does not require all services to fit in one slot's capacity", () => {
    const result = consecutiveOptions(rows, [{ groupId: "a", quantity: 1 }, { groupId: "b", quantity: 1 }], now);
    expect(result[0].assignments.map((a) => [a.groupId, a.slot.id])).toEqual([["a", "13:00"], ["b", "13:15"]]);
    expect(result[1].startTime).toBe("13:15");
  });

  it.each([
    { available: false }, { isActive: false }, { bookedCount: 1 },
  ])("never skips an unusable slot in the middle: %j", (change) => {
    const input = rows.map((r, i) => i === 1 ? { ...r, ...change } : r);
    expect(consecutiveOptions(input, request(2), now).map((o) => o.id)).toEqual(["13:30"]);
  });

  it("uses one remaining seat in each slot, even if other seats are taken", () => {
    const input = rows.map((r) => ({ ...r, capacity: 2, bookedCount: 1 }));
    expect(consecutiveOptions(input, request(2), now)).toHaveLength(3);
  });

  it("does not bridge a missing time, a day boundary, or an overlapping interval", () => {
    expect(consecutiveOptions([rows[0], rows[2]], request(2), now)).toEqual([]);
    expect(consecutiveOptions([rows[0], { ...rows[1], slotDate: "2026-11-20" }], request(2), now)).toEqual([]);
    expect(consecutiveOptions([slot("13:00", "13:30"), rows[1]], request(2), now)).toEqual([]);
  });

  it("checks the assigned group's eligibility in sequence, not every group in every slot", () => {
    const input = rows.map((r, i) => ({ ...r, groupIds: [i % 2 === 0 ? "a" : "b"] }));
    const orders = [{ groupId: "a", quantity: 1 }, { groupId: "b", quantity: 1 }];
    expect(consecutiveOptions(input, orders, now).map((o) => o.id)).toEqual(["13:00", "13:30"]);
    expect(consecutiveOptions(input, [...orders].reverse(), now).map((o) => o.id)).toEqual(["13:15"]);
  });

  it("uses actual slot ends (not a hardcoded duration) and normalizes seconds", () => {
    const input = [slot("13:30:00", "14:00:00"), slot("13:00", "13:30")];
    expect(consecutiveOptions(input, request(2), now)[0].assignments.map((a) => a.slot.id)).toEqual(["13:00", "13:30:00"]);
  });

  it("removes past starts, even if the slot has not ended yet", () => {
    expect(consecutiveOptions(rows, request(1), new Date("2026-11-19T13:05:00").getTime()).map((o) => o.id))
      .toEqual(["13:15", "13:30", "13:45"]);
  });

  it.each([0, -1, 1.5, 101])("rejects invalid or excessive quantities %i", (quantity) => {
    expect(consecutiveOptions(rows, request(quantity), now)).toEqual([]);
  });

  it("returns nothing without services or with insufficient time", () => {
    expect(consecutiveOptions(rows, [], now)).toEqual([]);
    expect(consecutiveOptions(rows, request(5), now)).toEqual([]);
  });
});
