"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, ArrowUp, ChevronDown, ChevronUp } from "lucide-react";
import { formatNumber } from "@/lib/services/format";
import { cn } from "@/lib/utils";
import type { CartItem } from "./types";
import { SlotLabel } from "./SlotLabel";

type Totals = { total: number; deposit: number; remaining: number };

type MobileSummaryBarProps = {
  cart: CartItem[];
  currency: string;
  totals: Totals;
  step: number;
  nextLabel: string;
  nextDisabled: boolean;
  onNext: () => void;
  address: string;
};

function money(value: number, currency: string): string {
  return `${formatNumber(value)} ${currency}`;
}

/** Fixed mobile bottom bar with an expandable summary drawer (Template parity). */
export default function MobileSummaryBar({
  cart,
  currency,
  totals,
  step,
  nextLabel,
  nextDisabled,
  onNext,
  address,
}: MobileSummaryBarProps) {
  const t = useTranslations("booking");
  const [open, setOpen] = useState(false);

  const scrollToTop = () => window.scrollTo({ top: 0, left: 0, behavior: "smooth" });

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t-2 border-copper bg-surface-secondary shadow-elevation-4 lg:hidden">
      {open ? (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs"
          aria-hidden="true"
        />
      ) : null}

      {open ? (
        <div className="relative z-50 max-h-[70vh] space-y-3 overflow-y-auto border-b border-border-primary bg-surface-secondary p-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-content-primary">{t("sidebar.mobileDetails")}</h4>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="cursor-pointer p-1 text-content-tertiary hover:text-content-primary"
              aria-label={t("success.close")}
            >
              <ChevronDown className="size-5" aria-hidden="true" />
            </button>
          </div>

          <div className="space-y-2">
            {cart.map((line) => (
              <div
                key={line.service.id}
                className="flex items-center justify-between rounded-control border border-border-primary bg-surface-primary p-2.5"
              >
                <div>
                  <div className="text-xs font-bold text-content-primary">{line.service.title}</div>
                  <div className="text-[10px] text-content-secondary">
                    {line.slot ? <SlotLabel line={line} /> : t("sidebar.mobileNeeds")}
                  </div>
                </div>
                <div className="text-xs font-black text-accent">
                  {line.service.price != null ? money(line.service.price, currency) : ""}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-1 rounded-control border border-border-interactive bg-surface-tertiary p-3 text-xs">
            <div className="flex justify-between text-content-secondary">
              <span>{t("sidebar.total")}</span>
              <span className="font-bold text-content-primary">{money(totals.total, currency)}</span>
            </div>
            <div className="flex justify-between font-black text-accent">
              <span>{t("sidebar.depositLabel")}</span>
              <span>{money(totals.deposit, currency)}</span>
            </div>
            <div className="flex justify-between text-content-secondary">
              <span>{t("sidebar.remaining")}</span>
              <span className="font-bold">{money(totals.remaining, currency)}</span>
            </div>
          </div>

          {address ? (
            <div className="text-[10px] text-content-tertiary">{address}</div>
          ) : null}
        </div>
      ) : null}

      <div className="relative z-50 mx-auto flex max-w-lg items-center justify-between gap-2 px-3 py-2 sm:py-3">
        {/* Price & expand trigger */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="group flex cursor-pointer items-center gap-1.5 text-start"
        >
          <div className="flex size-8 items-center justify-center rounded-control border border-border-interactive bg-surface-primary text-copper">
            {open ? (
              <ChevronDown className="size-4" aria-hidden="true" />
            ) : (
              <ChevronUp className="size-4" aria-hidden="true" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1 text-[10px] font-semibold text-content-secondary">
              <span>{t("sidebar.mobileItems", { n: cart.length })}</span>
              <span className="font-bold text-copper">{t("sidebar.mobileDeposit")}</span>
            </div>
            <div className="text-xs font-black leading-tight text-accent sm:text-sm">
              {money(totals.deposit, currency)}
            </div>
          </div>
        </button>

        {/* Scroll-to-top + CTA */}
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={scrollToTop}
            title={t("sidebar.finalStep")}
            className="flex cursor-pointer items-center justify-center rounded-control border border-border-interactive bg-surface-primary p-2 text-copper shadow-elevation-1 transition-all hover:text-accent active:scale-95"
          >
            <ArrowUp className="size-4" aria-hidden="true" />
          </button>

          {step === 0 || step === 1 ? (
            <button
              type="button"
              disabled={nextDisabled}
              onClick={onNext}
              className={cn(
                "flex shrink-0 cursor-pointer items-center gap-1.5 rounded-control border border-copper bg-accent px-3.5 py-2.5 text-xs font-black text-content-contrast shadow-md sm:text-sm",
                nextDisabled &&
                  "cursor-not-allowed border-border-primary bg-surface-primary text-content-tertiary",
              )}
            >
              <span>{nextLabel}</span>
              <ArrowRight className="size-3.5 rtl-mirror" aria-hidden="true" />
            </button>
          ) : (
            <div className="rounded-control border border-copper bg-surface-primary px-3 py-1.5 text-xs font-black text-accent">
              {t("sidebar.finalStep")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
