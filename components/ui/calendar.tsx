import * as React from "react";
import { ChevronLeft, ChevronRight, ChevronDown, Check } from "lucide-react";
import { DayPicker as GregorianDayPicker, type Matcher } from "react-day-picker";
import { enUS, faIR } from "react-day-picker/locale";
import { DayPicker as PersianDayPicker } from "react-day-picker/persian";
import { enUS as enUSJalali, faIR as faIRJalali } from "react-day-picker/persian";
import * as SelectPrimitive from "@radix-ui/react-select";
import { cn } from "@/lib/utils";

export type CalendarKind = "gregorian" | "jalali";

export type CalendarProps = {
  kind?: CalendarKind;
  locale?: "en" | "fa";
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  disabled?: Matcher | Matcher[];
  startMonth?: Date;
  endMonth?: Date;
  className?: string;
};

/** How many years beyond the current year the dropdown calendar may select. */
const BOOKING_YEARS_AHEAD = 5;

const dayButtonClass =
  "inline-flex size-full items-center justify-center rounded-control text-dash-body-sm font-normal text-accent transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

/** Shared class names for both calendar systems */
export function useCalendarClassNames() {
  return React.useMemo(
    () => ({
      root: "w-full",
      months: "relative flex w-full flex-col gap-2",
      month: "relative flex w-full flex-1 flex-col gap-2",

      // NAV is absolute, sitting directly on top of the caption row across the full width.
      // pointer-events-none lets clicks in the center pass directly to dropdowns,
      // while pointer-events-auto on buttons keeps arrows responsive.
      nav: "absolute top-0 inset-x-0 z-20 flex h-9 w-full items-center justify-between pointer-events-none px-0.5",

      // Caption row matches nav's exact height (h-9) for perfect vertical center alignment.
      // Generous horizontal padding (px-8) guarantees that centered dropdown pills
      // NEVER collide with or overlay the previous/next navigation buttons on the flanks.
      month_caption:
        "relative z-10 flex h-9 w-full items-center justify-center px-8 pointer-events-none *:pointer-events-auto",

      button_previous:
        "pointer-events-auto relative inline-flex size-8 shrink-0 items-center justify-center rounded-control text-content-tertiary hover:text-accent hover:bg-surface-tertiary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent aria-disabled:pointer-events-none aria-disabled:opacity-30",
      button_next:
        "pointer-events-auto relative inline-flex size-8 shrink-0 items-center justify-center rounded-control text-content-tertiary hover:text-accent hover:bg-surface-tertiary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent aria-disabled:pointer-events-none aria-disabled:opacity-30",

      // Dropdown pair (month + year) — now rendered by CalendarSelect below,
      // not a native <select>, so these classes style the Radix trigger.
      dropdowns: "relative flex items-center justify-center gap-1.5 max-w-full",
      caption_label:
        "pointer-events-none flex items-center gap-1 whitespace-nowrap text-dash-body-sm font-bold tracking-tight text-accent select-none",

      month_grid: "w-full border-collapse mt-1",
      weekdays: "flex w-full mb-1",
      weekday:
        "flex flex-1 basis-0 items-center justify-center pb-1 text-dash-caption font-bold uppercase tracking-wider text-content-tertiary select-none",
      weeks: "flex flex-col gap-0.5",
      week: "flex w-full gap-0.5",

      // Fluid cells
      day: "aspect-square flex-1 basis-0 p-0.5 text-center text-dash-body-sm",
      day_button: dayButtonClass,

      selected:
        "[&>button]:bg-accent [&>button]:font-bold [&>button]:text-content-contrast [&>button]:shadow-elevation-1 [&>button:hover]:bg-accent-hover",
      today: "[&>button]:border [&>button]:border-copper [&>button]:font-bold [&>button]:text-copper-strong",
      outside: "[&>button]:opacity-35",
      disabled: "[&>button]:pointer-events-none [&>button]:opacity-30",
      hidden: "invisible",
    }),
    [],
  );
}

function SharedChevron({
  orientation,
  className,
}: {
  orientation?: "up" | "down" | "left" | "right";
  className?: string;
}) {
  if (orientation === "down") {
    return (
      <ChevronDown
        className={cn("pointer-events-none size-3.5 shrink-0 text-content-tertiary ml-0.5", className)}
        aria-hidden="true"
      />
    );
  }
  if (orientation === "right") {
    return (
      <ChevronRight
        className={cn("size-4 shrink-0", className)}
        aria-hidden="true"
      />
    );
  }
  return (
    <ChevronLeft
      className={cn("size-4 shrink-0", className)}
      aria-hidden="true"
    />
  );
}

