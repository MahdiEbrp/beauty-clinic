"use client";

import { useLocale, useTranslations } from "next-intl";
import type { BookingStatus } from "@/src/db/schema";
import { formatDate, slotToDate } from "@/lib/bookings/dates";
import type { CalendarKind } from "@/lib/bookings/dates";

export const inputClass = (valid: boolean) =>
  `h-11 w-full rounded-control border bg-form-input-bg px-3 text-dash-body-sm text-accent outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
    valid ? "border-form-input-border focus-visible:border-copper" : "border-error/60"
  }`;

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="block text-dash-caption font-bold uppercase tracking-wider text-content-secondary">
        {label}
      </span>
      {children}
      {hint && (
        <span className="block text-dash-caption text-content-tertiary">{hint}</span>
      )}
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-dash-caption font-bold uppercase tracking-wider text-content-tertiary">
        {label}
      </dt>
      <dd className="truncate text-accent">{value}</dd>
    </div>
  );
}

export function ReviewBlock({
  fullName,
  phone,
  email,
  notes,
  status,
  mode,
  slotDate,
  serviceTitle,
  slotLabel,
}: {
  fullName: string;
  phone: string;
  email: string;
  notes: string;
  status: BookingStatus;
  mode: "create" | "edit";
  slotDate: string;
  serviceTitle: string;
  slotLabel: string;
}) {
  const t = useTranslations("reservationWizard");
  const locale = useLocale();
  // Review shows the chosen day in the visitor's own calendar system.
  const kind: CalendarKind = locale === "fa" ? "jalali" : "gregorian";
  const reviewDate = slotDate
    ? formatDate(slotToDate(slotDate, "12:00:00"), kind)
    : "—";
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      <Row label={t("reviewData.customer")} value={fullName} />
      <Row label={t("reviewData.phone")} value={phone} />
      <Row label={t("reviewData.email")} value={email || "—"} />
      <Row label={t("reviewData.service")} value={serviceTitle} />
      {mode === "create" ? (
        <>
          <Row label={t("reviewData.date")} value={reviewDate} />
          <Row label={t("reviewData.time")} value={slotLabel} />
        </>
      ) : (
        <Row label={t("statuses.pending")} value={t(`statuses.${status}`)} />
      )}
      <div className="sm:col-span-2">
        <Row label={t("fields.notes.label")} value={notes || "—"} />
      </div>
    </dl>
  );
}

export function DetailRow({ label, value }: { label: string; value: string }) {
  return <Row label={label} value={value} />;
}

export function DetailGrid({ children }: { children: React.ReactNode }) {
  return <dl className="grid gap-3 sm:grid-cols-2">{children}</dl>;
}
