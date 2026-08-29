"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Copy, CreditCard, ExternalLink, FileText, MapPin, Phone, ShieldCheck } from "lucide-react";
import { formatNumber } from "@/lib/services/format";
import { cn } from "@/lib/utils";

type ClinicInfo = {
  addressTitle: string;
  address: string;
  telephone: string | null;
  phoneDisplay: string;
  googleMap: string;
};

type OrderSummaryProps = {
  total: number;
  deposit: number;
  remaining: number;
  currency: string;
  selectionCount: number;
  isSubmitting: boolean;
  onPay: () => void;
  onPreviewInvoice: () => void;
  clinic: ClinicInfo;
};

/** Right-column order summary (Template Step4 parity): price breakdown,
 *  free-cancellation, gradient Shaparak pay button, preview invoice and the
 *  clinic address / map card. */
export default function OrderSummary({
  total,
  deposit,
  remaining,
  currency,
  selectionCount,
  isSubmitting,
  onPay,
  onPreviewInvoice,
  clinic,
}: OrderSummaryProps) {
  const t = useTranslations("booking");
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    if (!clinic.address) return;
    await navigator.clipboard.writeText(clinic.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const amount = `${formatNumber(deposit)} ${currency}`;

  return (
    <div className="space-y-4">
      {/* Price breakdown */}
      <div className="space-y-3.5 rounded-panel border-2 border-copper bg-surface-secondary p-4 shadow-md sm:p-5">
        <h3 className="border-b border-border-primary pb-2 text-base font-extrabold text-content-primary">
          {t("review.summaryTitle")}
        </h3>

        <div className="space-y-2.5 text-sm">
          <div className="flex items-center justify-between gap-3 text-content-secondary">
            <span>{t("review.total")}</span>
            <span className="font-extrabold text-content-primary">
              {formatNumber(total)} {currency}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-control border border-border-interactive bg-surface-tertiary p-3">
            <div>
              <div className="text-sm font-black text-accent">{t("review.depositNow")}</div>
              <div className="mt-0.5 text-[10px] font-bold text-copper-deep">
                {t("review.depositForAll", { n: selectionCount })}
              </div>
            </div>
            <div className="text-base font-black text-accent">
              {formatNumber(deposit)} {currency}
            </div>
          </div>

          <p className="text-[11px] italic leading-tight text-content-tertiary">{t("review.depositNote")}</p>

          <div className="flex items-center justify-between gap-3 border-t border-border-primary pt-2">
            <span className="text-xs font-bold text-content-secondary">{t("review.remaining")}</span>
            <span className="text-sm font-black text-content-primary">
              {formatNumber(remaining)} {currency}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-control border border-border-interactive bg-surface-primary p-2.5 text-xs font-semibold text-content-primary">
          <ShieldCheck className="size-4 shrink-0 text-copper" aria-hidden="true" />
          {t("sidebar.freeCancel")}
        </div>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={onPay}
          className={cn(
            "flex w-full cursor-pointer items-center justify-center gap-2 rounded-control bg-linear-to-r from-accent to-primary-deep px-4 py-3.5 text-sm font-black text-content-contrast shadow-md transition-all hover:from-accent-hover active:scale-[0.98] sm:text-base",
            isSubmitting && "cursor-not-allowed opacity-70 active:scale-100",
          )}
        >
          {isSubmitting ? (
            <span className="size-5 animate-spin rounded-full border-2 border-content-contrast border-t-transparent" />
          ) : (
            <>
              <CreditCard className="size-5 text-copper-light" aria-hidden="true" />
              <span>{t("review.payBtn", { amount })}</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onPreviewInvoice}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-control border border-border-interactive bg-surface-primary px-3 py-2.5 text-xs font-extrabold text-content-primary transition-colors hover:bg-surface-tertiary"
        >
          <FileText className="size-4 text-copper" aria-hidden="true" />
          {t("review.previewInvoice")}
        </button>
      </div>

      {/* Clinic address / map */}
      <div className="space-y-2.5 rounded-panel border border-border-primary bg-surface-secondary p-4 shadow-elevation-1">
        <div className="flex items-center justify-between gap-2">
          <h4 className="flex items-center gap-1.5 text-sm font-extrabold text-content-primary">
            <MapPin className="size-4 text-copper" aria-hidden="true" />
            {clinic.addressTitle}
          </h4>
          <button
            type="button"
            onClick={() => void copyAddress()}
            className="flex cursor-pointer items-center gap-1 text-[11px] font-bold text-copper-strong hover:underline"
          >
            {copied ? (
              <>
                <Check className="size-3 text-copper" aria-hidden="true" />
                <span className="font-extrabold text-copper-deep">{t("review.copied")}</span>
              </>
            ) : (
              <>
                <Copy className="size-3" aria-hidden="true" />
                {t("review.copyAddress")}
              </>
            )}
          </button>
        </div>

        <p className="rounded-control border border-border-primary bg-surface-primary p-2.5 text-xs font-medium leading-relaxed text-content-secondary">
          {clinic.address}
        </p>

        <div className="flex items-center justify-between gap-2 pt-1">
          {clinic.telephone ? (
            <a href={`tel:${clinic.telephone}`} className="flex items-center gap-1 text-xs font-bold text-accent hover:underline">
              <Phone className="size-3.5 text-copper" aria-hidden="true" />
              <span dir="ltr">{clinic.phoneDisplay}</span>
            </a>
          ) : null}

          {clinic.googleMap ? (
            <a
              href={clinic.googleMap}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-xs font-bold text-copper-strong hover:underline"
            >
              {t("review.directions")}
              <ExternalLink className="size-3" aria-hidden="true" />
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
