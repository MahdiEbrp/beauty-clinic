"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ListPlus, Minus, Plus, Trash2, Wand2 } from "lucide-react";

import { TimePickerField } from "@/components/date-time-picker/time-picker-field";
import { Field } from "../bookings/wizard-fields";
import { Panel } from "../create-group/ui";

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const STEP_OPTIONS = [15, 20, 30, 45, 60];

export type SlotPatternRow = {
  startTime: string;
  capacity: number;
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
    });
  }
  return rows;
}

export function SlotPatternEditor({
  rows,
  onChange,
  disabled,
}: {
  rows: SlotPatternRow[];
  onChange: (next: SlotPatternRow[]) => void;
  disabled?: boolean;
}) {
  const t = useTranslations("workingHoursForm");
  const [fillFrom, setFillFrom] = useState("");
  const [fillTo, setFillTo] = useState("");
  const [fillStep, setFillStep] = useState(15);
  const [fillCapacity, setFillCapacity] = useState("1");
  const [notice, setNotice] = useState<string | null>(null);

  const setRow = (index: number, patch: Partial<SlotPatternRow>) => {
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const addEmptyRow = () => {
    onChange([...rows, { startTime: "", capacity: 1 }]);
  };

  const removeRow = (index: number) => {
    onChange(rows.filter((_, i) => i !== index));
  };

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
      <div className="flex items-center justify-between gap-3">
        <p className="text-dash-body font-bold text-content-primary">{t("pattern.rowsLabel")}</p>
        <button
          type="button"
          disabled={disabled}
          onClick={addEmptyRow}
          className="inline-flex min-h-11 items-center gap-2 rounded-pill border border-border-interactive bg-surface-secondary px-4 text-dash-body-sm font-bold text-accent transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-40"
        >
          <Plus className="size-4" aria-hidden="true" />
          {t("pattern.addRow")}
        </button>
      </div>

      <div className="my-4 h-px bg-rule-gradient" aria-hidden="true" />

      <div className="grid gap-4 rounded-control border border-border-primary bg-surface-tertiary/50 p-4 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <p className="text-dash-caption font-bold text-content-secondary">
            <Wand2 className="ms-0.5 inline size-3.5 rtl-mirror align-[-2px]" aria-hidden="true" />
            {t("pattern.fillTitle")}
          </p>
          <p className="mt-1 text-dash-caption text-content-tertiary">{t("pattern.fillHint")}</p>
        </div>
        <Field label={t("pattern.fillFrom")}>
          <TimePickerField value={fillFrom} onChange={setFillFrom} />
        </Field>
        <Field label={t("pattern.fillTo")}>
          <TimePickerField value={fillTo} onChange={setFillTo} />
        </Field>
        <div className="grid content-start gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <Field label={t("pattern.fillStep")}>
            <div role="group" aria-label={t("pattern.fillStep")} className="flex flex-wrap gap-1.5">
              {STEP_OPTIONS.map((step) => (
                <button
                  key={step}
                  type="button"
                  onClick={() => setFillStep(step)}
                  aria-pressed={fillStep === step}
                  className={`min-h-11 rounded-pill border px-3 text-dash-caption font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                    fillStep === step
                      ? "border-copper bg-surface-secondary text-accent shadow-elevation-1"
                      : "border-border-primary text-content-secondary hover:border-border-interactive"
                  }`}
                >
                  {step}
                </button>
              ))}
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-2">
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
              className="inline-flex min-h-11 items-center justify-center gap-2 self-end rounded-pill bg-accent px-4 text-dash-body-sm font-bold text-content-contrast shadow-elevation-1 transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-40"
            >
              <ListPlus className="size-4" aria-hidden="true" />
              {t("pattern.fillAction")}
            </button>
          </div>
        </div>
      </div>

      {notice && <p className="mt-2 text-dash-caption font-bold text-error">{notice}</p>}

      {rows.length === 0 ? (
        <div className="mt-4 flex flex-col items-center gap-2 rounded-control border border-dashed border-border-primary bg-surface-tertiary/40 p-6 text-center">
          <Minus className="size-6 text-content-tertiary" aria-hidden="true" />
          <p className="text-dash-caption text-content-secondary">{t("pattern.noRows")}</p>
        </div>
      ) : (
        <ul className="mt-4 grid gap-2" aria-label={t("pattern.rowsLabel")}>
          {rows.map((row, index) => (
            <li
              key={index}
              className="grid items-end gap-3 rounded-control border border-border-primary bg-surface-tertiary/40 p-3 sm:grid-cols-[1fr_8rem_3rem]"
            >
              <Field label={t("pattern.startTimeLabel")}>
                <TimePickerField
                  value={row.startTime}
                  onChange={(next) => setRow(index, { startTime: next })}
                  invalid={Boolean(row.startTime) && !TIME_PATTERN.test(row.startTime)}
                />
              </Field>
              <Field label={t("pattern.capacityLabel")}>
                <div className="relative">
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
                  <div className="pointer-events-none absolute inset-y-0 inset-e-3 flex items-center">
                    <span className="flex h-6 w-px bg-border-primary" aria-hidden="true" />
                  </div>
                </div>
              </Field>
              <button
                type="button"
                disabled={disabled}
                onClick={() => removeRow(index)}
                aria-label={t("pattern.removeRow")}
                className="inline-flex min-h-11 items-center justify-center rounded-pill border border-border-primary bg-surface-secondary text-error transition-colors hover:bg-error/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-40"
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}