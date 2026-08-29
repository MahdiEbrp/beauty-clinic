"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Lock, Sun, Sunset } from "lucide-react";
import type { SlotOption } from "../types";
import { cn } from "@/lib/utils";

type PeriodFilter = "all" | "morning" | "afternoon";

type SlotGridProps = {
  grouped: { period: string; slots: SlotOption[] }[];
  selectedId: string | null;
  suggestedId: string | null;
  isTaken: (slot: SlotOption) => boolean;
  reservedName: (slot: SlotOption) => string | null;
  onSelect: (slot: SlotOption) => void;
  isFriday: boolean;
};

const FILTERS: { key: PeriodFilter; icon?: "sun" | "sunset" }[] = [
  { key: "all" },
  { key: "morning", icon: "sun" },
  { key: "afternoon", icon: "sunset" },
];

const FILTER_LABEL: Record<PeriodFilter, "schedule.allSlots" | "schedule.morning" | "schedule.evening"> = {
  all: "schedule.allSlots",
  morning: "schedule.morning",
  afternoon: "schedule.evening",
};

/** Period-filtered slot grid (Template Step2 parity): selected, conflict and
 *  consecutive-suggestion states. */
export default function SlotGrid({
  grouped,
  selectedId,
  suggestedId,
  isTaken,
  reservedName,
  onSelect,
  isFriday,
}: SlotGridProps) {
  const t = useTranslations("booking");
  const [filter, setFilter] = useState<PeriodFilter>("all");

  const buckets =
    filter === "morning"
      ? grouped.filter((g) => g.period === "morning")
      : filter === "afternoon"
        ? grouped.filter((g) => g.period === "afternoon" || g.period === "evening")
        : grouped;

  if (isFriday) {
    return (
      <div className="rounded-panel border border-border-primary bg-surface-primary p-6 text-center">
        <Lock className="mx-auto mb-2 size-8 text-copper" aria-hidden="true" />
        <p className="text-sm font-black text-content-primary">{t("schedule.closedFriTitle")}</p>
        <p className="mt-1 text-xs text-content-secondary">{t("schedule.closedFriDesc")}</p>
      </div>
    );
  }

  if (buckets.length === 0) {
    return (
      <div className="rounded-panel border border-border-primary bg-surface-primary p-6 text-center text-xs text-content-secondary">
        {t("schedule.noSlotsPeriod")}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Period filter */}
      <div className="flex items-center gap-1 rounded-control border border-border-interactive bg-surface-primary p-1">
        {FILTERS.filter((f) => f.key !== "afternoon" || !isFriday).map((f) => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={cn(
                "flex cursor-pointer items-center gap-1 rounded-control px-2.5 py-1 text-xs font-bold transition-all",
                active ? "bg-accent text-content-contrast shadow-elevation-1" : "text-content-secondary hover:text-content-primary",
              )}
            >
              {f.icon === "sun" ? <Sun className="size-3 text-copper" aria-hidden="true" /> : null}
              {f.icon === "sunset" ? <Sunset className="size-3 text-copper" aria-hidden="true" /> : null}
              {t(FILTER_LABEL[f.key])}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-2.5 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6">
        {buckets.flatMap((bucket) =>
          bucket.slots.map((slot) => {
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
                    ? "cursor-not-allowed border-red-300 bg-red-50/70 text-red-700 opacity-70"
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
                  <div className="mt-1 flex items-center justify-center gap-0.5 truncate text-[9px] font-bold text-red-700">
                    <Lock className="size-2.5 shrink-0" aria-hidden="true" />
                    <span className="max-w-[90px] truncate">{name ?? t("schedule.available")}</span>
                  </div>
                ) : suggested ? (
                  <div className="rounded-md bg-copper/15 px-1 py-0.5 text-[9px] font-black text-copper-deep">
                    ✨ {t("schedule.nextSlot")}
                  </div>
                ) : (
                  <div className={cn("mt-1 text-[10px] font-medium", selected ? "text-copper-light" : "text-content-secondary")}>
                    {t("schedule.available")}
                  </div>
                )}
              </button>
            );
          }),
        )}
      </div>
    </div>
  );
}
