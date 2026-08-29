"use client";

import { useLocale, useTranslations } from "next-intl";
import { formatDate, weekdayName, type CalendarKind } from "@/lib/bookings/dates";
import type { DayOption } from "@/lib/booking/scheduling";
import { cn } from "@/lib/utils";

type DayPickerProps = {
  days: DayOption[];
  activeDate: string | null;
  onSelect: (dateStr: string) => void;
  bookedByDate: Map<string, number>;
};

/** Date-ticket strip (Template Step2 parity). */
export default function DayPicker({ days, activeDate, onSelect, bookedByDate }: DayPickerProps) {
  const t = useTranslations("booking");
  const locale = useLocale() as "fa" | "en";
  const calendar: CalendarKind = locale === "fa" ? "jalali" : "gregorian";

  const relativeTag = (index: number) => {
    if (index === 0) return t("schedule.today");
    if (index === 1) return t("schedule.tomorrow");
    return null;
  };

  return (
    <div className="grid grid-cols-2 gap-2.5 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-7">
      {days.map((day, idx) => {
        const isSelected = activeDate === day.dateStr;
        const isClosed = !day.isOpen;
        const isThursday = day.weekday === 4;
        const isFriday = day.weekday === 5;
        const tag = relativeTag(idx);
        const date = new Date(`${day.dateStr}T00:00:00`);
        const dayNumber = date.getDate();
        const dateShort = formatDate(date, calendar).split("/").slice(1).join("/");
        const booked = bookedByDate.get(day.dateStr) ?? 0;

        return (
          <button
            key={day.dateStr}
            type="button"
            disabled={isClosed}
            onClick={() => onSelect(day.dateStr)}
            className={cn(
              "relative flex cursor-pointer select-none flex-col items-center justify-between rounded-panel border p-3 text-center transition-all group",
              isClosed
                ? "cursor-not-allowed border-border-primary/50 bg-surface-primary/50 text-content-tertiary opacity-50"
                : isSelected
                  ? "scale-[1.02] border-copper bg-accent font-bold text-content-contrast shadow-md ring-2 ring-copper/60"
                  : "border-border-interactive bg-surface-primary text-content-primary hover:border-copper hover:bg-surface-tertiary",
            )}
          >
            <div className="flex h-4 items-center justify-center">
              {tag ? (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[9px] font-black uppercase",
                    isSelected ? "bg-copper text-content-contrast" : "bg-copper/15 text-copper-deep",
                  )}
                >
                  {tag}
                </span>
              ) : isThursday ? (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[9px] font-bold",
                    isSelected ? "bg-white/20 text-content-contrast" : "text-copper-strong",
                  )}
                >
                  {t("schedule.halfDay")}
                </span>
              ) : isClosed ? (
                <span className="text-[9px] font-bold text-red-700">{t("schedule.closed")}</span>
              ) : booked > 0 ? (
                <span
                  className={cn(
                    "rounded-full border border-copper/30 bg-surface-tertiary px-1.5 py-0.5 text-[9px] font-black text-copper-deep",
                    isSelected && "bg-copper text-content-contrast",
                  )}
                >
                  {t("schedule.booked", { n: booked })}
                </span>
              ) : isFriday ? (
                <span className="text-[9px] font-bold text-red-700">{t("schedule.closed")}</span>
              ) : null}
            </div>

            <div className={cn("mt-1 text-xs font-black", isSelected ? "text-copper-light" : "text-content-primary")}>
              {weekdayName(date, locale)}
            </div>
            <div className="my-1 text-xl font-black tracking-tight sm:text-2xl">{dayNumber}</div>
            <div className={cn("text-[10px] font-semibold", isSelected ? "text-white/90" : "text-content-secondary")}>
              {dateShort}
            </div>
          </button>
        );
      })}
    </div>
  );
}
