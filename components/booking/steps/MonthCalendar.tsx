"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addMonths as addJalaliMonths, startOfMonth as startJalaliMonth } from "date-fns-jalali";
import {
  buildMonthGrids,
  isClinicOpenOn,
  isPastDay,
  type OpeningHourRow,
} from "@/lib/bookings/calendar";
import { formatDate, weekdayName, type CalendarKind } from "@/lib/bookings/dates";
import { cn } from "@/lib/utils";

type MonthCalendarProps = {
  openingHours: readonly OpeningHourRow[];
  activeDate: string | null;
  bookedByDate: Map<string, number>;
  onSelect: (dateStr: string) => void;
  /** How many months ahead (beyond the current one) the visitor may open. */
  maxAhead?: number;
};

const DEFAULT_MAX_AHEAD = 2;

function startMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/** A fixed, paper-like month grid (Jalali in fa, Gregorian in en). The layout
 *  never shifts between renders — a month is always one stable 7-column table. */
export default function MonthCalendar({
  openingHours,
  activeDate,
  bookedByDate,
  onSelect,
  maxAhead = DEFAULT_MAX_AHEAD,
}: MonthCalendarProps) {
  const t = useTranslations("booking");
  const locale = useLocale() as "fa" | "en";
  const calendar: CalendarKind = locale === "fa" ? "jalali" : "gregorian";

  const shiftMonth = (date: Date, offset: number): Date => {
    if (calendar === "jalali") return addJalaliMonths(startJalaliMonth(date), offset);
    return new Date(date.getFullYear(), date.getMonth() + offset, 1);
  };

  /** 0-based month distance of `date` relative to the current month. */
  const monthDistance = (date: Date): number => {
    const base = calendar === "jalali" ? startJalaliMonth(new Date()) : startMonth(new Date());
    const target = calendar === "jalali" ? startJalaliMonth(date) : startMonth(date);
    return (
      (target.getFullYear() - base.getFullYear()) * 12 + (target.getMonth() - base.getMonth())
    );
  };

  const initialOffset = useMemo(() => {
    if (!activeDate) return 0;
    return Math.max(0, Math.min(monthDistance(new Date(`${activeDate}T00:00:00`)), maxAhead));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [offset, setOffset] = useState(initialOffset);

  const selectDay = (dateStr: string) => {
    const distance = monthDistance(new Date(`${dateStr}T00:00:00`));
    if (distance >= 0 && distance <= maxAhead) setOffset(distance);
    onSelect(dateStr);
  };

  const month = useMemo(
    () => buildMonthGrids(shiftMonth(new Date(), offset), calendar, 1)[0],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [calendar, offset],
  );

  /** Column index → true when the clinic lists that weekday as closed. Every
   *  cell in a column shares the same weekday, so a single in-month sample
   *  per column is enough. This stays truthful for both Jalali (Sat-first,
   *  closed day = last column) and Gregorian (Sun-first, closed day = index 5). */
  const closedColumns = useMemo(() => {
    const flags = Array.from({ length: 7 }, () => false);
    for (const week of month.weeks) {
      for (let col = 0; col < 7; col += 1) {
        const cell = week[col];
        if (cell?.inMonth && !isClinicOpenOn(cell.date, openingHours)) flags[col] = true;
      }
    }
    return flags;
  }, [month, openingHours]);

  const dir = calendar === "jalali" ? "rtl" : "ltr";

  return (
    <div className="rounded-panel border border-border-primary bg-surface-primary p-3 shadow-elevation-1 sm:p-4">
      {/* Month header with pager */}
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <button
          type="button"
          disabled={offset === 0}
          onClick={() => setOffset((o) => Math.max(0, o - 1))}
          aria-label={t("schedule.prevMonth")}
          className="flex size-11 cursor-pointer items-center justify-center rounded-control border border-border-interactive bg-surface-secondary text-content-primary transition-colors hover:bg-surface-tertiary hover:border-copper disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="size-4 rtl-mirror" aria-hidden="true" />
        </button>

        <div className="text-center">
          <div className="text-base font-black tracking-wide text-content-primary">{month.label}</div>
          <div className="text-[10px] font-medium text-content-tertiary">
            {calendar === "jalali" ? t("schedule.calendarJalali") : t("schedule.calendarGregorian")}
          </div>
        </div>

        <button
          type="button"
          disabled={offset >= maxAhead}
          onClick={() => setOffset((o) => Math.min(maxAhead, o + 1))}
          aria-label={t("schedule.nextMonth")}
          className="flex size-11 cursor-pointer items-center justify-center rounded-control border border-border-interactive bg-surface-secondary text-content-primary transition-colors hover:bg-surface-tertiary hover:border-copper disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight className="size-4 rtl-mirror" aria-hidden="true" />
        </button>
      </div>

      {/* Weekday header row */}
      <div
        dir={dir}
        className="grid grid-cols-7 border-b border-border-primary pb-1"
        aria-hidden="true"
      >
        {month.weekdays.map((name, i) => (
          <div
            key={i}
            className={cn(
              "py-0.5 text-center text-[10px] font-black sm:text-[11px]",
              closedColumns[i] ? "text-error" : "text-copper-strong",
            )}
          >
            {name}
          </div>
        ))}
      </div>

      {/* Fixed 7-column grid — a real month table, no layout shifts */}
      <div dir={dir} className="mt-1 grid grid-cols-7 gap-1">
        {month.weeks.flatMap((week, w) =>
          week.map((day, d) => {
            const key = `${w}-${d}`;
            if (!day.inMonth) {
              return <div key={key} aria-hidden="true" className="min-h-11 sm:min-h-12" />;
            }
            const closed = !isClinicOpenOn(day.date, openingHours);
            const past = isPastDay(day.date);
            const disabled = closed || past;
            const selected = activeDate === day.dateStr;
            const booked = bookedByDate.get(day.dateStr) ?? 0;

            return (
              <button
                key={day.dateStr}
                type="button"
                disabled={disabled}
                onClick={() => selectDay(day.dateStr)}
                aria-label={`${weekdayName(day.date, locale)} ${formatDate(day.date, calendar)}${
                  disabled ? (closed ? ` · ${t("schedule.closed")}` : ` · ${t("schedule.pastDay")}`) : ""
                }`}
                aria-pressed={selected}
                title={disabled ? (closed ? t("schedule.closed") : t("schedule.pastDay")) : undefined}
                className={cn(
                  "relative flex min-h-11 cursor-pointer select-none flex-col items-center justify-center rounded-control text-sm transition-all sm:min-h-12",
                  disabled
                    ? "cursor-not-allowed opacity-35"
                    : selected
                      ? "bg-accent text-content-contrast shadow-md ring-2 ring-copper"
                      : day.isToday
                        ? "bg-copper/15 font-black text-copper-deep ring-1 ring-copper"
                        : "bg-surface-secondary text-content-primary hover:bg-surface-tertiary hover:ring-1 hover:ring-copper",
                  !disabled && "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent",
                )}
              >
                <span className={cn(selected ? "text-content-contrast" : "text-content-primary")}>
                  {day.dayNumber}
                </span>
                {booked > 0 && !selected ? (
                  <span
                    className={cn(
                      "absolute bottom-1 h-1 w-1 rounded-full",
                      disabled ? "bg-content-tertiary" : "bg-copper",
                    )}
                    aria-hidden="true"
                  />
                ) : null}
              </button>
            );
          }),
        )}
      </div>
    </div>
  );
}
