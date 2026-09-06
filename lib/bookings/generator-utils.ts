import { DEFAULT_CLINIC_TIMEZONE } from "./working-hours";

export type GeneratorConfig = {
  auto: boolean;
  intervalMin: number;
  durationMin: number;
  capacity: number;
  windowDays: number;
  timeZone: string;
};

export const SLOT_GENERATOR_KEYS = {
  auto: "booking.slot_auto",
  interval: "booking.slot_interval_min",
  duration: "booking.slot_duration_min",
  capacity: "booking.slot_default_capacity",
  window: "booking.slot_window_days",
} as const;

export const DEFAULTS: GeneratorConfig = {
  auto: false,
  intervalMin: 30,
  durationMin: 30,
  capacity: 1,
  windowDays: 30,
  timeZone: DEFAULT_CLINIC_TIMEZONE,
};

/** Minutes 0..1439 from an "HH:mm" (or "HH:mm:ss") time. */
export function minutesOf(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function hhmm(minutes: number): string {
  const m = Math.min(Math.max(0, minutes), 1439);
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

/** YYYY-MM-DD for today plus an optional day offset, in the clinic's timezone. */
export function zonedDateKey(timeZone: string, date: Date, offsetDays = 0): string {
  const shifted = new Date(date.getTime() + offsetDays * 24 * 60 * 60 * 1000);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(shifted);
  const year = parts.find((p) => p.type === "year")?.value ?? "";
  const month = parts.find((p) => p.type === "month")?.value ?? "";
  const day = parts.find((p) => p.type === "day")?.value ?? "";
  return `${year}-${month}-${day}`;
}

/** English weekday name for a YYYY-MM-DD wall-clock date. */
export function weekdayOf(dateKey: string): string {
  const names = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  // Parse at 12:00 UTC; only the calendar weekday matters and is stable.
  return names[new Date(`${dateKey}T12:00:00Z`).getUTCDay()] ?? "";
}

/**
 * Pure plan for one day window: start times spaced `intervalMin` apart, each
 * slot lasting `durationMin`, fully contained in [opens, closes).
 */
export function planWindowSlots(
  window: { opens: string; closes: string },
  intervalMin: number,
  durationMin: number,
): string[] {
  const open = minutesOf(window.opens);
  const close = minutesOf(window.closes);
  const starts: string[] = [];
  for (let t = open; t + durationMin <= close; t += intervalMin) {
    starts.push(hhmm(t));
  }
  return starts;
}