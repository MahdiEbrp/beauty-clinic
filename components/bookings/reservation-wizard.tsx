"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/src/i18n/navigation";
import type { BookingStatus } from "@/src/db/schema";
import type { ReservationAdmin } from "@/lib/bookings/admin-types";
import { DatePickerField } from "@/components/date-time-picker/date-picker-field";
import { WizardShell, type WizardStep } from "./wizard-shell";
import { Field, ReviewBlock, SelectField, inputClass } from "./wizard-fields";
import { GroupSelectStep, type GroupOption } from "./group-select-step";

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
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [slotDate, setSlotDate] = useState("");
  const [slots, setSlots] = useState<Array<{ id: string; label: string }>>([]);
  const [slotId, setSlotId] = useState("");

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const res = await fetch("/api/v1/service-groups?perPage=100&status=active", {
          credentials: "include",
        });
        if (!res.ok) return;
        const payload = (await res.json()) as {
          data: {
            items: Array<{ id: string; name: string }>;
          };
        };
        if (active) {
          setGroups(payload.data.items.map((item) => ({ id: item.id, name: item.name })));
        }
      } catch {
        // optional
      } finally {
        if (active) setGroupsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const primaryGroupId = groupIds.length > 0 ? groupIds[0] : undefined;

  useEffect(() => {
    if (!slotDate || !primaryGroupId) return;
    let active = true;
    void (async () => {
      try {
        // Fetch slots for the first selected group (all selected groups share one slot).
        const params = new URLSearchParams({ date: slotDate, groupId: primaryGroupId });
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
  }, [slotDate, primaryGroupId]);

  const customerValid =
    fullName.trim().length >= 2 && /^[0-9+][0-9\s()-]{6,19}$/.test(phone.trim());
  const canContinue =
    step === 0
      ? groupIds.length > 0
      : step === 1
        ? customerValid && Boolean(slotDate) && Boolean(slotId)
        : true;

  const submit = async () => {
    setSubmitting(true);
    try {
      if (mode === "create") {
        const items = groupIds.map((groupId) => ({
          groupId,
          slotId,
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
                <SelectField
                  value={slotId}
                  onChange={setSlotId}
                  placeholder={t("fields.time.placeholder")}
                  disabled={!slotDate || slots.length === 0}
                  invalid={!slotId}
                  options={slots.map((item) => ({
                    value: item.id,
                    label: item.label,
                  }))}
                />
              </Field>
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
          slotLabel={slots.find((item) => item.id === slotId)?.label ?? "—"}
          status={status}
          mode={mode}
        />
      )}
    </WizardShell>
  );
}
