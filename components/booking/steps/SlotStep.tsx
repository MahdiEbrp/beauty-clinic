"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CalendarX } from "lucide-react";
import type { Locale } from "@/lib/services/types";
import {
  upcomingDates,
  weekdayName,
  formatDate,
  type CalendarKind,
} from "@/lib/bookings/dates";
import { cn } from "@/lib/utils";
import { fetchAvailableSlots } from "../api";
import type { SlotOption } from "../types";

type SlotStepProps = {
  serviceId: string;
  selectedSlotId: string | null;
  onSelect: (slot: SlotOption) => void;
};

const AVAILABLE_DAYS = 14;

export default function SlotStep({
  serviceId,
  selectedSlotId,
  onSelect,
}: SlotStepProps) {
  const t = useTranslations("booking");
  const locale = useLocale() as Locale;
  const calendar: CalendarKind = locale === "fa" ? "jalali" : "gregorian";

  const days = upcomingDates(AVAILABLE_DAYS);
  const [state, setState] = useState<{
    date: string | null;
    slots: SlotOption[] | null;
    loading: boolean;
  }>({ date: null, slots: null, loading: false });

  const pickDate = (key: string) => {
    if (state.date === key) return;
    setState({ date: key, slots: null, loading: true });
    void fetchAvailableSlots(key, serviceId)
      .then((data) =>
        setState((s) => (s.date === key ? { ...s, slots: data, loading: false } : s)),
      )
      .catch(() =>
        setState((s) => (s.date === key ? { ...s, slots: [], loading: false } : s)),
      );
  };

  const { date, slots, loading } = state;

  return (
    <div>
      <div
        className="scrollbar-hide -mx-4 mb-8 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0"
        role="group"
        aria-label={t("schedule.datePicker")}
      >
        {days.map((d) => {
          const dateObj = d.date;
          const active = d.key === date;
          return (
            <button
              key={d.key}
              type="button"
              onClick={() => pickDate(d.key)}
              aria-pressed={active}
              className={cn(
                "flex min-h-16 w-[4.5rem] shrink-0 flex-col items-center justify-center rounded-panel border px-2 text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                active
                  ? "border-accent bg-accent text-content-contrast shadow-elevation-2"
                  : "border-border-primary bg-surface-secondary text-content-secondary hover:border-border-interactive",
              )}
            >
              <span className="text-caption font-medium opacity-80">
                {weekdayName(dateObj, locale)}
              </span>
              <span className="text-body-sm font-bold">{formatDate(dateObj, calendar)}</span>
            </button>
          );
        })}
      </div>

      {!date ? (
        <p className="rounded-panel border border-dashed border-border-interactive bg-surface-secondary px-6 py-12 text-center text-body-sm text-content-secondary">
          {t("schedule.pickDate")}
        </p>
      ) : loading || !slots ? (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-12 animate-pulse rounded-pill bg-surface-tertiary"
            />
          ))}
        </div>
      ) : slots.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-panel border border-dashed border-border-interactive bg-surface-secondary px-6 py-14 text-center">
          <span className="flex size-12 items-center justify-center rounded-pill bg-surface-tertiary text-copper">
            <CalendarX className="size-6" aria-hidden="true" />
          </span>
          <p className="text-body-sm text-content-secondary">{t("schedule.noSlots")}</p>
        </div>
      ) : (
        <div>
          <p className="mb-3 text-caption font-bold uppercase tracking-wide text-copper-strong">
            {t("schedule.available", { count: slots.length })}
          </p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
            {slots.map((slot) => {
              const selected = slot.id === selectedSlotId;
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => onSelect(slot)}
                  aria-pressed={selected}
                  className={cn(
                    "inline-flex min-h-12 items-center justify-center rounded-pill border px-3 text-body-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                    selected
                      ? "border-copper-deep bg-copper-deep text-content-contrast shadow-elevation-2"
                      : "border-border-interactive bg-surface-secondary text-accent hover:bg-surface-tertiary",
                    loading && "pointer-events-none",
                  )}
                >
                  {slot.startTime.slice(0, 5)}
                </button>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
