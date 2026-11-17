"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { doSlotsOverlap, slotDuration } from "@/lib/booking/scheduling";
import { fetchAvailableDates } from "../api";
import { getSlots, prefetchDays, type SlotsResult } from "../slots-cache";
import type { CartItem, SelectedGroup, SlotOption } from "../types";
import { gregorianKey, toParts } from "./date-selects";

export type DateModalOptions = {
  group: SelectedGroup;
  /** When true, the chosen date+time is applied to ALL cart lines (shared
   * selector) instead of a single group — header and conflict hints adapt. */
  shared?: boolean;
  /** Slot already assigned to this group, if any (used to pre-open the picker). */
  current: SlotOption | null;
  cart: CartItem[];
};

const WINDOW_DAYS = 60;

export function useDateModalSelection({ group, shared, current, cart }: DateModalOptions) {
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
  const fallbackYear = initialParts?.year ?? todayParts.year;
  const fallbackMonth = initialParts?.month ?? todayParts.month;

  const [pickerYear, setPickerYear] = useState(fallbackYear);
  const [pickerMonth, setPickerMonth] = useState(fallbackMonth);
  const [pickerDay, setPickerDay] = useState<Date | null>(current ? new Date(`${current.slotDate}T00:00:00`) : null);
  const [pickerSlot, setPickerSlot] = useState<SlotOption | null>(current);
  const [slots, setSlots] = useState<SlotsResult | null>(null);
  const [availableDateKeys, setAvailableDateKeys] = useState<Set<string>>(new Set());
  const [availabilityChecked, setAvailabilityChecked] = useState(false);

  // Calendar options are built only from dates that have real free capacity.
  const availableDates = useMemo(
    () => windowDates.filter((date) => availableDateKeys.has(gregorianKey(date))),
    [availableDateKeys, windowDates],
  );
  const years = useMemo(
    () => Array.from(new Set(availableDates.map((date) => toParts(date, jalali).year))).sort(),
    [availableDates, jalali],
  );
  const months = useMemo(
    () => Array.from(
      new Set(
        availableDates
          .filter((date) => toParts(date, jalali).year === pickerYear)
          .map((date) => toParts(date, jalali).month),
      ),
    ).sort((a, b) => a - b),
    [availableDates, jalali, pickerYear],
  );
  const days = useMemo(
    () => availableDates.filter((date) => {
      const parts = toParts(date, jalali);
      return parts.year === pickerYear && parts.month === pickerMonth;
    }),
    [availableDates, jalali, pickerMonth, pickerYear],
  );

  const pickerDateKey = pickerDay ? gregorianKey(pickerDay) : null;

  // One batched query reads the same slot records used by /dashboard/slots.
  // The API returns only date keys with an active slot and remaining capacity.
  useEffect(() => {
    let active = true;
    /* eslint-disable react-hooks/set-state-in-effect -- reset while the new range is loading */
    setAvailabilityChecked(false);
    /* eslint-enable react-hooks/set-state-in-effect */
    const firstDate = windowDates[0];
    const lastDate = windowDates[windowDates.length - 1];
    if (!firstDate || !lastDate) return;
    void fetchAvailableDates(
      gregorianKey(firstDate),
      gregorianKey(lastDate),
      availabilityGroupId,
      sharedQuery,
    ).then(
      (dateKeys) => {
        if (!active) return;
        setAvailableDateKeys(new Set(dateKeys));
        setAvailabilityChecked(true);
      },
      () => {
        if (!active) return;
        setAvailableDateKeys(new Set());
        setAvailabilityChecked(true);
      },
    );

    return () => {
      active = false;
    };
  }, [availabilityGroupId, sharedQuery, windowDates]);

  // After availability loads, retain the requested date when it is still free;
  // otherwise choose the first available month (prefer the current month).
  // The effect intentionally does not depend on the user's later month choice.
  const currentDateKey = current?.slotDate ?? null;
  const selectedDateKey = pickerDay ? gregorianKey(pickerDay) : null;
  useEffect(() => {
    if (!availabilityChecked) return;

    const currentDate = currentDateKey
      ? availableDates.find((date) => gregorianKey(date) === currentDateKey)
      : undefined;
    const preferredMonthDate = availableDates.find((date) => {
      const parts = toParts(date, jalali);
      return parts.year === fallbackYear && parts.month === fallbackMonth;
    });
    const targetDate = currentDate ?? preferredMonthDate ?? availableDates[0];
    const selectedDateIsAvailable =
      selectedDateKey !== null && availableDateKeys.has(selectedDateKey);

    /* eslint-disable react-hooks/set-state-in-effect -- synchronize selection with authoritative availability */
    if (
      (currentDateKey && !currentDate) ||
      (selectedDateKey && !selectedDateIsAvailable)
    ) {
      setPickerDay(null);
      setPickerSlot(null);
      setSlots(null);
    }
    if (targetDate) {
      const parts = toParts(targetDate, jalali);
      setPickerYear(parts.year);
      setPickerMonth(parts.month);
    } else {
      setPickerDay(null);
      setPickerSlot(null);
      setSlots(null);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [
    availabilityChecked,
    availableDateKeys,
    availableDates,
    currentDateKey,
    fallbackMonth,
    fallbackYear,
    jalali,
    selectedDateKey,
  ]);

  // Warm only the first few genuinely available dates for instant time loading.
  useEffect(() => {
    if (!availabilityChecked) return;
    prefetchDays(
      availableDates.slice(0, 5).map(gregorianKey),
      availabilityGroupId,
      sharedQuery,
    );
  }, [availabilityChecked, availableDates, availabilityGroupId, sharedQuery]);

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

  const onYearChange = (year: number) => {
    const firstMonth = availableDates
      .map((date) => toParts(date, jalali))
      .find((parts) => parts.year === year)?.month;
    setPickerYear(year);
    if (firstMonth) setPickerMonth(firstMonth);
    clearDay();
  };
  const onMonthChange = (month: number) => {
    setPickerMonth(month);
    clearDay();
  };
  const onDayChange = (date: Date) => {
    setPickerDay(date);
    setPickerSlot(null);
    setSlots(null);
  };

  return {
    locale, jalali, availabilityChecked, availableDates, availableDateKeys,
    pickerYear, pickerMonth, pickerDay, pickerSlot, pickerDateKey,
    years, months, days, slots, loading, canConfirm, disabledTitles,
    onYearChange, onMonthChange, onDayChange, setPickerSlot,
  };
}
