"use client";

import { useLocale } from "next-intl";
import { formatSlotLabel, type CalendarKind } from "@/lib/bookings/dates";
import type { CartItem } from "./types";

/** Localized date/time label for a cart line's assigned slot (jalali in fa). */
export function SlotLabel({ line }: { line: CartItem }) {
  const locale = useLocale() as "fa" | "en";
  if (!line.slot) return null;
  const calendar: CalendarKind = locale === "fa" ? "jalali" : "gregorian";
  return (
    <>
      {formatSlotLabel({
        date: line.slot.slotDate,
        time: line.slot.startTime,
        calendar,
        locale,
      })}
    </>
  );
}
