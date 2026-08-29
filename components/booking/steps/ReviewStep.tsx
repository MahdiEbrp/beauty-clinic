"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, CalendarDays, CheckCircle2 } from "lucide-react";
import { formatNumber } from "@/lib/services/format";
import { payBookingGroup } from "../api";
import type { CartItem, CreatedBookingGroup } from "../types";
import { SlotLabel } from "../SlotLabel";
import ShaparakGateway from "./ShaparakGateway";
import OrderSummary from "./OrderSummary";

type ClinicInfo = {
  addressTitle: string;
  address: string;
  telephone: string | null;
  phoneDisplay: string;
  googleMap: string;
};

type ReviewStepProps = {
  group: CreatedBookingGroup;
  cart: CartItem[];
  currency: string;
  deposit: number;
  contact: { fullName: string; phone: string; consultationRequired: boolean } | null;
  onPaid: () => void;
  onBack: () => void;
  onPreviewInvoice?: (group: CreatedBookingGroup, cart: CartItem[]) => void;
  clinic: ClinicInfo;
};

/** Step 4 — review & pay (Template Step4 parity): 7/5 grid of the reserved
 *  treatments, patient recap, Shaparak gateway and the order summary. */
export default function ReviewStep({
  group,
  cart,
  currency,
  deposit,
  contact,
  onPaid,
  onBack,
  onPreviewInvoice,
  clinic,
}: ReviewStepProps) {
  const t = useTranslations("booking");
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = cart.reduce((sum, line) => sum + Number(line.service.price) * line.quantity, 0);
  const remaining = Math.max(total - deposit, 0);
  const firstItem = group.items[0];

  const handlePay = async () => {
    if (!firstItem) return;
    setPaying(true);
    setError(null);
    try {
      await payBookingGroup(firstItem.id);
      onPaid();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="w-full max-w-4xl space-y-4">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 rounded-panel border border-border-primary bg-surface-secondary p-3.5 shadow-elevation-1 sm:flex-row sm:items-center sm:p-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-black text-content-contrast">
              {t("review.stepBadge")}
            </span>
            <h2 className="text-xl font-black tracking-tight text-content-primary">{t("review.title")}</h2>
          </div>
          <p className="mt-1 text-sm text-content-secondary">{t("review.subtitle")}</p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          {onPreviewInvoice ? (
            <button
              type="button"
              onClick={() => onPreviewInvoice(group, cart)}
              className="flex cursor-pointer items-center gap-1.5 rounded-control border border-border-interactive bg-surface-primary px-3 py-1.5 text-xs font-bold text-copper-deep shadow-elevation-1 transition-all hover:bg-surface-tertiary"
            >
              {t("review.printInvoice")}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onBack}
            className="flex cursor-pointer items-center gap-1.5 rounded-control border border-border-interactive bg-surface-primary px-3 py-1.5 text-xs font-bold text-content-primary shadow-elevation-1 transition-all hover:bg-surface-tertiary"
          >
            <ArrowRight className="size-3.5 rtl-mirror" aria-hidden="true" />
            {t("review.editDetails")}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Left: services + patient + gateway */}
        <div className="space-y-4 lg:col-span-7">
          {/* Services recap */}
          <div className="space-y-3 rounded-panel border border-border-primary bg-surface-secondary p-4 shadow-elevation-1">
            <h3 className="flex items-center gap-2 text-sm font-extrabold text-content-primary sm:text-base">
              <CalendarDays className="size-4 text-copper" aria-hidden="true" />
              {t("review.reservedTitle")}
            </h3>

            <div className="space-y-2.5">
              {cart.map((line) => (
                <div
                  key={line.service.id}
                  className="mx-auto w-full max-w-md space-y-1.5 rounded-control border border-border-primary bg-surface-primary p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-extrabold text-content-primary">{line.service.title}</div>
                      <div className="text-[11px] text-content-secondary">{line.service.categoryTitle}</div>
                    </div>
                    <div className="shrink-0 text-end">
                      <div className="text-sm font-black text-accent">
                        {line.service.price != null ? `${formatNumber(line.service.price)} ${currency}` : ""}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 border-t border-border-primary/60 pt-2 text-xs text-content-secondary">
                    <span className="flex items-center gap-1 font-semibold">
                      <CalendarDays className="size-3.5 text-copper" aria-hidden="true" />
                      <SlotLabel line={line} />
                    </span>
                    {line.service.durationMin ? (
                      <span className="rounded-md bg-surface-tertiary px-2 py-0.5 font-bold text-copper-deep">
                        {t("review.duration", { n: line.service.durationMin })}
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Patient recap */}
          <div className="rounded-panel border border-border-primary bg-surface-secondary p-4 shadow-elevation-1">
            <h3 className="mb-2 text-sm font-extrabold text-content-primary">{t("review.patientTitle")}</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-control border border-border-primary bg-surface-primary p-2.5">
                <span className="block text-[10px] text-content-tertiary">{t("review.patientName")}</span>
                <span className="font-bold text-content-primary">{contact?.fullName ?? ""}</span>
              </div>
              <div className="rounded-control border border-border-primary bg-surface-primary p-2.5">
                <span className="block text-[10px] text-content-tertiary">{t("review.patientPhone")}</span>
                <span className="font-bold text-content-primary" dir="ltr">{contact?.phone ?? ""}</span>
              </div>
            </div>
            {contact?.consultationRequired ? (
              <div className="mt-2 flex items-center gap-1.5 rounded-control border border-copper/30 bg-surface-tertiary p-2.5 text-[11px] font-bold text-copper-deep">
                <CheckCircle2 className="size-4 shrink-0 text-copper" aria-hidden="true" />
                {t("review.consultNeeded")}
              </div>
            ) : null}
          </div>

          <ShaparakGateway deposit={deposit} currency={currency} />
        </div>

        {/* Right: order summary + address */}
        <div className="lg:col-span-5">
          <OrderSummary
            total={total}
            deposit={deposit}
            remaining={remaining}
            currency={currency}
            selectionCount={cart.length}
            isSubmitting={paying}
            onPay={() => void handlePay()}
            onPreviewInvoice={() => onPreviewInvoice?.(group, cart)}
            clinic={clinic}
          />
          {error ? (
            <p role="alert" className="mt-3 rounded-control border border-error/40 bg-error/5 px-4 py-3 text-sm text-error">
              {error}
            </p>
          ) : null}
        </div>
      </div>

      <div aria-hidden="true" className="h-14 sm:h-20 lg:hidden" />
    </div>
  );
}
