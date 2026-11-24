"use client";

import { useTranslations } from "next-intl";
import { Check, X, CalendarDays, LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SlotOption } from "../types";
import { DateSelects } from "./date-selects";
import { TimeSlotGrid } from "./TimeSlotGrid";
import { formatPrettyDate } from "./pretty-date";
import { useDateModalSelection, type DateModalOptions } from "./use-date-modal-selection";

type DateModalProps = DateModalOptions & {
  onAssign: (groupId: string, slot: SlotOption) => void;
  onClose: () => void;
};

/** Themed per-group date & time picker bound to real slots. */
export default function DateModal({ group, shared, current, cart, onAssign, onClose }: DateModalProps) {
  const t = useTranslations("booking");
  const {
    locale, jalali, availabilityChecked, availableDates, availableDateKeys,
    pickerYear, pickerMonth, pickerDay, pickerSlot, pickerDateKey,
    years, months, days, slots, loading, canConfirm, disabledTitles,
    onYearChange, onMonthChange, onDayChange, setPickerSlot,
  } = useDateModalSelection({ group, shared, current, cart });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("schedule.dateModalTitle")}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-xs animate-fade-in"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose();
      }}
    >
      <div className="flex max-h-[92vh] w-full max-w-md flex-col overflow-y-auto rounded-panel border border-border-primary bg-surface-primary p-4 shadow-elevation-3 sm:p-5">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-3 border-b border-border-primary/80 pb-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-control bg-accent text-content-contrast">
              <CalendarDays className="size-4 text-copper-light" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h3 className="text-body font-black text-accent">{t("schedule.dateModalTitle")}</h3>
              <p className="text-caption text-content-secondary">
                {shared ? t("schedule.consecutiveServices") : group.title}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("schedule.close")}
            className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border-primary bg-surface-secondary text-content-tertiary transition-colors hover:text-content-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        {/* Only years/months/days with free slots are selectable. */}
        <div className="space-y-3">
          {!availabilityChecked ? (
            <div className="flex items-center justify-center gap-2 rounded-control border border-border-interactive bg-surface-secondary px-4 py-6 text-caption font-bold text-content-secondary">
              <LoaderCircle className="size-4 animate-spin text-copper" aria-hidden="true" />
              {t("schedule.loadingTimes")}
            </div>
          ) : availableDates.length === 0 ? (
            <p className="rounded-control border border-dashed border-border-interactive bg-surface-secondary px-4 py-6 text-center text-caption text-content-tertiary">
              {t("schedule.emptyDay")}
            </p>
          ) : (
            <DateSelects
              jalali={jalali}
              locale={locale}
              pickerYear={pickerYear}
              pickerMonth={pickerMonth}
              pickerDay={pickerDay}
              years={years}
              months={months}
              days={days}
              availableDateKeys={availableDateKeys}
              onYearChange={onYearChange}
              onMonthChange={onMonthChange}
              onDayChange={onDayChange}
            />
          )}

          {/* Time slots */}
          <div className="space-y-2">
            <label className="flex items-center justify-between px-1 text-caption font-bold text-content-secondary">
              <span>{t("schedule.pickTime")}</span>
              {canConfirm ? <span className="text-caption font-black text-copper">{t("schedule.required")}</span> : null}
            </label>

            {!pickerDateKey ? (
              <p className="rounded-control border border-dashed border-border-interactive bg-surface-secondary px-4 py-6 text-center text-caption text-content-tertiary">
                {t("schedule.pickDayHint")}
              </p>
            ) : loading ? (
              <div className="flex items-center justify-center gap-2 rounded-control border border-border-interactive bg-surface-secondary px-4 py-6 text-caption font-bold text-content-secondary">
                <LoaderCircle className="size-4 animate-spin text-copper" aria-hidden="true" />
                {t("schedule.loadingTimes")}
              </div>
            ) : (slots?.data ?? []).length === 0 ? (
              <p className="rounded-control border border-dashed border-border-interactive bg-surface-secondary px-4 py-6 text-center text-caption text-content-tertiary">
                {t("schedule.emptyDay")}
              </p>
            ) : (
              <TimeSlotGrid slots={slots?.data ?? []} selectedId={pickerSlot?.id ?? null} disabledTitles={disabledTitles} onSelect={setPickerSlot} />
            )}
          </div>
        </div>

        {/* Preview strip */}
        <div className="mt-4 rounded-control border border-border-primary/80 bg-surface-secondary/80 p-2.5 text-center text-caption">
          {pickerDay && pickerSlot ? (
            <span className="inline-flex items-center gap-1.5 font-black text-accent">
              <Check className="size-3.5 text-copper" strokeWidth={3} aria-hidden="true" />
              {formatPrettyDate(pickerDay, locale, jalali)} · <span dir="ltr">{pickerSlot.startTime.slice(0, 5)}</span>
            </span>
          ) : (
            <span className="text-content-tertiary">{t("schedule.selectHint")}</span>
          )}
        </div>

        {/* Actions */}
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-border-primary/80 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-pill border border-border-interactive px-4 text-body-sm font-bold text-content-secondary transition-colors hover:bg-surface-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {t("schedule.cancel")}
          </button>
          <button
            type="button"
            disabled={!canConfirm}
            onClick={() => {
              if (!pickerSlot) return;
              onAssign(group.id, pickerSlot);
              onClose();
            }}
            className={cn(
              "inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-pill bg-accent px-5 text-body-sm font-black text-content-contrast shadow-elevation-1 transition-all hover:bg-copper-deep disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
            )}
          >
            <Check className="size-4" strokeWidth={3} aria-hidden="true" />
            {t("schedule.confirmSlot")}
          </button>
        </div>
      </div>
    </div>
  );
}