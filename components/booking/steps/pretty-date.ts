import { format as formatJalali } from "date-fns-jalali";
import { formatNumber } from "@/lib/services/format";
import { weekdayName } from "@/lib/bookings/dates";

export const FA_MONTHS = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];
export const EN_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function toParts(date: Date, jalali: boolean): { year: number; month: number; day: number } {
  if (jalali) {
    return {
      year: Number(formatJalali(date, "yyyy")),
      month: Number(formatJalali(date, "M")),
      day: Number(formatJalali(date, "d")),
    };
  }
  return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
}

/** "شنبه ۱۴۰۵/۰۵/۳۰" →  "شنبه ۳۰ مرداد ۱۴۰۵" (Latin digits rendered fa via ss01). */
export function formatPrettyDate(date: Date, locale: "fa" | "en", jalali: boolean): string {
  const parts = toParts(date, jalali);
  const monthName = jalali ? FA_MONTHS[parts.month - 1] : EN_MONTHS[parts.month - 1];
  const day = formatNumber(parts.day);
  const year = formatNumber(parts.year);
  const weekday = weekdayName(date, locale);
  return jalali
    ? `${weekday} ${day} ${monthName ?? parts.month} ${year}`
    : `${weekday} ${monthName ?? parts.month} ${day}, ${year}`;
}