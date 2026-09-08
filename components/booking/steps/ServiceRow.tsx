"use client";

import { useTranslations } from "next-intl";
import { Check, Clock, Info, Plus } from "lucide-react";
import { formatNumber } from "@/lib/services/format";
import { cn } from "@/lib/utils";
import type { GroupTheme } from "../group-theme";
import type { SelectedService } from "../types";

type ServiceRowProps = {
  service: SelectedService;
  rowNumber: number;
  selected: boolean;
  theme: GroupTheme;
  onToggle: () => void;
  onInfo: () => void;
};

/**
 * One service row of the step-1 table (Template parity). Desktop renders a
 * multi-column grid row; mobile renders a compact two-tier card. Both tiers
 * are fluid so the table never overflows horizontally.
 */
export function ServiceRow({ service, rowNumber, selected, theme, onToggle, onInfo }: ServiceRowProps) {
  const t = useTranslations("booking");
  const GroupIcon = theme.icon;

  const checkBadge = selected ? (
    <div className={cn("flex size-6 shrink-0 items-center justify-center rounded-lg shadow-xs transition-all", theme.buttonCheckBg)}>
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
      onClick={(e) => {
        e.stopPropagation();
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
          <span>{t("services.selectedLabel")}</span>
        </>
      ) : (
        <>
          <Plus className="size-4" aria-hidden="true" />
          <span>{t("services.selectLabel")}</span>
        </>
      )}
    </button>
  );

  const infoButton = (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onInfo();
      }}
      className="inline-flex min-h-11 cursor-pointer items-center gap-1 rounded-control px-2 text-body-sm font-bold text-copper transition-colors hover:text-copper-deep hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <Info className="size-4 shrink-0" aria-hidden="true" />
      <span>{t("services.moreInfo")}</span>
    </button>
  );

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={service.title}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
      className={cn(
        "w-full cursor-pointer select-none transition-colors group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        selected
          ? "bg-accent/[0.04] hover:bg-accent/[0.08]"
          : "even:bg-surface-secondary/20 hover:bg-surface-secondary/70",
      )}
    >
      {/* Desktop row */}
      <div className="hidden grid-cols-[3rem_minmax(0,1fr)_9rem_6rem_7.5rem] items-center gap-3 px-4 py-3 md:grid">
        <div className="flex items-center justify-center">{checkBadge}</div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={cn("text-body-sm font-black leading-snug", selected ? "text-accent" : "text-content-primary")}>
              {service.title}
            </span>
            {service.isFeatured ? (
              <span className={cn("rounded-control px-1.5 py-0.5 text-[10px] font-black", theme.tagBarBg, theme.tagBarText)}>
                {t("services.featuredTag")}
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 max-w-lg truncate text-caption leading-tight text-content-tertiary">
            {service.shortDesc}
          </p>
        </div>

        <div className="flex items-center justify-center">
          <span className={cn("inline-flex max-w-full items-center gap-1 rounded-pill border px-2 py-0.5 text-caption font-bold", theme.tagBarBg, theme.tagBarText, theme.tagBarBorder)}>
            <GroupIcon className="size-3 shrink-0" aria-hidden="true" />
            <span className="truncate">{service.categoryTitle}</span>
          </span>
        </div>

        <div className="flex items-center justify-center gap-1 text-body-sm font-bold text-content-secondary">
          <Clock className="size-3.5 shrink-0 text-copper" aria-hidden="true" />
          <span>
            {formatNumber(service.durationMin)} {t("appointment.minutes")}
          </span>
        </div>

        <div className="flex flex-col items-center justify-center gap-1 py-1">
          {selectPill}
          {infoButton}
        </div>
      </div>

      {/* Mobile row */}
      <div className="block space-y-2.5 p-3.5 md:hidden">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {checkBadge}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className={cn("text-body-sm font-black leading-snug", selected ? "text-accent" : "text-content-primary")}>
                  {service.title}
                </span>
                {service.isFeatured ? (
                  <span className={cn("rounded-control px-1 py-0.5 text-[9px] font-black", theme.tagBarBg, theme.tagBarText)}>
                    {t("services.featuredTag")}
                  </span>
                ) : null}
              </div>
              {service.shortDesc ? (
                <p className="mt-0.5 truncate text-caption text-content-tertiary">{service.shortDesc}</p>
              ) : null}
            </div>
          </div>

          <span className={cn("inline-flex shrink-0 items-center gap-1 rounded-pill border px-1.5 py-0.5 text-[10px] font-bold", theme.tagBarBg, theme.tagBarText, theme.tagBarBorder)}>
            <GroupIcon className="size-3 shrink-0" aria-hidden="true" />
            <span className="max-w-24 truncate">{service.categoryTitle}</span>
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border-primary/40 pt-2">
          <div className="flex items-center gap-2 text-body-sm">
            <span className="inline-flex items-center gap-1 font-bold text-content-tertiary">
              <Clock className="size-3.5 shrink-0 text-copper" aria-hidden="true" />
              <span>
                {formatNumber(service.durationMin)} {t("appointment.minutes")}
              </span>
            </span>
          </div>

          <div className="flex items-center justify-end gap-1.5">
            {selectPill}
            {infoButton}
          </div>
        </div>
      </div>
    </div>
  );
}