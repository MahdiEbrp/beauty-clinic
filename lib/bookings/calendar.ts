import { addMonths, eachDayOfInterval, format as formatJalali, getDate as getJalaliDay, getDaysInMonth as getJalaliDaysInMonth, getDay as getJalaliWeekday, startOfMonth as startJalaliMonth } from "date-fns-jalali";
import type { CalendarKind } from "./dates";

export type CalendarDay = {
  /** Gregorian Date at 00:00 local. */
  date: Date;
  /** "YYYY-MM-DD" (Gregorian) — the wire format for slot lookups. */
  dateStr: string;
  /** Day-of-month shown on the cell (Jalali day in fa, Gregorian day in en). */
  dayNumber: number;
  /** JS weekday: 0=Sunday … 6=Saturday. */
  weekday: number;
  /** True when the cell belongs to the current month (no trailing filler). */
  inMonth: boolean;
  /** True when the cell is the current calendar day. */
  isToday: boolean;
};

export type CalendarMonth = {
  key: string;
  /** Month anchor (first of month) as a Gregorian Date. */
  monthDate: Date;
  /** Month label, e.g. "1405/06" (Latin digits, ss01 renders Persian glyphs). */
  label: string;
  /** Weekday short labels in display (column) order. */
  weekdays: string[];
  /** Weeks of 7 cells each — fixed grid that never shifts between renders. */
  weeks: CalendarDay[][];
  /** Inclusive date range of the cells shown (first..last). */
  startsAt: Date;
  endsAt: Date;
};

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

export function toWireDate(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/** Weekday letters in display (column) order per calendar kind. */
function weekdayLabels(kind: CalendarKind): string[] {
  return kind === "jalali"
    ? ["ش", "ی", "د", "س", "چ", "پ", "ج"]
    : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
}

/** Column offset of the first cell of a month. Jalali weeks start Saturday,
 *  Gregorian weeks start Sunday (matches the weekday labels). */
function leadingBlanks(kind: CalendarKind, monthStart: Date): number {
  const weekday = kind === "jalali" ? getJalaliWeekday(monthStart) : monthStart.getDay();
  return kind === "jalali" ? (weekday + 1) % 7 : weekday;
}

function buildCells(
  kind: CalendarKind,
  monthStart: Date,
  daysInMonth: number,
  today: Date,
): CalendarDay[] {
  const offset = leadingBlanks(kind, monthStart);
  const total = Math.ceil((offset + daysInMonth) / 7) * 7;
  const cells: CalendarDay[] = [];
  for (let i = 0; i < total; i += 1) {
    const date = new Date(monthStart);
    date.setDate(monthStart.getDate() + (i - offset));
    const inMonth = i >= offset && i < offset + daysInMonth;
    const sameDay =
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate();
    cells.push({
      date,
      dateStr: toWireDate(date),
      dayNumber: kind === "jalali" ? getJalaliDay(date) : date.getDate(),
      weekday: kind === "jalali" ? getJalaliWeekday(date) : date.getDay(),
      inMonth,
      isToday: sameDay,
    });
  }
  return cells;
}

/** Builds `count` consecutive month grids starting from the month containing
 *  `from`. All date handling stays in local wall-clock time. */
export function buildMonthGrids(from: Date, kind: CalendarKind, count = 1): CalendarMonth[] {
  const today = new Date();
  const months: CalendarMonth[] = [];
  let cursor = kind === "jalali" ? startJalaliMonth(from) : new Date(from.getFullYear(), from.getMonth(), 1);
  for (let m = 0; m < count; m += 1) {
    const daysInMonth =
      kind === "jalali"
        ? getJalaliDaysInMonth(cursor)
        : new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const cells = buildCells(kind, cursor, daysInMonth, today);
    const weeks: CalendarDay[][] = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    months.push({
      key: `${cursor.getFullYear()}-${cursor.getMonth()}`,
      monthDate: cursor,
      label:
        kind === "jalali"
          ? formatJalali(cursor, "yyyy/MM")
          : `${cursor.getFullYear()}/${pad2(cursor.getMonth() + 1)}`,
      weekdays: weekdayLabels(kind),
      weeks,
      startsAt: cells[0]?.date ?? cursor,
      endsAt: cells[cells.length - 1]?.date ?? cursor,
    });
    cursor = kind === "jalali" ? addMonths(cursor, 1) : new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
  }
  return months;
}

/** Range of Gregorian `Date`s from `start` (inclusive) to `end` (exclusive)
 *  reused by smart auto-scheduling. */
export function eachDate(start: Date, end: Date): Date[] {
  return eachDayOfInterval({ start, end });
}

export type OpeningHourRow = {
  readonly days: readonly string[];
  readonly opens: string;
  readonly closes: string;
  /** Default seat capacity for this window (used by the slot generator). */
  readonly capacity?: number;
};

const EN_WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

/** English weekday name (opening-hours rows are stored with English names). */
export function weekdayNameEn(date: Date): string {
  return EN_WEEKDAYS[date.getDay()] ?? "";
}

/** True when the clinic lists the date's weekday in its opening hours. */
export function isClinicOpenOn(date: Date, openingHours: readonly OpeningHourRow[]): boolean {
  const name = weekdayNameEn(date);
  return openingHours.some((row) => row.days.includes(name));
}

/** True when the date is not strictly before today (selectable past-free). */
export function isPastDay(date: Date, today: Date = new Date()): boolean {
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const t = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  return t < d;
}
