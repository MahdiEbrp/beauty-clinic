"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { CalendarKind } from "@/lib/bookings/dates";
import { formatDate } from "@/lib/bookings/dates";
import { parseKey, toKey, weekdayHeaders, type MonthCell } from "@/lib/bookings/calendar";
import type { SlotAdmin } from "./api";

type CalendarGridProps = {
  cells: MonthCell[];
  slotsByDate: Map<string, SlotAdmin[]>;
  selectedDate: string;
  todayKey: string;
  calendar: CalendarKind;
  locale: "fa" | "en";
  onSelect: (key: string) => void;
};

/** Next/previous calendar day without pulling in date-fns helpers. */
function shiftDay(date: Date, delta: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + delta);
  return next;
}

export default function CalendarGrid({
  cells,
  slotsByDate,
  selectedDate,
  todayKey,
  calendar,
  locale,
  onSelect,
}: CalendarGridProps) {
  const t = useTranslations("bookingAdmin.calendar");
  const cellRefs = useRef(new Map<string, HTMLButtonElement>());

  /** Roving-tabindex arrow-key navigation; direction-aware for RTL. */
  function moveFocusedDay(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.shiftKey || event.metaKey || event.ctrlKey || event.altKey) return;
    const rtl = locale === "fa";
    const delta =
      event.key === "ArrowUp"
        ? -7
        : event.key === "ArrowDown"
          ? 7
          : event.key === (rtl ? "ArrowLeft" : "ArrowRight")
            ? 1
            : event.key === (rtl ? "ArrowRight" : "ArrowLeft")
              ? -1
              : 0;
    if (delta === 0) return;
    const target = toKey(shiftDay(parseKey(selectedDate), delta));
    if (!cells.some((cell) => cell.key === target && !cell.leading)) return;
    event.preventDefault();
    onSelect(target);
    cellRefs.current.get(target)?.focus();
  }

  return (
    <div>
      <div className="mb-2 grid grid-cols-7 gap-1.5 md:gap-2" aria-hidden="true">
        {weekdayHeaders(locale).map((day, i) => (
          <div
            key={i}
            className="py-1 text-center text-dash-caption font-bold uppercase text-content-tertiary"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5 md:gap-2" onKeyDown={moveFocusedDay}>
        {cells.map((cell) => {
          if (cell.leading) {
            return <div key={cell.key} aria-hidden="true" className="min-h-12 md:min-h-14" />;
          }

          let total = 0;
          let booked = 0;
          let capacity = 0;
          for (const slot of slotsByDate.get(cell.key) ?? []) {
            if (!slot.isActive) continue;
            total += 1;
            booked += slot.bookedCount;
            capacity += slot.capacity;
          }
          const ratio = capacity > 0 ? booked / capacity : 0;
          const isToday = cell.key === todayKey;
          const selected = cell.key === selectedDate;
          // Subtle copper fill communicates booked/capacity without extra chrome.
          const fillPct = selected || total === 0 ? 0 : Math.round(Math.min(1, ratio) * 16);

          const labelParts = [formatDate(cell.date, calendar)];
          if (total > 0) labelParts.push(`${total} ${t("slotsIndicator")}`);
          if (isToday) labelParts.push(t("today"));

          return (
            <button
              key={cell.key}
              ref={(node) => {
                if (node) cellRefs.current.set(cell.key, node);
                else cellRefs.current.delete(cell.key);
              }}
              type="button"
              tabIndex={selected ? 0 : -1}
              onClick={() => onSelect(cell.key)}
              aria-pressed={selected}
              aria-current={isToday ? "date" : undefined}
              aria-label={labelParts.join(" — ")}
              style={
                fillPct > 0
                  ? {
                      backgroundColor: `color-mix(in srgb, var(--copper-deep) ${fillPct}%, transparent)`,
                    }
                  : undefined
              }
              className={cn(
                "relative flex min-h-12 flex-col items-center justify-center gap-1 rounded-control border p-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:min-h-14",
                selected
                  ? "border-accent bg-accent/10 text-accent shadow-elevation-1"
                  : "border-transparent bg-surface-primary text-content-secondary hover:border-border-interactive hover:bg-surface-secondary",
                isToday && "ring-2 ring-inset ring-copper-deep/70",
              )}
            >
              <span className="text-dash-body-sm font-bold">{cell.date.getDate()}</span>
              {total > 0 ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    "size-1.5 rounded-pill",
                    selected ? "bg-accent" : "bg-copper-deep",
                  )}
                />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
