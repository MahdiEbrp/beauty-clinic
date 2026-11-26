import { inflateRawSync } from "node:zlib";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Booking } from "@/src/db/schema";

const dbMock = vi.hoisted(() => {
  const selectQueue: unknown[][] = [];
  const makeChain = (rows: unknown[]) => {
    const chain: Record<string, unknown> = {
      from: () => chain,
      where: () => chain,
      groupBy: () => chain,
      orderBy: () => chain,
      limit: () => chain,
      then: (resolve: (value: unknown[]) => unknown, reject?: (err: unknown) => unknown) =>
        Promise.resolve(rows).then(resolve, reject),
    };
    return chain;
  };
  return {
    selectQueue,
    db: {
      select: () => makeChain(selectQueue.shift() ?? []),
    },
  };
});

vi.mock("server-only", () => ({}));
vi.mock("@/src/db", () => ({ db: dbMock.db }));

import { exportBookingsQuerySchema } from "@/lib/validation/bookings";
import { exportBookingsToXlsx } from "./export";

function extractWorksheetXml(buffer: Buffer): string {
  let eocd = -1;
  for (let i = buffer.length - 22; i >= 0; i -= 1) {
    if (buffer.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  const count = buffer.readUInt16LE(eocd + 10);
  let cursor = buffer.readUInt32LE(eocd + 16);
  for (let i = 0; i < count; i += 1) {
    const nameLen = buffer.readUInt16LE(cursor + 28);
    const extraLen = buffer.readUInt16LE(cursor + 30);
    const commentLen = buffer.readUInt16LE(cursor + 32);
    const localOffset = buffer.readUInt32LE(cursor + 42);
    const name = buffer.subarray(cursor + 46, cursor + 46 + nameLen).toString("utf8");
    if (name === "xl/worksheets/sheet1.xml") {
      const localNameLen = buffer.readUInt16LE(localOffset + 26);
      const localExtraLen = buffer.readUInt16LE(localOffset + 28);
      const size = buffer.readUInt32LE(localOffset + 18);
      const start = localOffset + 30 + localNameLen + localExtraLen;
      return inflateRawSync(buffer.subarray(start, start + size)).toString("utf8");
    }
    cursor += 46 + nameLen + extraLen + commentLen;
  }
  throw new Error("sheet1.xml missing");
}

function makeRow(overrides: Partial<Booking> = {}): Booking {
  return {
    id: "00000000-0000-4000-8000-000000000001",
    groupRef: "NF-88888",
    customerId: null,
    fullName: "زهرا حسینی",
    phone: "09123334455",
    email: "zahra@example.com",
    groupId: "svc-1",
    groupTitle: "لیزر بیکینی",
    slotId: "slot-1",
    quantity: 1,
    totalAmount: "100000",
    currency: "تومان",
    slotStart: new Date("2026-11-26T06:30:00.000Z"), // 10:00 Asia/Tehran -> 1405/09/05
    slotEnd: new Date("2026-11-26T07:00:00.000Z"),   // 10:30 Asia/Tehran
    status: "paid",
    paymentReference: "REF-777",
    notes: "یادداشت تست",
    consultationRequired: false,
    hasAllergies: false,
    isPregnant: false,
    termsAcceptedAt: null,
    reminderSentAt: null,
    createdBy: null,
    createdAt: new Date("2026-11-26T05:00:00.000Z"),
    updatedAt: new Date("2026-11-26T05:00:00.000Z"),
    ...overrides,
  };
}

describe("booking Excel export", () => {
  beforeEach(() => {
    dbMock.selectQueue.length = 0;
  });

  it("validates query params and falls back cleanly on defaults", () => {
    expect(exportBookingsQuerySchema.parse({})).toEqual({
      status: "all",
      locale: "fa",
    });
    expect(() =>
      exportBookingsQuerySchema.parse({ locale: "de" }),
    ).toThrow();
  });

  it("exports multi-service grouped orders as one RTL Persian row with Jalali dates and summed amount", async () => {
    const line1 = makeRow({
      id: "id-1",
      groupRef: "NF-88888",
      groupTitle: "فیشیال کلاسیک",
      totalAmount: "100000",
      slotStart: new Date("2026-11-26T06:30:00.000Z"),
      slotEnd: new Date("2026-11-26T07:00:00.000Z"),
    });
    const line2 = makeRow({
      id: "id-2",
      groupRef: "NF-88888",
      groupTitle: "میکرونیدلینگ",
      totalAmount: "0",
      slotStart: new Date("2026-11-26T07:00:00.000Z"),
      slotEnd: new Date("2026-11-26T07:30:00.000Z"),
      paymentReference: null,
    });

    dbMock.selectQueue.push([{ groupRef: "NF-88888" }], [line2, line1]);

    const { buffer, filename } = await exportBookingsToXlsx({
      status: "all",
      locale: "fa",
      tz: "Asia/Tehran",
    });

    expect(filename).toMatch(/^reservations-\d{4}-\d{2}-\d{2}\.xlsx$/);
    const sheetXml = extractWorksheetXml(buffer);

    expect(sheetXml).toContain('rightToLeft="1"');
    expect(sheetXml).toContain("کد سفارش");
    expect(sheetXml).toContain("NF-88888");
    expect(sheetXml).toContain("فیشیال کلاسیک، میکرونیدلینگ");
    expect(sheetXml).toContain("09123334455");
    expect(sheetXml).toContain("<v>100000</v>");
    expect(sheetXml).toContain("1405/09/05 — 10:00–11:00");
    expect(sheetXml).toContain("پرداخت‌شده");
    // Only 1 header row + 1 grouped data row (not 2 split rows).
    expect(sheetXml.match(/<row /g)).toHaveLength(2);
  });

  it("supports English LTR export with Gregorian dates", async () => {
    const line1 = makeRow({
      groupRef: "NF-12345",
      groupTitle: "Facial",
      status: "done",
    });
    dbMock.selectQueue.push([{ groupRef: "NF-12345" }], [line1]);

    const { buffer } = await exportBookingsToXlsx({
      status: "done",
      locale: "en",
      tz: "UTC",
    });

    const sheetXml = extractWorksheetXml(buffer);
    expect(sheetXml).not.toContain('rightToLeft="1"');
    expect(sheetXml).toContain("Order Ref");
    expect(sheetXml).toContain("2026/11/26 — 06:30–07:00");
    expect(sheetXml).toContain("Done");
  });
});
