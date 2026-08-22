"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, LoaderCircle } from "lucide-react";
import type { Locale } from "@/lib/services/types";
import { cn } from "@/lib/utils";
import {
  monthGrid,
  monthLabel,
  shiftMonth,
  toKey,
  weekdayHeaders,
} from "@/lib/bookings/calendar";
import { fetchSlots, type SlotAdmin } from "./api";
import DaySlotPanel from "./DaySlotPanel";

export default function SlotCalendar() {
  const t = useTranslations("bookingAdmin.calendar");
  const locale = useLocale() as Locale;

  const [calendar, setCalendar] = useState<"jalali" | "gregorian">(
    locale === "fa" ? "jalali" : "gregorian",
  );
  const [cursor, setCursor] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => toKey(new Date()));
  const [slotsByDate, setSlotsByDate] = useState<Map<string, SlotAdmin[]>>(new Map());
  const [loading, setLoading] = useState(true);

  const cells = useMemo(() => monthGrid(cursor, calendar), [cursor, calendar]);
  const range = useMemo(
    () => ({ from: cells[0].key, to: cells[cells.length - 1].key }),
    [cells],
  );

  function buildMap(slots: SlotAdmin[]): Map<string, SlotAdmin[]> {
    const map = new Map<string, SlotAdmin[]>();
    for (const slot of slots) {
      const list = map.get(slot.slotDate) ?? [];
      list.push(slot);
      map.set(slot.slotDate, list);
    }
    return map;
  }

  useEffect(() => {
    let running = true;
    void fetchSlots(range.from, range.to)
      .then((slots) => {
        if (!running) return;
        setSlotsByDate(buildMap(slots));
      })
      .catch(() => {
        // keep whatever we had
      })
      .finally(() => {
        if (running) setLoading(false);
      });
    return () => {
      running = false;
    };
  }, [range.from, range.to]);

  const refresh = useCallback(() => {
    setLoading(true);
    void fetchSlots(range.from, range.to)
      .then((slots) => setSlotsByDate(buildMap(slots)))
      .catch(() => {
        // keep whatever we had
      })
      .finally(() => setLoading(false));
  }, [range.from, range.to]);

  const selectedSlots = slotsByDate.get(selectedDate) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setCursor((c) => shiftMonth(c, -1, calendar));
            }}
            aria-label={t("prevMonth")}
            className="inline-flex size-11 items-center justify-center rounded-control border border-border-interactive bg-surface-secondary text-accent transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <ChevronRight className="size-5 rtl-mirror" aria-hidden="true" />
          </button>
          <h2 className="min-w-[10rem] text-center text-dash-title font-bold text-accent">
            {monthLabel(cursor, calendar, locale)}
          </h2>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setCursor((c) => shiftMonth(c, 1, calendar));
            }}
            aria-label={t("nextMonth")}
            className="inline-flex size-11 items-center justify-center rounded-control border border-border-interactive bg-surface-secondary text-accent transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <ChevronLeft className="size-5 rtl-mirror" aria-hidden="true" />
          </button>
        </div>

        <div
          role="group"
          aria-label={t("calendarToggle")}
          className="inline-flex items-center rounded-pill border border-border-interactive bg-surface-secondary p-1"
        >
          {(["jalali", "gregorian"] as const).map((kind) => (
            <button
              key={kind}
              type="button"
              onClick={() => {
                setLoading(true);
                setCalendar(kind);
              }}
              aria-pressed={calendar === kind}
              className={cn(
                "min-h-10 rounded-pill px-5 text-dash-body-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                calendar === kind
                  ? "bg-accent text-content-contrast shadow-elevation-1"
                  : "text-content-secondary hover:text-accent",
              )}
            >
              {t(kind)}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-card border border-border-primary bg-surface-secondary p-3 shadow-elevation-1 md:p-4">
        <div className="mb-2 grid grid-cols-7 gap-1">
          {weekdayHeaders(locale).map((day, i) => (
            <div
              key={i}
              className="py-1 text-center text-dash-caption font-bold uppercase text-content-tertiary"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell) => {
            if (cell.leading) {
              return <div key={cell.key} aria-hidden="true" />;
            }
            const daySlots = slotsByDate.get(cell.key) ?? [];
            const active = daySlots.filter((s) => s.isActive);
            const booked = active.reduce((sum, s) => sum + s.bookedCount, 0);
            const capacity = active.reduce((sum, s) => sum + s.capacity, 0);
            const ratio = capacity > 0 ? booked / capacity : 0;
            const isToday = toKey(new Date()) === cell.key;
            const selected = cell.key === selectedDate;
            return (
              <button
                key={cell.key}
                type="button"
                onClick={() => setSelectedDate(cell.key)}
                aria-pressed={selected}
                className={cn(
                  "relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-control border p-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                  selected
                    ? "border-accent bg-accent text-content-contrast shadow-elevation-2"
                    : "border-transparent bg-surface-primary text-content-secondary hover:border-border-interactive",
                )}
              >
                <span className="text-dash-body-sm font-bold">{cell.date.getDate()}</span>
                {isToday ? (
                  <span
                    className={cn(
                      "size-1.5 rounded-pill",
                      selected ? "bg-content-contrast" : "bg-copper-deep",
                    )}
                    aria-label={t("today")}
                  />
                ) : null}
                {daySlots.length > 0 ? (
                  <span
                    aria-hidden="true"
                    className="h-1 w-8 overflow-hidden rounded-pill bg-border-primary"
                  >
                    <span
                      className="block h-full rounded-pill bg-copper-deep transition-all"
                      style={{ width: `${Math.min(100, Math.round(ratio * 100))}%` }}
                    />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-6 text-dash-body-sm text-content-tertiary">
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          {t("loading")}
        </div>
      ) : (
        <DaySlotPanel dateKey={selectedDate} slots={selectedSlots} onChanged={refresh} />
      )}
    </div>
  );
}
