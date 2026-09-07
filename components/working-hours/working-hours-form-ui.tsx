"use client";

import { useTranslations } from "next-intl";
import {
  CalendarClock,
  CalendarDays,
  Check,
  ClipboardList,
  Clock3,
  Gauge,
  ListOrdered,
  Power,
} from "lucide-react";

export type ScheduleMode = "uniform" | "pattern";

export function SectionHeading({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof CalendarDays;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-accent text-content-contrast shadow-elevation-1">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <h2 className="text-dash-title font-bold text-content-primary">{title}</h2>
        <p className="mt-1 text-dash-body-sm leading-6 text-content-secondary">{description}</p>
      </div>
    </div>
  );
}

export function ScheduleModePicker({
  value,
  onChange,
}: {
  value: ScheduleMode;
  onChange: (value: ScheduleMode) => void;
}) {
  const t = useTranslations("workingHoursForm");
  const options: Array<{
    value: ScheduleMode;
    icon: typeof CalendarClock;
    label: string;
    hint: string;
  }> = [
    {
      value: "uniform",
      icon: CalendarClock,
      label: t("mode.uniform"),
      hint: t("mode.uniformHint"),
    },
    {
      value: "pattern",
      icon: ClipboardList,
      label: t("mode.pattern"),
      hint: t("mode.patternHint"),
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2" role="group" aria-label={t("mode.label")}>
      {options.map(({ value: option, icon: Icon, label, hint }) => {
        const selected = value === option;
        return (
          <button
            key={option}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option)}
            className={`group flex min-h-24 items-start gap-3 rounded-card border p-4 text-start transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
              selected
                ? "border-accent bg-accent text-content-contrast shadow-elevation-2"
                : "border-border-primary bg-surface-primary text-content-primary hover:border-copper hover:bg-surface-tertiary"
            }`}
          >
            <span
              className={`flex size-10 shrink-0 items-center justify-center rounded-control border ${
                selected
                  ? "border-content-contrast/30 bg-content-contrast/10 text-content-contrast"
                  : "border-border-interactive bg-surface-secondary text-accent"
              }`}
            >
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="flex items-center gap-2 text-dash-body font-bold">
                {label}
                {selected && <Check className="size-4 shrink-0" aria-hidden="true" />}
              </span>
              <span className={`mt-1 block text-dash-caption leading-5 ${selected ? "text-content-contrast/80" : "text-content-secondary"}`}>
                {hint}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function WorkingHoursSummary({
  day,
  opens,
  closes,
  capacity,
  isActive,
  scheduleMode,
  rowsCount,
}: {
  day: string;
  opens: string;
  closes: string;
  capacity: string;
  isActive: boolean;
  scheduleMode: ScheduleMode;
  rowsCount: number;
}) {
  const t = useTranslations("workingHoursForm");
  const tRoot = useTranslations();
  const valueOrFallback = (value: string) => value || t("summary.notSet");
  const items = [
    { icon: CalendarDays, label: t("summary.day"), value: valueOrFallback(day) },
    { icon: Clock3, label: t("summary.window"), value: `${valueOrFallback(opens)} – ${valueOrFallback(closes)}` },
    {
      icon: Gauge,
      label: t("summary.capacity"),
      value: scheduleMode === "uniform" ? valueOrFallback(capacity) : t("summary.perSlot"),
    },
    {
      icon: ListOrdered,
      label: t("summary.slots"),
      value: scheduleMode === "pattern" ? String(rowsCount) : t("summary.generatedAutomatically"),
    },
  ];

  return (
    <aside className="rounded-card border border-border-primary bg-surface-primary p-4 shadow-elevation-1 sm:p-5" aria-label={t("summary.title")}>
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-control bg-copper text-content-contrast">
          <CalendarDays className="size-4" aria-hidden="true" />
        </span>
        <h2 className="text-dash-body font-bold text-content-primary">{t("summary.title")}</h2>
      </div>
      <dl className="mt-4 grid gap-3">
        {items.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center justify-between gap-3 border-b border-border-primary/70 pb-3 last:border-0 last:pb-0">
            <dt className="flex min-w-0 items-center gap-2 text-dash-caption font-semibold text-content-secondary">
              <Icon className="size-4 shrink-0 text-copper-strong" aria-hidden="true" />
              <span>{label}</span>
            </dt>
            <dd className="max-w-[60%] truncate text-end text-dash-body-sm font-bold text-content-primary">{value}</dd>
          </div>
        ))}
      </dl>
      <div className={`mt-4 flex items-center gap-2 rounded-control px-3 py-2.5 text-dash-caption font-bold ${isActive ? "bg-success/10 text-success" : "bg-surface-tertiary text-content-secondary"}`}>
        <Power className="size-4" aria-hidden="true" />
        {isActive ? tRoot("workingHours.statuses.active") : tRoot("workingHours.statuses.inactive")}
      </div>
    </aside>
  );
}
