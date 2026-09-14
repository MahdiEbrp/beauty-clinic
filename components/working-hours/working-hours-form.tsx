"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { CalendarDays, Power, TriangleAlert } from "lucide-react";

import { TimePickerField } from "@/components/date-time-picker/time-picker-field";
import { useRouter } from "@/src/i18n/navigation";
import { msgKey } from "@/src/i18n/message-key";
import { WizardShell, type WizardStep } from "../bookings/wizard-shell";
import { Field, inputClass } from "../bookings/wizard-fields";
import type { GroupOption } from "../bookings/group-multi-select";
import { DaySelect, type DayOption } from "./day-select";
import {
  SlotPatternEditor,
  type SlotPatternRow,
} from "./slot-pattern-editor";
import {
  ScheduleModePicker,
  SectionHeading,
  WorkingHoursSummary,
  type ScheduleMode,
} from "./working-hours-form-ui";

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
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const res = await fetch("/api/v1/service-groups?perPage=100&status=active", {
          credentials: "include",
        });
        if (!res.ok) return;
        const payload = (await res.json()) as {
          data: { items: Array<{ id: string; name: string }> };
        };
        if (active) {
          setGroups(payload.data.items.map((item) => ({ id: item.id, title: item.name })));
        }
      } catch {
        // The group list is optional; patterns still save without it.
      } finally {
        if (active) setGroupsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

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
                groupIds: row.groupIds,
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
      <div className="space-y-8">
        <section className="space-y-4" aria-labelledby="working-hours-mode-heading">
          <SectionHeading
            icon={CalendarDays}
            title={t("sections.schedule.title")}
            description={t("sections.schedule.description")}
          />
          <h2 id="working-hours-mode-heading" className="sr-only">{t("mode.label")}</h2>
          <ScheduleModePicker value={scheduleMode} onChange={setScheduleMode} />
        </section>

        <section className="space-y-4" aria-labelledby="working-hours-window-heading">
          <SectionHeading
            icon={CalendarDays}
            title={t("sections.window.title")}
            description={t("sections.window.description")}
          />
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,20rem)]">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("fields.day.label")}>
                {mode === "create" ? (
                  <DaySelect value={day} onChange={setDay} options={dayOptions} placeholder={t("fields.day.placeholder")} />
                ) : (
                  <div className={`${inputClass(true)} flex items-center`} aria-hidden="true">
                    {tRoot(msgKey(`workingHours.days.${record?.day}`))}
                  </div>
                )}
              </Field>
              <Field label={t("fields.opens.label")}>
                <TimePickerField value={opens} onChange={setOpens} invalid={!opens} hourLabel={t("fields.hour")} minuteLabel={t("fields.minute")} />
              </Field>
              <Field label={t("fields.closes.label")} hint={!timeValid && opens && closes ? t("errors.closesBeforeOpens") : undefined}>
                <TimePickerField value={closes} onChange={setCloses} invalid={Boolean(opens && closes) && !timeValid} hourLabel={t("fields.hour")} minuteLabel={t("fields.minute")} />
              </Field>
              {scheduleMode === "uniform" && (
                <Field label={t("fields.capacity.label")} hint={t("fields.capacity.hint")}>
                  <input type="number" min={1} max={500} required value={capacity} onChange={(event) => setCapacity(event.target.value)} className={inputClass(capacityValid)} />
                </Field>
              )}
              <Field label={t("fields.displayOrder.label")} hint={t("fields.displayOrder.hint")}>
                <input type="number" min={0} max={1000} required value={displayOrder} onChange={(event) => setDisplayOrder(event.target.value)} className={inputClass(orderValid)} />
              </Field>
            </div>
            <WorkingHoursSummary
              day={day ? tRoot(msgKey(`workingHours.days.${day}`)) : ""}
              opens={opens}
              closes={closes}
              capacity={capacity}
              isActive={isActive}
              scheduleMode={scheduleMode}
              rowsCount={rows.length}
            />
          </div>
        </section>

        <section className="space-y-4" aria-labelledby="working-hours-status-heading">
          <SectionHeading icon={Power} title={t("sections.status.title")} description={t("sections.status.description")} />
          <h2 id="working-hours-status-heading" className="sr-only">{t("fields.isActive.label")}</h2>
          <Field label={t("fields.isActive.label")} hint={isActive ? t("fields.isActive.hintOn") : t("fields.isActive.hintOff")}>
            <button type="button" role="switch" aria-checked={isActive} onClick={() => setIsActive((prev) => !prev)} className={`flex min-h-12 w-full items-center justify-between gap-3 rounded-control border px-4 text-dash-body-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${isActive ? "border-success bg-success/10 text-success" : "border-border-interactive bg-surface-tertiary text-content-secondary"}`}>
              <span className="flex items-center gap-2"><Power className="size-4" aria-hidden="true" />{isActive ? tRoot("workingHours.statuses.active") : tRoot("workingHours.statuses.inactive")}</span>
              <span className={`flex h-6 w-11 items-center rounded-pill border p-0.5 ${isActive ? "justify-end border-success/50 bg-success/30" : "justify-start border-border-primary bg-surface-primary"}`}><span className="size-5 rounded-full bg-surface-secondary shadow-elevation-1" /></span>
            </button>
          </Field>
        </section>
      </div>

      {scheduleMode === "pattern" && (
        <div className="mt-4 space-y-3">
          <SlotPatternEditor
            rows={rows}
            onChange={setRows}
            groups={groups}
            groupsLoading={groupsLoading}
            disabled={submitting}
          />
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
