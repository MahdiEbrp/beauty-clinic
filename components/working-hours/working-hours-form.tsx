"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { CalendarClock, ClipboardList, TriangleAlert } from "lucide-react";

import { TimePickerField } from "@/components/date-time-picker/time-picker-field";
import { useRouter } from "@/src/i18n/navigation";
import { msgKey } from "@/src/i18n/message-key";
import { WizardShell, type WizardStep } from "../bookings/wizard-shell";
import { Field, inputClass } from "../bookings/wizard-fields";
import { DaySelect, type DayOption } from "./day-select";
import {
  SlotPatternEditor,
  type SlotPatternRow,
} from "./slot-pattern-editor";

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
  patterns?: SlotPatternRow[];
};

type ScheduleMode = "uniform" | "pattern";
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
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>(
    record?.patterns && record.patterns.length > 0 ? "pattern" : "uniform",
  );
  const [rows, setRows] = useState<SlotPatternRow[]>(record?.patterns ?? []);

  const dayOptions: DayOption[] = WEEKDAYS.map((value) => ({
    value,
    label: tRoot(msgKey(`workingHours.days.${value}`)),
  }));
  const timeValid =
    TIME_PATTERN.test(opens) && TIME_PATTERN.test(closes) && closes > opens;
  const capacityValid = Number(capacity) >= 1;
  const orderValid = Number(displayOrder) >= 0;
  const patternValid =
    rows.length > 0 &&
    rows.every(
      (row) =>
        TIME_PATTERN.test(row.startTime) &&
        row.capacity >= 1 &&
        row.capacity <= 500,
    ) &&
    new Set(rows.map((row) => row.startTime)).size === rows.length;
  const detailsValid =
    Boolean(day) &&
    timeValid &&
    orderValid &&
    (scheduleMode === "uniform" ? capacityValid : patternValid);
  const submit = async () => {
    setSubmitting(true);
    try {
      const base = {
        opens,
        closes,
        capacity: Number(capacity),
        displayOrder: Number(displayOrder),
        isActive,
        patterns:
          scheduleMode === "pattern"
            ? rows.map((row) => ({
                startTime: row.startTime,
                capacity: row.capacity,
              }))
            : [],
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
  const modeButton = (value: ScheduleMode, labelKey: string, hintKey: string) => (
    <button
      type="button"
      aria-pressed={scheduleMode === value}
      onClick={() => setScheduleMode(value)}
      className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-pill border px-4 py-2.5 text-start text-dash-body-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
        scheduleMode === value
          ? "border-copper bg-surface-secondary text-accent shadow-elevation-1"
          : "border-border-primary bg-surface-tertiary text-content-secondary hover:border-border-interactive hover:text-accent"
      }`}
    >
      {value === "uniform" ? (
        <CalendarClock className="size-4 shrink-0" aria-hidden="true" />
      ) : (
        <ClipboardList className="size-4 shrink-0" aria-hidden="true" />
      )}
      <span className="min-w-0">
        <span className="block truncate">{t(labelKey as never)}</span>
        <span className="block truncate text-dash-caption font-normal text-content-tertiary">
          {t(hintKey as never)}
        </span>
      </span>
    </button>
  );

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
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        {modeButton("uniform", "mode.uniform", "mode.uniformHint")}
        {modeButton("pattern", "mode.pattern", "mode.patternHint")}
      </div>

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

        {scheduleMode === "uniform" && (
          <Field
            label={t("fields.capacity.label")}
            hint={t("fields.capacity.hint")}
          >
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
        )}

        <Field label={t("fields.opens.label")}>
          <TimePickerField value={opens} onChange={setOpens} invalid={!opens} />
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

      {scheduleMode === "pattern" && (
        <div className="mt-4 space-y-3">
          <SlotPatternEditor rows={rows} onChange={setRows} disabled={submitting} />
          {!patternValid && (
            <p role="alert" className="flex items-center gap-2 text-dash-caption font-bold text-error">
              <TriangleAlert className="size-4 shrink-0" aria-hidden="true" />
              {t("errors.patternInvalid")}
            </p>
          )}
        </div>
      )}
    </WizardShell>
  );
}