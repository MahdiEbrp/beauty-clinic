import { describe, expect, it } from "vitest";
import type { Booking } from "@/src/db/schema";

import {
  aggregateBookingGroup,
  formatLineTitles,
  groupBookingRowsInOrder,
} from "./grouping";

function makeRow(overrides: Partial<Booking> = {}): Booking {
  const id = overrides.id ?? "11111111-1111-4111-8111-111111111111";
  return {
    id,
    groupRef: "NF-10001",
    customerId: "cust-1",
    fullName: "نگین راد",
    phone: "09121234567",
    email: null,
    groupId: "svc-grp-1",
    groupTitle: "فیشیال تخصصی",
    slotId: "slot-1",
    quantity: 1,
    totalAmount: "100000",
    currency: "تومان",
    slotStart: new Date("2026-12-01T07:00:00.000Z"),
    slotEnd: new Date("2026-12-01T07:30:00.000Z"),
    status: "paid",
    paymentReference: "PAY-123",
    notes: null,
    consultationRequired: false,
    hasAllergies: false,
    isPregnant: false,
    termsAcceptedAt: null,
    reminderSentAt: null,
    createdBy: null,
    createdAt: new Date("2026-11-26T08:00:00.000Z"),
    updatedAt: new Date("2026-11-26T08:00:00.000Z"),
    ...overrides,
  };
}

describe("booking grouping helpers", () => {
  it("merges multiple service rows sharing one groupRef into a single row with combined deposit", () => {
    const first = makeRow({
      id: "aaaa0001-0000-4000-8000-000000000001",
      groupRef: "NF-55555",
      groupId: "grp-1",
      groupTitle: "فیشیال تخصصی",
      totalAmount: "100000",
      slotStart: new Date("2026-12-01T07:00:00.000Z"),
      slotEnd: new Date("2026-12-01T07:30:00.000Z"),
      paymentReference: "PAY-555",
    });
    const second = makeRow({
      id: "aaaa0002-0000-4000-8000-000000000002",
      groupRef: "NF-55555",
      groupId: "grp-2",
      groupTitle: "لیزر صورت",
      quantity: 2,
      totalAmount: "0",
      slotStart: new Date("2026-12-01T07:30:00.000Z"),
      slotEnd: new Date("2026-12-01T08:00:00.000Z"),
      paymentReference: null,
    });

    // Pass rows out of chronological order to verify sorting.
    const grouped = aggregateBookingGroup([second, first]);

    expect(grouped.groupRef).toBe("NF-55555");
    expect(grouped.id).toBe(first.id);
    expect(grouped.totalAmount).toBe(100000);
    expect(grouped.itemCount).toBe(2);
    expect(grouped.groupTitle).toBe("فیشیال تخصصی، لیزر صورت ×2");
    expect(grouped.slotStart).toBe("2026-12-01T07:00:00.000Z");
    expect(grouped.slotEnd).toBe("2026-12-01T08:00:00.000Z");
    expect(grouped.paymentReference).toBe("PAY-555");
    expect(grouped.items.map((i) => i.groupTitle)).toEqual([
      "فیشیال تخصصی",
      "لیزر صورت",
    ]);
    expect(grouped.items[1]?.quantity).toBe(2);
  });

  it("prefers active status when aggregating a mixed-status group and respects preferredStatus filter", () => {
    const refunded = makeRow({
      id: "bbbb0001-0000-4000-8000-000000000001",
      status: "refunded",
      totalAmount: "0",
      slotStart: new Date("2026-12-01T07:00:00.000Z"),
    });
    const waiting = makeRow({
      id: "bbbb0002-0000-4000-8000-000000000002",
      status: "waiting",
      totalAmount: "100000",
      slotStart: new Date("2026-12-01T07:30:00.000Z"),
    });

    const defaultView = aggregateBookingGroup([refunded, waiting]);
    expect(defaultView.status).toBe("waiting");
    expect(defaultView.id).toBe(waiting.id);

    const filteredRefunded = aggregateBookingGroup([refunded, waiting], "refunded");
    expect(filteredRefunded.status).toBe("refunded");
  });

  it("groups rows preserving paginated groupRef order", () => {
    const r1 = makeRow({ id: "1", groupRef: "NF-1", groupTitle: "A", totalAmount: "100000" });
    const r2a = makeRow({ id: "2", groupRef: "NF-2", groupTitle: "B", totalAmount: "100000" });
    const r2b = makeRow({ id: "3", groupRef: "NF-2", groupTitle: "C", totalAmount: "0" });

    const out = groupBookingRowsInOrder(["NF-2", "NF-1"], [r1, r2b, r2a]);
    expect(out.map((item) => item.groupRef)).toEqual(["NF-2", "NF-1"]);
    expect(out[0]?.itemCount).toBe(2);
    expect(out[0]?.totalAmount).toBe(100000);
    expect(out[1]?.itemCount).toBe(1);
  });

  it("formats line titles cleanly with quantities", () => {
    expect(
      formatLineTitles(
        [
          { groupTitle: "بوتاکس", quantity: 1 },
          { groupTitle: "فیلر لب", quantity: 2 },
        ],
        ", ",
      ),
    ).toBe("بوتاکس, فیلر لب ×2");
  });
});
