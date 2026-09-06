"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { TimePickerField } from "@/components/date-time-picker/time-picker-field";
import { useRouter } from "@/src/i18n/navigation";
import { msgKey } from "@/src/i18n/message-key";
import { WizardShell, type WizardStep } from "../bookings/wizard-shell";
import { Field, inputClass } from "../bookings/wizard-fields";
import { DaySelect, type DayOption } from "./day-select";

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export type WorkingHoursEditData = {
  id: string;
  day: string;
  opens: string;
  closes: string;
  capacity: number;
  displayOrder: number;
  isActive: boolean;
};

const STEPS: WizardStep[] = [
  { key: "details", labelKey: "workingHoursForm.steps.details.name" },
];

export function WorkingHoursForm({
  mode,
  record,
  backHref,
}: {
  mode: "create" | "edit";
  record?: WorkingHoursEditData | null;
  backHref: string;
}) {
  const t = useTranslations("workingHoursForm");
  const tRoot = useTranslations();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const [day, setDay] = useState(record?.day ?? "");
  const [opens, setOpens] = useState(record?.opens ?? "");
  const [closes, setCloses] = useState(record?.closes ?? "");
  const [capacity, setCapacity] = useState(String(record?.capacity ?? 1));
  const [displayOrder, setDisplayOrder] = useState(
    String(record?.displayOrder ?? 0),
  );
  const [isActive, setIsActive] = useState(record?.isActive ?? true);

  const dayOptions: DayOption[] = WEEKDAYS.map((value) => ({
    value,
    label: tRoot(msgKey(`workingHours.days.${value}`)),
  }));

  const timeValid =
    TIME_PATTERN.test(opens) && TIME_PATTERN.test(closes) && closes > opens;
  const capacityValid = Number(capacity) >= 1;
  const orderValid = Number(displayOrder) >= 0;
  const detailsValid =
    Boolean(day) && timeValid && capacityValid && orderValid;

  const submit = async () => {
    setSubmitting(true);
    try {
      const base = {
        opens,
        closes,
        capacity: Number(capacity),
        displayOrder: Number(displayOrder),
        isActive,
      };
      const body =
        mode === "create"
          ? JSON.stringify({ day, ...base })
          : JSON.stringify(base);
      const res = await fetch(
        mode === "create"
          ? "/api/v1/working-hours"
          : `/api/v1/working-hours/${record?.id}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body,
        },
      );
      if (!res.ok) throw new Error();
      toast.success(
        mode === "create" ? t("toast.created") : t("toast.updated"),
      );
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
      namespace="workingHoursForm"
      backHref={backHref}
      title={mode === "create" ? t("title.add") : t("title.edit")}
      steps={STEPS}
      step={0}
      onStep={() => undefined}
      canContinue={detailsValid}
      submitting={submitting}
      mode={mode}
      onSubmit={submit}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("fields.day.label")}>
          {mode === "create" ? (
            <DaySelect
              value={day}
              onChange={setDay}
              options={dayOptions}
              placeholder={t("fields.day.placeholder")}
            />
          ) : (
            <div
              className={`${inputClass(true)} flex items-center`}
              aria-hidden="true"
            >
              {tRoot(msgKey(`workingHours.days.${record?.day}`))}
            </div>
          )}
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

        <Field label={t("fields.opens.label")}>
          <TimePickerField
            value={opens}
            onChange={setOpens}
            invalid={!opens}
          />
        </Field>

        <Field
          label={t("fields.closes.label")}
          hint={
            !timeValid && opens && closes
              ? t("errors.closesBeforeOpens")
              : undefined
          }
        >
          <TimePickerField
            value={closes}
            onChange={setCloses}
            invalid={Boolean(opens && closes) && !timeValid}
          />
        </Field>

        <Field
          label={t("fields.displayOrder.label")}
          hint={t("fields.displayOrder.hint")}
        >
          <input
            type="number"
            min={0}
            max={1000}
            required
            value={displayOrder}
            onChange={(event) => setDisplayOrder(event.target.value)}
            className={inputClass(orderValid)}
          />
        </Field>

        <Field
          label={t("fields.isActive.label")}
          hint={
            isActive
              ? t("fields.isActive.hintOn")
              : t("fields.isActive.hintOff")
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
                isActive
                  ? "border-success/50 bg-success/30 justify-end"
                  : "justify-start border-border-primary bg-surface-primary"
              }`}
            >
              <span className="size-4 rounded-full bg-surface-secondary shadow-elevation-1" />
            </span>
            {isActive
              ? tRoot("workingHours.statuses.active")
              : tRoot("workingHours.statuses.inactive")}
          </button>
        </Field>
      </div>
    </WizardShell>
  );
}