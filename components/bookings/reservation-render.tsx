"use client";

import { Clock, CreditCard } from "lucide-react";
import type { Column } from "@/components/admin-list/types";
import { formatPrice } from "@/components/admin-list/helpers";
import type { ReservationAdmin } from "@/lib/bookings/admin-types";
import { StatusPill } from "./status-pill";

export function formatSlotDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${y}/${m}/${day} — ${hh}:${mm}`;
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
      key: "service",
      labelKey: "bookingReservations.table.service",
      render: (row) => <span className="text-accent">{row.serviceTitle || "—"}</span>,
    },
    {
      key: "date",
      labelKey: "bookingReservations.table.date",
      responsive: "desktop",
      render: (row) => (
        <div className="flex min-w-0 items-center gap-1.5">
          <Clock className="size-3.5 shrink-0 text-content-tertiary" aria-hidden="true" />
          <span className="truncate text-accent">{formatSlotDate(row.slotStart)}</span>
        </div>
      ),
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
      render: (row) => <StatusPill status={row.status} />,
    },
  ];
}

export function ReservationMobileCard({ row }: { row: ReservationAdmin }) {
  return (
    <div className="min-w-0 space-y-1">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate font-bold text-accent">{row.fullName}</span>
        <StatusPill status={row.status} />
      </div>
      <p className="text-dash-caption text-content-secondary">
        {row.serviceTitle} · {row.phone}
      </p>
      <p className="text-dash-caption text-content-tertiary">
        {formatSlotDate(row.slotStart)} · {formatPrice(row.totalAmount, row.currency)}
      </p>
    </div>
  );
}
