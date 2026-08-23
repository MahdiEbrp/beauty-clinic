"use client";

import { Circle } from "lucide-react";
import { useTranslations } from "next-intl";
import { RESERVE_STATUS_CLASS, SLOT_STATUS_CLASS } from "./status-class";

export function StatusPill({
  status,
  variant = "reservation",
}: {
  status: string | boolean;
  variant?: "reservation" | "slot";
}) {
  const t = useTranslations();
    if (variant === "slot") {
    const active = Boolean(status);
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-pill border px-2 py-0.5 text-dash-caption font-bold ${SLOT_STATUS_CLASS[String(active) as "true" | "false"]}`}
      >
        <Circle className="size-2 fill-current" aria-hidden="true" />
        {active
          ? t("bookingSlots.statuses.active")
          : t("bookingSlots.statuses.inactive")}
      </span>
    );
  }
  const key = String(status) as
    | "pending"
    | "confirmed"
    | "paid"
    | "cancelled";
  const cls = RESERVE_STATUS_CLASS[key];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-pill border px-2 py-0.5 text-dash-caption font-bold ${cls}`}
    >
      <Circle className="size-2 fill-current" aria-hidden="true" />
      {t(`bookingReservations.statuses.${key}`)}
    </span>
  );
}
