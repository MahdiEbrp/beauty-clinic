"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CreditCard, LoaderCircle } from "lucide-react";
import { formatNumber } from "@/lib/services/format";
import type { Locale } from "@/lib/services/types";
import { formatSlotLabel, type CalendarKind } from "@/lib/bookings/dates";
import { bookingErrorKey } from "@/lib/bookings/errors";
import { asTranslate } from "@/src/i18n/message-key";
import { payBooking } from "../api";
import type { CreatedBooking, SelectedService, SlotOption } from "../types";

type ReviewStepProps = {
  booking: CreatedBooking;
  service: SelectedService;
  slot: SlotOption;
  onDone: (booking: CreatedBooking) => void;
};

export default function ReviewStep({ booking, service, slot, onDone }: ReviewStepProps) {
  const t = useTranslations("booking");
  const looseT = asTranslate(t);
  const locale = useLocale() as Locale;
  const calendar: CalendarKind = locale === "fa" ? "jalali" : "gregorian";
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amount = Number(booking.totalAmount) || 0;
  const slotLabel = formatSlotLabel({
    date: slot.slotDate,
    time: slot.startTime,
    calendar,
    locale,
  });

  const rows = [
    { key: "service", label: t("review.service"), value: booking.serviceTitle },
    { key: "date", label: t("review.date"), value: slotLabel },
    {
      key: "duration",
      label: t("review.duration"),
      value: service.durationMin
        ? `${service.durationMin} ${t("appointment.minutes")}`
        : t("appointment.consult"),
    },
    { key: "name", label: t("review.name"), value: booking.fullName },
    { key: "phone", label: t("review.phone"), value: booking.phone },
  ];

  const handlePay = async () => {
    setPaying(true);
    setError(null);
    try {
      const paid = await payBooking(booking.id);
      onDone(paid);
    } catch (err) {
      setError(looseT(`errors.${bookingErrorKey(err)}`));
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="space-y-6">
      <dl className="overflow-hidden rounded-panel border border-border-primary bg-surface-secondary">
        {rows.map((row, i) => (
          <div
            key={row.key}
            className={`flex items-center justify-between gap-4 px-5 py-4 ${
              i !== rows.length - 1 ? "border-b border-border-primary" : ""
            }`}
          >
            <dt className="text-body-sm text-content-tertiary">{row.label}</dt>
            <dd className="text-body-sm font-semibold text-accent">{row.value}</dd>
          </div>
        ))}
      </dl>

      <div className="flex items-center justify-between rounded-panel border border-copper-deep/30 bg-surface-tertiary px-5 py-4">
        <span className="text-body font-bold text-content-secondary">
          {amount > 0 ? t("review.depositDue") : t("review.freeLabel")}
        </span>
        <span className="text-heading-3 font-extrabold text-copper-deep">
          {amount > 0 ? `${formatNumber(amount)} ${booking.currency}` : t("appointment.free")}
        </span>
      </div>

      {error ? (
        <p role="alert" className="rounded-control border border-error/40 bg-error/5 px-4 py-3 text-body-sm text-error">
          {error}
        </p>
      ) : null}

      <button
        type="button"
        onClick={() => void handlePay()}
        disabled={paying}
        className="inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-pill border border-copper bg-accent px-8 text-body-lg font-bold text-content-contrast transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-elevation-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
      >
        {paying ? (
          <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
        ) : (
          <CreditCard className="size-5" aria-hidden="true" />
        )}
        {amount > 0 ? t("review.pay") : t("review.confirm")}
      </button>
      <p className="text-center text-caption text-content-tertiary">{t("review.note")}</p>
    </div>
  );
}
