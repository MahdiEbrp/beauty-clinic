"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { useMemo } from "react";
import { format as formatJalali } from "date-fns-jalali";
import { weekdayName } from "@/lib/bookings/dates";
import { Root as SelectRoot, Value as SelectValue, Trigger as SelectTrigger, Content as SelectContent, Item as SelectItem } from "../booking-select";
import { FA_MONTHS, EN_MONTHS } from "./pretty-date";

export type Parts = { year: number; month: number; day: number };

export function toParts(date: Date, jalali: boolean): Parts {
  if (jalali) {
    return {
      year: Number(formatJalali(date, "yyyy")),
      month: Number(formatJalali(date, "M")),
      day: Number(formatJalali(date, "d")),
    };
  }
  return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
}

export function gregorianKey(date: Date): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function DateField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="px-1 text-caption font-bold text-content-secondary">{label}</label>
      {children}
    </div>
  );
}

type DateSelectsProps = {
  jalali: boolean;
  locale: "fa" | "en";
  pickerYear: number;
  pickerMonth: number;
  pickerDay: Date | null;
  years: number[];
  months: number[];
  /** Only days with available slots are shown. */
  days: Date[];
  availableDateKeys: Set<string>;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  onDayChange: (date: Date) => void;
};

/** Year / Month / Day Radix selects for the 30-day booking window. */
export function DateSelects({
  jalali,
  locale,
  pickerYear,
  pickerMonth,
  pickerDay,
  years,
  months,
  days,
  availableDateKeys,
  onYearChange,
  onMonthChange,
  onDayChange,
}: DateSelectsProps) {
  const t = useTranslations("booking");

  // Only render days that have available slots.
  const availableDays = useMemo(
    () => days.filter((d) => availableDateKeys.has(gregorianKey(d))),
    [days, availableDateKeys],
  );

  return (
    <>
      <DateField label={t("schedule.year")}>
        <SelectRoot value={String(pickerYear)} onValueChange={(value) => onYearChange(Number(value))}>
          <SelectTrigger aria-label={t("schedule.year")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={String(year)}>
                {t("schedule.yearValue", { year })}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>
      </DateField>

      <DateField label={t("schedule.month")}>
        <SelectRoot value={String(pickerMonth)} onValueChange={(value) => onMonthChange(Number(value))}>
          <SelectTrigger aria-label={t("schedule.month")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {months.map((month) => (
              <SelectItem key={month} value={String(month)}>
                {jalali ? FA_MONTHS[month - 1] ?? month : EN_MONTHS[month - 1] ?? month}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>
      </DateField>

      <DateField label={t("schedule.day")}>
        <SelectRoot
          value={pickerDay ? String(toParts(pickerDay, jalali).day) : ""}
          onValueChange={(value) => {
            const date = days.find((d) => toParts(d, jalali).day === Number(value));
            if (date) onDayChange(date);
          }}
        >
          <SelectTrigger aria-label={t("schedule.day")}>
            <SelectValue placeholder={t("schedule.chooseDay")} />
          </SelectTrigger>
          <SelectContent>
            {availableDays.map((date) => {
              const parts = toParts(date, jalali);
              return (
                <SelectItem key={gregorianKey(date)} value={String(parts.day)}>
                  <span className="inline-flex items-center gap-2">
                    <span>{weekdayName(date, locale)}</span>
                    <span dir="ltr">{parts.day}</span>
                    {gregorianKey(date) === gregorianKey(new Date()) ? (
                      <span className="text-caption text-copper-deep">{t("schedule.today")}</span>
                    ) : null}
                  </span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </SelectRoot>
      </DateField>
    </>
  );
}