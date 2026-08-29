import type { CartItem, SlotOption } from "@/components/booking/types";

/**
 * Pure scheduling intelligence (port of the template's smart selection):
 * overlap detection, consecutive-slot suggestion and multi-day spreading.
 * Locale-free and side-effect free so it is unit-testable in isolation.
 */

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function doSlotsOverlap(
  startA: string,
  durationA: number,
  startB: string,
  durationB: number,
): boolean {
  const a1 = timeToMinutes(startA);
  const a2 = a1 + Math.max(durationA, 15);
  const b1 = timeToMinutes(startB);
  const b2 = b1 + Math.max(durationB, 15);
  return Math.max(a1, b1) < Math.min(a2, b2);
}

export function slotDuration(slot: SlotOption, fallback = 45): number {
  if (!slot.endTime) return fallback;
  const duration = timeToMinutes(slot.endTime) - timeToMinutes(slot.startTime);
  return duration > 0 ? duration : fallback;
}

/** Cross-line time conflicts inside the cart (different slots, same time). */
export function findCartConflicts(items: CartItem[]): number[][] {
  const conflicts: number[][] = [];
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i];
      const b = items[j];
      if (!a.slot || !b.slot || a.slot.id === b.slot.id) continue;
      if (a.slot.slotDate !== b.slot.slotDate) continue;
      if (
        doSlotsOverlap(
          a.slot.startTime,
          slotDuration(a.slot),
          b.slot.startTime,
          slotDuration(b.slot),
        )
      ) {
        conflicts.push([i, j]);
      }
    }
  }
  return conflicts;
}

export type DayOption = {
  dateStr: string; // YYYY-MM-DD
  weekday: number; // 0=Sunday … 6=Saturday
  isOpen: boolean;
  opens: string | null;
  closes: string | null;
};

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export function toDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Next `count` days with open/closed status resolved from the DB
 * `clinic.opening_hours` setting (weekday names are English in the setting).
 */
export function buildDayOptions(
  openingHours: readonly { readonly days: readonly string[]; readonly opens: string; readonly closes: string }[],
  count = 14,
  from: Date = new Date(),
): DayOption[] {
  const days: DayOption[] = [];
  for (let i = 0; i < count; i++) {
    const date = new Date(from);
    date.setDate(from.getDate() + i);
    const weekday = date.getDay();
    const name = WEEKDAYS[weekday] ?? "";
    const entry = openingHours.find((h) => h.days.includes(name));
    days.push({
      dateStr: toDateStr(date),
      weekday,
      isOpen: Boolean(entry),
      opens: entry?.opens ?? null,
      closes: entry?.closes ?? null,
    });
  }
  return days;
}

export function dayPeriod(startTime: string): "morning" | "afternoon" | "evening" {
  const h = timeToMinutes(startTime) / 60;
  if (h < 12) return "morning";
  if (h < 16) return "afternoon";
  return "evening";
}

/**
 * Smart auto-scheduler (template parity): tries to place every cart line on
 * the SAME day in consecutive free slots; falls back to spreading over
 * multiple open days when one day cannot fit them all.
 */
export function autoSchedule(
  items: CartItem[],
  days: DayOption[],
  slotsByDate: Map<string, SlotOption[]>,
  preferredDate?: string,
): CartItem[] {
  const usable = items.map((item) => item);
  if (usable.length === 0) return usable;

  const openDays = days.filter((d) => d.isOpen);
  const startDay =
    openDays.find((d) => d.dateStr === preferredDate) ?? openDays[0];
  if (!startDay) return usable;

  const takeSlots = (day: DayOption, count: number): SlotOption[] => {
    const slots = (slotsByDate.get(day.dateStr) ?? []).filter((s) => s.available);
    return slots.slice(0, count);
  };

  // Same-day consecutive attempt.
  const sameDay = takeSlots(startDay, usable.length);
  if (sameDay.length >= usable.length) {
    return usable.map((item, idx) => ({ ...item, slot: sameDay[idx] }));
  }

  // Multi-day spread: fill each open day, then continue on the next.
  const result: CartItem[] = usable.map((item) => ({ ...item }));
  let line = 0;
  for (const day of openDays) {
    if (line >= result.length) break;
    const slots = takeSlots(day, result.length - line);
    for (const slot of slots) {
      if (line >= result.length) break;
      result[line] = { ...result[line], slot };
      line += 1;
    }
  }
  return result;
}