"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle, ArrowRight, CalendarDays, Check, Clock } from "lucide-react";
import { formatNumber } from "@/lib/services/format";
import { findCartConflicts } from "@/lib/booking/scheduling";
import { cn } from "@/lib/utils";
import { SlotLabel } from "../SlotLabel";
import DateModal from "./DateModal";
import type { CartItem, SelectedService, SlotOption } from "../types";

type ScheduleStepProps = {
  cart: CartItem[];
  currency: string;
  onAssignSlot: (serviceId: string, slot: SlotOption | null) => void;
  onBack: () => void;
};

/**
 * Step 2 — per-service date & time (Template parity). Each cart line opens its
 * own themed DateModal fed by REAL slot availability.
 */
export default function ScheduleStep({ cart, currency, onAssignSlot, onBack }: ScheduleStepProps) {
  const t = useTranslations("booking");
  const [activeService, setActiveService] = useState<SelectedService | null>(null);

  const scheduledCount = cart.filter((line) => line.slot).length;
  const allScheduled = cart.length > 0 && scheduledCount === cart.length;
  const conflicts = findCartConflicts(cart);

  if (cart.length === 0) {
    return (
      <div className="w-full space-y-4">
        <div className="rounded-panel border border-dashed border-border-primary bg-surface-secondary p-10 text-center">
          <AlertCircle className="mx-auto mb-3 size-10 text-copper" aria-hidden="true" />
          <h3 className="text-body font-black text-content-primary">{t("schedule.noServicesTitle")}</h3>
          <p className="mx-auto mt-1 max-w-sm text-caption text-content-secondary">{t("schedule.noServicesDesc")}</p>
          <button
            type="button"
            onClick={onBack}
            className="mt-4 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-pill bg-accent px-5 text-body-sm font-black text-content-contrast transition-colors hover:bg-copper-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <ArrowRight className="rtl-mirror size-4" aria-hidden="true" />
            {t("schedule.backToServices")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Top bar */}
      <div className="rounded-panel border border-border-primary/80 bg-surface-secondary/70 p-3 shadow-xs sm:p-3.5">
        <div className="flex flex-col justify-between gap-2.5 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-body-lg font-black tracking-tight text-accent">{t("schedule.title")}</h2>
            <span className="rounded-pill border border-border-primary/80 bg-surface-primary px-2.5 py-0.5 text-caption font-black text-copper">
              {t("schedule.selectedCount", { n: cart.length })}
            </span>
          </div>

          {allScheduled ? (
            <span className="inline-flex items-center gap-1.5 self-start rounded-pill border border-success/30 bg-success/15 px-3 py-1 text-caption font-black text-success sm:self-auto">
              <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
              {t("schedule.allScheduled")}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 self-start rounded-pill border border-copper/30 bg-copper/15 px-3 py-1 text-caption font-black text-copper-deep sm:self-auto">
              <AlertCircle className="size-3.5" aria-hidden="true" />
              {t("schedule.progressScheduled", { n: scheduledCount, total: cart.length })}
            </span>
          )}
        </div>
      </div>

      {/* Conflict alert */}
      {conflicts.length > 0 ? (
        <div role="alert" className="flex items-start gap-2.5 rounded-panel border border-error/40 bg-error/5 p-3.5">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-error" aria-hidden="true" />
          <div>
            <p className="text-body-sm font-black text-error">{t("schedule.conflictsTitle")}</p>
            <p className="mt-0.5 text-caption text-content-secondary">{t("schedule.conflictsDesc")}</p>
          </div>
        </div>
      ) : null}

      {/* Table */}
      <div className="overflow-hidden rounded-panel border border-border-primary bg-surface-primary shadow-xs">
        {/* Desktop header */}
        <div className="hidden grid-cols-[3.5rem_minmax(0,1fr)_8rem_6rem_16rem] items-center gap-3 border-b border-border-primary/80 bg-surface-secondary/90 px-4 py-3 text-caption font-black text-accent md:grid">
          <div className="text-center">{t("schedule.colIndex")}</div>
          <div>{t("schedule.colService")}</div>
          <div className="text-center">{t("schedule.colPrice")}</div>
          <div className="text-center">{t("schedule.colDuration")}</div>
          <div className="text-center">{t("schedule.colSlot")}</div>
        </div>

        <div className="divide-y divide-border-primary/60">
          {cart.map((line, index) => {
            const assigned = line.slot;
            return (
              <div key={line.service.id} className="w-full bg-surface-primary even:bg-surface-secondary/15 hover:bg-surface-secondary/50">
                {/* Desktop row */}
                <div className="hidden grid-cols-[3.5rem_minmax(0,1fr)_8rem_6rem_16rem] items-center gap-3 px-4 py-3 md:grid">
                  <div className="flex items-center justify-center">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-lg border border-border-interactive/70 bg-surface-secondary text-caption font-black text-content-secondary">
                      {index + 1}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-body-sm font-black leading-snug text-content-primary">{line.service.title}</span>
                      <span className="rounded-pill border border-border-primary bg-surface-secondary px-2 py-0.5 text-caption font-bold text-content-secondary">
                        {line.service.categoryTitle}
                      </span>
                    </div>
                    {line.service.shortDesc ? (
                      <p className="mt-0.5 max-w-lg truncate text-caption leading-tight text-content-tertiary">{line.service.shortDesc}</p>
                    ) : null}
                  </div>

                  <div className="text-center">
                    <span className="text-body-sm font-black text-copper-deep">
                      {formatNumber(line.service.price)} {currency}
                    </span>
                  </div>

                  <div className="flex items-center justify-center gap-1 text-body-sm font-bold text-content-secondary">
                    <Clock className="size-3.5 shrink-0 text-copper" aria-hidden="true" />
                    {formatNumber(line.service.durationMin)} {t("appointment.minutes")}
                  </div>

                  <div className="flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setActiveService(line.service)}
                      className={cn(
                        "inline-flex min-h-11 w-full max-w-64 cursor-pointer select-none items-center justify-between gap-1.5 rounded-pill border px-3 text-caption font-bold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                        assigned
                          ? "border-copper bg-copper/10 text-copper-deep hover:bg-copper hover:text-content-contrast"
                          : "border-border-interactive bg-surface-secondary text-content-secondary hover:border-copper hover:bg-surface-tertiary hover:text-accent",
                      )}
                    >
                      <span className="inline-flex min-w-0 items-center gap-1.5">
                        <CalendarDays className="size-3.5 shrink-0 text-copper" aria-hidden="true" />
                        <span className="truncate">
                          {assigned ? <SlotLabel line={line} /> : t("schedule.pickDateTime")}
                        </span>
                      </span>
                      <span className="shrink-0 text-caption font-black opacity-90">
                        {assigned ? t("schedule.editSlot") : t("schedule.pick")}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Mobile row */}
                <div className="block space-y-2.5 p-3.5 md:hidden">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-md border border-border-interactive bg-surface-secondary text-caption font-black text-content-secondary">
                        {index + 1}
                      </span>
                      <span className="min-w-0 truncate text-body-sm font-black text-content-primary">{line.service.title}</span>
                    </div>
                    <span className="shrink-0 text-body-sm font-black text-copper-deep">
                      {formatNumber(line.service.price)} {currency}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-border-primary/40 pt-2 text-caption text-content-tertiary">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-3 shrink-0 text-copper" aria-hidden="true" />
                      {t("schedule.durationShort", { n: formatNumber(line.service.durationMin) })}
                    </span>
                    <span className="font-bold text-content-secondary">{line.service.categoryTitle}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveService(line.service)}
                    className={cn(
                      "inline-flex min-h-11 w-full cursor-pointer select-none items-center justify-between gap-2 rounded-control border px-3 py-2 text-caption font-bold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                      assigned ? "border-copper bg-copper/10 text-copper-deep" : "border-border-interactive bg-surface-secondary text-content-secondary hover:border-copper",
                    )}
                  >
                    <span className="inline-flex min-w-0 items-center gap-1.5">
                      <CalendarDays className="size-4 shrink-0 text-copper" aria-hidden="true" />
                      <span className="truncate">
                        {assigned ? <SlotLabel line={line} /> : t("schedule.pickDateTime")}
                      </span>
                    </span>
                    <span className="shrink-0 text-caption font-bold text-copper underline">
                      {assigned ? t("schedule.editSlot") : t("schedule.pick")}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Per-service date/time modal */}
      {activeService ? (
        <DateModal
          service={activeService}
          current={cart.find((line) => line.service.id === activeService.id)?.slot ?? null}
          cart={cart}
          onAssign={onAssignSlot}
          onClose={() => setActiveService(null)}
        />
      ) : null}

      <div aria-hidden="true" className="h-16 sm:h-20" />
    </div>
  );
}