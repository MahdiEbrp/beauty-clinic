"use client";

import { useTranslations } from "next-intl";
import { Calendar, ChevronDown, Receipt, Sparkles } from "lucide-react";
import { formatNumber } from "@/lib/services/format";
import { cn } from "@/lib/utils";
import { SlotLabel } from "../SlotLabel";
import type { CartItem } from "../types";

type BookingSummaryProps = {
  cart: CartItem[];
  currency: string;
  deposit: number;
  open: boolean;
  onToggle: () => void;
};

/** Collapsible step-3 recap of chosen groups + the online deposit. */
export function BookingSummary({ cart, currency, deposit, open, onToggle }: BookingSummaryProps) {
  const t = useTranslations("booking");

  return (
    <div className="overflow-hidden rounded-panel border border-border-primary bg-surface-secondary shadow-elevation-1">
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className="flex w-full cursor-pointer select-none items-center justify-between gap-3 p-3.5 text-start transition-colors hover:bg-surface-tertiary/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:p-4"
      >
        <span className="flex items-center gap-2.5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-accent text-content-contrast">
            <Receipt className="size-4 text-copper-light" aria-hidden="true" />
          </span>
          <span className="text-body-sm font-black text-accent">{t("summary.bookingSummary")}</span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          <span className="hidden text-caption font-bold text-copper xs:inline">
            {open ? t("summary.hideDetails") : t("summary.showDetails")}
          </span>
          <span className={cn("flex size-7 items-center justify-center rounded-control border border-border-interactive bg-surface-primary text-content-secondary transition-transform", open && "rotate-180 text-accent")}>
            <ChevronDown className="size-4" aria-hidden="true" />
          </span>
        </span>
      </button>

      {open ? (
        <div className="space-y-3 border-t border-border-primary/60 bg-surface-secondary p-3.5 pt-3 animate-fade-in sm:p-4">
          <div>
            <div className="mb-1.5 flex items-center justify-between text-caption font-bold text-content-tertiary">
              <span>{t("summary.selectedGroups")}</span>
              <span>{formatNumber(cart.length)}</span>
            </div>
            <div className="max-h-60 space-y-2 overflow-y-auto">
              {cart.map((line) => (
                <div key={line.group.id} className="flex items-center justify-between gap-2.5 rounded-control border border-border-primary/80 bg-surface-primary px-3 py-2.5 text-body-sm">
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-bold text-content-primary">{line.group.title}</div>
                    {line.slot ? (
                      <div className="mt-1 flex flex-wrap items-center gap-1.5 text-caption text-content-tertiary">
                        <span className="inline-flex items-center gap-1 font-bold text-content-secondary">
                          <Calendar className="size-3 shrink-0 text-copper" aria-hidden="true" />
                          <SlotLabel line={line} />
                        </span>
                      </div>
                    ) : null}
                  </div>
                  {line.quantity > 1 ? (
                    <span className="shrink-0 text-caption font-bold text-content-tertiary">× {formatNumber(line.quantity)}</span>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-control border border-border-primary bg-surface-primary p-3">
            <div className="flex items-center justify-between text-body-sm font-black text-accent">
              <span className="flex items-center gap-1.5">
                <Sparkles className="size-4 text-copper" aria-hidden="true" />
                {t("summary.depositOnline")}
              </span>
              <span className="font-black text-copper-strong">
                {formatNumber(deposit)} {currency}
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}