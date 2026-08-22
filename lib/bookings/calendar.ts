import {
  addDays,
  addMonths as addJalaliMonths,
  format as formatJalali,
  getMonth as getJalaliMonth,
  startOfMonth as jalaliStartOfMonth,
} from "date-fns-jalali";

import type { CalendarKind } from "@/lib/bookings/dates";

const PERSIAN_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

const GREGORIAN_MONTHS_FA = [
  "ژانویه",
  "فوریه",
  "مارس",
  "آوریل",
  "مه",
  "ژوئن",
  "ژوئیه",
  "اوت",
  "سپتامبر",
  "اکتبر",
  "نوامبر",
  "دسامبر",
];

const GREGORIAN_MONTHS_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** Pad a number to 2 Latin digits (ss01 renders them in fa). */
function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/** Gregorian "YYYY-MM-DD" key from a real `Date`. */
export function toKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

/** First real Gregorian `Date` of the displayed month in the active calendar. */
export function monthAnchor(cursor: Date, calendar: CalendarKind): Date {
  if (calendar === "gregorian") {
    return new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  }
  return jalaliStartOfMonth(cursor);
}

export function shiftMonth(cursor: Date, dir: number, calendar: CalendarKind): Date {
  if (calendar === "gregorian") {
    return new Date(cursor.getFullYear(), cursor.getMonth() + dir, 1);
  }
  return addJalaliMonths(cursor, dir);
}

export type MonthCell = { key: string; date: Date; leading: boolean };

/** A 6×7 grid of cells for the active month, plus the weekday of the 1st. */
export function monthGrid(cursor: Date, calendar: CalendarKind): MonthCell[] {
  const anchor = monthAnchor(cursor, calendar);
  const leadingCount = anchor.getDay(); // 0 = Sunday, column offset

  const cells: MonthCell[] = [];
  const start = addDays(anchor, -leadingCount);
  for (let i = 0; i < 42; i += 1) {
    const date = addDays(start, i);
    cells.push({ key: toKey(date), date, leading: i < leadingCount });
  }
  return cells;
}

/** Human label for the displayed month, in the UI language, Latin digits. */
export function monthLabel(
  cursor: Date,
  calendar: CalendarKind,
  locale: "fa" | "en",
): string {
  const anchor = monthAnchor(cursor, calendar);
  if (calendar === "gregorian") {
    const months = locale === "fa" ? GREGORIAN_MONTHS_FA : GREGORIAN_MONTHS_EN;
    return `${months[anchor.getMonth()]} ${anchor.getFullYear()}`;
  }
  const year = formatJalali(anchor, "yyyy");
  const month = PERSIAN_MONTHS[getJalaliMonth(anchor)] ?? "";
  return `${month} ${year}`;
}

/** Weekday header labels in the UI language. Lucide-free; uses tokens only. */
export function weekdayHeaders(locale: "fa" | "en"): string[] {
  if (locale === "fa") {
    return ["ش", "ی", "د", "س", "چ", "پ", "ج"];
  }
  return ["S", "M", "T", "W", "T", "F", "S"];
}
