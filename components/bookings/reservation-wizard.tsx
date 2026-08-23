"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/src/i18n/navigation";
import type { BookingStatus } from "@/src/db/schema";
import type { ReservationAdmin } from "@/lib/bookings/admin-types";
import { WizardShell, type WizardStep } from "./wizard-shell";
import { Field, ReviewBlock, inputClass } from "./wizard-fields";

const STEPS: WizardStep[] = [
  { key: "customer", labelKey: "reservationWizard.steps.details" },
  { key: "review", labelKey: "reservationWizard.steps.review" },
];

type ServiceOption = { id: string; title: string };
type SlotOption = { id: string; label: string };

export function ReservationWizard({
  mode,
  reservation,
  backHref,
}: {
  mode: "create" | "edit";
  reservation?: ReservationAdmin | null;
  backHref: string;
}) {
  const t = useTranslations("reservationWizard");
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [fullName, setFullName] = useState(reservation?.fullName ?? "");
  const [phone, setPhone] = useState(reservation?.phone ?? "");
  const [email, setEmail] = useState(reservation?.email ?? "");
  const [notes, setNotes] = useState(reservation?.notes ?? "");
  const [status, setStatus] = useState<BookingStatus>(reservation?.status ?? "pending");

  const [serviceId, setServiceId] = useState("");
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [slotDate, setSlotDate] = useState("");
  const [slots, setSlots] = useState<SlotOption[]>([]);
  const [slotId, setSlotId] = useState("");

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const res = await fetch("/api/v1/services?perPage=100&status=active", {
          credentials: "include",
        });
        if (!res.ok) return;
        const payload = (await res.json()) as {
          data: { items: Array<{ id: string; title: string }> };
        };
        if (active) setServices(payload.data.items);
      } catch {
        // optional
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Load bookable slots for the chosen date/service.
  useEffect(() => {
    if (!slotDate) return;
    let active = true;
    void (async () => {
      try {
        const params = new URLSearchParams({ date: slotDate });
        if (serviceId) params.set("serviceId", serviceId);
        const res = await fetch(`/api/public/slots?${params.toString()}`);
        if (!res.ok) return;
        const payload = (await res.json()) as {
          data: Array<{ id: string; startTime: string; endTime: string }>;
        };
        if (!active) return;
        setSlots(
          payload.data.map((slot) => ({
            id: slot.id,
            label: `${slot.startTime} – ${slot.endTime}`,
          })),
        );
        setSlotId("");
      } catch {
        if (active) setSlots([]);
      }
    })();
    return () => {
      active = false;
    };
  }, [slotDate, serviceId]);

  const customerValid =
    fullName.trim().length >= 2 && /^[0-9+][0-9\s()-]{6,19}$/.test(phone.trim());
  const canContinue = step === 0 ? customerValid : true;

  const submit = async () => {
    setSubmitting(true);
    try {
      if (mode === "create") {
        const res = await fetch("/api/v1/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            fullName: fullName.trim(),
            phone: phone.trim(),
            email: email.trim() || null,
            serviceId,
            slotId,
            locale: "fa",
            notes: notes.trim() || null,
          }),
        });
        if (!res.ok) throw new Error();
        toast.success(t("toast.created"));
        router.push(backHref);
        router.refresh();
        return;
      }
      if (!reservation) return;
      const res = await fetch(`/api/v1/bookings/${reservation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim() || null,
          notes: notes.trim() || null,
          status,
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

  const selectedService =
    services.find((item) => item.id === serviceId)?.title ?? reservation?.serviceTitle;

  return (
    <WizardShell
      namespace="reservationWizard"
      backHref={backHref}
      title={mode === "create" ? t("title.add") : t("title.edit")}
      steps={STEPS}
      step={step}
      onStep={setStep}
      canContinue={canContinue}
      submitting={submitting}
      mode={mode}
      onSubmit={submit}
    >
            {step === 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("fields.customerName.label")}>
            <input
              type="text"
              required
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder={t("fields.customerName.placeholder")}
              className={inputClass(customerValid || !fullName)}
            />
          </Field>

          <Field label={t("fields.phone.label")}>
            <input
              type="tel"
              required
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder={t("fields.phone.placeholder")}
              className={inputClass(customerValid || !phone)}
            />
          </Field>

          <Field label={t("fields.email.label")}>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={t("fields.email.placeholder")}
              className={inputClass(true)}
            />
          </Field>

          <Field label={t("fields.service.label")}>
            <select
              value={serviceId}
              onChange={(event) => setServiceId(event.target.value)}
              disabled={mode === "edit"}
              className={`${inputClass(mode === "create" ? Boolean(serviceId) : true)} disabled:opacity-60`}
            >
              <option value="">{t("fields.service.placeholder")}</option>
              {services.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.title}
                </option>
              ))}
            </select>
          </Field>

          {mode === "create" && (
            <>
              <Field label={t("fields.date.label")}>
                <input
                  type="date"
                  value={slotDate}
                  onChange={(event) => setSlotDate(event.target.value)}
                  className={inputClass(Boolean(slotDate))}
                />
              </Field>

              <Field label={t("fields.time.label")}>
                <select
                  value={slotId}
                  onChange={(event) => setSlotId(event.target.value)}
                  disabled={!slotDate || slots.length === 0}
                  className={`${inputClass(Boolean(slotId))} disabled:opacity-60`}
                >
                  <option value="">{t("fields.time.placeholder")}</option>
                  {slots.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </Field>
            </>
          )}

          {mode === "edit" && (
            <Field label={t("statuses.pending")}>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as BookingStatus)}
                className={inputClass(true)}
              >
                {(["pending", "confirmed", "paid", "cancelled"] as const).map((value) => (
                  <option key={value} value={value}>
                    {t(`statuses.${value}`)}
                  </option>
                ))}
              </select>
            </Field>
          )}

          <div className="sm:col-span-2">
            <Field label={t("fields.notes.label")}>
              <textarea
                rows={3}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder={t("fields.notes.placeholder")}
                className="w-full rounded-control border border-form-input-border bg-form-input-bg p-3 text-dash-body-sm text-accent outline-none focus-visible:border-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              />
            </Field>
          </div>
        </div>
      ) : (
        <ReviewBlock
          fullName={fullName}
          phone={phone}
          email={email}
          notes={notes}
          status={status}
          mode={mode}
          slotDate={slotDate}
          serviceTitle={selectedService ?? "—"}
          slotLabel={slots.find((item) => item.id === slotId)?.label ?? "—"}
        />
      )}
    </WizardShell>
  );
}
