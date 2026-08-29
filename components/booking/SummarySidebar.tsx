"use client";

import { useTranslations } from "next-intl";
import {
  ArrowRight,
  Clock,
  MapPin,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import { formatNumber } from "@/lib/services/format";
import { cn } from "@/lib/utils";
import type { CartItem } from "./types";
import { SlotLabel } from "./SlotLabel";

type Totals = { total: number; deposit: number; remaining: number };

type SummarySidebarProps = {
  cart: CartItem[];
  currency: string;
  totals: Totals;
  step: number;
  nextLabel: string;
  nextDisabled: boolean;
  onRemove: (serviceId: string) => void;
  onNext: () => void;
  addressTitle: string;
  address: string;
};

function money(value: number, currency: string): string {
  return `${formatNumber(value)} ${currency}`;
}

/** Sticky desktop summary (Template parity): copper panel with cart, totals,
 *  free-cancellation pill, CTA and clinic address. */
export default function SummarySidebar({
  cart,
  currency,
  totals,
  step,
  nextLabel,
  nextDisabled,
  onRemove,
  onNext,
  addressTitle,
  address,
}: SummarySidebarProps) {
  const t = useTranslations("booking");

  if (cart.length === 0) {
    return (
      <aside className="hidden w-80 shrink-0 space-y-3 lg:block">
        <div className="space-y-3 rounded-panel border border-border-primary bg-surface-secondary p-4 text-center shadow-elevation-1 sm:p-5">
          <div className="mx-auto flex size-12 items-center justify-center rounded-control border border-border-interactive bg-surface-tertiary text-copper">
            <Sparkles className="size-6" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-content-primary">
              {t("sidebar.emptyTitle")}
            </h3>
            <p className="mt-1 text-xs text-content-secondary">{t("sidebar.emptyDesc")}</p>
          </div>

          <div className="space-y-1.5 rounded-control border border-border-primary bg-surface-primary p-3 text-start text-xs text-content-secondary">
            <div className="flex items-center justify-between gap-2">
              <span>{t("sidebar.serviceRow")}</span>
              <span className="font-bold text-content-tertiary">{t("appointment.notSelected")}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span>{t("sidebar.dtRow")}</span>
              <span className="font-bold text-content-tertiary">{t("appointment.notSelected")}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span>{t("sidebar.consultRow")}</span>
              <span className="font-bold text-content-primary">{t("sidebar.consultRowValue")}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span>{t("sidebar.depositRow")}</span>
              <span className="font-bold text-copper-deep">{money(totals.deposit, currency)}</span>
            </div>
          </div>
        </div>

        {address ? (
          <div className="space-y-1 rounded-panel border border-border-primary bg-surface-secondary/80 p-3 text-xs text-content-secondary">
            <div className="flex items-center gap-1 font-bold text-content-primary">
              <MapPin className="size-3.5 text-copper" aria-hidden="true" />
              <span>{addressTitle}</span>
            </div>
            <p className="line-clamp-2 text-[11px] font-medium leading-relaxed">{address}</p>
          </div>
        ) : null}
      </aside>
    );
  }

  return (
    <aside className="hidden w-80 shrink-0 space-y-3 lg:block">
      <div className="sticky top-50 z-999 max-h-[calc(100vh-200px-1rem)] space-y-3.5 overflow-y-auto rounded-panel border-2 border-copper/80 bg-surface-secondary p-4 shadow-md sm:p-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-primary pb-2.5">
          <div>
            <h3 className="text-base font-extrabold text-content-primary">{t("sidebar.title")}</h3>
            <span className="text-xs font-bold text-copper-strong">
              {t("sidebar.count", { n: cart.length })}
            </span>
          </div>
          <span className="rounded-full bg-copper/15 px-2 py-0.5 text-[10px] font-black text-copper-deep ring-1 ring-copper/30">
            {t("sidebar.stepOf", { n: step + 1 })}
          </span>
        </div>

        {/* Selected services list */}
        <div className="max-h-56 space-y-2 overflow-y-auto pe-1 scrollbar-hide">
          <div className="text-[11px] font-bold uppercase tracking-wider text-content-tertiary">
            {t("sidebar.selectedLabel")}
          </div>

          {cart.map((line) => (
            <div
              key={line.service.id}
              className="relative w-full max-w-md m-0.5 space-y-1 rounded-control bg-surface-primary p-2.5 ring-1 ring-border-primary"
            >
              <div className="flex items-start justify-between gap-1">
                <span className="text-xs font-extrabold leading-snug text-content-primary">
                  {line.service.title}
                </span>
                {step === 0 ? (
                  <button
                    type="button"
                    onClick={() => onRemove(line.service.id)}
                    title={t("services.removeService")}
                    className="cursor-pointer rounded p-0.5 text-content-tertiary transition-colors hover:text-red-700"
                  >
                    <Trash2 className="size-3.5" aria-hidden="true" />
                  </button>
                ) : null}
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-accent">
                  {line.service.price != null ? money(line.service.price, currency) : ""}
                </span>
                <span className="text-[10px] font-medium text-content-secondary">
                  {t("sidebar.duration", { n: line.service.durationMin ?? 45 })}
                </span>
              </div>

              <div className="border-t border-border-primary/60 pt-1 text-[10px] text-content-secondary">
                {line.slot ? (
                  <span className="flex items-center gap-1 font-bold text-content-primary">
                    <Clock className="size-3 text-copper" aria-hidden="true" />
                    <SlotLabel line={line} />
                  </span>
                ) : (
                  <span className="font-semibold text-copper-strong">{t("appointment.notSelected")}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pricing totals */}
        <div className="space-y-2 border-t border-border-primary pt-3 text-xs">
          <div className="flex items-center justify-between text-content-secondary">
            <span>{t("sidebar.total")}</span>
            <span className="font-extrabold text-content-primary">{money(totals.total, currency)}</span>
          </div>

          <div className="flex items-center justify-between rounded-control border border-border-interactive bg-surface-tertiary p-2.5">
            <div>
              <span className="block text-xs font-black text-accent">{t("sidebar.depositLabel")}</span>
              <span className="text-[10px] text-content-secondary">{t("sidebar.depositHint")}</span>
            </div>
            <span className="text-sm font-black text-accent">{money(totals.deposit, currency)}</span>
          </div>

          <div className="flex items-center justify-between font-bold text-content-secondary">
            <span>{t("sidebar.remaining")}</span>
            <span className="font-extrabold text-content-primary">{money(totals.remaining, currency)}</span>
          </div>
        </div>

        {/* Free cancellation pill */}
        <div className="flex items-center gap-1.5 rounded-control border border-border-interactive bg-surface-primary p-2 text-[11px] font-semibold text-content-primary">
          <ShieldCheck className="size-3.5 shrink-0 text-copper" aria-hidden="true" />
          <span>{t("sidebar.freeCancel")}</span>
        </div>

        {/* CTA */}
        {step === 0 || step === 1 ? (
          <button
            type="button"
            disabled={nextDisabled}
            onClick={onNext}
            className={cn(
              "flex w-full cursor-pointer items-center justify-center gap-2 rounded-control border border-copper bg-accent px-4 py-3 text-sm font-extrabold text-content-contrast shadow-md transition-all active:scale-[0.98]",
              nextDisabled &&
                "cursor-not-allowed border-border-primary bg-surface-primary text-content-tertiary shadow-none active:scale-100",
            )}
          >
            <span>{nextLabel}</span>
            <ArrowRight className="size-4 rtl-mirror" aria-hidden="true" />
          </button>
        ) : null}

        {/* Clinic address */}
        {address ? (
          <div className="pt-2 text-start text-[11px] text-content-secondary">
            <div className="flex items-center gap-1 font-bold text-content-primary">
              <MapPin className="size-3 text-copper" aria-hidden="true" />
              <span>{addressTitle}</span>
            </div>
            <p className="mt-0.5 line-clamp-2 text-[10px]">{address}</p>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
