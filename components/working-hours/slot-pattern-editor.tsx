"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ListPlus, Minus, Plus, Trash2, Users, Wand2 } from "lucide-react";

import { TimePickerField } from "@/components/date-time-picker/time-picker-field";
import { Field } from "../bookings/wizard-fields";
import {
  GroupMultiSelect,
  type GroupOption,
} from "../bookings/group-multi-select";
import { Panel } from "../create-group/ui";

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const STEP_OPTIONS = [15, 20, 30, 45, 60];

export type SlotPatternRow = {
  startTime: string;
  capacity: number;
  /** Linked service groups; empty = the generated slot accepts all groups. */
  groupIds: string[];
};

/** Client-side builder used to prefill the row list on a regular step. */
export function buildRangeRows(
  from: string,
  to: string,
  stepMin: number,
  defaultCapacity: number,
): SlotPatternRow[] {
  const rows: SlotPatternRow[] = [];
  if (!TIME_PATTERN.test(from) || !TIME_PATTERN.test(to)) return rows;
  const start = from.split(":").map(Number);
  const limit = start[0] * 60 + start[1];
  const end = to.split(":").map(Number).reduce((h, m) => h * 60 + m, 0);
  if (end < limit) return rows;
  for (let t = limit; t <= end; t += stepMin) {
    rows.push({
      startTime: `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`,
      capacity: defaultCapacity,
      groupIds: [],
    });
  }
  return rows;
}

