"use client";

import { useLocale, useTranslations } from "next-intl";
import { CalendarDays, Clock, LayoutList } from "lucide-react";

import type { Column } from "@/components/admin-list/types";
import type { SlotAdminRow } from "@/lib/bookings/slots-admin";
import {
  formatDate,
  formatTime,
  slotToDate,
  weekdayName,
} from "@/lib/bookings/dates";
import type { CalendarKind } from "@/lib/bookings/dates";
import { StatusPill } from "./status-pill";

/** Localized "شنبه ۱۴۰۵/۰۵/۳۰" style label (digits stay Latin for ss01). */
function useDateLabel() {
  const locale = useLocale();
  return (slotDate: string) => {
    const date = slotToDate(slotDate, "12:00:00");
    const kind: CalendarKind = locale === "fa" ? "jalali" : "gregorian";
    const weekday = weekdayName(date, locale === "fa" ? "fa" : "en");
    return `${weekday} ${formatDate(date, kind)}`;
  };
}

export function slotColumns(): Column<SlotAdminRow>[] {
  const DateLabel = ({ value }: { value: string }) => {
    const label = useDateLabel()(value);
    return (
      <div className="flex min-w-0 items-center gap-1.5">
        <CalendarDays className="size-3.5 shrink-0 text-content-tertiary" aria-hidden="true" />
        <span className="truncate text-accent">{label}</span>
      </div>
    );
  };

  return [
    {
      key: "date",
      labelKey: "bookingSlots.table.date",
      render: (row) => <DateLabel value={row.slotDate} />,
    },
    {
      key: "time",
      labelKey: "bookingSlots.table.time",
      render: (row) => (
        <div className="flex min-w-0 items-center gap-1.5">
          <Clock className="size-3.5 shrink-0 text-content-tertiary" aria-hidden="true" />
          <span className="truncate text-accent">
            {formatTime(row.startTime)} – {formatTime(row.endTime)}
          </span>
        </div>
      ),
    },
    {
      key: "services",
      labelKey: "bookingSlots.table.services",
      responsive: "desktop",
      render: (row) => <ServicesCell row={row} />,
    },
    {
      key: "capacity",
      labelKey: "bookingSlots.table.capacity",
      responsive: "desktop",
      render: (row) => <CapacityCell row={row} />,
    },
    {
      key: "status",
      labelKey: "bookingSlots.table.status",
      render: (row) => <StatusPill status={row.status} variant="slot" />,
    },
  ];
}

export function ServicesCell({ row }: { row: SlotAdminRow }) {
  const t = useTranslations();
  if (row.allServices) {
    return (
      <span className="inline-flex items-center gap-1.5 text-content-secondary">
        <LayoutList className="size-3.5 shrink-0 text-copper-strong" aria-hidden="true" />
        {t("bookingSlots.allServices")}
      </span>
    );
  }
  const shown = row.services.slice(0, 2).map((s) => s.title);
  const rest = row.services.length - shown.length;
  return (
    <span className="block truncate text-content-secondary" title={row.services.map((s) => s.title).join("، ")}>
      {shown.join("، ")}
      {rest > 0 ? ` +${rest}` : ""}
    </span>
  );
}

export function CapacityCell({ row }: { row: SlotAdminRow }) {
  const pct = Math.min(100, Math.round((row.bookedCount / row.capacity) * 100));
  const full = row.bookedCount >= row.capacity;
  return (
    <div className="flex w-28 items-center gap-2">
      <span
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        className={`h-1.5 flex-1 overflow-hidden rounded-pill bg-surface-tertiary`}
      >
        <span
          className={`block h-full rounded-pill ${full ? "bg-error" : "bg-copper-strong"}`}
          style={{ width: `${pct}%` }}
        />
      </span>
      <span className="shrink-0 text-dash-caption text-content-secondary">
        {row.bookedCount}/{row.capacity}
      </span>
    </div>
  );
}

export function SlotMobileCard({ row }: { row: SlotAdminRow }) {
  const t = useTranslations();
  const dateLabel = useDateLabel()(row.slotDate);
  return (
    <div className="min-w-0 space-y-1">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate font-bold text-accent">{dateLabel}</span>
        <StatusPill status={row.status} variant="slot" />
      </div>
      <p className="text-dash-caption text-content-secondary">
        {t("bookingSlots.table.time")}: {formatTime(row.startTime)} – {formatTime(row.endTime)}
      </p>
      {!row.allServices && (
        <p className="truncate text-dash-caption text-content-secondary">
          {t("bookingSlots.table.services")}:{" "}
          <ServicesInline row={row} />
        </p>
      )}
      <p className="text-dash-caption text-content-tertiary">
        {t("bookingSlots.table.booked")}: {row.bookedCount} / {row.capacity}
      </p>
    </div>
  );
}

function ServicesInline({ row }: { row: SlotAdminRow }) {
  if (row.allServices) return null;
  return (
    <span className="text-accent">
      {row.services.map((s) => s.title).join("، ")}
    </span>
  );
}
