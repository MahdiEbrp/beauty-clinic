"use client";

import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";

import { useAdminListContext } from "@/components/admin-list/context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { msgKey } from "@/src/i18n/message-key";
import { nextBookingStatuses } from "@/lib/bookings/status-flow";
import type { ReservationAdmin } from "@/lib/bookings/admin-types";
import { StatusPill } from "./status-pill";
import { RESERVE_STATUS_CLASS } from "./status-class";

export function BookingStatusMenu({ row }: { row: ReservationAdmin }) {
  const t = useTranslations();
  const ctx = useAdminListContext<ReservationAdmin>();
  const next = nextBookingStatuses(row.status);

  const trigger = (
    <button
      type="button"
      disabled={next.length === 0 || ctx.isSyncing(row.id)}
      aria-label={t(msgKey("bookingReservations.statusMenu.label"))}
      className="inline-flex min-h-11 items-center gap-1 rounded-pill border bg-clip-padding p-1.5 text-start transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none"
    >
      <StatusPill status={row.status} />
      {next.length > 0 && (
        <ChevronDown className="size-3.5 text-content-tertiary" aria-hidden="true" />
      )}
    </button>
  );

  if (next.length === 0) return trigger;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <div className="px-2 py-1.5 text-dash-caption font-bold uppercase tracking-wider text-content-tertiary">
          {t(msgKey("bookingReservations.statusMenu.current"))} •{" "}
          {t(msgKey(`bookingReservations.statuses.${row.status}`))}
        </div>
        <DropdownMenuSeparator />
        {next.map((status) => (
          <DropdownMenuItem
            key={status}
            disabled={ctx.isSyncing(row.id)}
            onSelect={() =>
              ctx.setConfirm({ kind: "row", action: `status:${status}`, row })
            }
          >
            <span
              aria-hidden="true"
              className={`size-2 shrink-0 rounded-full ${RESERVE_STATUS_CLASS[status]}`}
            />
            <span>{t(msgKey(`bookingReservations.statuses.${status}`))}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}