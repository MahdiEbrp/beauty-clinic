import { format as formatJalali } from "date-fns-jalali";

export type CalendarKind = "jalali" | "gregorian";

const FA_WEEKDAYS = [
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه",
  "شنبه",
];

const EN_WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/** 0-9 → "00"-"09". Pure Latin digits, so ss01 renders them in fa. */
function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function weekdayName(date: Date, locale: "fa" | "en"): string {
  const names = locale === "fa" ? FA_WEEKDAYS : EN_WEEKDAYS;
  return names[date.getDay()] ?? "";
}

/** Formats a Gregorian `Date` in the requested calendar with Latin digits. */
export function formatDate(date: Date, calendar: CalendarKind): string {
  if (calendar === "jalali") {
    return formatJalali(date, "yyyy/MM/dd");
  }
  return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())}`;
}

/** "HH:mm:ss" → "HH:mm". */
export function formatTime(time: string): string {
  return time.slice(0, 5);
}

/** Combines a DB slot date + time ("YYYY-MM-DD" + "HH:mm:ss") into a Date. */
export function slotToDate(date: string, time: string): Date {
  return new Date(`${date}T${time}`);
}

/** Printable slot label, e.g. "شنبه ۱۴۰۵/۰۵/۳۰ — ۱۰:۳۰". */
export function formatSlotLabel(opts: {
  date: string;
  time: string;
  calendar: CalendarKind;
  locale: "fa" | "en";
}): string {
  const date = slotToDate(opts.date, opts.time);
  const weekday = weekdayName(date, opts.locale);
  const day = formatDate(date, opts.calendar);
  const time = formatTime(opts.time);
  return `${weekday} ${day} — ${time}`;
}

/** Builds the next `count` Gregorian days starting tomorrow, as YYYY-MM-DD. */
export function upcomingDates(count: number): { date: Date; key: string }[] {
  const out: { date: Date; key: string }[] = [];
  const base = new Date();
  base.setHours(12, 0, 0, 0);
  for (let i = 1; i <= count; i += 1) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    out.push({
      date: d,
      key: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    });
  }
  return out;
}
