"use client";

import { useTranslations } from "next-intl";
import { Check, Lock } from "lucide-react";
import type { SlotOption } from "../types";
import { cn } from "@/lib/utils";

type SlotGridProps = {
  /** The day's slots, already sorted by start time. */
  slots: SlotOption[] | null;
  loading?: boolean;
  selectedId: string | null;
  suggestedId: string | null;
  isTaken: (slot: SlotOption) => boolean;
  reservedName: (slot: SlotOption) => string | null;
  onSelect: (slot: SlotOption) => void;
};

/** Flat time-slot grid ordered by clock time (no shift filtering). */
export default function SlotGrid({
  slots,
  loading = false,
  selectedId,
  suggestedId,
  isTaken,
  reservedName,
  onSelect,
}: SlotGridProps) {
  const t = useTranslations("booking");

  if (loading || slots === null) {
    return (
      <div className="grid grid-cols-2 gap-2.5 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6" aria-hidden="true">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-panel bg-surface-tertiary" />
        ))}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="rounded-panel border border-border-primary bg-surface-primary p-6 text-center text-xs font-semibold text-content-secondary">
        {t("schedule.noSlots")}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2.5 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6">
      {slots.map((slot) => {
        const selected = selectedId === slot.id;
        const taken = isTaken(slot);
        const suggested = !taken && suggestedId === slot.id && !selected;
        const name = reservedName(slot);

        return (
          <button
            key={slot.id}
            type="button"
            disabled={taken || !slot.available}
            onClick={() => onSelect(slot)}
            className={cn(
              "group relative cursor-pointer select-none rounded-panel border p-3 text-center font-bold transition-all",
              taken || !slot.available
                ? "cursor-not-allowed border-error/40 bg-error/10 text-error opacity-70"
                : selected
                  ? "scale-[1.03] border-copper bg-accent text-content-contrast shadow-md ring-2 ring-copper/60"
                  : suggested
                    ? "border-copper bg-surface-primary text-content-primary ring-1 ring-copper hover:bg-surface-tertiary"
                    : "border-border-interactive bg-surface-primary text-content-primary hover:border-copper hover:bg-surface-tertiary",
            )}
          >
            <div className="flex items-center justify-center gap-1 text-sm font-black tracking-wide" dir="ltr">
              <span>{slot.startTime.slice(0, 5)}</span>
              {selected ? (
                <Check className="size-3.5 animate-zoom-in text-copper" aria-hidden="true" />
              ) : null}
            </div>

            {taken ? (
              <div className="mt-1 flex items-center justify-center gap-0.5 truncate text-[9px] font-bold text-error">
                <Lock className="size-2.5 shrink-0" aria-hidden="true" />
                <span className="max-w-[90px] truncate">{name ?? t("schedule.available")}</span>
              </div>
            ) : !slot.available ? (
              <div className="mt-1 text-[10px] font-bold text-error">{t("schedule.full")}</div>
            ) : suggested ? (
              <div className="rounded-md bg-copper/15 px-1 py-0.5 text-[9px] font-black text-copper-deep">
                {t("schedule.nextSlot")}
              </div>
            ) : (
              <div
                className={cn(
                  "mt-1 text-[10px] font-medium",
                  selected ? "text-copper-light" : "text-content-secondary",
                )}
              >
                {t("schedule.available")}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
