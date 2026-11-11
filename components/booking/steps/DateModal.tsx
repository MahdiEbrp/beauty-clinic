"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, X, CalendarDays, LoaderCircle } from "lucide-react";
import { doSlotsOverlap, slotDuration } from "@/lib/booking/scheduling";
import { cn } from "@/lib/utils";
import { getSlots, prefetchDays, type SlotsResult } from "../slots-cache";
import type { CartItem, SelectedGroup, SlotOption } from "../types";
import { DateSelects, gregorianKey, toParts } from "./date-selects";
import { TimeSlotGrid } from "./TimeSlotGrid";
import { formatPrettyDate } from "./pretty-date";

type DateModalProps = {
  group: SelectedGroup;
  /** When true, the chosen date+time is applied to ALL cart lines (shared
   * selector) instead of a single group — header and conflict hints adapt. */
  shared?: boolean;
  /** Slot already assigned to this group, if any (used to pre-open the picker). */
  current: SlotOption | null;
  cart: CartItem[];
  onAssign: (groupId: string, slot: SlotOption) => void;
  onClose: () => void;
};

const WINDOW_DAYS = 180;

/** Themed per-group date & time picker bound to real slots. */
export default function DateModal({ group, shared, current, cart, onAssign, onClose }: DateModalProps) {
  const t = useTranslations("booking");
  const locale = useLocale() as "fa" | "en";
  const jalali = locale === "fa";
  const sharedQuery = useMemo(() => shared ? {
    groupIds: [...new Set(cart.map((line) => line.group.id))].sort(),
    quantity: cart.reduce((total, line) => total + line.quantity, 0),
  } : undefined, [cart, shared]);
  const availabilityGroupId = shared ? undefined : group.id;

  const windowDates = useMemo(() => {
    const out: Date[] = [];
    const base = new Date();
    base.setHours(12, 0, 0, 0);
    for (let i = 0; i < WINDOW_DAYS; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      out.push(d);
    }
    return out;
  }, []);

  const initialParts = current ? toParts(new Date(`${current.slotDate}T00:00:00`), jalali) : null;
  const todayParts = toParts(new Date(), jalali);

  const [pickerYear, setPickerYear] = useState(initialParts?.year ?? todayParts.year);
  const [pickerMonth, setPickerMonth] = useState(initialParts?.month ?? todayParts.month);
  const [pickerDay, setPickerDay] = useState<Date | null>(current ? new Date(`${current.slotDate}T00:00:00`) : null);
  const [pickerSlot, setPickerSlot] = useState<SlotOption | null>(current);
  const [slots, setSlots] = useState<SlotsResult | null>(null);
  const [availableDateKeys, setAvailableDateKeys] = useState<Set<string>>(new Set());
  const [availabilityChecked, setAvailabilityChecked] = useState(false);

  const years = useMemo(() => Array.from(new Set(windowDates.map((d) => toParts(d, jalali).year))).sort(), [jalali, windowDates]);
  const months = useMemo(
    () => Array.from(new Set(windowDates.filter((d) => toParts(d, jalali).year === pickerYear).map((d) => toParts(d, jalali).month))).sort((a, b) => a - b),
    [jalali, pickerYear, windowDates],
  );
  const days = useMemo(
    () => windowDates.filter((d) => toParts(d, jalali).year === pickerYear && toParts(d, jalali).month === pickerMonth),
    [jalali, pickerMonth, pickerYear, windowDates],
  );

  const pickerDateKey = pickerDay ? gregorianKey(pickerDay) : null;

  // Warm the cache for the next days while the customer browses.
  useEffect(() => {
    prefetchDays(windowDates.slice(1, 6).map(gregorianKey), availabilityGroupId, sharedQuery);
  }, [availabilityGroupId, sharedQuery, windowDates]);

  // Prefetch all days in the current month view and hide dates with no slots.
  useEffect(() => {
    const dateKeys = days.map(gregorianKey);
    prefetchDays(dateKeys, availabilityGroupId, sharedQuery);

    const checkAll = async () => {
      const results = await Promise.allSettled(
        dateKeys.map(async (dateKey) => {
          const result = getSlots(dateKey, availabilityGroupId, sharedQuery);
          const data = await result.fresh;
          return { dateKey, hasSlots: data.length > 0 };
        })
      );
      const available = new Set(
        results
          .filter(
            (r): r is PromiseFulfilledResult<{ dateKey: string; hasSlots: boolean }> =>
              r.status === "fulfilled" && r.value.hasSlots,
          )
          .map((r) => r.value.dateKey),
      );
      setAvailableDateKeys(available);
      setAvailabilityChecked(true);
    };

    void checkAll();
  }, [pickerYear, pickerMonth, availabilityGroupId, sharedQuery, days]);

  // Load the chosen day's real slots (stale-while-revalidate via cache).
  useEffect(() => {
    if (!pickerDateKey) return;
    const result = getSlots(pickerDateKey, availabilityGroupId, sharedQuery);
    /* eslint-disable react-hooks/set-state-in-effect -- sync snapshot + async revalidate from the cache */
    setSlots(result);
    void result.fresh.then(
      () => setSlots(getSlots(pickerDateKey, availabilityGroupId, sharedQuery)),
      () => setSlots(result), // fallback to cached data on refresh failure (rate limit, etc.)
    );
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [pickerDateKey, availabilityGroupId, sharedQuery]);

  const clearDay = () => {
    setPickerDay(null);
    setPickerSlot(null);
    setSlots(null);
  };

  // Same-time locking: another cart line already owns this slot or an
  // overlapping one on the same date → this candidate is unavailable.
  const lockedBy = (slot: SlotOption): string | null => {
    const other = cart.find((line) => line.group.id !== group.id && line.slot && line.slot.slotDate === slot.slotDate && (line.slot.id === slot.id || doSlotsOverlap(slot.startTime, slotDuration(slot), line.slot.startTime, slotDuration(line.slot))));
    return other ? other.group.title : null;
  };

  const disabledTitles = new Map<string, string>();
  // In shared mode every cart line intentionally receives the same slot, so
  // same-slot overlap hints would wrongly mark every candidate as "taken".
  if (!shared) {
    slots?.data?.forEach((slot) => {
      const conflict = lockedBy(slot);
      if (conflict) disabledTitles.set(slot.id, conflict);
    });
  }

  const canConfirm = pickerSlot !== null;
  const loading = pickerDateKey !== null && slots?.data === null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("schedule.dateModalTitle")}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-xs animate-fade-in"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose();
      }}
    >
      <div className="flex max-h-[92vh] w-full max-w-md flex-col overflow-y-auto rounded-panel border border-border-primary bg-surface-primary p-4 shadow-elevation-3 sm:p-5">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-3 border-b border-border-primary/80 pb-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-control bg-accent text-content-contrast">
              <CalendarDays className="size-4 text-copper-light" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h3 className="text-body font-black text-accent">{t("schedule.dateModalTitle")}</h3>
              <p className="truncate text-caption text-content-secondary">
                {shared ? t("schedule.forAllServices") : group.title}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("schedule.close")}
            className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border-primary bg-surface-secondary text-content-tertiary transition-colors hover:text-content-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        {/* Year / Month / Day selects */}
        <div className="space-y-3">
          <DateSelects
            jalali={jalali}
            locale={locale}
            pickerYear={pickerYear}
            pickerMonth={pickerMonth}
            pickerDay={pickerDay}
            years={years}
            months={months}
            days={days}
            availableDateKeys={availabilityChecked ? availableDateKeys : new Set(days.map(gregorianKey))}
            onYearChange={(year) => {
              setPickerYear(year);
              clearDay();
            }}
            onMonthChange={(month) => {
              setPickerMonth(month);
              clearDay();
            }}
            onDayChange={(date) => {
              setPickerDay(date);
              setPickerSlot(null);
              setSlots(null);
            }}
          />

          {/* Time slots */}
          <div className="space-y-2">
            <label className="flex items-center justify-between px-1 text-caption font-bold text-content-secondary">
              <span>{t("schedule.pickTime")}</span>
              {canConfirm ? <span className="text-caption font-black text-copper">{t("schedule.required")}</span> : null}
            </label>

            {!pickerDateKey ? (
              <p className="rounded-control border border-dashed border-border-interactive bg-surface-secondary px-4 py-6 text-center text-caption text-content-tertiary">
                {t("schedule.pickDayHint")}
              </p>
            ) : loading ? (
              <div className="flex items-center justify-center gap-2 rounded-control border border-border-interactive bg-surface-secondary px-4 py-6 text-caption font-bold text-content-secondary">
                <LoaderCircle className="size-4 animate-spin text-copper" aria-hidden="true" />
                {t("schedule.loadingTimes")}
              </div>
            ) : (slots?.data ?? []).length === 0 ? (
              <p className="rounded-control border border-dashed border-border-interactive bg-surface-secondary px-4 py-6 text-center text-caption text-content-tertiary">
                {t("schedule.emptyDay")}
              </p>
            ) : (
              <TimeSlotGrid slots={slots?.data ?? []} selectedId={pickerSlot?.id ?? null} disabledTitles={disabledTitles} onSelect={setPickerSlot} />
            )}
          </div>
        </div>

        {/* Preview strip */}
        <div className="mt-4 rounded-control border border-border-primary/80 bg-surface-secondary/80 p-2.5 text-center text-caption">
          {pickerDay && pickerSlot ? (
            <span className="inline-flex items-center gap-1.5 font-black text-accent">
              <Check className="size-3.5 text-copper" strokeWidth={3} aria-hidden="true" />
              {formatPrettyDate(pickerDay, locale, jalali)} · <span dir="ltr">{pickerSlot.startTime.slice(0, 5)}</span>
            </span>
          ) : (
            <span className="text-content-tertiary">{t("schedule.selectHint")}</span>
          )}
        </div>

        {/* Actions */}
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-border-primary/80 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-pill border border-border-interactive px-4 text-body-sm font-bold text-content-secondary transition-colors hover:bg-surface-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {t("schedule.cancel")}
          </button>
          <button
            type="button"
            disabled={!canConfirm}
            onClick={() => {
              if (!pickerSlot) return;
              onAssign(group.id, pickerSlot);
              onClose();
            }}
            className={cn(
              "inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-pill bg-accent px-5 text-body-sm font-black text-content-contrast shadow-elevation-1 transition-all hover:bg-copper-deep disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
            )}
          >
            <Check className="size-4" strokeWidth={3} aria-hidden="true" />
            {t("schedule.confirmSlot")}
          </button>
        </div>
      </div>
    </div>
  );
}