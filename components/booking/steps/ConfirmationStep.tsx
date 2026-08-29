"use client";

import { useTranslations } from "next-intl";
import { CheckCircle2, Home, Printer } from "lucide-react";
import { Link } from "@/src/i18n/navigation";
import { formatNumber } from "@/lib/services/format";
import type { CreatedBookingGroup } from "../types";

type ConfirmationStepProps = {
  group: CreatedBookingGroup;
  currency: string;
};

/** Success ticket (template BookingSuccessModal parity) for the whole group. */
export default function ConfirmationStep({ group, currency }: ConfirmationStepProps) {
  const t = useTranslations("booking");

  const print = () => window.print();

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center text-center">
      <span className="relative mb-6 flex size-20 items-center justify-center">
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-copper/30"
          style={{ animation: "breath 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite" }}
        />
        <span className="relative flex size-16 items-center justify-center rounded-full bg-copper-deep text-content-contrast shadow-elevation-3">
          <CheckCircle2 className="size-9" aria-hidden="true" />
        </span>
      </span>

      <h2 className="text-heading-2 font-bold text-accent">{t("confirmation.title")}</h2>
      <p className="mt-2 text-body text-content-secondary">{t("confirmation.description")}</p>

      <div className="mt-8 w-full rounded-panel border border-border-primary bg-surface-secondary p-6 text-start">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <span className="text-body-sm text-content-tertiary">{t("confirmation.reference")}</span>
            <span dir="ltr" className="break-all font-mono text-body-sm font-bold text-copper-deep">
              {group.groupRef}
            </span>
          </div>
          {group.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 border-t border-border-primary pt-3"
            >
              <span className="min-w-0 truncate text-body-sm text-accent">
                {item.serviceTitle}
                <span className="text-content-tertiary"> × {item.quantity}</span>
              </span>
              <span dir="ltr" className="shrink-0 text-caption font-semibold text-content-secondary">
                {item.slotDate} · {item.startTime?.slice(0, 5)}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between gap-4 border-t border-border-primary pt-3">
            <span className="text-body-sm text-content-tertiary">{t("confirmation.depositPaid")}</span>
            <span className="text-body-sm font-extrabold text-copper-deep">
              {formatNumber(group.deposit)} {currency}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-body-sm text-content-tertiary">{t("confirmation.status")}</span>
            <span className="rounded-pill bg-copper/15 px-3 py-1 text-caption font-bold text-copper-strong">
              {t("confirmation.statusPaid")}
            </span>
          </div>
        </div>
      </div>

      <p className="mt-6 text-body-sm text-content-tertiary">{t("confirmation.note")}</p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={print}
          className="inline-flex min-h-13 items-center justify-center gap-2 rounded-pill border border-border-interactive bg-surface-secondary px-8 text-body font-bold text-content-secondary transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <Printer className="size-5" aria-hidden="true" />
          {t("confirmation.print")}
        </button>
        <Link
          href="/"
          className="inline-flex min-h-13 items-center justify-center gap-2 rounded-pill border border-copper bg-accent px-8 text-body font-bold text-content-contrast transition-all hover:bg-accent-hover hover:shadow-elevation-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <Home className="size-5" aria-hidden="true" />
          {t("confirmation.home")}
        </Link>
      </div>
    </div>
  );
}
