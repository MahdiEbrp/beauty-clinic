import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Booking } from "@/src/db/schema";

const dbMock = vi.hoisted(() => {
  const selectQueue: unknown[][] = [];
  const updateCalls: Array<{ set: Record<string, unknown>; returningResult: unknown[] }> = [];
  const deleteCalls: unknown[] = [];

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
    updateCalls,
    deleteCalls,
    db: {
      select: () => makeChain(selectQueue.shift() ?? []),
      update: () => ({
        set: (values: Record<string, unknown>) => ({
          where: () => ({
            returning: () => {
              const entry = { set: values, returningResult: [] as unknown[] };
              updateCalls.push(entry);
              return Promise.resolve(entry.returningResult);
            },
          }),
        }),
      }),
      delete: () => ({
        where: (clause: unknown) => {
          deleteCalls.push(clause);
          return Promise.resolve([]);
        },
      }),
    },
  };
});

vi.mock("server-only", () => ({}));
vi.mock("@/src/db", () => ({ db: dbMock.db }));

import {
  deleteBooking,
  getBookingGroupById,
  listBookings,
  listRecentBookings,
  updateBookingDetails,
  updateBookingStatus,
} from "./service";

function makeRow(overrides: Partial<Booking> = {}): Booking {
  return {
    id: "00000000-0000-4000-8000-000000000001",
    groupRef: "NF-10001",
    customerId: null,
    fullName: "مریم کریمی",
    phone: "09121112233",
    email: null,
    groupId: "svc-1",
    groupTitle: "پاکسازی پوست",
    slotId: "slot-1",
    quantity: 1,
    totalAmount: "100000",
    currency: "تومان",
    slotStart: new Date("2026-12-02T08:00:00.000Z"),
    slotEnd: new Date("2026-12-02T08:30:00.000Z"),
    status: "paid",
    paymentReference: "PAY-1",
    notes: null,
    consultationRequired: false,
    hasAllergies: false,
    isPregnant: false,
    termsAcceptedAt: null,
    reminderSentAt: null,
    createdBy: null,
    createdAt: new Date("2026-11-26T09:00:00.000Z"),
    updatedAt: new Date("2026-11-26T09:00:00.000Z"),
    ...overrides,
  };
}

describe("booking service grouping and whole-group mutations", () => {
  beforeEach(() => {
    dbMock.selectQueue.length = 0;
    dbMock.updateCalls.length = 0;
    dbMock.deleteCalls.length = 0;
  });

  it("returns one grouped ReservationAdmin per groupRef in listBookings", async () => {
    const line1 = makeRow({
      id: "00000000-0000-4000-8000-000000000010",
      groupRef: "NF-20001",
      groupTitle: "فیشیال",
      totalAmount: "100000",
      slotStart: new Date("2026-12-02T08:00:00.000Z"),
      slotEnd: new Date("2026-12-02T08:30:00.000Z"),
    });
    const line2 = makeRow({
      id: "00000000-0000-4000-8000-000000000011",
      groupRef: "NF-20001",
      groupTitle: "مزوتراپی",
      totalAmount: "0",
      slotStart: new Date("2026-12-02T08:30:00.000Z"),
      slotEnd: new Date("2026-12-02T09:00:00.000Z"),
    });

    dbMock.selectQueue.push(
      [{ count: 1 }],
      [{ groupRef: "NF-20001" }],
      [line2, line1],
    );

    const res = await listBookings({ page: 1, perPage: 10, status: "all" });
    expect(res.total).toBe(1);
    expect(res.items).toHaveLength(1);
    expect(res.items[0]).toMatchObject({
      groupRef: "NF-20001",
      totalAmount: 100000,
      itemCount: 2,
      groupTitle: "فیشیال، مزوتراپی",
      slotStart: "2026-12-02T08:00:00.000Z",
      slotEnd: "2026-12-02T09:00:00.000Z",
    });
  });

  it("loads grouped recent bookings and edit-page orders via getBookingGroupById", async () => {
    const line1 = makeRow({ id: "id-1", groupRef: "NF-30001", totalAmount: "100000" });
    const line2 = makeRow({ id: "id-2", groupRef: "NF-30001", totalAmount: "0", groupTitle: "لیزر" });

    dbMock.selectQueue.push([{ groupRef: "NF-30001" }], [line1, line2]);
    const recent = await listRecentBookings(5);
    expect(recent).toHaveLength(1);
    expect(recent[0]?.totalAmount).toBe(100000);
    expect(recent[0]?.items).toHaveLength(2);

    dbMock.selectQueue.push([line2], [line1, line2]);
    const order = await getBookingGroupById("id-2");
    expect(order.groupRef).toBe("NF-30001");
    expect(order.totalAmount).toBe(100000);
    expect(order.itemCount).toBe(2);
  });

  it("propagates status, customer updates, and deletion across the whole groupRef", async () => {
    const row1 = makeRow({ id: "id-1", groupRef: "NF-40001", status: "pending", paymentReference: null });
    const row2 = makeRow({ id: "id-2", groupRef: "NF-40001", status: "pending", paymentReference: null, totalAmount: "0" });

    dbMock.selectQueue.push([row2]);
    await updateBookingStatus("id-2", "done");
    expect(dbMock.updateCalls).toHaveLength(1);
    expect(dbMock.updateCalls[0]?.set.status).toBe("done");

    dbMock.selectQueue.push([row2], [row1, row2]);
    await updateBookingDetails("id-2", { fullName: "نام جدید", status: "paid" });
    expect(dbMock.updateCalls).toHaveLength(2);
    expect(dbMock.updateCalls[1]?.set.fullName).toBe("نام جدید");
    expect(dbMock.updateCalls[1]?.set.status).toBe("paid");
    expect(typeof dbMock.updateCalls[1]?.set.paymentReference).toBe("string");

    dbMock.selectQueue.push([{ id: "id-2", groupRef: "NF-40001" }]);
    await deleteBooking("id-2");
    expect(dbMock.deleteCalls).toHaveLength(1);
  });
});
