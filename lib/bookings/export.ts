import "server-only";

import { desc, inArray, sql } from "drizzle-orm";

import { buildXlsxWorkbook, type XlsxCell, type XlsxColumn } from "@/lib/export/xlsx";
import { getApiTranslations } from "@/lib/i18n/api-translations";
import type { ExportBookingsQuery } from "@/lib/validation/bookings";
import { db } from "@/src/db";
import { bookings } from "@/src/db/schema";

import {
  bookingSearchFilter,
  formatLineTitles,
  groupBookingRowsInOrder,
} from "./grouping";

const MAX_EXPORT_ORDERS = 5000;
const DEFAULT_TIMEZONE = "Asia/Tehran";

function resolveTimeZone(tz?: string): string {
  if (!tz?.trim()) return DEFAULT_TIMEZONE;
  try {
    new Intl.DateTimeFormat("en", { timeZone: tz.trim() });
    return tz.trim();
  } catch {
    return DEFAULT_TIMEZONE;
  }
}

function dateParts(date: Date, locale: "fa" | "en", timeZone: string) {
  const calendarLocale = locale === "fa" ? "en-u-ca-persian" : "en-GB";
  const fmt = new Intl.DateTimeFormat(calendarLocale, {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const parts: Record<string, string> = {};
  for (const part of fmt.formatToParts(date)) {
    parts[part.type] = part.value;
  }
  return {
    day: `${parts.year ?? ""}/${parts.month ?? ""}/${parts.day ?? ""}`,
    time: `${parts.hour ?? ""}:${parts.minute ?? ""}`,
  };
}

function formatDateTime(iso: string | null, locale: "fa" | "en", timeZone: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const p = dateParts(d, locale, timeZone);
  return `${p.day} — ${p.time}`;
}

function formatAppointmentRange(
  startIso: string | null,
  endIso: string | null,
  locale: "fa" | "en",
  timeZone: string,
): string {
  if (!startIso) return "—";
  const startDate = new Date(startIso);
  if (Number.isNaN(startDate.getTime())) return "—";
  const start = dateParts(startDate, locale, timeZone);

  if (!endIso) return `${start.day} — ${start.time}`;
  const endDate = new Date(endIso);
  if (Number.isNaN(endDate.getTime()) || endDate.getTime() <= startDate.getTime()) {
    return `${start.day} — ${start.time}`;
  }

  const end = dateParts(endDate, locale, timeZone);
  if (start.day === end.day) {
    return `${start.day} — ${start.time}–${end.time}`;
  }
  return `${start.day} ${start.time} — ${end.day} ${end.time}`;
}

/**
 * Exports all grouped reservations matching the given filters into an `.xlsx`
 * spreadsheet buffer with localized headers and RTL support for Persian.
 */
export async function exportBookingsToXlsx(
  query: ExportBookingsQuery,
): Promise<{ buffer: Buffer; filename: string }> {
  const locale = query.locale;
  const timeZone = resolveTimeZone(query.tz);
  const where = bookingSearchFilter(query);

  const refRows = await db
    .select({ groupRef: bookings.groupRef })
    .from(bookings)
    .where(where)
    .groupBy(bookings.groupRef)
    .orderBy(desc(sql`max(${bookings.createdAt})`), desc(bookings.groupRef))
    .limit(MAX_EXPORT_ORDERS);

  const refs = refRows.map((row) => row.groupRef);
  const rows =
    refs.length > 0
      ? await db.select().from(bookings).where(inArray(bookings.groupRef, refs))
      : [];

  const preferredStatus = query.status !== "all" ? query.status : undefined;
  const orders = groupBookingRowsInOrder(refs, rows, preferredStatus);

  const t = await getApiTranslations(locale);
  const sep = locale === "fa" ? "، " : ", ";

  const columns: XlsxColumn[] = [
    { header: t("bookingReservations.excel.columns.groupRef"), width: 14, type: "string" },
    { header: t("bookingReservations.excel.columns.fullName"), width: 22, type: "string" },
    { header: t("bookingReservations.excel.columns.phone"), width: 16, type: "string" },
    { header: t("bookingReservations.excel.columns.email"), width: 24, type: "string" },
    { header: t("bookingReservations.excel.columns.services"), width: 34, type: "string" },
    { header: t("bookingReservations.excel.columns.itemsCount"), width: 14, type: "number" },
    { header: t("bookingReservations.excel.columns.slotDate"), width: 24, type: "string" },
    { header: t("bookingReservations.excel.columns.amount"), width: 16, type: "number" },
    { header: t("bookingReservations.excel.columns.currency"), width: 12, type: "string" },
    { header: t("bookingReservations.excel.columns.status"), width: 16, type: "string" },
    { header: t("bookingReservations.excel.columns.paymentReference"), width: 24, type: "string" },
    { header: t("bookingReservations.excel.columns.notes"), width: 28, type: "string" },
    { header: t("bookingReservations.excel.columns.createdAt"), width: 22, type: "string" },
  ];

  const excelRows: XlsxCell[][] = orders.map((order) => [
    order.groupRef,
    order.fullName,
    order.phone,
    order.email ?? "—",
    formatLineTitles(order.items, sep) || order.groupTitle || "—",
    order.items.reduce((sum, item) => sum + item.quantity, 0),
    formatAppointmentRange(order.slotStart, order.slotEnd, locale, timeZone),
    order.totalAmount,
    order.currency,
    t(`bookingReservations.statuses.${order.status}`),
    order.paymentReference ?? "—",
    order.notes ?? "—",
    formatDateTime(order.createdAt, locale, timeZone),
  ]);

  const buffer = buildXlsxWorkbook({
    sheetName: t("bookingReservations.excel.sheetName"),
    columns,
    rows: excelRows,
    rtl: locale === "fa",
  });

  const dateStamp = new Date().toISOString().slice(0, 10);
  return {
    buffer,
    filename: `reservations-${dateStamp}.xlsx`,
  };
}
