"use client";

import { Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Column } from "@/components/admin-list/types";
import type { SlotAdminRow } from "@/lib/bookings/slots-admin";
import { StatusPill } from "./status-pill";

export function slotColumns(): Column<SlotAdminRow>[] {
  return [
    {
      key: "date",
      labelKey: "bookingSlots.table.date",
      render: (row) => <span className="text-accent">{row.slotDate}</span>,
    },
    {
      key: "time",
      labelKey: "bookingSlots.table.time",
      render: (row) => (
        <div className="flex min-w-0 items-center gap-1.5">
          <Clock className="size-3.5 shrink-0 text-content-tertiary" aria-hidden="true" />
          <span className="truncate text-accent">
            {row.startTime} – {row.endTime}
          </span>
        </div>
      ),
    },
    {
      key: "capacity",
      labelKey: "bookingSlots.table.capacity",
      responsive: "desktop",
      render: (row) => <span className="text-accent">{row.capacity}</span>,
    },
    {
      key: "booked",
      labelKey: "bookingSlots.table.booked",
      responsive: "desktop",
      render: (row) => <span className="text-content-secondary">{row.bookedCount}</span>,
    },
    {
      key: "status",
      labelKey: "bookingSlots.table.status",
      render: (row) => <StatusPill status={row.isActive} variant="slot" />,
    },
  ];
}

export function SlotMobileCard({ row }: { row: SlotAdminRow }) {
  const t = useTranslations();
  return (
    <div className="min-w-0 space-y-1">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate font-bold text-accent">{row.slotDate}</span>
        <StatusPill status={row.isActive} variant="slot" />
      </div>
      <p className="text-dash-caption text-content-secondary">
        {t("bookingSlots.table.time")}: {row.startTime} – {row.endTime}
      </p>
      <p className="text-dash-caption text-content-tertiary">
        {t("bookingSlots.table.booked")}: {row.bookedCount} / {row.capacity}
      </p>
    </div>
  );
}
