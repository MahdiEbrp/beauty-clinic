"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/src/i18n/navigation";
import type { BookingStatus } from "@/src/db/schema";
import type { ReservationAdmin } from "@/lib/bookings/admin-types";
import { DatePickerField } from "@/components/date-time-picker/date-picker-field";
import { Check } from "lucide-react";
import { WizardShell, type WizardStep } from "./wizard-shell";
import { Field, ReviewBlock, SelectField, inputClass } from "./wizard-fields";
import { useReservationOptions } from "./use-reservation-options";
import { GroupSelectStep } from "./group-select-step";

const STEPS: WizardStep[] = [
  { key: "service", labelKey: "reservationWizard.steps.service.name" },
  { key: "customer", labelKey: "reservationWizard.steps.customer.name" },
  { key: "review", labelKey: "reservationWizard.steps.review.name" },
];
export function ReservationWizard({
  mode,
  reservation,
  backHref,
}: {
  mode: "create" | "edit";
  reservation?: ReservationAdmin | null;
  backHref: string;
  currency?: string;
}) {
  const t = useTranslations("reservationWizard");
  const locale = useLocale();
  const router = useRouter();
  const [step, setStep] = useState(mode === "edit" ? 1 : 0);
  const [submitting, setSubmitting] = useState(false);

  const [fullName, setFullName] = useState(reservation?.fullName ?? "");
  const [phone, setPhone] = useState(reservation?.phone ?? "");
  const [email, setEmail] = useState(reservation?.email ?? "");
  const [status, setStatus] = useState<BookingStatus>(reservation?.status ?? "pending");

  const [groupIds, setGroupIds] = useState<string[]>(
    reservation?.groupId ? [reservation.groupId] : [],
  );
  const [slotDate, setSlotDate] = useState("");
  const [slotIds, setSlotIds] = useState<string[]>([]);

  const { groups, groupsLoading, slots } = useReservationOptions(slotDate, setSlotIds);

  const customerValid =
    fullName.trim().length >= 2 && /^[0-9+][0-9\s()-]{6,19}$/.test(phone.trim());
  // Require at least one group and at least one slot (one slot per service ideally).
  const canContinue =
    step === 0
      ? groupIds.length > 0
      : step === 1
        ? customerValid && Boolean(slotDate) && slotIds.length > 0
        : true;

  const submit = async () => {
    setSubmitting(true);
    try {
      if (mode === "create") {
        // Pair each selected group with a selected slot (1-to-1 in order).
        // Extra slots are ignored; extra groups get the last available slot.
        const items = groupIds.map((groupId, index) => ({
          groupId,
          slotId: slotIds[Math.min(index, slotIds.length - 1)],
          quantity: 1,
        }));

        const res = await fetch("/api/v1/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            fullName: fullName.trim(),
            phone: phone.trim(),
            email: email.trim() || null,
            items,
            locale: "fa",
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

  const selectedGroups = groups.filter((item) => groupIds.includes(item.id));
  const groupTitle = selectedGroups.map((g) => g.name).join(", ") ?? reservation?.groupTitle ?? "—";

  // Build review labels: pair groups with slots in order.
  const slotLabels = slotIds.map((id) => slots.find((s) => s.id === id)?.label ?? "—");

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
        <GroupSelectStep
          groups={groups}
          selectedIds={groupIds}
          onChange={setGroupIds}
          loading={groupsLoading}
        />
      ) : step === 1 ? (
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

          {mode === "create" && (
            <>
              <Field label={t("fields.date.label")}>
                <DatePickerField
                  value={slotDate}
                  onChange={setSlotDate}
                  locale={locale === "fa" ? "fa" : "en"}
                  min={new Date().toISOString().slice(0, 10)}
                />
              </Field>

              <Field label={t("fields.time.label")}>
                <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-4">
                  {slots.map((slot) => {
                    const isSelected = slotIds.includes(slot.id);
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        role="checkbox"
                        aria-checked={isSelected}
                        onClick={() =>
                          setSlotIds((prev) =>
                            isSelected
                              ? prev.filter((id) => id !== slot.id)
                              : [...prev, slot.id],
                          )
                        }
                        className={`flex min-h-11 flex-col items-center gap-1.5 rounded-control border p-2 text-start transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                          isSelected
                            ? "border-accent bg-accent-subtle/60 text-accent"
                            : "border-border-primary bg-surface-secondary text-content-secondary hover:border-border-interactive hover:bg-surface-tertiary/50"
                        }`}
                      >
                        <span
                          className={`flex size-5 shrink-0 items-center justify-center rounded-pill border ${
                            isSelected
                              ? "border-accent bg-accent text-content-contrast"
                              : "border-border-interactive"
                          }`}
                          aria-hidden="true"
                        >
                          {isSelected && <Check className="size-3" strokeWidth={3} />}
                        </span>
                        <span className="text-dash-caption font-semibold text-center leading-none">
                          {slot.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </Field>

              <p className="text-dash-caption text-content-tertiary">
                {slotIds.length === 0
                  ? t("errors.slotRequired")
                  : t("fields.time.hint", {
                      count: slotIds.length,
                    })}
              </p>
            </>
          )}

          {mode === "edit" && (
            <Field label={t("fields.status.label")}>
              <SelectField
                value={status}
                onChange={(value) => setStatus(value as BookingStatus)}
                options={(
                  ["pending", "paid", "waiting", "done", "refunded"] as const
                ).map((value) => ({
                  value,
                  label: t(`statuses.${value}`),
                }))}
              />
            </Field>
          )}
        </div>
      ) : (
        <ReviewBlock
          fullName={fullName}
          phone={phone}
          email={email}
          groupTitle={groupTitle}
          slotDate={slotDate}
          slotLabels={slotLabels}
          status={status}
          mode={mode}
        />
      )}
    </WizardShell>
  );
}
