"use client";

import { Check, ChevronDown } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import * as SelectPrimitive from "@radix-ui/react-select";
import type { BookingStatus } from "@/src/db/schema";
import { formatDate, slotToDate } from "@/lib/bookings/dates";
import type { CalendarKind } from "@/lib/bookings/dates";

export const inputClass = (valid: boolean) =>
  `h-11 w-full rounded-control border bg-form-input-bg px-3 text-dash-body-sm text-accent outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
    valid ? "border-form-input-border focus-visible:border-copper" : "border-error/60"
  }`;

export function SelectField({
  value,
  onChange,
  placeholder,
  disabled,
  invalid,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
}) {
  return (
    <SelectPrimitive.Root
      value={value || undefined}
      onValueChange={onChange}
      disabled={disabled}
    >
      <SelectPrimitive.Trigger
        className={`relative flex h-11 w-full items-center justify-between gap-2 rounded-control border bg-form-input-bg px-3 text-dash-body-sm text-accent outline-none transition-colors hover:border-copper data-[state=open]:border-copper data-[state=open]:ring-1 data-[state=open]:ring-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60 ${
          invalid ? "border-error/60" : "border-form-input-border"
        }`}
      >
        <SelectPrimitive.Value placeholder={placeholder}>
          {value
            ? undefined
            : placeholder && <span className="text-content-tertiary">{placeholder}</span>}
        </SelectPrimitive.Value>
        <SelectPrimitive.Icon asChild>
          <ChevronDown className="pointer-events-none size-4 shrink-0 text-content-tertiary" aria-hidden="true" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={4}
          className="z-50 max-h-64 overflow-hidden rounded-control border border-border-primary bg-surface-secondary text-accent shadow-elevation-3 animate-fade-in"
        >
          <SelectPrimitive.Viewport className="p-1">
            {options.map((opt) => (
              <SelectPrimitive.Item
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
                className="relative flex h-11 cursor-pointer select-none items-center rounded-control px-3 pr-8 text-dash-body-sm text-accent outline-none transition-colors focus:bg-surface-tertiary data-highlighted:bg-surface-tertiary data-[state=checked]:bg-accent-subtle data-[state=checked]:font-bold data-disabled:pointer-events-none data-disabled:opacity-30"
              >
                <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="absolute right-2.5 inline-flex items-center">
                  <Check className="size-3.5 text-copper-strong" aria-hidden="true" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}

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
  groupTitle,
  slotLabel,
}: {
  fullName: string;
  phone: string;
  email: string;
  notes: string;
  status: BookingStatus;
  mode: "create" | "edit";
  slotDate: string;
  groupTitle: string;
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
      <Row label={t("reviewData.group")} value={groupTitle} />
      {mode === "create" ? (
        <>
          <Row label={t("reviewData.date")} value={reviewDate} />
          <Row label={t("reviewData.time")} value={slotLabel} />
        </>
      ) : (
        <Row label={t("fields.status.label")} value={t(`statuses.${status}`)} />
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
