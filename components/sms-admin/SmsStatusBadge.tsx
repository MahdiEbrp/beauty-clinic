"use client";

import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

export type SmsStatus =
  | "unknown"
  | "healthy"
  | "unhealthy"
  | "queued"
  | "sending"
  | "sent"
  | "delivered"
  | "failed"
  | "partial";

export function SmsStatusBadge({ status }: { status: SmsStatus }) {
  const t = useTranslations("smsAdmin");
  const tone =
    status === "healthy" || status === "sent" || status === "delivered"
      ? "border-success/30 bg-success/10 text-success"
      : status === "unhealthy" || status === "failed"
        ? "border-error/30 bg-error/10 text-error"
        : status === "partial"
          ? "border-warning/30 bg-warning/10 text-warning"
          : "border-border-primary bg-surface-tertiary text-content-secondary";

  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center rounded-pill border px-2.5 text-dash-caption font-bold",
        tone,
      )}
    >
      {t(`statuses.${status}` as never)}
    </span>
  );
}
