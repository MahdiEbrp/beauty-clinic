"use client";

import { format as formatJalali } from "date-fns-jalali";
import { Clock, CreditCard } from "lucide-react";
import { useLocale } from "next-intl";
import type { Column } from "@/components/admin-list/types";
import { formatPrice } from "@/components/admin-list/helpers";
import type { ReservationAdmin } from "@/lib/bookings/admin-types";
import { BookingStatusMenu } from "./booking-status-menu";

function formatDay(d: Date, locale: "fa" | "en"): string {
  if (locale === "fa") return formatJalali(d, "yyyy/MM/dd");
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}/${m}/${day}`;
}

function formatTime(d: Date): string {
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export function formatSlotDate(iso: string | null, locale: "fa" | "en" = "en"): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${formatDay(d, locale)} — ${formatTime(d)}`;
}

export function formatSlotRange(
  startIso: string | null,
  endIso: string | null,
  locale: "fa" | "en" = "en",
): string {
  if (!startIso) return "—";
  const start = new Date(startIso);
  if (Number.isNaN(start.getTime())) return "—";
  const startDay = formatDay(start, locale);
  const startTime = formatTime(start);
  if (!endIso) return `${startDay} — ${startTime}`;

  const end = new Date(endIso);
  if (Number.isNaN(end.getTime()) || end.getTime() <= start.getTime()) {
    return `${startDay} — ${startTime}`;
  }
  const endDay = formatDay(end, locale);
  const endTime = formatTime(end);
  if (startDay === endDay) return `${startDay} — ${startTime}–${endTime}`;
  return `${startDay} ${startTime} — ${endDay} ${endTime}`;
}

export function ReservationServices({ row }: { row: ReservationAdmin }) {
  const items = row.items?.length ? row.items : [];
  if (items.length <= 1) {
    const single = items[0];
    const label = single
      ? single.quantity > 1
        ? `${single.groupTitle} ×${single.quantity}`
        : single.groupTitle
      : row.groupTitle;
    return <span className="text-accent">{label || "—"}</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item.id}
          className="inline-flex items-center rounded-pill border border-border-primary bg-surface-tertiary px-2.5 py-0.5 text-dash-caption font-medium text-accent"
        >
          {item.quantity > 1 ? `${item.groupTitle} ×${item.quantity}` : item.groupTitle}
        </span>
      ))}
    </div>
  );
}

export function formatOrderSummary(row: ReservationAdmin, locale: "fa" | "en"): string {
  const items = row.items?.length ? row.items : [];
  if (items.length === 0) return row.groupTitle || "—";
  const sep = locale === "fa" ? "، " : ", ";
  return items
    .map((item) =>
      item.quantity > 1 ? `${item.groupTitle} ×${item.quantity}` : item.groupTitle,
    )
    .join(sep);
}

function DateCell({
  startIso,
  endIso,
}: {
  startIso: string | null;
  endIso: string | null;
}) {
  const locale = useLocale() as "fa" | "en";
  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <Clock className="size-3.5 shrink-0 text-content-tertiary" aria-hidden="true" />
      <span dir="ltr" className="truncate text-accent">
        {formatSlotRange(startIso, endIso, locale)}
      </span>
    </div>
  );
}

export function reservationColumns(): Column<ReservationAdmin>[] {
  return [
    {
      key: "customer",
      labelKey: "bookingReservations.table.customer",
      render: (row) => (
        <div className="flex min-w-0 flex-col">
          <span className="block text-accent">{row.fullName}</span>
          <div className="flex flex-wrap items-center gap-x-2 text-dash-caption text-content-tertiary">
            <span dir="ltr">{row.phone}</span>
            {row.groupRef ? <span dir="ltr">· {row.groupRef}</span> : null}
          </div>
        </div>
      ),
    },
    {
      key: "group",
      labelKey: "bookingReservations.table.group",
      render: (row) => <ReservationServices row={row} />,
    },
    {
      key: "date",
      labelKey: "bookingReservations.table.date",
      responsive: "desktop",
      render: (row) => <DateCell startIso={row.slotStart} endIso={row.slotEnd} />,
    },
    {
      key: "amount",
      labelKey: "bookingReservations.table.amount",
      responsive: "desktop",
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <CreditCard
            className="size-3.5 shrink-0 text-content-tertiary"
            aria-hidden="true"
          />
          <span dir="ltr" className="text-accent">
            {formatPrice(row.totalAmount, row.currency)}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      labelKey: "bookingReservations.table.status",
      render: (row) => <BookingStatusMenu row={row} />,
    },
  ];
}

export function ReservationMobileCard({ row }: { row: ReservationAdmin }) {
  const locale = useLocale() as "fa" | "en";
  return (
    <div className="min-w-0 space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <span className="block truncate font-bold text-accent">{row.fullName}</span>
          <span dir="ltr" className="text-dash-caption text-content-tertiary">
            {row.phone}
            {row.groupRef ? ` · ${row.groupRef}` : ""}
          </span>
        </div>
        <BookingStatusMenu row={row} />
      </div>
      <ReservationServices row={row} />
      <p className="flex flex-wrap items-center gap-x-2 text-dash-caption text-content-tertiary">
        <span dir="ltr">{formatSlotRange(row.slotStart, row.slotEnd, locale)}</span>
        <span>·</span>
        <span dir="ltr">{formatPrice(row.totalAmount, row.currency)}</span>
      </p>
    </div>
  );
}
