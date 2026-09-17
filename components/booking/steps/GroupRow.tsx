"use client";

import { useTranslations } from "next-intl";
import { Check, Info, Layers, ListOrdered, Plus } from "lucide-react";
import { formatNumber } from "@/lib/services/format";
import { cn } from "@/lib/utils";
import type { GroupTheme } from "../group-theme";
import type { SelectedGroup } from "../types";

type GroupRowProps = {
  group: SelectedGroup;
  rowNumber: number;
  selected: boolean;
  theme: GroupTheme;
  onToggle: () => void;
  onInfo: () => void;
  /** When false, the "more info" button is hidden entirely. */
  showInfo: boolean;
};

/**
 * One treatment-group row of the step-1 table. Desktop renders a multi-column
 * grid row; mobile renders a compact two-tier card, both fluid so the table
 * never overflows horizontally.
 */
export function GroupRow({ group, rowNumber, selected, theme, onToggle, onInfo, showInfo }: GroupRowProps) {
  const t = useTranslations("booking");
  const GroupIcon = theme.icon;

  const categoryCount = group.categories.length;
  const serviceCount = group.categories.reduce(
    (sum, category) => sum + category.services.length,
    0,
  );

  const checkBadge = selected ? (
    <div
      className={cn(
        "flex size-6 shrink-0 items-center justify-center rounded-lg shadow-xs transition-all",
        theme.buttonCheckBg,
      )}
    >
      <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
    </div>
  ) : (
    <div className="flex size-6 shrink-0 items-center justify-center rounded-lg border border-border-interactive/70 bg-surface-secondary text-content-tertiary transition-all group-hover:border-copper group-hover:text-copper">
      <span className="text-caption font-black leading-none">{rowNumber}</span>
    </div>
  );

  const selectPill = (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onToggle();
      }}
      className={cn(
        "inline-flex min-h-11 cursor-pointer select-none items-center justify-center gap-1 rounded-pill px-4 text-body-sm font-black transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        selected
          ? "bg-accent text-content-contrast shadow-sm"
          : "border border-border-interactive bg-surface-secondary text-content-secondary hover:border-copper hover:text-content-primary",
      )}
      aria-pressed={selected}
    >
      {selected ? (
        <>
          <Check className="size-4" strokeWidth={3} aria-hidden="true" />
          <span>{t("groups.selectedLabel")}</span>
        </>
      ) : (
        <>
          <Plus className="size-4" aria-hidden="true" />
          <span>{t("groups.selectLabel")}</span>
        </>
      )}
    </button>
  );

  const infoButton = (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onInfo();
      }}
      className="inline-flex min-h-11 cursor-pointer items-center gap-1 rounded-control px-2 text-body-sm font-bold text-copper transition-colors hover:text-copper-deep hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <Info className="size-4 shrink-0" aria-hidden="true" />
      <span>{t("groups.moreInfo")}</span>
    </button>
  );

  const categoryTag = (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1 rounded-pill border px-2 py-0.5 text-caption font-bold",
        theme.tagBarBg,
        theme.tagBarText,
        theme.tagBarBorder,
      )}
    >
      <Layers className="size-3 shrink-0" aria-hidden="true" />
      <span className="truncate">{t("groups.categoryCount", { n: formatNumber(categoryCount) })}</span>
    </span>
  );

  const serviceTag = (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1 rounded-pill border px-2 py-0.5 text-caption font-bold",
        theme.tagBarBg,
        theme.tagBarText,
        theme.tagBarBorder,
      )}
    >
      <ListOrdered className="size-3 shrink-0" aria-hidden="true" />
      <span className="truncate">{t("groups.serviceCount", { n: formatNumber(serviceCount) })}</span>
    </span>
  );

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={group.title}
      onClick={onToggle}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onToggle();
        }
      }}
      className={cn(
        "group w-full cursor-pointer select-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        selected
          ? "bg-accent/4 hover:bg-accent/8"
          : "even:bg-surface-secondary/20 hover:bg-surface-secondary/70",
      )}
    >
      {/* Desktop row */}
      <div className="hidden grid-cols-[3rem_minmax(0,1fr)_8rem_7rem_9rem] items-center gap-3 px-4 py-3 md:grid">
        <div className="flex items-center justify-center">{checkBadge}</div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={cn(
                "text-body-sm font-black leading-snug",
                selected ? "text-accent" : "text-content-primary",
              )}
            >
              {group.title}
            </span>
          </div>
          {group.description ? (
            <p className="mt-0.5 max-w-lg truncate text-caption leading-tight text-content-tertiary">
              {group.description}
            </p>
          ) : null}
        </div>

        <div className="flex items-center justify-center">{categoryTag}</div>
        <div className="flex items-center justify-center">{serviceTag}</div>

        <div className="flex flex-col items-center justify-center gap-1 py-1">
          {selectPill}
          {showInfo ? infoButton : null}
        </div>
      </div>

      {/* Mobile row */}
      <div className="block space-y-2.5 p-3.5 md:hidden">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {checkBadge}
            <div className="min-w-0 flex-1">
              <span
                className={cn(
                  "block text-body-sm font-black leading-snug",
                  selected ? "text-accent" : "text-content-primary",
                )}
              >
                {group.title}
              </span>
              {group.description ? (
                <p className="mt-0.5 truncate text-caption text-content-tertiary">
                  {group.description}
                </p>
              ) : null}
            </div>
          </div>

          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-control",
              theme.iconBg,
              theme.iconColor,
            )}
            aria-hidden="true"
          >
            <GroupIcon className="size-4" />
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border-primary/40 pt-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {categoryTag}
            {serviceTag}
          </div>

          <div className="flex items-center justify-end gap-1.5">
            {selectPill}
            {showInfo ? infoButton : null}
          </div>
        </div>
      </div>
    </div>
  );
}
