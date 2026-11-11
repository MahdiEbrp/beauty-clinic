"use client";

import { useFormatter, useTranslations } from "next-intl";
import {
  ArrowUpRight,
  Network,
  Plus,
  Settings2,
  Stethoscope,
  Tag,
} from "lucide-react";
import { Link } from "@/src/i18n/navigation";
import type { PerformanceViewData } from "@/lib/services/performance";
import type { ServiceCatalogSummary } from "@/lib/services/types";

function percentage(part: number, total: number): number {
  return total === 0 ? 0 : Math.round((part / total) * 100);
}

const primaryAction =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-pill bg-accent px-4 py-2 text-dash-caption font-bold text-content-contrast transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
const secondaryAction =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-pill border border-border-interactive bg-surface-secondary px-4 py-2 text-dash-caption font-bold text-content-primary transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export default function ServicesAnalyticsContent({
  data,
  catalog,
  canWrite,
}: {
  data: PerformanceViewData;
  catalog: ServiceCatalogSummary;
  canWrite: boolean;
}) {
  const t = useTranslations();
  const format = useFormatter();

  const rows = [
    { key: "services" as const, count: data.services.total, dot: "bg-accent", track: "bg-accent/10", fill: "bg-accent" },
    { key: "categories" as const, count: data.categories.total, dot: "bg-copper-deep", track: "bg-surface-tertiary/30", fill: "bg-copper-deep" },
    { key: "groups" as const, count: data.groups.total, dot: "bg-gold", track: "bg-surface-tertiary/30", fill: "bg-gold" },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <header className="space-y-2">
        <h1 className="text-dash-display font-bold tracking-tight text-accent">
          {t("servicesAnalytics.heading")}
        </h1>
        <p className="max-w-2xl wrap-break-word text-dash-body text-content-secondary">
          {t("servicesAnalytics.subtitle")}
        </p>
      </header>

      <section aria-labelledby="performance-heading" className="space-y-4">
        <h2 id="performance-heading" className="text-dash-title font-bold tracking-tight text-content-primary">
          {t("servicesAnalytics.performance.title")}
        </h2>
        <div className="relative overflow-hidden rounded-panel border border-surface-variant/50 bg-surface-secondary p-5 shadow-elevation-2 sm:p-6 md:p-8">
          <div className="relative z-10 space-y-6">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <p className="text-dash-caption font-bold uppercase tracking-widest text-content-tertiary">
                  {t("servicesAnalytics.performance.totalAssets")}
                </p>
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-dash-display leading-none text-content-primary">
                    {format.number(data.totalAssets)}
                  </span>
                  <span className="text-dash-body-sm font-medium text-content-secondary">
                    {t("servicesAnalytics.performance.activeItems")}
                  </span>
                </div>
              </div>
              <span className="rounded-pill border border-accent/10 bg-accent/5 px-3 py-1.5 text-dash-caption font-semibold text-content-primary">
                {t("servicesAnalytics.performance.live")}
              </span>
            </div>
            <div className="space-y-4">
              {rows.map((row) => {
                const pct = percentage(row.count, data.totalAssets);
                return (
                  <div key={row.key} className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className={`size-2 shrink-0 rounded-full ${row.dot}`} aria-hidden="true" />
                        <span className="truncate text-dash-body-sm font-medium text-content-secondary">
                          {t(`servicesAnalytics.performance.${row.key}`)}
                        </span>
                      </div>
                      <span className="text-dash-body-sm font-semibold text-content-primary">
                        {format.number(row.count)}
                      </span>
                    </div>
                    <div
                      className={`h-1.5 w-full overflow-hidden rounded-full ${row.track}`}
                      role="progressbar"
                      aria-valuenow={pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={t(`servicesAnalytics.performance.${row.key}`)}
                    >
                      <div className={`h-full rounded-full ${row.fill}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="catalog-heading" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="catalog-heading" className="text-dash-title font-bold tracking-tight text-content-primary">
              {t("servicesAnalytics.hub.title")}
            </h2>
            <p className="mt-1 text-dash-caption text-content-secondary">
              {format.number(catalog.groups.length)} {t("servicesAnalytics.hub.group.name")} · {format.number(catalog.categories.length)} {t("servicesAnalytics.hub.category.name")} · {format.number(catalog.totalServices)} {t("servicesAnalytics.hub.service.name")}
            </p>
          </div>
          <Link href="/dashboard/services/manage/services" className={secondaryAction}>
            <Stethoscope className="size-4" aria-hidden="true" />
            {t("servicesAnalytics.manage")} {t("servicesAnalytics.hub.service.name")}
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>

        {canWrite ? (
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/services/manage/groups/add" className={primaryAction}>
              <Plus className="size-4" aria-hidden="true" />
              {t("serviceGroups.addShort")}
            </Link>
            <Link href="/dashboard/services/manage/categories/add" className={secondaryAction}>
              <Plus className="size-4" aria-hidden="true" />
              {t("serviceCategories.add")}
            </Link>
            <Link href="/dashboard/services/manage/services/add" className={secondaryAction}>
              <Plus className="size-4" aria-hidden="true" />
              {t("serviceServices.add")}
            </Link>
            <Link href="/dashboard/services/manage/groups" className={secondaryAction}>
              {t("servicesAnalytics.manage")} {t("servicesAnalytics.hub.group.name")}
            </Link>
            <Link href="/dashboard/services/manage/categories" className={secondaryAction}>
              {t("servicesAnalytics.manage")} {t("servicesAnalytics.hub.category.name")}
            </Link>
          </div>
        ) : null}

        {catalog.groups.length === 0 ? (
          <div className="rounded-panel border border-dashed border-border-primary bg-surface-secondary p-6 text-center text-dash-body-sm text-content-secondary">
            {t("serviceGroups.empty")}
          </div>
        ) : (
          <div className="space-y-4">
            {catalog.groups.map((group) => {
              const categories = catalog.categories.filter((category) => category.groupId === group.id);
              return (
                <article key={group.id} className="overflow-hidden rounded-panel border border-border-primary bg-surface-secondary shadow-elevation-1">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-primary px-4 py-4 sm:px-5">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-accent/10 text-accent">
                        <Network className="size-5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="truncate text-dash-heading font-bold text-content-primary">{group.name}</h3>
                        <p className="text-dash-caption text-content-secondary">
                          {t("servicesAnalytics.counts.total", { count: format.number(group.categoryCount) })}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {canWrite ? (
                      <Link href={`/dashboard/services/manage/categories/add?groupId=${encodeURIComponent(group.id)}`} className={secondaryAction}>
                        <Plus className="size-4" aria-hidden="true" />
                        {t("serviceCategories.add")}
                      </Link>
                      ) : null}
                      {canWrite ? (
                      <Link href={`/dashboard/services/manage/groups/${group.id}/edit`} className={secondaryAction}>
                        <Settings2 className="size-4" aria-hidden="true" />
                        {t("serviceGroups.actions.edit")}
                      </Link>
                      ) : null}
                    </div>
                  </div>

                  <div className="space-y-2 p-3 sm:p-4">
                    {categories.length === 0 ? (
                      <p className="rounded-control border border-dashed border-border-primary px-4 py-3 text-dash-caption text-content-tertiary">
                        {t("serviceCategories.empty")}
                      </p>
                    ) : categories.map((category) => (
                      <div key={category.id} className="flex flex-wrap items-center justify-between gap-3 rounded-control border border-border-primary/70 bg-surface-primary px-3 py-3 sm:px-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-control bg-copper/10 text-copper-deep">
                            <Tag className="size-4" aria-hidden="true" />
                          </span>
                          <div className="min-w-0">
                            <h4 className="truncate text-dash-body-sm font-bold text-content-primary">{category.name}</h4>
                            <p className="text-dash-caption text-content-secondary">
                              {t("servicesAnalytics.counts.total", { count: format.number(category.serviceCount) })} · {t("servicesAnalytics.hub.service.name")}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {canWrite ? (
                            <Link href={`/dashboard/services/manage/services/add?categoryId=${encodeURIComponent(category.id)}`} className={secondaryAction}>
                              <Plus className="size-4" aria-hidden="true" />
                              {t("serviceServices.add")}
                            </Link>
                          ) : null}
                          <Link href={`/dashboard/services/manage/services?categoryId=${encodeURIComponent(category.id)}`} className={primaryAction}>
                            <Stethoscope className="size-4" aria-hidden="true" />
                            {t("servicesAnalytics.manage")} {t("servicesAnalytics.hub.service.name")}
                          </Link>
                          {canWrite ? (
                            <Link href={`/dashboard/services/manage/categories/${category.id}/edit`} className={secondaryAction}>
                              <Settings2 className="size-4" aria-hidden="true" />
                              {t("serviceCategories.actions.edit")}
                            </Link>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
