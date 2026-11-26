import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Booking } from "@/src/db/schema";
import type * as GroupsModule from "./groups";

const mockDeps = vi.hoisted(() => {
  const selectQueue: unknown[][] = [];
  const cancelBookingRows = vi.fn(() => Promise.resolve({ cancelled: 2 }));
  const loadMinCancelHours = vi.fn(() => Promise.resolve(24));

  const makeChain = (rows: unknown[]) => {
    const chain: Record<string, unknown> = {
      from: () => chain,
      where: () => chain,
      groupBy: () => chain,
      orderBy: () => chain,
      limit: () => chain,
      offset: () => chain,
      then: (resolve: (value: unknown[]) => unknown, reject?: (err: unknown) => unknown) =>
        Promise.resolve(rows).then(resolve, reject),
    };
    return chain;
  };

  return {
    selectQueue,
    cancelBookingRows,
    loadMinCancelHours,
    db: {
      select: () => makeChain(selectQueue.shift() ?? []),
    },
  };
});

vi.mock("server-only", () => ({}));
vi.mock("@/src/db", () => ({ db: mockDeps.db }));
vi.mock("./groups", async (importOriginal) => {
  const actual = await importOriginal<typeof GroupsModule>();
  return {
    ...actual,
    cancelBookingRows: mockDeps.cancelBookingRows,
    loadMinCancelHours: mockDeps.loadMinCancelHours,
  };
});

import { cancelMyBooking, listMyBookings } from "./mine";

function makeRow(overrides: Partial<Booking> = {}): Booking {
  return {
    id: "00000000-0000-4000-8000-000000000001",
    groupRef: "NF-70001",
    customerId: "cust-1",
    fullName: "الهام موسوی",
    phone: "09124445566",
    email: null,
    groupId: "svc-1",
    groupTitle: "فیشیال",
    slotId: "slot-1",
    quantity: 1,
    totalAmount: "100000",
    currency: "تومان",
    slotStart: new Date(Date.now() + 72 * 60 * 60 * 1000),
    slotEnd: new Date(Date.now() + 73 * 60 * 60 * 1000),
    status: "paid",
    paymentReference: "PAY-700",
    notes: null,
    consultationRequired: false,
    hasAllergies: false,
    isPregnant: false,
    termsAcceptedAt: null,
    reminderSentAt: null,
    createdBy: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe("customer own-bookings grouping", () => {
  beforeEach(() => {
    mockDeps.selectQueue.length = 0;
    vi.clearAllMocks();
  });

  it("groups multi-service customer bookings into one row with summed deposit", async () => {
    const line1 = makeRow({ id: "b1", groupTitle: "فیشیال", totalAmount: "100000" });
    const line2 = makeRow({ id: "b2", groupTitle: "لیزر", totalAmount: "0" });

    mockDeps.selectQueue.push(
      [{ count: 1 }],
      [{ groupRef: "NF-70001" }],
      [line1, line2],
    );

    const page = await listMyBookings(
      { userId: "cust-1", phoneDigits: "9124445566" },
      { page: 1, perPage: 10, status: "all" },
    );

    expect(page.total).toBe(1);
    expect(page.items).toHaveLength(1);
    expect(page.items[0]?.totalAmount).toBe(100000);
    expect(page.items[0]?.itemCount).toBe(2);
    expect(page.items[0]?.canCancel).toBe(true);
  });

  it("cancels every sibling line sharing the target groupRef", async () => {
    const line1 = makeRow({ id: "b1", groupRef: "NF-70001", totalAmount: "100000" });
    const line2 = makeRow({ id: "b2", groupRef: "NF-70001", totalAmount: "0" });

    mockDeps.selectQueue.push([line1], [line1, line2]);

    const res = await cancelMyBooking(
      { userId: "cust-1", phoneDigits: "9124445566" },
      "b1",
    );

    expect(res.cancelled).toBe(2);
    expect(mockDeps.cancelBookingRows).toHaveBeenCalledWith([line1, line2]);
  });

  it("rejects cancelling another customer's booking with 404", async () => {
    const foreign = makeRow({
      id: "b9",
      customerId: "other-user",
      phone: "09129998877",
    });
    mockDeps.selectQueue.push([foreign]);

    await expect(
      cancelMyBooking({ userId: "cust-1", phoneDigits: "9124445566" }, "b9"),
    ).rejects.toMatchObject({ status: 404 });
    expect(mockDeps.cancelBookingRows).not.toHaveBeenCalled();
  });
});
