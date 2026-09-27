"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GroupTheme } from "../group-theme";
import type { SelectedGroup } from "../types";

type GroupRowProps = {
  group: SelectedGroup;
  selected: boolean;
  theme: GroupTheme;
  onToggle: () => void;
};

/**
 * One treatment-group row of the step-1 picker — a checkbox + title only.
 * Descriptions and per-group counts are intentionally not shown (the booking
 * list is a flat set of bookable items, per the clinic's request).
 */
export function GroupRow({ group, selected, theme, onToggle }: GroupRowProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      aria-label={group.title}
      className={cn(
        "group flex w-full min-h-14 cursor-pointer select-none items-center gap-3 px-4 py-3 text-start transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        selected
          ? "bg-accent/4 hover:bg-accent/8"
          : "even:bg-surface-secondary/20 hover:bg-surface-secondary/70",
      )}
    >
      <span
        className={cn(
          "flex size-6 shrink-0 items-center justify-center rounded-lg border transition-all",
          selected
            ? cn(theme.buttonCheckBg, "border-transparent")
            : "border-border-interactive/70 bg-surface-secondary text-content-tertiary group-hover:border-copper group-hover:text-copper",
        )}
        aria-hidden="true"
      >
        {selected ? <Check className="size-3.5" strokeWidth={3} /> : null}
      </span>

      <span
        className={cn(
          "text-body-sm font-black leading-snug",
          selected ? "text-accent" : "text-content-primary",
        )}
      >
        {group.title}
      </span>
    </button>
  );
}
