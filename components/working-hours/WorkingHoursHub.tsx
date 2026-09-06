"use client";

import { useTranslations } from "next-intl";
import {
  CalendarDays,
  CalendarOff,
  Clock,
  Globe,
  Plus,
  Settings2,
  Sparkles,
  Timer,
  Users,
  Zap,
} from "lucide-react";
import { Link } from "@/src/i18n/navigation";
import type { WorkingHoursPerformance } from "@/lib/bookings/working-hours-performance";

function weeklyLabel(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins.toString().padStart(2, "0")}m`;
}

export default function WorkingHoursHub({
  data,
}: {
  data: WorkingHoursPerformance;
}) {
  const t = useTranslations();

  const stats = [
    {
      key: "openDays" as const,
      label: t("workingHoursHub.stats.openDays"),
      value: String(data.openDays),
      icon: CalendarDays,
    },
    {
      key: "closedDays" as const,
      label: t("workingHoursHub.stats.closedDays"),
      value: String(data.closedDays),
      icon: CalendarOff,
    },
    {
      key: "weeklyHours" as const,
      label: t("workingHoursHub.stats.weeklyHours"),
      value: weeklyLabel(data.totalWeeklyMinutes),
      icon: Clock,
    },
    {
      key: "capacity" as const,
      label: t("workingHoursHub.stats.capacity"),
      value: String(data.generator.capacity),
      icon: Users,
    },
  ];

  const generatorRows = [
    {
      key: "auto" as const,
      label: t("workingHoursHub.generator.auto"),
      value: data.generator.auto
        ? t("workingHoursHub.generator.on")
        : t("workingHoursHub.generator.off"),
      icon: Zap,
    },
    {
      key: "interval" as const,
      label: t("workingHoursHub.generator.interval"),
      value: t("workingHoursHub.generator.minutes", {
        count: data.generator.intervalMin,
      }),
      icon: Timer,
    },
    {
      key: "duration" as const,
      label: t("workingHoursHub.generator.duration"),
      value: t("workingHoursHub.generator.minutes", {
        count: data.generator.durationMin,
      }),
      icon: Timer,
    },
    {
      key: "window" as const,
      label: t("workingHoursHub.generator.window"),
      value: t("workingHoursHub.generator.days", {
        count: data.generator.windowDays,
      }),
      icon: CalendarDays,
    },
    {
      key: "timezone" as const,
      label: t("workingHoursHub.generator.timezone"),
      value: data.generator.timeZone,
      icon: Globe,
    },
  ];

  const manageClass =
    "flex-1 px-4 py-2.5 min-h-11 flex items-center justify-center gap-2 whitespace-nowrap rounded-pill bg-accent text-on-primary text-dash-body-sm font-semibold transition-colors duration-300 hover:bg-primary-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
  const addClass =
    "flex-1 px-4 py-2.5 min-h-11 flex items-center justify-center gap-2 whitespace-nowrap rounded-pill border border-accent bg-accent/5 text-accent text-dash-body-sm font-semibold transition-colors duration-300 hover:bg-accent/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

  return (
    <div className="space-y-6 sm:space-y-8">
      <header className="space-y-2">
        <h1 className="text-dash-display font-bold tracking-tight text-accent">
          {t("workingHoursHub.heading")}
        </h1>
        <p className="max-w-2xl wrap-break-word text-dash-body text-content-secondary">
          {t("workingHoursHub.subtitle")}
        </p>
      </header>

      <section aria-labelledby="performance-heading" className="space-y-4">
        <h2
          id="performance-heading"
          className="text-dash-title font-bold tracking-tight text-content-primary"
        >
          {t("workingHoursHub.performance.title")}
        </h2>
        <div className="relative overflow-hidden rounded-panel border border-surface-variant/50 bg-surface-secondary p-5 shadow-elevation-2 sm:p-6 md:p-8">
          <div
            className="pointer-events-none absolute inset-0 bg-linear-to-br from-surface-tertiary/20 to-transparent"
            aria-hidden="true"
          />
          <div className="relative z-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.key}
                className="flex items-center gap-3 rounded-control border border-surface-variant/50 bg-surface-primary p-4"
              >
                <div className="shrink-0 rounded-control bg-accent/10 p-2 text-copper-strong">
                  <stat.icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <p className="text-dash-caption font-semibold text-content-tertiary">
                    {stat.label}
                  </p>
                  <p className="truncate text-dash-heading font-bold text-content-primary">
                    {stat.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="generator-heading" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2
            id="generator-heading"
            className="text-dash-title font-bold tracking-tight text-content-primary"
          >
            {t("workingHoursHub.generator.title")}
          </h2>
          <span className="inline-flex items-center gap-2 rounded-pill border border-accent/10 bg-accent/5 px-3 py-1.5">
            <Sparkles className="size-4 text-copper-strong" aria-hidden="true" />
            <span className="text-dash-caption font-semibold text-content-primary">
              {t("workingHoursHub.generator.readOnly")}
            </span>
          </span>
        </div>
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-panel border border-surface-variant/50 bg-surface-variant/50 shadow-elevation-1 sm:grid-cols-2 lg:grid-cols-5">
          {generatorRows.map((row) => (
            <div
              key={row.key}
              className="min-w-0 space-y-1.5 bg-surface-secondary p-4"
            >
              <div className="flex items-center gap-1.5 text-content-tertiary">
                <row.icon className="size-4 shrink-0 text-copper-strong" aria-hidden="true" />
                <span className="truncate text-dash-caption font-semibold">
                  {row.label}
                </span>
              </div>
              <p className="text-dash-body-sm font-bold text-content-primary">
                {row.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="manage-heading" className="space-y-4">
        <h2
          id="manage-heading"
          className="text-dash-title font-bold tracking-tight text-content-primary"
        >
          {t("workingHoursHub.manage.title")}
        </h2>
        <div className="flex min-w-0 flex-col items-start justify-between gap-5 rounded-panel border border-surface-variant/50 bg-surface-secondary p-5 shadow-elevation-2 transition-all duration-300 hover:shadow-elevation-3 sm:gap-6 lg:flex-row lg:items-center">
          <div className="w-full min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
              <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
                <div className="shrink-0 rounded-control bg-accent/10 p-2 text-copper-strong">
                  <Clock className="size-6" strokeWidth={1.75} aria-hidden="true" />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <h3 className="text-dash-heading wrap-break-word text-content-primary">
                    {t("workingHoursHub.manage.name")}
                  </h3>
                  <p className="text-dash-body-sm wrap-break-word text-content-secondary">
                    {t("workingHoursHub.manage.description")}
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-x-4 gap-y-2 border-t border-surface-variant/50 pt-3 sm:grid-cols-2">
              {[
                { icon: Clock, label: t("workingHoursHub.manage.featureHours") },
                { icon: Users, label: t("workingHoursHub.manage.featureCapacity") },
                { icon: Zap, label: t("workingHoursHub.manage.featureToggle") },
              ].map((feature) => (
                <div
                  key={feature.label}
                  className="flex min-w-0 items-start gap-2 text-dash-body-sm text-content-secondary"
                >
                  <feature.icon
                    className="mt-0.5 size-4 shrink-0 text-copper-strong"
                    aria-hidden="true"
                  />
                  <span className="wrap-break-word">{feature.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex w-full shrink-0 flex-col gap-2.5 sm:flex-row lg:w-48 lg:flex-col">
            <Link href="/dashboard/working-hours/manage" className={manageClass}>
              <Settings2 className="size-4 shrink-0" aria-hidden="true" />
              <span>{t("workingHoursHub.manageManage")}</span>
            </Link>
            <Link href="/dashboard/working-hours/add" className={addClass}>
              <Plus className="size-4 shrink-0" aria-hidden="true" />
              <span>{t("workingHoursHub.manageAdd")}</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}