"use client";

import { useLocale, useTranslations } from "next-intl";
import { BadgeCheck, CalendarCheck, CheckCircle2, Clock3, Home, Printer, Sparkles } from "lucide-react";
import { Link } from "@/src/i18n/navigation";
import { formatNumber } from "@/lib/services/format";
import { formatSlotLabel, type CalendarKind } from "@/lib/bookings/dates";
import type { ClinicBookingInfo } from "../BookingWizard";
import type { ContactInfo, CreatedBookingGroup } from "../types";
import { HintBlock, Row, SectionTitle } from "./confirm-blocks";

type ConfirmationStepProps = {
  group: CreatedBookingGroup;
  contact: ContactInfo | null;
  paymentReference: string | null;
  clinic: ClinicBookingInfo;
  onOpenInvoice: () => void;
};

/** Success voucher (Template parity) for the whole confirmed group. */
export default function ConfirmationStep({
  group,
  contact,
  paymentReference,
  clinic,
  onOpenInvoice,
}: ConfirmationStepProps) {
  const t = useTranslations("booking");
  const locale = useLocale() as "fa" | "en";
  const calendar: CalendarKind = locale === "fa" ? "jalali" : "gregorian";

  const paid = Boolean(paymentReference);
  const whatsapp = clinic.phoneDisplay
    ? `https://wa.me/${clinic.phoneDisplay.replace(/\D/g, "")}?text=${encodeURIComponent(
        t("confirmation.whatsappText", {
          ref: group.groupRef,
          name: contact?.fullName ?? "",
        }),
      )}`
    : null;

  return (
    <section className="mx-auto w-full max-w-xl animate-zoom-in">
      {/* Success badge */}
      <div className="mb-5 flex flex-col items-center text-center">
        <span className="relative mb-4 flex size-20 items-center justify-center">
          <span aria-hidden="true" className="absolute inset-0 rounded-full bg-copper/25 blur-sm" />
          <span className="relative flex size-16 items-center justify-center rounded-full bg-copper-deep text-content-contrast shadow-elevation-3">
            <CheckCircle2 className="size-9" aria-hidden="true" />
          </span>
        </span>
        <h2 className="text-heading-2 font-black tracking-tight text-accent">{t("confirmation.title")}</h2>
        <p className="mx-auto mt-2 max-w-md text-body leading-relaxed text-content-secondary">
          {t("confirmation.description")}
        </p>
      </div>

      {/* Voucher card */}
      <div className="overflow-hidden rounded-panel border border-border-primary bg-surface-primary shadow-elevation-3">
        <div className="border-b border-dashed border-border-interactive bg-copper-deep p-4 text-content-contrast">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm font-black">{clinic.clinicName}</div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-copper-light">
              <BadgeCheck className="size-4" aria-hidden="true" />
              {t(paid ? "confirmation.verified" : "confirmation.reserved")}
            </div>
          </div>
        </div>

        <div className="space-y-4 p-4 sm:p-6">
          <SectionTitle icon={CalendarCheck} title={t("confirmation.appointment")} />
          <div>
            {group.items.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-dashed border-border-primary/70 py-2 last:border-b-0">
                <div className="min-w-0">
                  <div className="truncate text-body-sm font-black text-content-primary">
                    {item.groupTitle}
                    {item.quantity > 1 ? <span className="text-content-tertiary"> × {formatNumber(item.quantity)}</span> : null}
                  </div>
                  {item.slotDate && item.startTime ? (
                    <div className="mt-0.5 flex items-center gap-1.5 text-caption font-bold text-copper-strong">
                      <Clock3 className="size-3.5 shrink-0" aria-hidden="true" />
                      {formatSlotLabel({ date: item.slotDate, time: item.startTime, calendar, locale })}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          <SectionTitle icon={Sparkles} title={t("confirmation.groupInfo")} />
          <div>
            <Row label={t("confirmation.reference")}>
              <span dir="ltr" className="break-all font-mono">{group.groupRef}</span>
            </Row>
            <Row label={t("confirmation.contactName")}>{contact?.fullName ?? "—"}</Row>
            <Row label={t("confirmation.contactPhone")}>
              <span dir="ltr">{contact?.phone ?? "—"}</span>
            </Row>
            {clinic.addressTitle ? (
              <Row label={clinic.addressTitle}>{clinic.address}</Row>
            ) : null}
          </div>

          <SectionTitle icon={Sparkles} title={t("confirmation.clinicInfo")} />
          <div>
            <Row label={t("confirmation.visitAddress")}>{clinic.clinicName}</Row>
            <Row label={t("confirmation.visitPhone")}>
              <span dir="ltr">{clinic.phoneDisplay || "—"}</span>
            </Row>
          </div>

          <HintBlock>{t("confirmation.note")}</HintBlock>

          <p className="text-caption font-medium leading-relaxed text-content-tertiary">{t("confirmation.smsNote")}</p>

          <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={onOpenInvoice}
                className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-control border border-border-interactive bg-surface-secondary px-4 text-body-sm font-bold text-content-primary transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <Printer className="size-4 text-copper" aria-hidden="true" />
                {t("confirmation.print")}
              </button>
              {whatsapp ? (
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-control border border-copper/50 bg-copper/10 px-4 text-body-sm font-bold text-copper-deep transition-colors hover:bg-copper hover:text-content-contrast focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <Sparkles className="size-4" aria-hidden="true" />
                  {t("confirmation.whatsapp")}
                </a>
              ) : null}
            </div>
            <Link
              href="/"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-control bg-accent px-5 text-body-sm font-black text-content-contrast shadow-elevation-1 transition-all hover:bg-accent-hover active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <Home className="size-4" aria-hidden="true" />
              {t("confirmation.home")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}