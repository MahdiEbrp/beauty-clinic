"use client";

import { useTranslations } from "next-intl";
import { CreditCard, ShieldCheck, X } from "lucide-react";
import { formatNumber } from "@/lib/services/format";
import type { PublicRule } from "@/lib/services/rules-types";
import { SlotLabel } from "../SlotLabel";
import type { CartItem } from "../types";

type PreGatewayModalProps = {
  fullName: string;
  phone: string;
  cart: CartItem[];
  deposit: number;
  currency: string;
  rules: PublicRule[];
  processing: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

/** Final confirmation + deposit payment hand-off (Template parity). */
export default function PreGatewayModal({
  fullName,
  phone,
  cart,
  deposit,
  currency,
  rules,
  processing,
  onConfirm,
  onClose,
}: PreGatewayModalProps) {
  const t = useTranslations("booking");

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("summary.preGatewayTitle")}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-3 backdrop-blur-xs animate-fade-in"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && !processing) onClose();
      }}
    >
      <div className="relative my-auto flex w-full max-w-lg flex-col overflow-hidden rounded-panel border border-border-primary bg-surface-primary shadow-elevation-4">
        <div className="flex items-center justify-between gap-3 border-b border-border-primary bg-accent p-4 text-content-contrast">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 shrink-0 text-copper-light" aria-hidden="true" />
            <h3 className="text-body font-black">{t("summary.preGatewayTitle")}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={processing}
            aria-label={t("summary.close")}
            className="flex size-10 cursor-pointer items-center justify-center rounded-control text-content-contrast/80 transition-colors hover:bg-white/10 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-4 p-4 sm:p-6">
          <div className="space-y-1.5 rounded-control border border-border-primary bg-surface-secondary p-3">
            <div className="flex justify-between gap-3">
              <span className="text-caption text-content-tertiary">{t("summary.client")}</span>
              <span className="truncate text-body-sm font-bold text-content-primary">{fullName}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-caption text-content-tertiary">{t("summary.phone")}</span>
              <span dir="ltr" className="text-body-sm font-bold text-content-primary">{phone}</span>
            </div>
            <div className="flex justify-between gap-1.5 rounded-control bg-surface-primary p-2 text-caption">
              {cart.map((line) => (
                <span key={line.group.id} className="inline-flex min-w-0 flex-1 items-center justify-center gap-1 rounded-control border border-border-primary bg-surface-secondary px-1.5 py-1">
                  <span className="truncate font-black text-content-primary">{line.group.title}</span>
                  <span className="shrink-0 text-caption text-content-tertiary"><SlotLabel line={line} /></span>
                </span>
              ))}
            </div>
            <div className="flex justify-between gap-3 border-t border-border-primary/60 pt-1.5">
              <span className="text-body-sm font-bold text-content-secondary">{t("summary.depositDue")}</span>
              <span className="text-body-sm font-black text-copper-strong">
                {formatNumber(deposit)} {currency}
              </span>
            </div>
          </div>

          <div className="space-y-2 rounded-control border border-border-interactive bg-surface-secondary/70 p-3.5">
            <span className="block border-b border-border-primary/60 pb-1 text-body-sm font-black text-accent">{t("summary.preGatewayCharter")}</span>
            {rules.length > 0 ? (
              <ul className="list-inside list-disc space-y-1.5 text-caption leading-relaxed text-content-secondary">
                {rules.map((rule) => (
                  <li key={rule.id}>{rule.name}</li>
                ))}
              </ul>
            ) : (
              <p className="text-caption text-content-tertiary">{t("summary.rules.empty")}</p>
            )}
          </div>

          <div className="flex flex-col gap-2.5 border-t border-border-primary pt-3 sm:flex-row">
            <button
              type="button"
              onClick={onConfirm}
              disabled={processing}
              className="inline-flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-control bg-accent px-4 text-body-sm font-black text-content-contrast shadow-elevation-1 transition-all hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {processing ? (
                <>
                  <span className="size-4 animate-spin rounded-pill border-2 border-content-contrast border-t-transparent" aria-hidden="true" />
                  {t("summary.connectingGateway")}
                </>
              ) : (
                <>
                  <CreditCard className="size-4 text-copper-light" aria-hidden="true" />
                  {t("summary.agreeAndPay")}
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={processing}
              className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-control border border-border-interactive bg-surface-secondary px-4 text-body-sm font-bold text-content-secondary transition-colors hover:bg-surface-tertiary disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {t("summary.goBackAndEdit")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}