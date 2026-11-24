import { beforeEach, describe, expect, it, vi } from "vitest";
import { availableConsecutiveDates, availableConsecutiveSlots } from "./slot-queries";

const mocks = vi.hoisted(() => {
  const rows: Record<string, unknown>[][] = [];
  const select = vi.fn(() => Object.assign(Promise.resolve(rows.shift() ?? []), {
    from() { return this; }, where() { return this; }, orderBy() { return this; }, groupBy() { return this; },
  }));
  return { rows, select };
});
vi.mock("@/src/db", () => ({ db: { select: mocks.select } }));
beforeEach(() => { mocks.rows.length = 0; vi.clearAllMocks(); });

const items = [{ groupId: "a", quantity: 1 }, { groupId: "b", quantity: 1 }];
function seed(full = false) {
  mocks.rows.push(
    [0, 1, 2, 3].map((i) => ({
      id: `s${i}`, slotDate: "2099-01-01", startTime: `13:${String(i * 15).padStart(2, "0")}`,
      endTime: i === 3 ? "14:00" : `13:${String((i + 1) * 15).padStart(2, "0")}`,
      capacity: 1, isActive: true,
    })),
    full ? [{ slotId: "s1", count: 1 }, { slotId: "s3", count: 1 }] : [],
    [],
  );
}

describe("consecutive slot and calendar availability", () => {
  it("returns all sliding starts and their real per-service slot IDs", async () => {
    seed();
    const options = await availableConsecutiveSlots("2099-01-01", items);
    expect(options.map((o) => o.startTime)).toEqual(["13:00", "13:15", "13:30"]);
    expect(options[1].assignments.map((a) => [a.groupId, a.slot.id])).toEqual([["a", "s1"], ["b", "s2"]]);
    expect(mocks.select).toHaveBeenCalledTimes(3);
  });

  it("calendar includes a date exactly when that date has a complete run", async () => {
    seed();
    expect(await availableConsecutiveDates("2099-01-01", "2099-01-02", items)).toEqual(["2099-01-01"]);
    seed(true);
    expect(await availableConsecutiveDates("2099-01-01", "2099-01-02", items)).toEqual([]);
    seed(true);
    expect(await availableConsecutiveSlots("2099-01-01", items)).toEqual([]);
  });
});
