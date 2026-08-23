"use client";

import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CalendarKind } from "@/lib/bookings/dates";
import { cn } from "@/lib/utils";

type CalendarHeaderProps = {
  label: string;
  calendar: CalendarKind;
  onPrev: () => void;
  onNext: () => void;
  onCalendarChange: (kind: CalendarKind) => void;
  onToday?: () => void;
  loading: boolean;
  locale: "fa" | "en";
};

export default function CalendarHeader({
  label,
  calendar,
  onPrev,
  onNext,
  onCalendarChange,
  onToday,
  loading,
  locale,
}: CalendarHeaderProps) {
  const t = useTranslations("bookingAdmin.calendar");

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={loading}
          aria-label={t("prevMonth")}
          className="inline-flex size-11 items-center justify-center rounded-control border border-border-interactive bg-surface-secondary text-accent transition-colors hover:bg-surface-tertiary disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <ChevronRight className="size-5 rtl-mirror" aria-hidden="true" />
        </button>
        <h2 className="min-w-40 text-center text-dash-title font-bold text-accent">
          {label}
        </h2>
        <button
          type="button"
          onClick={onNext}
          disabled={loading}
          aria-label={t("nextMonth")}
          className="inline-flex size-11 items-center justify-center rounded-control border border-border-interactive bg-surface-secondary text-accent transition-colors hover:bg-surface-tertiary disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <ChevronLeft className="size-5 rtl-mirror" aria-hidden="true" />
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
        {locale === "fa" && (
          <div role="group" aria-label={t("calendarToggle")}>
            <div className="inline-flex items-center rounded-pill border border-border-interactive bg-surface-secondary p-1">
              {(["jalali", "gregorian"] as const).map((kind) => (
                <button
                  key={kind}
                  type="button"
                  onClick={() => onCalendarChange(kind)}
                  aria-pressed={calendar === kind}
                  className={cn(
                    "min-h-10 rounded-pill px-4 text-dash-body-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:px-5",
                    calendar === kind
                      ? "bg-accent text-content-contrast shadow-elevation-1"
                      : "text-content-secondary hover:text-accent",
                  )}
                >
                  {t(kind)}
                </button>
              ))}
            </div>
          </div>
        )}

        {onToday ? (
          <button
            type="button"
            onClick={onToday}
            disabled={loading}
            className="inline-flex min-h-11 items-center justify-center rounded-pill border border-border-interactive bg-surface-secondary px-4 text-dash-caption font-bold text-accent transition-colors hover:bg-surface-tertiary disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {t("goToToday")}
          </button>
        ) : null}
      </div>
    </div>
  );
}
