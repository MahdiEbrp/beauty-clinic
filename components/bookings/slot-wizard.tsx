"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/src/i18n/navigation";
import type { SlotAdminRow } from "@/lib/bookings/slots-admin";
import { WizardShell, type WizardStep } from "./wizard-shell";
import { DetailGrid, DetailRow, Field } from "./wizard-fields";

const STEPS: WizardStep[] = [
  { key: "details", labelKey: "slotWizard.steps.details" },
  { key: "review", labelKey: "slotWizard.steps.review" },
];

type ServiceOption = { id: string; title: string };

export function SlotWizard({
  mode,
  slot,
  backHref,
}: {
  mode: "create" | "edit";
  slot?: SlotAdminRow | null;
  backHref: string;
}) {
  const t = useTranslations("slotWizard");
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [serviceId, setServiceId] = useState<string>("");
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [slotDate, setSlotDate] = useState(slot?.slotDate ?? "");
  const [startTime, setStartTime] = useState((slot?.startTime ?? "").slice(0, 5));
  const [endTime, setEndTime] = useState((slot?.endTime ?? "").slice(0, 5));
  const [capacity, setCapacity] = useState(String(slot?.capacity ?? 1));

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
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const detailsValid =
    /^\d{4}-\d{2}-\d{2}$/.test(slotDate) &&
    /^\d{2}:\d{2}$/.test(startTime) &&
    /^\d{2}:\d{2}$/.test(endTime) &&
    endTime > startTime &&
    Number(capacity) >= 1;

  const submit = async () => {
    setSubmitting(true);
    try {
      if (mode === "create") {
        const res = await fetch("/api/v1/bookings/slots", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            slots: [
              {
                serviceId: serviceId || null,
                slotDate,
                startTime,
                endTime,
                capacity: Number(capacity),
              },
            ],
          }),
        });
        if (!res.ok) throw new Error();
        toast.success(t("toast.created"));
        router.push(backHref);
        router.refresh();
        return;
      }
      if (!slot) return;
      const res = await fetch(`/api/v1/bookings/slots/${slot.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          slotDate,
          startTime,
          endTime,
          capacity: Number(capacity),
        }),
      });
      if (!res.ok) throw new Error();
      toast.success(t("toast.updated"));
      router.push(backHref);
      router.refresh();
    } catch {
      toast.error(t("toast.error"));
    } finally {
      setSubmitting(false);
    }
  };

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
          <Field label={t("fields.service.label")}>
            <select
              value={serviceId}
              onChange={(event) => setServiceId(event.target.value)}
              className="h-11 w-full rounded-control border border-form-input-border bg-form-input-bg px-3 text-dash-body-sm text-accent outline-none focus-visible:border-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <option value="">{t("fields.service.placeholder")}</option>
              {services.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.title}
                </option>
              ))}
            </select>
          </Field>

          <Field label={t("fields.date.label")}>
            <input
              type="date"
              required
              value={slotDate}
              onChange={(event) => setSlotDate(event.target.value)}
              className="h-11 w-full rounded-control border border-form-input-border bg-form-input-bg px-3 text-dash-body-sm text-accent outline-none focus-visible:border-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            />
          </Field>

          <Field label={t("fields.startTime.label")}>
            <input
              type="time"
              required
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              className="h-11 w-full rounded-control border border-form-input-border bg-form-input-bg px-3 text-dash-body-sm text-accent outline-none focus-visible:border-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            />
          </Field>

          <Field label={t("fields.endTime.label")} hint={detailsValid ? undefined : t("errors.endBeforeStart")}>
            <input
              type="time"
              required
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
              className={`h-11 w-full rounded-control border bg-form-input-bg px-3 text-dash-body-sm text-accent outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                detailsValid || !endTime
                  ? "border-form-input-border focus-visible:border-copper"
                  : "border-error/60"
              }`}
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
              className="h-11 w-full rounded-control border border-form-input-border bg-form-input-bg px-3 text-dash-body-sm text-accent outline-none focus-visible:border-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            />
          </Field>
        </div>
      ) : (
        <DetailGrid>
          <DetailRow label={t("fields.date.label")} value={slotDate} />
          <DetailRow
            label={t("fields.startTime.label")}
            value={`${startTime} – ${endTime}`}
          />
          <DetailRow label={t("fields.capacity.label")} value={capacity} />
          <DetailRow
            label={t("fields.service.label")}
            value={
              services.find((item) => item.id === serviceId)?.title ??
              t("fields.service.placeholder")
            }
          />
        </DetailGrid>
      )}
    </WizardShell>
  );
}

