import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createBookingGroup } from "./create";

const mocks = vi.hoisted(() => {
  const rows: Array<Array<Record<string, unknown>>> = [];
  const settings = new Map([["booking.price", "150000"], ["booking.currency", "تومان"]]);
  const values = vi.fn((value: Record<string, unknown>) => ({
    returning: () => Promise.resolve([{ ...value, id: "booking" }]),
  }));
  const store = {
    select: vi.fn(() => Object.assign(Promise.resolve(rows.shift() ?? []), {
      from() { return this; }, where() { return this; }, limit() { return this; }, for() { return this; },
    })),
    insert: () => ({ values }),
  };
  return { rows, settings, values, store };
});
vi.mock("@/src/db", () => ({ db: {
  ...mocks.store,
  transaction: (run: (tx: unknown) => Promise<unknown>) => run(mocks.store),
} }));
vi.mock("@/lib/settings/loader", () => ({ loadSystemSettingsMap: () => Promise.resolve(mocks.settings) }));
vi.mock("@/lib/bookings/working-hours", () => ({ loadWorkingHours: () => Promise.resolve([]) }));
vi.mock("./availability", () => ({ isOpenAt: () => true }));
vi.mock("./snapshot", () => ({ snapshotGroups: () => Promise.resolve(new Map([
  ["group-1", { title: "First" }], ["group-2", { title: "Second" }], ["group-3", { title: "Third" }],
])) }));
vi.mock("@/lib/users/customers", () => ({ ensureCustomerUser: () => Promise.resolve("customer") }));

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-11-18T08:00:00Z"));
  mocks.rows.length = 0;
  mocks.settings.set("booking.price", "150000");
});
afterEach(() => vi.useRealTimers());

async function createLines(count: number) {
  mocks.rows.push(
    [{ id: "slot", slotDate: "2026-11-19", startTime: "10:00:00", endTime: "11:00:00", capacity: 10, isActive: true }],
    [],
  );
  for (let index = 0; index < count; index++) mocks.rows.push([{ seats: 0 }], []);
  return createBookingGroup({
    fullName: "Customer", phone: "09120000001", locale: "fa",
    items: Array.from({ length: count }, (_, index) => ({ groupId: `group-${index + 1}`, slotId: "slot", quantity: 2 })),
  });
}

describe("booking group deposit allocation", () => {
  it.each([1, 3])("stores one deposit across %i lines regardless of quantity", async (count) => {
    const result = await createLines(count);
    expect(result.deposit).toBe(150000);
    expect(result.items.map((item) => item.totalAmount)).toEqual(["150000", ...Array.from({ length: count - 1 }, () => "0")]);
    expect(result.items.reduce((sum, item) => sum + Number(item.totalAmount), 0)).toBe(result.deposit);
    expect(mocks.values).toHaveBeenCalledTimes(count);
  });

  it("stores zero on every line when the configured deposit is zero", async () => {
    mocks.settings.set("booking.price", "0");
    const result = await createLines(3);
    expect(result.deposit).toBe(0);
    expect(result.items.map((item) => item.totalAmount)).toEqual(["0", "0", "0"]);
  });
});
