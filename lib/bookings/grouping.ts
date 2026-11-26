import { and, eq, or, sql, type SQL } from "drizzle-orm";

import { bookings, type Booking, type BookingStatus } from "@/src/db/schema";

import type { ReservationAdmin, ReservationLineItem } from "./admin-types";

const STATUS_PRIORITY: readonly BookingStatus[] = [
  "waiting",
  "paid",
  "pending",
  "done",
  "refunded",
];

const ACTIVE_STATUSES: ReadonlySet<BookingStatus> = new Set([
  "pending",
  "paid",
  "waiting",
]);

export type BookingQueryFilters = {
  search?: string;
  status?: "all" | BookingStatus;
  slotId?: string;
};

/** Shared filter builder for admin bookings listing, bulk lookups, and export. */
export function bookingSearchFilter(opts: BookingQueryFilters): SQL | undefined {
  const conditions: SQL[] = [];

  if (opts.slotId) {
    conditions.push(eq(bookings.slotId, opts.slotId));
  }
  if (opts.status && opts.status !== "all") {
    conditions.push(eq(bookings.status, opts.status));
  }
  if (opts.search?.trim()) {
    const term = `%${opts.search.trim()}%`;
    conditions.push(
      or(
        sql`${bookings.fullName} ILIKE ${term}`,
        sql`${bookings.phone} ILIKE ${term}`,
        sql`${bookings.groupTitle} ILIKE ${term}`,
        sql`${bookings.email} ILIKE ${term}`,
        sql`${bookings.groupRef} ILIKE ${term}`,
      ) as SQL,
    );
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
}

function toTimestamp(value: Date | string | null | undefined): number | null {
  if (!value) return null;
  const ms = new Date(value).getTime();
  return Number.isFinite(ms) ? ms : null;
}

function sortOrderRows(rows: readonly Booking[]): Booking[] {
  return [...rows].sort((a, b) => {
    const aStart = toTimestamp(a.slotStart) ?? Number.MAX_SAFE_INTEGER;
    const bStart = toTimestamp(b.slotStart) ?? Number.MAX_SAFE_INTEGER;
    if (aStart !== bStart) return aStart - bStart;

    const aCreated = toTimestamp(a.createdAt) ?? 0;
    const bCreated = toTimestamp(b.createdAt) ?? 0;
    if (aCreated !== bCreated) return aCreated - bCreated;

    return a.id.localeCompare(b.id);
  });
}

function resolveGroupStatus(
  rows: readonly Booking[],
  preferredStatus?: BookingStatus,
): BookingStatus {
  if (preferredStatus && rows.some((row) => row.status === preferredStatus)) {
    return preferredStatus;
  }
  for (const status of STATUS_PRIORITY) {
    if (rows.some((row) => row.status === status)) {
      return status;
    }
  }
  return rows[0].status;
}

function pickRepresentativeRow(rows: readonly Booking[]): Booking {
  return (
    rows.find((row) => ACTIVE_STATUSES.has(row.status)) ??
    rows.find((row) => Boolean(row.paymentReference) || Number(row.totalAmount ?? 0) > 0) ??
    rows[0]
  );
}

/** Formats all line item titles for display/search fallback. */
export function formatLineTitles(
  items: readonly Pick<ReservationLineItem, "groupTitle" | "quantity">[],
  separator = "، ",
): string {
  return items
    .map((item) => {
      const title = item.groupTitle.trim();
      if (!title) return "";
      return item.quantity > 1 ? `${title} ×${item.quantity}` : title;
    })
    .filter(Boolean)
    .join(separator);
}

/**
 * Collapses all `bookings` rows sharing one `groupRef` into a single
 * order-level reservation record with summed deposit (`totalAmount`) and
 * chronological line items.
 */
export function aggregateBookingGroup(
  rows: readonly Booking[],
  preferredStatus?: BookingStatus,
): ReservationAdmin {
  if (rows.length === 0) {
    throw new Error("Cannot aggregate an empty booking group.");
  }

  const sorted = sortOrderRows(rows);
  const rep = pickRepresentativeRow(sorted);
  const status = resolveGroupStatus(sorted, preferredStatus);

  const items: ReservationLineItem[] = sorted.map((row) => ({
    id: row.id,
    groupId: row.groupId ?? null,
    groupTitle: row.groupTitle,
    quantity: row.quantity,
    slotStart: row.slotStart ? new Date(row.slotStart).toISOString() : null,
    slotEnd: row.slotEnd ? new Date(row.slotEnd).toISOString() : null,
    status: row.status,
  }));

  const startMs = sorted
    .map((row) => toTimestamp(row.slotStart))
    .filter((ms): ms is number => ms !== null);
  const endMs = sorted
    .map((row) => toTimestamp(row.slotEnd))
    .filter((ms): ms is number => ms !== null);
  const createdMs = sorted
    .map((row) => toTimestamp(row.createdAt))
    .filter((ms): ms is number => ms !== null);

  const totalAmount = sorted.reduce(
    (sum, row) => sum + (Number.isFinite(Number(row.totalAmount)) ? Number(row.totalAmount) : 0),
    0,
  );

  return {
    id: rep.id,
    groupRef: rep.groupRef,
    fullName: sorted.find((r) => r.fullName.trim())?.fullName ?? rep.fullName,
    phone: sorted.find((r) => r.phone.trim())?.phone ?? rep.phone,
    email: sorted.find((r) => Boolean(r.email))?.email ?? null,
    groupId: rep.groupId ?? null,
    groupTitle: formatLineTitles(items, "، ") || rep.groupTitle,
    totalAmount,
    currency: rep.currency,
    slotStart: startMs.length > 0 ? new Date(Math.min(...startMs)).toISOString() : null,
    slotEnd: endMs.length > 0 ? new Date(Math.max(...endMs)).toISOString() : null,
    status,
    paymentReference: sorted.find((r) => Boolean(r.paymentReference))?.paymentReference ?? null,
    createdAt:
      createdMs.length > 0
        ? new Date(Math.min(...createdMs)).toISOString()
        : new Date().toISOString(),
    notes: sorted.find((r) => Boolean(r.notes))?.notes ?? null,
    itemCount: items.length,
    items,
  };
}

/**
 * Groups `rows` by `groupRef` preserving the exact order of `orderedRefs`.
 */
export function groupBookingRowsInOrder(
  orderedRefs: readonly string[],
  rows: readonly Booking[],
  preferredStatus?: BookingStatus,
): ReservationAdmin[] {
  const byRef = new Map<string, Booking[]>();
  for (const row of rows) {
    const list = byRef.get(row.groupRef);
    if (list) list.push(row);
    else byRef.set(row.groupRef, [row]);
  }

  const result: ReservationAdmin[] = [];
  for (const ref of orderedRefs) {
    const groupRows = byRef.get(ref);
    if (groupRows && groupRows.length > 0) {
      result.push(aggregateBookingGroup(groupRows, preferredStatus));
    }
  }
  return result;
}
