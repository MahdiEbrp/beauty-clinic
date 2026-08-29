"use client";

import { useTranslations } from "next-intl";
import { CalendarDays, Check, ChevronDown, Layers, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CartItem } from "../types";

type SmartScheduleBarProps = {
  cart: CartItem[];
  activeId: string;
  feedback: string | null;
  onActivate: (serviceId: string) => void;
  onSmartSameDay: () => void;
  onSmartMultiDay: () => void;
  onDismissFeedback: () => void;
};

/** Multi-service smart auto-schedule toolbar + feedback + service tabs
 *  (Template Step2 parity). */
export default function SmartScheduleBar({
  cart,
  activeId,
  feedback,
  onActivate,
  onSmartSameDay,
  onSmartMultiDay,
  onDismissFeedback,
}: SmartScheduleBarProps) {
  const t = useTranslations("booking");
  if (cart.length <= 1) return null;

  return (
    <>
      {/* Header card already renders the toolbar inside its footer */}
      <div className="flex flex-col justify-between gap-3 rounded-panel border border-border-primary bg-surface-secondary p-4 shadow-elevation-1 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-black text-content-primary">
            <Wand2 className="size-4 text-copper" aria-hidden="true" />
            {t("schedule.smartTitle")}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onSmartSameDay}
              className="flex cursor-pointer items-center gap-1.5 rounded-control bg-accent px-3.5 py-1.5 text-xs font-extrabold text-content-contrast shadow-elevation-1 transition-all hover:bg-accent-hover"
            >
              <CalendarDays className="size-3.5 text-copper" aria-hidden="true" />
              {t("schedule.sameDay")}
            </button>
            <button
              type="button"
              onClick={onSmartMultiDay}
              className="flex cursor-pointer items-center gap-1.5 rounded-control border border-border-interactive bg-surface-primary px-3.5 py-1.5 text-xs font-bold text-content-primary shadow-elevation-1 transition-all hover:bg-surface-secondary"
            >
              <Layers className="size-3.5 text-copper" aria-hidden="true" />
              {t("schedule.separateDays")}
            </button>
          </div>
        </div>
      </div>

      {/* Smart feedback */}
      {feedback ? (
        <div className="flex items-center justify-between gap-2 rounded-panel border border-copper bg-copper/15 p-3 text-xs font-bold text-copper-deep shadow-elevation-1 sm:text-sm">
          <div className="flex items-center gap-2">
            <Check className="size-5 shrink-0 text-copper" strokeWidth={3} aria-hidden="true" />
            <span>{feedback}</span>
          </div>
          <button
            type="button"
            onClick={onDismissFeedback}
            className="cursor-pointer p-1 text-content-secondary hover:text-content-primary"
            aria-label={t("success.close")}
          >
            <ChevronDown className="size-4" aria-hidden="true" />
          </button>
        </div>
      ) : null}

      {/* Service tabs */}
      <div className="space-y-2.5 rounded-panel border border-border-primary bg-surface-secondary p-3 shadow-elevation-1 sm:p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-black text-content-primary">
            <Layers className="size-4 text-copper" aria-hidden="true" />
            {t("schedule.schedulingLabel")}
          </div>
          <span className="text-[11px] font-medium text-content-secondary">{t("schedule.clickToEdit")}</span>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
          {cart.map((line, idx) => {
            const isActive = line.service.id === activeId;
            const isScheduled = Boolean(line.slot);
            return (
              <button
                key={line.service.id}
                type="button"
                onClick={() => onActivate(line.service.id)}
                className={cn(
                  "flex cursor-pointer flex-col justify-between gap-1.5 rounded-control border p-2.5 text-start transition-all",
                  isActive
                    ? "border-copper bg-accent font-bold text-content-contrast shadow-md ring-2 ring-copper/60"
                    : isScheduled
                      ? "border-copper/50 bg-surface-primary text-content-primary hover:border-copper"
                      : "border-border-interactive bg-surface-primary text-content-primary hover:border-copper",
                )}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <span className="max-w-40 truncate text-xs font-black">
                    {idx + 1}. {line.service.title}
                  </span>
                  {isScheduled ? (
                    <span
                      className={cn(
                        "flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-black",
                        isActive
                          ? "bg-copper text-content-contrast"
                          : "border border-copper/30 bg-surface-tertiary text-copper-deep",
                      )}
                    >
                      <Check className="size-2.5" aria-hidden="true" />
                      <span>{t("schedule.ready")}</span>
                    </span>
                  ) : (
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                        isActive
                          ? "bg-white/20 text-content-contrast"
                          : "border border-border-primary bg-surface-tertiary text-copper-strong",
                      )}
                    >
                      {t("schedule.pickTime")}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-1 text-[11px] font-semibold">
                  <span className={isActive ? "text-copper-light" : "text-content-secondary"}>
                    {isScheduled ? t("schedule.noTime") : t("schedule.noTime")}
                  </span>
                  <span className="text-[10px] opacity-75">
                    {t("schedule.durationShort", { n: line.service.durationMin ?? 45 })}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
