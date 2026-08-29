"use client";

import { useTranslations } from "next-intl";
import {
  Calendar,
  CheckCircle,
  FileText,
  MapPin,
  QrCode,
  RotateCcw,
  X,
} from "lucide-react";
import { formatNumber } from "@/lib/services/format";
import type { CartItem, CreatedBookingGroup } from "./types";

type Props = {
  group: CreatedBookingGroup;
  cart: CartItem[];
  contact: { fullName: string; phone: string } | null;
  currency: string;
  deposit: number;
  addressTitle: string;
  address: string;
  onPrint: () => void;
  onNew: () => void;
  onClose: () => void;
};

/** Post-payment success ticket (Template BookingSuccessModal parity), tokenized. */
export default function BookingSuccessModal({
  group,
  cart,
  contact,
  currency,
  deposit,
  addressTitle,
  address,
  onPrint,
  onNew,
  onClose,
}: Props) {
  const t = useTranslations("booking");
  const total = cart.reduce((sum, l) => sum + Number(l.service.price) * l.quantity, 0);
  const remaining = Math.max(total - deposit, 0);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("success.title")}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-3 backdrop-blur-xs sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="my-auto flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-panel border-2 border-copper bg-surface-secondary shadow-elevation-4 animate-zoom-in">
        {/* Celebratory header */}
        <div className="relative shrink-0 bg-linear-to-r from-accent via-primary-deep to-accent p-5 text-center">
          <button
            type="button"
            onClick={onClose}
            className="absolute inset-e-4 top-4 cursor-pointer rounded-full bg-white/10 p-1.5 text-white transition-colors hover:bg-white/20"
            aria-label={t("success.close")}
          >
            <X className="size-4" aria-hidden="true" />
          </button>

          <div className="mx-auto mb-2 flex size-14 items-center justify-center rounded-panel border-2 border-white/20 bg-copper text-white shadow-lg">
            <CheckCircle className="size-8" strokeWidth={2.5} aria-hidden="true" />
          </div>
          <h3 className="text-lg font-black tracking-tight text-content-contrast sm:text-xl">{t("success.title")}</h3>
          <p className="mt-1 text-xs font-medium text-copper-light">{t("success.subtitle")}</p>
        </div>

        <div className="space-y-4 overflow-y-auto p-4 sm:p-6">
          {/* Reference + QR */}
          <div className="flex items-center justify-between gap-3 rounded-panel border border-border-interactive bg-surface-primary p-3.5">
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-content-tertiary">
                {t("success.reference")}
              </span>
              <div dir="ltr" className="text-xl font-black tracking-widest text-accent sm:text-2xl">
                {group.groupRef}
              </div>
              <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-copper/30 bg-surface-tertiary px-2 py-0.5 text-[10px] font-bold text-copper-deep">
                <CheckCircle className="size-3 text-copper" aria-hidden="true" />
                {t("success.depositBadge")}
              </span>
            </div>

            <div className="shrink-0 rounded-control bg-white p-2 text-center shadow-elevation-1 ring-1 ring-border-primary">
              <QrCode className="mx-auto size-14 text-primary-deep" aria-hidden="true" />
              <span className="mt-0.5 block text-[9px] font-bold text-gray-500">{t("success.scanTip")}</span>
            </div>
          </div>

          {/* Client */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-control border border-border-primary bg-surface-primary p-2.5">
              <span className="block text-[10px] text-content-tertiary">{t("success.client")}</span>
              <span className="font-extrabold text-content-primary">{contact?.fullName ?? ""}</span>
            </div>
            <div className="rounded-control border border-border-primary bg-surface-primary p-2.5">
              <span className="block text-[10px] text-content-tertiary">{t("success.phone")}</span>
              <span className="font-bold text-content-primary" dir="ltr">{contact?.phone ?? ""}</span>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-2">
            <div className="text-xs font-extrabold text-content-primary">{t("success.servicesTitle")}</div>
            {cart.map((line) => (
              <div
                key={line.service.id}
                className="mx-auto flex w-full max-w-md items-start justify-between gap-2 rounded-control border border-border-primary bg-surface-primary p-3 text-xs"
              >
                <div>
                  <div className="font-extrabold text-content-primary">{line.service.title}</div>
                  <div className="mt-1 flex items-center gap-2 text-[11px] font-semibold text-content-secondary">
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3 text-copper" aria-hidden="true" />
                      {line.slot?.slotDate ?? ""}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-content-primary">
                      {t("success.at", { time: line.slot?.startTime.slice(0, 5) ?? "" })}
                    </span>
                  </div>
                </div>
                <div className="font-black text-accent">
                  {line.service.price != null ? `${formatNumber(line.service.price)} ${currency}` : ""}
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-1.5 rounded-control border border-border-interactive bg-surface-tertiary p-3 text-xs">
            <div className="flex justify-between text-content-secondary">
              <span>{t("success.total")}</span>
              <span className="font-bold text-content-primary">
                {formatNumber(total)} {currency}
              </span>
            </div>
            <div className="flex justify-between font-black text-accent">
              <span>{t("success.depositPaid")}</span>
              <span>
                {formatNumber(deposit)} {currency}
              </span>
            </div>
            <div className="flex justify-between border-t border-border-primary pt-1 font-bold text-content-primary">
              <span>{t("success.balance")}</span>
              <span className="font-black">
                {formatNumber(remaining)} {currency}
              </span>
            </div>
          </div>

          {/* Address */}
          {address ? (
            <div className="space-y-1 rounded-control border border-border-primary bg-surface-primary p-3 text-xs">
              <div className="flex items-center gap-1 font-bold text-content-primary">
                <MapPin className="size-3.5 text-copper" aria-hidden="true" />
                {addressTitle}
              </div>
              <p className="text-[11px] leading-relaxed text-content-secondary">{address}</p>
            </div>
          ) : null}
        </div>

        {/* Footer actions */}
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-border-primary bg-surface-secondary p-3 sm:p-4">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onPrint}
              className="flex cursor-pointer items-center gap-1 rounded-control border border-border-interactive bg-surface-primary px-3 py-2 text-xs font-bold text-copper-deep transition-colors hover:bg-surface-tertiary"
            >
              <FileText className="size-3.5 text-copper" aria-hidden="true" />
              {t("success.printInvoice")}
            </button>
          </div>

          <button
            type="button"
            onClick={onNew}
            className="flex cursor-pointer items-center gap-1.5 rounded-control bg-accent px-4 py-2 text-xs font-black text-content-contrast shadow-elevation-1 transition-colors hover:bg-accent-hover"
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
            {t("success.bookAnother")}
          </button>
        </div>
      </div>
    </div>
  );
}
