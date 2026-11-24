import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createBookingGroup } from "./create";

const mocks = vi.hoisted(() => {
  const rows: Array<Array<Record<string, unknown>>> = [];
  const settings = new Map([["booking.price", "150000"], ["booking.currency", "تومان"]]);
  const values = vi.fn((value: Record<string, unknown>[]) => ({
    returning: () => Promise.resolve(value.map((row, index) => ({ ...row, id: `booking-${index}` }))),
  }));
  const store = {
    select: vi.fn(() => Object.assign(Promise.resolve(rows.shift() ?? []), {
      from() { return this; }, where() { return this; }, limit() { return this; }, orderBy() { return this; }, groupBy() { return this; }, for() { return this; },
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
    [{ slotId: "slot", seats: 0 }], [], [],
  );
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
    expect(mocks.values).toHaveBeenCalledTimes(1);
    expect(mocks.values.mock.calls[0][0]).toHaveLength(count);
  });

  it("stores zero on every line when the configured deposit is zero", async () => {
    mocks.settings.set("booking.price", "0");
    const result = await createLines(3);
    expect(result.deposit).toBe(0);
    expect(result.items.map((item) => item.totalAmount)).toEqual(["0", "0", "0"]);
  });
});

function sequenceRows() {
  return [0, 1, 2].map((index) => ({
    id: `slot-${index}`, slotDate: "2026-11-19", startTime: `13:${String(index * 15).padStart(2, "0")}:00`,
    endTime: `13:${String((index + 1) * 15).padStart(2, "0")}:00`, capacity: 1, isActive: true,
  }));
}
function sequenceInput() {
  return {
    fullName: "Customer", phone: "09120000001", locale: "fa" as const, sequential: true,
    items: [0, 1, 2].map((index) => ({ groupId: `group-${index + 1}`, slotId: `slot-${index}`, quantity: 1 })),
  };
}
function seedSequence({ rows = sequenceRows(), counts = [] as Record<string, unknown>[],
  links = [] as Record<string, unknown>[], conflicts = [] as Record<string, unknown>[] } = {}) {
  mocks.rows.push(rows, counts, links, conflicts);
}

describe("atomic consecutive service booking", () => {
  it("stores each service on a distinct adjacent capacity-one slot with one deposit", async () => {
    seedSequence();
    const result = await createBookingGroup(sequenceInput());
    expect(result.items.map((item) => item.slotId)).toEqual(["slot-0", "slot-1", "slot-2"]);
    expect(result.items.map((item) => item.quantity)).toEqual([1, 1, 1]);
    expect(result.items.map((item) => item.totalAmount)).toEqual(["150000", "0", "0"]);
    expect(mocks.store.select).toHaveBeenCalledTimes(4);
    expect(mocks.values).toHaveBeenCalledTimes(1);
  });

  it("rechecks the continuation's capacity under locks before writing anything", async () => {
    seedSequence({ counts: [{ slotId: "slot-1", seats: 1 }] });
    await expect(createBookingGroup(sequenceInput())).rejects.toMatchObject({ code: "SLOT_FULL" });
    expect(mocks.values).not.toHaveBeenCalled();
  });

  it("rechecks the continuation's group restrictions", async () => {
    seedSequence({ links: [{ slotId: "slot-1", groupId: "group-1" }] });
    await expect(createBookingGroup(sequenceInput())).rejects.toMatchObject({ code: "GROUP_UNAVAILABLE" });
    expect(mocks.values).not.toHaveBeenCalled();
  });

  it.each(["gap", "next-day", "duplicate", "quantity", "inactive"])("rejects a stale/tampered %s plan without inserts", async (kind) => {
    const rows = sequenceRows();
    const input = sequenceInput();
    if (kind === "gap") rows[1].startTime = "13:20:00";
    if (kind === "next-day") rows[1].slotDate = "2026-11-20";
    if (kind === "duplicate") input.items[1].slotId = "slot-0";
    if (kind === "quantity") input.items[0].quantity = 2;
    if (kind === "inactive") rows[1].isActive = false;
    if (kind === "duplicate") {
      rows.splice(1, 1);
      rows[0].capacity = 5;
    }
    if (kind === "quantity") rows[0].capacity = 5;
    seedSequence({ rows });
    await expect(createBookingGroup(input)).rejects.toMatchObject({ code: "SLOT_UNAVAILABLE" });
    expect(mocks.values).not.toHaveBeenCalled();
  });

  it("rejects missing continuation slots", async () => {
    seedSequence({ rows: sequenceRows().slice(0, 2) });
    await expect(createBookingGroup(sequenceInput())).rejects.toMatchObject({ code: "SLOT_NOT_FOUND" });
    expect(mocks.values).not.toHaveBeenCalled();
  });

  it("allows existing customer bookings touching the new run's boundaries", async () => {
    seedSequence({ conflicts: [
      { start: new Date("2026-11-19T12:30:00"), end: new Date("2026-11-19T13:00:00") },
      { start: new Date("2026-11-19T13:45:00"), end: new Date("2026-11-19T14:00:00") },
    ] });
    expect((await createBookingGroup(sequenceInput())).items).toHaveLength(3);
  });

  it("rejects an overlapping customer booking in a continuation slot", async () => {
    seedSequence({ conflicts: [
      { start: new Date("2026-11-19T13:20:00"), end: new Date("2026-11-19T13:25:00") },
    ] });
    await expect(createBookingGroup(sequenceInput())).rejects.toMatchObject({ code: "CUSTOMER_CONFLICT" });
    expect(mocks.values).not.toHaveBeenCalled();
  });
});
