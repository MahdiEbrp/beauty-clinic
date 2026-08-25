"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import { DatePickerField } from "@/components/date-time-picker/date-picker-field";
import { TimePickerField } from "@/components/date-time-picker/time-picker-field";
import { useRouter } from "@/src/i18n/navigation";
import type { CalendarKind } from "@/lib/bookings/dates";
import { formatDate, slotToDate } from "@/lib/bookings/dates";
import { WizardShell, type WizardStep } from "./wizard-shell";
import { DetailGrid, DetailRow, Field, inputClass } from "./wizard-fields";
import {
  ServiceMultiSelect,
  type ServiceOption,
} from "./service-multi-select";

const STEPS: WizardStep[] = [
  { key: "details", labelKey: "slotWizard.steps.details.name" },
  { key: "review", labelKey: "slotWizard.steps.review.name" },
];

export type SlotEditData = {
  id: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  capacity: number;
  isActive: boolean;
  serviceIds: string[];
};

export function SlotWizard({
  mode,
  slot,
  backHref,
}: {
  mode: "create" | "edit";
  slot?: SlotEditData | null;
  backHref: string;
}) {
  const t = useTranslations("slotWizard");
  const tRoot = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [serviceIds, setServiceIds] = useState<string[]>(slot?.serviceIds ?? []);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [slotDate, setSlotDate] = useState(slot?.slotDate ?? "");
  const [startTime, setStartTime] = useState(slot?.startTime ?? "");
  const [endTime, setEndTime] = useState(slot?.endTime ?? "");
  const [capacity, setCapacity] = useState(String(slot?.capacity ?? 1));
  const [isActive, setIsActive] = useState(slot?.isActive ?? true);
  // Clock lives in state so render stays pure; set once after mount.
  const [nowMs, setNowMs] = useState<number | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time clock capture so render stays pure
    setNowMs(Date.now());
  }, []);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const res = await fetch("/api/v1/services?perPage=100&status=active", {
          credentials: "include",
        });
        if (!res.ok) return;
        const payload = (await res.json()) as { data: { items: ServiceOption[] } };
        if (active) setServices(payload.data.items);
      } catch {
        // service list is optional for slot creation
      } finally {
        if (active) setServicesLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const timeValid =
    /^\d{2}:\d{2}$/.test(startTime) &&
    /^\d{2}:\d{2}$/.test(endTime) &&
    endTime > startTime;
  const capacityValid = Number(capacity) >= 1;
  const endsInFuture =
    mode === "create" && nowMs !== null
      ? Boolean(
          slotDate &&
            endTime &&
            new Date(`${slotDate}T${endTime}`).getTime() > nowMs,
        )
      : true;
  const detailsValid = /^\d{4}-\d{2}-\d{2}$/.test(slotDate) && timeValid && capacityValid && endsInFuture;

  const submit = async () => {
    setSubmitting(true);
    try {
      const body = JSON.stringify({
        serviceIds,
        slotDate,
        startTime,
        endTime,
        capacity: Number(capacity),
      });
      const res =
        mode === "create"
          ? await fetch("/api/v1/bookings/slots", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                slots: [{ serviceIds, slotDate, startTime, endTime, capacity: Number(capacity) }],
              }),
            })
          : await fetch(`/api/v1/bookings/slots/${slot?.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body,
            });
      if (!res.ok) throw new Error();
      toast.success(mode === "create" ? t("toast.created") : t("toast.updated"));
      router.push(backHref);
      router.refresh();
    } catch {
      toast.error(t("toast.error"));
    } finally {
      setSubmitting(false);
    }
  };

  const kind: CalendarKind = locale === "fa" ? "jalali" : "gregorian";
  const reviewDate = slotDate
    ? formatDate(slotToDate(slotDate, "12:00:00"), kind)
    : "—";
  const selectedTitles = serviceIds
    .map((id) => services.find((option) => option.id === id)?.title)
    .filter(Boolean)
    .join("، ");

  return (
    <WizardShell
      namespace="slotWizard"
      backHref={backHref}
      title={mode === "create" ? t("title.add") : t("title.edit")}
      steps={STEPS}
      step={step}
      onStep={setStep}
      canContinue={step === 0 ? detailsValid : true}
      submitting={submitting}
      mode={mode}
      onSubmit={submit}
    >
      {step === 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label={t("fields.services.label")}>
              <ServiceMultiSelect
                options={services}
                selected={serviceIds}
                onChange={setServiceIds}
                loading={servicesLoading}
              />
            </Field>
          </div>

          <Field label={t("fields.date.label")}>
            <DatePickerField
              value={slotDate}
              onChange={setSlotDate}
              locale={locale === "fa" ? "fa" : "en"}
              min={new Date().toISOString().slice(0, 10)}
            />
          </Field>

          <Field label={t("fields.capacity.label")} hint={t("fields.capacity.hint")}>
            <input
              type="number"
              min={1}
              max={500}
              required
              value={capacity}
              onChange={(event) => setCapacity(event.target.value)}
              className={inputClass(capacityValid)}
            />
          </Field>

          <Field label={t("fields.startTime.label")}>
            <TimePickerField value={startTime} onChange={setStartTime} invalid={!startTime} />
          </Field>

          <Field
            label={t("fields.endTime.label")}
            hint={
              !timeValid && startTime && endTime
                ? t("errors.endBeforeStart")
                : !endsInFuture
                  ? tRoot("bookingSlots.statuses.expired")
                  : undefined
            }
          >
            <TimePickerField
              value={endTime}
              onChange={setEndTime}
              invalid={Boolean(startTime && endTime) && !timeValid}
            />
          </Field>

          {mode === "edit" && (
            <Field
              label={t("fields.isActive.label")}
              hint={
                isActive ? t("fields.isActive.hintOn") : t("fields.isActive.hintOff")
              }
            >
              <button
                type="button"
                role="switch"
                aria-checked={isActive}
                onClick={() => setIsActive((prev) => !prev)}
                className={`inline-flex h-11 w-full items-center gap-3 rounded-control border px-3 text-dash-body-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                  isActive
                    ? "border-success/40 bg-success/10 text-success"
                    : "border-border-primary bg-surface-tertiary text-content-secondary"
                }`}
              >
                <span
                  className={`flex h-5 w-9 items-center rounded-pill border p-0.5 transition-colors ${
                    isActive ? "border-success/50 bg-success/30 justify-end" : "justify-start border-border-primary bg-surface-primary"
                  }`}
                >
                  <span className="size-4 rounded-full bg-surface-secondary shadow-elevation-1" />
                </span>
                {isActive
                  ? tRoot("bookingSlots.statuses.active")
                  : tRoot("bookingSlots.statuses.inactive")}
              </button>
            </Field>
          )}
        </div>
      ) : (
        <DetailGrid>
          <DetailRow label={t("fields.date.label")} value={reviewDate} />
          <DetailRow
            label={t("fields.startTime.label")}
            value={`${startTime || "--:--"} – ${endTime || "--:--"}`}
          />
          <DetailRow label={t("fields.capacity.label")} value={capacity} />
          <DetailRow
            label={t("fields.services.label")}
            value={selectedTitles || t("reviewData.servicesAll")}
          />
          {mode === "edit" && (
            <DetailRow
              label={t("reviewData.statusLabel")}
              value={
                isActive
                  ? tRoot("bookingSlots.statuses.active")
                  : tRoot("bookingSlots.statuses.inactive")
              }
            />
          )}
        </DetailGrid>
      )}
    </WizardShell>
  );
}
