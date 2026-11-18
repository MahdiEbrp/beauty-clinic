"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { CalendarDays } from "lucide-react";

import { Calendar, type CalendarKind } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDate } from "@/lib/bookings/dates";
import { cn } from "@/lib/utils";

export type DatePickerLocale = "fa" | "en";

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/** Date → "YYYY-MM-DD" (local wall clock, never UTC-shifted). */
export function dateToKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** "YYYY-MM-DD" → local Date pinned to noon (TZ-safe round trips). */
export function keyToDate(key: string): Date | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return undefined;
  const parsed = new Date(`${key}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function formatTrigger(date: Date, kind: CalendarKind): string {
  // Latin digits everywhere; ss01 shapes them into Persian glyphs in fa.
  return formatDate(date, kind);
}

const triggerClass = (filled: boolean, invalid?: boolean) =>
  cn(
    "flex h-11 w-full items-center gap-2 rounded-control border bg-form-input-bg px-3 text-start text-dash-body-sm outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
    invalid
      ? "border-error/60"
      : filled
        ? "border-form-input-border text-accent hover:border-copper"
        : "border-form-input-border text-content-tertiary hover:border-copper",
  );

/**
 * Localized single-date picker: Jalali by default in fa, Gregorian in en,
 * using the locale's calendar system. Emits canonical
 * "YYYY-MM-DD" regardless of the displayed calendar.
 */
export function DatePickerField({
  value,
  onChange,
  locale,
  min,
  disabled,
  invalid,
}: {
  value?: string;
  onChange: (next: string) => void;
  locale: DatePickerLocale;
  /** Earliest selectable day ("YYYY-MM-DD"). */
  min?: string;
  disabled?: boolean;
  invalid?: boolean;
}) {
  const t = useTranslations("dateTimePicker");
  const [open, setOpen] = React.useState(false);
  // Keep the calendar system aligned with the active application locale.
  const kind: CalendarKind = locale === "fa" ? "jalali" : "gregorian";

  const selected = value ? keyToDate(value) : undefined;
  const minDate = min ? keyToDate(min) : undefined;

  const handleSelect = (next: Date | undefined) => {
    onChange(next ? dateToKey(next) : "");
    if (next) setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={triggerClass(Boolean(selected), invalid)}
        >
          <CalendarDays className="size-4 shrink-0 text-content-tertiary" aria-hidden="true" />
          <span className="truncate">
            {selected ? formatTrigger(selected, kind) : t("chooseDate")}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        dir={locale === "fa" ? "rtl" : "ltr"}
        className="w-auto rounded-panel border border-border-primary bg-surface-primary p-2 text-content-primary shadow-elevation-3"
      >
        <Calendar
          kind={kind}
          locale={locale}
          selected={selected}
          onSelect={handleSelect}
          disabled={minDate ? { before: minDate } : undefined}
          startMonth={selected ?? minDate ?? new Date()}
        />
      </PopoverContent>
    </Popover>
  );
}