/**
 * Themed replacement for RDP's dropdown Component prop.
 *
 * RDP renders month/year pickers as a raw native <select> by default. A
 * native <select>'s OPEN option list is drawn by the OS/browser chrome, not
 * by CSS — appearance-none, text-transparent, etc. only ever touch the
 * closed trigger. That's why the previous version showed a themed pill
 * when closed but a plain white system list (black text, blue OS
 * highlight) when opened: there was never a way to theme that list while
 * it stayed a real <select>.
 *
 * Fix: swap the whole control for Radix Select, which renders its open
 * list as real styled DOM (SelectPrimitive.Content), not an OS popup — so
 * every pixel of it, open or closed, can use this project's tokens.
 * RDP still owns the month/year VALUE and calls onChange; this component
 * only needs to translate that into Radix's onValueChange contract.
 */
function CalendarDropdown(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const { value, onChange, options, className, "aria-label": ariaLabel } = props as typeof props & {
    options?: { value: string | number; label: string; disabled?: boolean; }[];
  };

  const handleValueChange = (next: string) => {
    if (!onChange) return;
    // RDP's own dropdown handler reads event.target.value — build a
    // minimal synthetic event carrying that shape so RDP's internal month/
    // year change logic keeps working unmodified.
    onChange({
      target: { value: next },
    } as unknown as React.ChangeEvent<HTMLSelectElement>);
  };

  const selectedLabel =
    options?.find((o) => String(o.value) === String(value))?.label ?? "";

  return (
    <SelectPrimitive.Root
      value={value != null ? String(value) : undefined}
      onValueChange={handleValueChange}
    >
      <SelectPrimitive.Trigger
        aria-label={ariaLabel}
        className={cn(
          "relative flex h-8 items-center gap-1 overflow-hidden rounded-control border border-form-input-border bg-form-input-bg px-2.5 text-dash-body-sm font-bold tracking-tight text-accent outline-none transition-colors hover:border-copper data-[state=open]:border-copper data-[state=open]:ring-1 data-[state=open]:ring-copper",
          className,
        )}
      >
        <SelectPrimitive.Value>{selectedLabel}</SelectPrimitive.Value>
        <SelectPrimitive.Icon asChild>
          <ChevronDown className="pointer-events-none size-3.5 shrink-0 text-content-tertiary" aria-hidden="true" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={4}
          className="z-50 max-h-64 overflow-hidden rounded-control border border-border-primary bg-surface-secondary text-accent shadow-elevation-3 animate-fade-in"
        >
          <SelectPrimitive.Viewport className="p-1">
            {options?.map((opt) => (
              <SelectPrimitive.Item
                key={opt.value}
                value={String(opt.value)}
                disabled={opt.disabled}
                className={cn(
                  "relative flex h-9 cursor-pointer select-none items-center rounded-control px-3 pr-8 text-dash-body-sm text-accent outline-none transition-colors",
                  "focus:bg-surface-tertiary data-highlighted:bg-surface-tertiary",
                  "data-[state=checked]:bg-accent-subtle data-[state=checked]:font-bold",
                  "data-disabled:pointer-events-none data-disabled:opacity-30",
                )}
              >
                <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="absolute right-2.5 inline-flex items-center">
                  <Check className="size-3.5 text-copper-strong" aria-hidden="true" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}

export function Calendar({
  kind = "gregorian",
  locale = "en",
  selected,
  onSelect,
  disabled,
  startMonth,
  endMonth,
  className,
}: CalendarProps) {
  const classNames = useCalendarClassNames();

  // RDP v9 pins the dropdown year range to end-of-current-year when no
  // endMonth toYear is supplied (getNavMonths defaults endMonth to
  // endOfYear(today)). That makes the year dropdown unusable past the
  // current year. Default to a generous future horizon so future dates can
  // be selected, while keeping an explicit endMonth when callers need one.
  const futureEndMonth =
    endMonth ??
    new Date(new Date().getFullYear() + BOOKING_YEARS_AHEAD, 11, 31);

  const shared = {
    mode: "single" as const,
    selected,
    onSelect,
    disabled,
    startMonth,
    endMonth: futureEndMonth,
    showOutsideDays: true,
    numerals: "latn" as const,
    captionLayout: "dropdown" as const,
    dir: locale === "fa" ? ("rtl" as const) : ("ltr" as const),
    classNames,
    components: { Chevron: SharedChevron, Dropdown: CalendarDropdown },
    className: cn("w-full select-none", className),
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

export default Calendar;