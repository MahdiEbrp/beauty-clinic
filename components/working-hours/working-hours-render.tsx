"use client";

import { useTranslations } from "next-intl";
import { CalendarDays, Clock, Users } from "lucide-react";

import type { Column } from "@/components/admin-list/types";
import type { WorkingHoursAdminRow } from "@/lib/bookings/working-hours-admin";
import { msgKey } from "@/src/i18n/message-key";
import { StatusPill } from "../bookings/status-pill";

function DayCell({ day }: { day: string }) {
  const t = useTranslations();
  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <CalendarDays className="size-3.5 shrink-0 text-content-tertiary" aria-hidden="true" />
      <span className="truncate text-accent">{t(msgKey(`workingHours.days.${day}`))}</span>
    </div>
  );
}

function HoursCell({ opens, closes }: { opens: string; closes: string }) {
  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <Clock className="size-3.5 shrink-0 text-content-tertiary" aria-hidden="true" />
      <span className="truncate text-accent">
        {opens} – {closes}
      </span>
    </div>
  );
}

export function workingHoursColumns(): Column<WorkingHoursAdminRow>[] {
  return [
    {
      key: "day",
      labelKey: "workingHours.table.day",
      render: (row) => <DayCell day={row.day} />,
    },
    {
      key: "hours",
      labelKey: "workingHours.table.hours",
      render: (row) => <HoursCell opens={row.opens} closes={row.closes} />,
    },
    {
      key: "capacity",
      labelKey: "workingHours.table.capacity",
      responsive: "desktop",
      render: (row) => (
        <div className="flex min-w-0 items-center gap-1.5">
          <Users className="size-3.5 shrink-0 text-content-tertiary" aria-hidden="true" />
          <span className="text-content-secondary">{row.capacity}</span>
        </div>
      ),
    },
    {
      key: "status",
      labelKey: "workingHours.table.status",
      render: (row) => (
        <StatusPill
          status={row.isActive ? "active" : "inactive"}
          variant="slot"
        />
      ),
    },
  ];
}

export function WorkingHoursMobileCard({ row }: { row: WorkingHoursAdminRow }) {
  const t = useTranslations();
  const tNs = useTranslations("workingHours");
  return (
    <div className="min-w-0 space-y-1">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate font-bold text-accent">{t(msgKey(`workingHours.days.${row.day}`))}</span>
        <StatusPill
          status={row.isActive ? "active" : "inactive"}
          variant="slot"
        />
      </div>
      <p className="text-dash-caption text-content-secondary">
        {tNs("table.hours")}: {row.opens} – {row.closes}
      </p>
      <p className="text-dash-caption text-content-tertiary">
        {tNs("table.capacity")}: {row.capacity}
      </p>
    </div>
  );
}