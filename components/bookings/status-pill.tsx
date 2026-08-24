"use client";

import { Circle } from "lucide-react";
import { useTranslations } from "next-intl";

import type { SlotStatus } from "@/lib/bookings/slot-status";
import { msgKey } from "@/src/i18n/message-key";
import { RESERVE_STATUS_CLASS, SLOT_STATUS_CLASS } from "./status-class";

/**
 * Status pill for reservations (variant="reservation", booking status enum)
 * and slots (variant="slot", derived active/inactive/expired).
 */
export function StatusPill({
  status,
  variant = "reservation",
}: {
  status: string;
  variant?: "reservation" | "slot";
}) {
  const t = useTranslations();
  if (variant === "slot") {
    const key = (status in SLOT_STATUS_CLASS ? status : "inactive") as SlotStatus;
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-pill border px-2 py-0.5 text-dash-caption font-bold ${SLOT_STATUS_CLASS[key]}`}
      >
        <Circle className="size-2 fill-current" aria-hidden="true" />
        {t(msgKey(`bookingSlots.statuses.${key}`))}
      </span>
    );
  }
  const key = String(status);
  const cls = RESERVE_STATUS_CLASS[key] ?? RESERVE_STATUS_CLASS.cancelled;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-pill border px-2 py-0.5 text-dash-caption font-bold ${cls}`}
    >
      <Circle className="size-2 fill-current" aria-hidden="true" />
      {t(msgKey(`bookingReservations.statuses.${key}`))}
    </span>
  );
}
