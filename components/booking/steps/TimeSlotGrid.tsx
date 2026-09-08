"use client";

import { Check, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SlotOption } from "../types";

type TimeSlotGridProps = {
  slots: SlotOption[];
  selectedId: string | null;
  disabledTitles: Map<string, string>;
  onSelect: (slot: SlotOption) => void;
};

/** Real availability chips for one date (hide-full + same-time lock applied). */
export function TimeSlotGrid({ slots, selectedId, disabledTitles, onSelect }: TimeSlotGridProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {slots.map((slot) => {
        const conflictTitle = disabledTitles.get(slot.id);
        const taken = selectedId === slot.id;
        return (
          <button
            key={slot.id}
            type="button"
            disabled={Boolean(conflictTitle)}
            title={conflictTitle ?? undefined}
            onClick={() => onSelect(slot)}
            className={cn(
              "inline-flex min-h-11 cursor-pointer select-none items-center justify-center gap-1 rounded-control border px-2 text-body-sm transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
              taken
                ? "border-copper bg-copper font-black text-content-contrast shadow-elevation-1 ring-1 ring-copper"
                : "border-border-interactive bg-surface-secondary font-bold text-content-primary hover:border-copper hover:bg-surface-tertiary",
              conflictTitle && "cursor-not-allowed opacity-40",
            )}
          >
            {taken ? <Check className="size-3.5" strokeWidth={3} aria-hidden="true" /> : <Clock className="size-3.5 text-copper" aria-hidden="true" />}
            <span dir="ltr">{slot.startTime.slice(0, 5)}</span>
          </button>
        );
      })}
    </div>
  );
}