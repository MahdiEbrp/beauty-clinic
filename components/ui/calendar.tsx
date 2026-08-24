"use client";

import * as React from "react";
import { ChevronLeft } from "lucide-react";
import {
  DayPicker as GregorianDayPicker,
} from "react-day-picker";
import { enUS, faIR } from "react-day-picker/locale";
import { DayPicker as PersianDayPicker } from "react-day-picker/persian";
import { enUS as enUSJalali, faIR as faIRJalali } from "react-day-picker/persian";

import { cn } from "@/lib/utils";

/**
 * shadcn/ui Calendar (react-day-picker v9) adapted to this project's tokens
 * and to dual-calendar rendering: `kind="jalali"` renders through the bundled
 * Persian date lib (date-fns-jalali) while `kind="gregorian"` uses the
 * standard one. Digits are always Latin — the Estedad ss01 font feature shapes
 * them per locale.
 */

export type CalendarKind = "jalali" | "gregorian";

const dayButtonClass =
  "inline-flex min-h-9 min-w-9 items-center justify-center gap-1 rounded-control p-2 text-dash-body-sm font-normal text-accent transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

/** Shared class names for both calendar systems (merged over RD defaults). */
function useCalendarClassNames() {
  return React.useMemo(
    () => ({
      months: "relative flex flex-col sm:flex-row gap-4",
      month: "flex w-full min-w-[17rem] flex-col gap-3",
      nav: "absolute inset-x-0 top-0 flex items-center justify-between",
      button_previous:
        "inline-flex size-9 items-center justify-center rounded-control text-accent transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent aria-disabled:pointer-events-none aria-disabled:opacity-40",
      button_next:
        "inline-flex size-9 items-center justify-center rounded-control text-accent transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent aria-disabled:pointer-events-none aria-disabled:opacity-40",
      month_caption: "flex h-9 items-center justify-center px-2",
      dropdowns: "flex w-full items-center justify-center gap-2",
      dropdown_root:
        "relative rounded-control border border-form-input-border bg-form-input-bg has-focus:border-copper",
      dropdown:
        "absolute inset-0 h-full w-full appearance-none bg-transparent px-2 text-dash-caption text-accent outline-none",
      caption_label:
        "text-dash-body-sm font-bold tracking-tight text-accent whitespace-nowrap",
      month_grid: "mt-2 border-collapse",
      weekdays: "flex",
      weekday:
        "flex w-9 flex-1 items-center justify-center pb-1 text-dash-caption font-bold uppercase text-content-tertiary",
      weeks: "flex flex-col gap-y-1",
      week: "flex w-full",
      day: "flex min-w-9 flex-1 items-center justify-center self-start p-0 text-dash-body-sm",
      day_button: dayButtonClass,
      selected:
        "[&>button]:bg-accent [&>button]:font-bold [&>button]:text-content-contrast [&>button:hover]:bg-accent-hover",
      today: "[&>button]:border [&>button]:border-copper [&>button]:font-bold",
      outside: "[&>button]:opacity-35",
      disabled: "[&>button]:pointer-events-none [&>button]:opacity-30",
      hidden: "invisible",
    }),
    [],
  );
}

export interface CalendarProps {
  kind?: CalendarKind;
  locale: "fa" | "en";
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  /** Matcher(s) for unselectable days, e.g. past dates. */
  disabled?: unknown;
  /** First selectable/renderable month (bounds the year dropdown). */
  startMonth?: Date;
  endMonth?: Date;
  className?: string;
}

function SharedChevron() {
  return (
    <ChevronLeft
      className={cn("size-4 rtl-mirror", "rtl:rotate-180")}
      aria-hidden="true"
    />
  );
}

export function Calendar({
  kind = "gregorian",
  locale,
  selected,
  onSelect,
  disabled,
  startMonth,
  endMonth,
  className,
}: CalendarProps) {
  const classNames = useCalendarClassNames();
  const shared = {
    mode: "single" as const,
    selected,
    onSelect,
    disabled: disabled as never,
    startMonth,
    endMonth,
    showOutsideDays: true,
    numerals: "latn" as const,
    captionLayout: "dropdown" as const,
    dir: locale === "fa" ? ("rtl" as const) : ("ltr" as const),
    classNames,
    components: { Chevron: SharedChevron },
    className: cn("w-fit p-4", className),
  };

  if (kind === "jalali") {
    return (
      <PersianDayPicker
        {...shared}
        locale={locale === "fa" ? faIRJalali : enUSJalali}
        weekStartsOn={6}
      />
    );
  }
  return (
    <GregorianDayPicker
      {...shared}
      locale={locale === "fa" ? faIR : enUS}
      weekStartsOn={locale === "fa" ? 6 : undefined}
    />
  );
}
