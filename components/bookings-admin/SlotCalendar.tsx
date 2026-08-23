"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/lib/services/types";
import { monthGrid, monthLabel, shiftMonth, toKey } from "@/lib/bookings/calendar";
import CalendarHeader from "./CalendarHeader";
import CalendarGrid from "./CalendarGrid";
import DaySlotPanel from "./DaySlotPanel";
import { fetchSlots, type SlotAdmin } from "./api";

function buildMap(slots: SlotAdmin[]): Map<string, SlotAdmin[]> {
  const map = new Map<string, SlotAdmin[]>();
  for (const slot of slots) {
    const list = map.get(slot.slotDate) ?? [];
    list.push(slot);
    map.set(slot.slotDate, list);
  }
  return map;
}

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
  const todayKey = useMemo(() => toKey(new Date()), []);

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
    <div className="space-y-6 md:space-y-8" aria-busy={loading}>
      <CalendarHeader
        label={monthLabel(cursor, calendar, locale)}
        calendar={calendar}
        loading={loading}
        locale={locale}
        onPrev={() => {
          setLoading(true);
          setCursor((c) => shiftMonth(c, -1, calendar));
        }}
        onNext={() => {
          setLoading(true);
          setCursor((c) => shiftMonth(c, 1, calendar));
        }}
        onCalendarChange={(kind) => {
          setLoading(true);
          setCalendar(kind);
        }}
        onToday={() => {
          setLoading(true);
          setCursor(new Date());
          setSelectedDate(todayKey);
        }}
      />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-8">
        <div className="rounded-card border border-border-primary bg-surface-secondary p-3 shadow-elevation-1 md:p-4 lg:p-5">
          <CalendarGrid
            cells={cells}
            slotsByDate={slotsByDate}
            selectedDate={selectedDate}
            todayKey={todayKey}
            calendar={calendar}
            locale={locale}
            onSelect={setSelectedDate}
          />
        </div>

        {loading ? (
          <div
            className="rounded-card border border-border-primary bg-surface-secondary p-4 md:p-5"
            aria-hidden="true"
          >
            <span className="sr-only">{t("loading")}</span>
            <div className="mb-4 h-6 w-40 animate-pulse rounded-control bg-surface-tertiary" />
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-16 animate-pulse rounded-control bg-surface-tertiary/70"
                />
              ))}
            </div>
          </div>
        ) : (
          <DaySlotPanel dateKey={selectedDate} slots={selectedSlots} onChanged={refresh} />
        )}
      </div>
    </div>
  );
}
