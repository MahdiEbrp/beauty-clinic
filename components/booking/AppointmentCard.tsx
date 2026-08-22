"use client";

import { useLocale, useTranslations } from "next-intl";
import { CalendarClock, Sparkles, User } from "lucide-react";
import { formatNumber } from "@/lib/services/format";
import type { Locale } from "@/lib/services/types";
import { formatSlotLabel, type CalendarKind } from "@/lib/bookings/dates";
import { cn } from "@/lib/utils";
import type { SelectedService, SlotOption } from "./types";

type AppointmentCardProps = {
  service: SelectedService | null;
  slot: SlotOption | null;
  amount: number;
  currency: string;
};

function Row({
  icon: Icon,
  title,
  value,
  muted,
}: {
  icon: typeof Sparkles;
  title: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-card border border-copper/30 bg-copper/10 text-copper">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-caption font-medium text-content-contrast/60">{title}</p>
        <p
          className={cn(
            "truncate text-body-sm font-semibold text-content-contrast",
            muted && "text-content-contrast/70",
          )}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

/**
 * The signature appointment-card rail. Assembles like a real clinic
 * appointment slip as the visitor completes each step.
 */
export default function AppointmentCard({
  service,
  slot,
  amount,
  currency,
}: AppointmentCardProps) {
  const t = useTranslations("booking");
  const locale = useLocale() as Locale;
  const calendar: CalendarKind = locale === "fa" ? "jalali" : "gregorian";

  const slotValue = slot
    ? formatSlotLabel({
        date: slot.slotDate,
        time: slot.startTime,
        calendar,
        locale,
      })
    : t("appointment.notSelected");

  return (
    <div className="relative overflow-hidden rounded-feature bg-primary-deep p-6 text-content-contrast shadow-elevation-4 md:p-8">
      {/* Copper corner accents */}
      <span aria-hidden="true" className="pointer-events-none absolute -end-8 -top-8 size-28 rounded-full bg-copper/15 blur-2xl" />
      <span aria-hidden="true" className="pointer-events-none absolute -start-10 -bottom-10 size-28 rounded-full bg-gold/10 blur-2xl" />

      <p className="mb-5 text-caption font-bold uppercase tracking-[0.18em] text-copper">
        {t("appointment.label")}
      </p>

      <div className="space-y-5">
        <Row
          icon={Sparkles}
          title={t("appointment.service")}
          value={service?.title ?? t("appointment.notSelected")}
          muted={!service}
        />
        <Row
          icon={CalendarClock}
          title={t("appointment.date")}
          value={slotValue}
          muted={!slot}
        />
        <Row
          icon={User}
          title={t("appointment.duration")}
          value={
            service?.durationMin
              ? `${service.durationMin} ${t("appointment.minutes")}`
              : t("appointment.consult")
          }
          muted={!service}
        />
      </div>

      <div className="rule-gradient my-6" />

      <div className="flex items-end justify-between gap-4">
        <span className="text-caption font-medium text-content-contrast/60">
          {t("appointment.deposit")}
        </span>
        <span className="text-heading-3 font-extrabold text-copper">
          {amount > 0 ? `${formatNumber(amount)} ${currency}` : t("appointment.free")}
        </span>
      </div>
    </div>
  );
}