export function SlotPatternEditor({
  rows,
  onChange,
  groups,
  groupsLoading,
  disabled,
}: {
  rows: SlotPatternRow[];
  onChange: (next: SlotPatternRow[]) => void;
  groups: GroupOption[];
  groupsLoading?: boolean;
  disabled?: boolean;
}) {
  const t = useTranslations("workingHoursForm");
  const [fillFrom, setFillFrom] = useState("");
  const [fillTo, setFillTo] = useState("");
  const [fillStep, setFillStep] = useState(15);
  const [fillCapacity, setFillCapacity] = useState("1");
  const [notice, setNotice] = useState<string | null>(null);
  const [openGroups, setOpenGroups] = useState<number | null>(null);

  const setRow = (index: number, patch: Partial<SlotPatternRow>) => {
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const addEmptyRow = () => {
    onChange([...rows, { startTime: "", capacity: 1, groupIds: [] }]);
  };

  const removeRow = (index: number) => {
    setOpenGroups((current) => (current === index ? null : current));
    onChange(rows.filter((_, i) => i !== index));
  };

  const groupsSummary = (row: SlotPatternRow) =>
    row.groupIds.length === 0
      ? t("pattern.groupsAll")
      : t("pattern.groupsCount", { count: row.groupIds.length });

  const runFill = () => {
    const capacity = Number(fillCapacity) || 1;
    const built = buildRangeRows(fillFrom, fillTo, fillStep, capacity);
    if (built.length === 0) {
      setNotice(t("errors.patternTime"));
      return;
    }
    setNotice(null);
    onChange(built);
  };

  return (
    <Panel>
      {/* Header ------------------------------------------------------- */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-dash-title font-bold text-content-primary">{t("pattern.rowsLabel")}</p>
          <p className="mt-1 text-dash-caption text-content-secondary">{t("pattern.fillHint")}</p>
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={addEmptyRow}
          className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-pill border border-border-interactive bg-surface-secondary px-4 text-dash-body-sm font-bold text-accent transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-40"
        >
          <Plus className="size-4" aria-hidden="true" />
          {t("pattern.addRow")}
        </button>
      </div>

      <div className="my-4 h-px bg-rule-gradient" aria-hidden="true" />

      {/* Quick-fill panel ---------------------------------------------
         1 col on mobile -> 2 cols on tablet -> a deliberate asymmetric
         desktop layout that gives the intro text its own lane instead
         of fighting the fields for a fifth of a five-col grid. */}
      <div className="grid grid-cols-1 gap-4 rounded-card border border-border-primary bg-surface-primary p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.4fr)]">
        <div className="sm:col-span-2 xl:col-span-1">
          <p className="flex items-center gap-1.5 text-dash-caption font-bold text-content-secondary">
            {t("pattern.fillTitle")}
            <Wand2 className="size-3.5 shrink-0" aria-hidden="true" />
          </p>
          <p className="mt-1 text-dash-caption text-content-tertiary">{t("pattern.fillHint")}</p>
        </div>

        <Field label={t("pattern.fillFrom")}>
          <TimePickerField value={fillFrom} onChange={setFillFrom} hourLabel={t("fields.hour")} minuteLabel={t("fields.minute")} />
        </Field>

        <Field label={t("pattern.fillTo")}>
          <TimePickerField value={fillTo} onChange={setFillTo} hourLabel={t("fields.hour")} minuteLabel={t("fields.minute")} />
        </Field>

        <div className="grid content-start gap-3 sm:col-span-2 xl:col-span-1">
          <Field label={t("pattern.fillStep")}>
            {/* A real 5-up grid instead of flex-wrap: reads as one
               cohesive segmented control and never wraps raggedly. */}
            <div role="group" aria-label={t("pattern.fillStep")} className="grid grid-cols-5 gap-1.5">
              {STEP_OPTIONS.map((step) => (
                <button
                  key={step}
                  type="button"
                  onClick={() => setFillStep(step)}
                  aria-pressed={fillStep === step}
                  className={`min-h-11 rounded-control border px-1 text-dash-caption font-bold tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${fillStep === step
                      ? "border-copper bg-surface-secondary text-accent shadow-elevation-1"
                      : "border-border-primary text-content-secondary hover:border-border-interactive"
                    }`}
                >
                  {step}
                </button>
              ))}
            </div>
          </Field>

          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2">
            <Field label={t("pattern.fillDefaultCapacity")}>
              <input
                type="number"
                min={1}
                max={500}
                value={fillCapacity}
                onChange={(event) => setFillCapacity(event.target.value.replace(/[^0-9]/g, ""))}
                aria-label={t("pattern.fillDefaultCapacity")}
                className="min-h-11 w-full rounded-control border border-form-input-border bg-form-input-bg px-3 text-dash-body-sm text-accent outline-none transition-colors hover:border-border-interactive focus-visible:border-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              />
            </Field>
            <button
              type="button"
              disabled={disabled}
              onClick={runFill}
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-pill bg-accent px-4 text-dash-body-sm font-bold text-content-contrast shadow-elevation-1 transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-40"
            >
              <ListPlus className="size-4 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">{t("pattern.fillAction")}</span>
            </button>
          </div>
        </div>
      </div>

      {notice && <p className="mt-2 text-dash-caption font-bold text-error">{notice}</p>}

      {/* Row list -------------------------------------------------- */}
      {rows.length === 0 ? (
        <div className="mt-4 flex flex-col items-center gap-2 rounded-control border border-dashed border-border-primary bg-surface-tertiary/40 p-6 text-center">
          <Minus className="size-6 text-content-tertiary" aria-hidden="true" />
          <p className="text-dash-caption text-content-secondary">{t("pattern.noRows")}</p>
        </div>
      ) : (
        <ul className="mt-4 grid gap-2.5" aria-label={t("pattern.rowsLabel")}>
          {rows.map((row, index) => (
            <li
              key={index}
              className="rounded-card border border-border-primary bg-surface-primary p-3 sm:p-3.5"
            >
              <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 sm:grid-cols-[auto_minmax(0,1fr)_9rem_auto]">
                <span className="flex size-8 items-center justify-center rounded-pill bg-accent text-dash-caption font-bold tabular-nums text-content-contrast">
                  {index + 1}
                </span>

                <div className="col-span-2 sm:col-span-1">
                  <Field label={t("pattern.startTimeLabel")}>
                    <TimePickerField
                      value={row.startTime}
                      onChange={(next) => setRow(index, { startTime: next })}
                      invalid={Boolean(row.startTime) && !TIME_PATTERN.test(row.startTime)}
                      hourLabel={t("fields.hour")}
                      minuteLabel={t("fields.minute")}
                    />
                  </Field>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <Field label={t("pattern.capacityLabel")}>
                    <input
                      id={`pattern-capacity-${index}`}
                      type="number"
                      min={1}
                      max={500}
                      value={row.capacity}
                      onChange={(event) =>
                        setRow(index, { capacity: Math.max(1, Number(event.target.value) || 1) })
                      }
                      aria-label={t("pattern.capacityLabel")}
                      className="min-h-11 w-full rounded-control border border-form-input-border bg-form-input-bg px-3 text-dash-body-sm text-accent outline-none transition-colors hover:border-border-interactive focus-visible:border-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    />
                  </Field>
                </div>

                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => removeRow(index)}
                  aria-label={t("pattern.removeRow")}
                  className="col-start-2 row-start-1 ms-auto inline-flex size-9 shrink-0 items-center justify-center self-start rounded-pill border border-border-primary bg-surface-secondary text-error transition-colors hover:bg-error/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-40 sm:col-start-4 sm:row-start-1 sm:self-end"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </button>
              </div>

              <div className="mt-2 border-t border-border-primary/70 pt-2">
                <button
                  type="button"
                  disabled={disabled}
                  aria-expanded={openGroups === index}
                  onClick={() =>
                    setOpenGroups((current) => (current === index ? null : index))
                  }
                  className="inline-flex min-h-11 w-full items-center gap-2 rounded-control border border-border-primary bg-surface-secondary px-3 text-start text-dash-caption font-bold text-accent transition-colors hover:border-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-40"
                >
                  <Users className="size-4 shrink-0 text-copper-strong" aria-hidden="true" />
                  <span className="truncate">{t("pattern.groupsLabel")}</span>
                  <span className="ms-auto truncate text-content-secondary">
                    {groupsSummary(row)}
                  </span>
                </button>

                {openGroups === index && (
                  <div className="mt-2">
                    <GroupMultiSelect
                      options={groups}
                      selected={row.groupIds}
                      onChange={(next) => setRow(index, { groupIds: next })}
                      loading={groupsLoading}
                    />
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}