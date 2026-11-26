"use client";

import { Clock, CreditCard } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import type { Column } from "@/components/admin-list/types";
import { formatPrice } from "@/components/admin-list/helpers";
import type { MyReservationAdmin } from "@/lib/bookings/admin-types";
import { msgKey } from "@/src/i18n/message-key";
import { StatusPill } from "./status-pill";
import {
  ReservationServices,
  formatSlotDate,
  formatSlotRange,
} from "./reservation-render";

/**
 * Same table shape as the admin reservations list, minus the staff-only bits:
 * the status cell is a read-only pill and the date cell shows the customer's
 * own cancellation deadline.
 */
export function myReservationColumns(): Column<MyReservationAdmin>[] {
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
      render: (row) => <DateCell row={row} />,
    },
    {
      key: "amount",
      labelKey: "bookingReservations.table.amount",
      responsive: "desktop",
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <CreditCard className="size-3.5 shrink-0 text-content-tertiary" aria-hidden="true" />
          <span dir="ltr" className="text-accent">
            {formatPrice(row.totalAmount, row.currency)}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      labelKey: "bookingReservations.table.status",
      render: (row) => <StatusPill status={row.status} />,
    },
  ];
}

function CancelCaption({ row }: { row: MyReservationAdmin }) {
  const t = useTranslations();
  const locale = useLocale() as "fa" | "en";
  if (!row.cancelUntil) return null;
  return (
    <span className="text-dash-caption text-content-tertiary">
      {t(msgKey("myReservations.cancelUntil"), { date: formatSlotDate(row.cancelUntil, locale) })}
    </span>
  );
}

function DateCell({ row }: { row: MyReservationAdmin }) {
  const locale = useLocale() as "fa" | "en";
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <div className="flex min-w-0 items-center gap-1.5">
        <Clock className="size-3.5 shrink-0 text-content-tertiary" aria-hidden="true" />
        <span dir="ltr" className="truncate text-accent">
          {formatSlotRange(row.slotStart, row.slotEnd, locale)}
        </span>
      </div>
      <CancelCaption row={row} />
    </div>
  );
}

export function MyReservationMobileCard({ row }: { row: MyReservationAdmin }) {
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
        <StatusPill status={row.status} />
      </div>
      <ReservationServices row={row} />
      <p className="flex flex-wrap items-center gap-x-2 text-dash-caption text-content-tertiary">
        <span dir="ltr">{formatSlotRange(row.slotStart, row.slotEnd, locale)}</span>
        <span>·</span>
        <span dir="ltr">{formatPrice(row.totalAmount, row.currency)}</span>
      </p>
      <CancelCaption row={row} />
    </div>
  );
}
