"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { CalendarDays, TriangleAlert } from "lucide-react";

import { useRouter } from "@/src/i18n/navigation";
import { msgKey } from "@/src/i18n/message-key";
import { WizardShell, type WizardStep } from "../bookings/wizard-shell";
import { SlotPatternEditor, type SlotPatternRow } from "./slot-pattern-editor";
import {
  ScheduleModePicker,
  SectionHeading,
  WorkingHoursSummary,
  type ScheduleMode,
} from "./working-hours-form-ui";
import type { WorkingHoursEditData } from "./working-hours-form";
import { useSlotGroups } from "./use-slot-groups";

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const STEPS: WizardStep[] = [
  { key: "slots", labelKey: "workingHoursForm.steps.slots.name" },
];

/**
 * Dedicated per-day editor for a weekday's explicit slot grid. Saving always
 * PATCHes the day's full pattern list (empty = back to the automatic window),
 * so add / edit / remove / mode-switch all go through one replace request.
 */
export function WorkingHoursSlotEditor({
  record,
  backHref,
}: {
  record: WorkingHoursEditData;
  backHref: string;
}) {
  const t = useTranslations("workingHoursForm");
  const tRoot = useTranslations();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>(
    record.patterns && record.patterns.length > 0 ? "pattern" : "uniform",
  );
  const [rows, setRows] = useState<SlotPatternRow[]>(record.patterns ?? []);
  const { groups, groupsLoading } = useSlotGroups();

  const dayLabel = tRoot(msgKey(`workingHours.days.${record.day}`));
  const patternValid =
    rows.length > 0 &&
    rows.every(
      (row) =>
        TIME_PATTERN.test(row.startTime) &&
        row.capacity >= 1 &&
        row.capacity <= 500,
    ) &&
    new Set(rows.map((row) => row.startTime)).size === rows.length;
  const canSubmit = scheduleMode === "uniform" || patternValid;

  const submit = async () => {
    setSubmitting(true);
    try {
      const patterns =
        scheduleMode === "pattern"
          ? rows.map((row) => ({
              startTime: row.startTime,
              capacity: row.capacity,
              groupIds: row.groupIds,
            }))
          : [];
      const res = await fetch(`/api/v1/working-hours/${record.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ patterns }),
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
      namespace="workingHoursForm"
      backHref={backHref}
      title={t("title.slots", { day: dayLabel })}
      subtitle={t("slots.subtitle")}
      steps={STEPS}
      step={0}
      onStep={() => undefined}
      canContinue={canSubmit}
      submitting={submitting}
      mode="edit"
      onSubmit={submit}
    >
      <div className="space-y-8">
        <section className="space-y-4" aria-labelledby="slot-mode-heading">
          <SectionHeading
            icon={CalendarDays}
            title={t("sections.schedule.title")}
            description={t("sections.schedule.description")}
          />
          <h2 id="slot-mode-heading" className="sr-only">
            {t("mode.label")}
          </h2>
          <ScheduleModePicker value={scheduleMode} onChange={setScheduleMode} />
          <WorkingHoursSummary
            day={dayLabel}
            opens={record.opens}
            closes={record.closes}
            capacity={String(record.capacity)}
            isActive={record.isActive}
            scheduleMode={scheduleMode}
            rowsCount={rows.length}
          />
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
            <p
              role="alert"
              className="flex items-center gap-2 text-dash-caption font-bold text-error"
            >
              <TriangleAlert className="size-4 shrink-0" aria-hidden="true" />
              {t("errors.patternInvalid")}
            </p>
          )}
        </div>
      )}
    </WizardShell>
  );
}
