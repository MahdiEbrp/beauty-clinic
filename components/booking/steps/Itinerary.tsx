"use client";

import { useTranslations } from "next-intl";
import { AlertCircle, ArrowRight, CalendarDays, CheckCircle2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CartItem } from "../types";
import { SlotLabel } from "../SlotLabel";

type ItineraryProps = {
  cart: CartItem[];
  conflicts: number[][];
  isComplete: boolean;
  onActivate: (serviceId: string) => void;
  onContinue: () => void;
  className?: string;
};

/** Visual appointment itinerary with zero-overlap verification (Template Step2
 *  parity) plus the conflicts alert and continue/complete action. */
export default function Itinerary({
  cart,
  conflicts,
  isComplete,
  onActivate,
  onContinue,
  className,
}: ItineraryProps) {
  const t = useTranslations("booking");

  return (
    <div
      className={cn(
        "space-y-3.5 rounded-panel border-2 border-copper/80 bg-surface-secondary p-4 shadow-md sm:p-5",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border-primary pb-3">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-control bg-copper text-content-contrast shadow-elevation-1">
            <CalendarDays className="size-4" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-black text-content-primary sm:text-base">{t("schedule.itineraryTitle")}</h3>
            <span className="text-[11px] font-medium text-content-secondary">{t("schedule.itinerarySub")}</span>
          </div>
        </div>

        {isComplete ? (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-control border border-copper/40 bg-surface-primary px-3 py-1 text-xs font-black text-accent shadow-elevation-1">
            <CheckCircle2 className="size-4 text-copper" aria-hidden="true" />
            {t("schedule.verified")}
          </span>
        ) : null}
      </div>

      {/* Slots list */}
      <div className="space-y-2">
        {cart.map((line, idx) => {
          const scheduled = Boolean(line.slot);
          return (
            <div
              key={line.service.id}
              className="flex flex-col justify-between gap-2.5 rounded-control border border-border-interactive bg-surface-primary p-3 sm:flex-row sm:items-center"
            >
              <div className="flex items-center gap-2.5">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-control bg-accent text-xs font-black text-content-contrast">
                  {idx + 1}
                </span>
                <div>
                  <div className="text-xs font-black text-content-primary sm:text-sm">{line.service.title}</div>
                  <div className="text-[11px] text-content-secondary">
                    {line.service.categoryTitle} • {t("schedule.serviceDuration", { n: line.service.durationMin ?? 45 })}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                {scheduled ? (
                  <span className="flex items-center gap-1.5 rounded-control border border-border-interactive bg-surface-secondary px-3 py-1.5 text-xs font-bold text-content-primary">
                    <SlotLabel line={line} />
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onActivate(line.service.id)}
                    className="cursor-pointer rounded-control border border-copper/40 bg-surface-tertiary px-3 py-1.5 text-xs font-black text-accent transition-colors hover:bg-surface-secondary"
                  >
                    {t("schedule.selectSlot")}
                  </button>
                )}

                {cart.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => onActivate(line.service.id)}
                    title={t("schedule.editSlot")}
                    className="cursor-pointer rounded-control p-1.5 text-content-secondary transition-colors hover:bg-surface-secondary hover:text-content-primary"
                  >
                    <RotateCcw className="size-3.5" aria-hidden="true" />
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* Conflicts alert */}
      {conflicts.length > 0 ? (
        <div className="space-y-1 rounded-control border border-red-300 bg-red-100 p-3 text-xs font-bold text-red-800">
          <div className="flex items-center gap-1.5 font-black">
            <AlertCircle className="size-4 text-red-600" aria-hidden="true" />
            {t("schedule.conflictsTitle")}
          </div>
          {conflicts.map((pair, i) => (
            <div key={i} className="ms-5">
              • {cart[pair[0]]?.service.title} ↔ {cart[pair[1]]?.service.title}
            </div>
          ))}
        </div>
      ) : null}

      {/* Action */}
      {isComplete ? (
        <div className="flex flex-col justify-between gap-3 pt-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-1.5 rounded-control border border-border-interactive bg-surface-primary px-3.5 py-2 text-xs font-extrabold text-copper-deep">
            <CheckCircle2 className="size-4 shrink-0 text-copper" aria-hidden="true" />
            {t("schedule.readyProceed")}
          </div>
          <button
            type="button"
            onClick={onContinue}
            className="flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-control border border-copper bg-accent px-6 py-2.5 text-sm font-black text-content-contrast shadow-sm transition-all hover:bg-accent-hover active:scale-[0.98]"
          >
            {t("schedule.confirmContinue")}
            <ArrowRight className="size-4 text-copper-light rtl-mirror" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-control border border-border-interactive bg-surface-primary p-3 text-xs font-bold text-copper-deep">
          <AlertCircle className="size-4 shrink-0 text-copper" aria-hidden="true" />
          {t("schedule.pickAllTimes")}
        </div>
      )}
    </div>
  );
}
