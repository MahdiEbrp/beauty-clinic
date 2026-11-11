"use client";

import { format as formatJalali } from "date-fns-jalali";
import { Clock, CreditCard } from "lucide-react";
import { useLocale } from "next-intl";
import type { Column } from "@/components/admin-list/types";
import { formatPrice } from "@/components/admin-list/helpers";
import type { ReservationAdmin } from "@/lib/bookings/admin-types";
import { BookingStatusMenu } from "./booking-status-menu";

export function formatSlotDate(iso: string | null, locale: "fa" | "en" = "en"): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  if (locale === "fa") {
    return `${formatJalali(d, "yyyy/MM/dd")} — ${formatTime(d)}`;
  }
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${y}/${m}/${day} — ${hh}:${mm}`;
}

function formatTime(d: Date): string {
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function DateCell({ iso }: { iso: string | null }) {
  const locale = useLocale() as "fa" | "en";
  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <Clock className="size-3.5 shrink-0 text-content-tertiary" aria-hidden="true" />
      <span className="truncate text-accent">{formatSlotDate(iso, locale)}</span>
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
          <span className="text-dash-caption text-content-tertiary">{row.phone}</span>
        </div>
      ),
    },
    {
      key: "group",
      labelKey: "bookingReservations.table.group",
      render: (row) => <span className="text-accent">{row.groupTitle || "—"}</span>,
    },
    {
      key: "date",
      labelKey: "bookingReservations.table.date",
      responsive: "desktop",
      render: (row) => <DateCell iso={row.slotStart} />,
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
          <span className="text-accent">
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
    <div className="min-w-0 space-y-1">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate font-bold text-accent">{row.fullName}</span>
        <BookingStatusMenu row={row} />
      </div>
      <p className="text-dash-caption text-content-secondary">
        {row.groupTitle} · {row.phone}
      </p>
      <p className="text-dash-caption text-content-tertiary">
        {formatSlotDate(row.slotStart, locale)} · {formatPrice(row.totalAmount, row.currency)}
      </p>
    </div>
  );
}
