"use client";

import { useFormatter, useTranslations } from "next-intl";
import {
  Brush,
  Code2,
  GitFork,
  LayoutGrid,
  Link2,
  ListOrdered,
  Network,
  Plus,
  Settings2,
  Star,
  Stethoscope,
  Tag,
  Timer,
  Wallet,
} from "lucide-react";
import { Link } from "@/src/i18n/navigation";
import type { PerformanceViewData } from "@/lib/services/performance";

function percentage(part: number, total: number): number {
  return total === 0 ? 0 : Math.round((part / total) * 100);
}

export default function ServicesAnalyticsContent({
  data,
}: {
  data: PerformanceViewData;
}) {
  const t = useTranslations();
  const format = useFormatter();

  const rows = [
    {
      key: "services" as const,
      count: data.services.total,
      dot: "bg-accent",
      track: "bg-accent/10",
      fill: "bg-accent",
    },
    {
      key: "categories" as const,
      count: data.categories.total,
      dot: "bg-copper-deep",
      track: "bg-surface-tertiary/30",
      fill: "bg-copper-deep",
    },
    {
      key: "groups" as const,
      count: data.groups.total,
      dot: "bg-gold",
      track: "bg-surface-tertiary/30",
      fill: "bg-gold",
    },
  ];

  const cards = [
    {
      key: "group" as const,
      title: t("servicesAnalytics.hub.group.name"),
      description: t("servicesAnalytics.hub.group.description"),
      href: "/dashboard/services/manage/groups",
      addHref: "/dashboard/services/manage/groups/add",
      icon: Network,
      badge: t("servicesAnalytics.counts.active", {
        count: format.number(data.groups.active),
      }),
      features: [
        { icon: Link2, label: t("servicesAnalytics.hub.group.featureSlug") },
        { icon: ListOrdered, label: t("servicesAnalytics.hub.group.featureOrder") },
        { icon: Brush, label: t("servicesAnalytics.hub.group.featureBrand") },
      ],
    },
    {
      key: "category" as const,
      title: t("servicesAnalytics.hub.category.name"),
      description: t("servicesAnalytics.hub.category.description"),
      href: "/dashboard/services/manage/categories",
      icon: LayoutGrid,
      badge: t("servicesAnalytics.counts.total", {
        count: format.number(data.categories.total),
      }),
      features: [
        { icon: GitFork, label: t("servicesAnalytics.hub.category.featureGroup") },
        { icon: Tag, label: t("servicesAnalytics.hub.category.featureSeo") },
        { icon: Code2, label: t("servicesAnalytics.hub.category.featureSlug") },
      ],
    },
    {
      key: "service" as const,
      title: t("servicesAnalytics.hub.service.name"),
      description: t("servicesAnalytics.hub.service.description"),
      href: "/dashboard/services/manage/services",
      icon: Stethoscope,
      badge: t("servicesAnalytics.counts.active", {
        count: format.number(data.services.active),
      }),
      features: [
        { icon: Wallet, label: t("servicesAnalytics.hub.service.featurePrice") },
        { icon: Timer, label: t("servicesAnalytics.hub.service.featureDuration") },
        { icon: Star, label: t("servicesAnalytics.hub.service.featureFeatured") },
      ],
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
          {t("servicesAnalytics.heading")}
        </h1>
        <p className="max-w-2xl wrap-break-word text-dash-body text-content-secondary">
          {t("servicesAnalytics.subtitle")}
        </p>
      </header>

      <section aria-labelledby="performance-heading" className="space-y-4">
        <h2
          id="performance-heading"
          className="text-dash-title font-bold tracking-tight text-content-primary"
        >
          {t("servicesAnalytics.performance.title")}
        </h2>
        <div className="relative overflow-hidden rounded-panel border border-surface-variant/50 bg-surface-secondary p-5 shadow-elevation-2 sm:p-6 md:p-8">
          <div
            className="pointer-events-none absolute inset-0 bg-linear-to-br from-surface-tertiary/20 to-transparent"
            aria-hidden="true"
          />
          <div className="relative z-10 space-y-6 sm:space-y-8">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div className="min-w-0 space-y-1">
                <p className="text-dash-caption font-bold uppercase tracking-widest text-content-tertiary">
                  {t("servicesAnalytics.performance.totalAssets")}
                </p>
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-dash-display leading-none text-content-primary">
                    {format.number(data.totalAssets)}
                  </span>
                  <span className="whitespace-nowrap text-dash-body-sm font-medium text-content-secondary">
                    {t("servicesAnalytics.performance.activeItems")}
                  </span>
                </div>
              </div>
              <div className="shrink-0">
                <div className="flex items-center gap-2 rounded-pill border border-accent/10 bg-accent/5 px-3 py-1.5">
                  <span
                    className="size-2 rounded-full bg-accent animate-pulse"
                    aria-hidden="true"
                  />
                  <span className="text-dash-caption font-semibold text-content-primary">
                    {t("servicesAnalytics.performance.live")}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-5 sm:space-y-6">
              {rows.map((row) => {
                const pct = percentage(row.count, data.totalAssets);
                return (
                  <div key={row.key} className="space-y-2 sm:space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          className={`size-1.5 shrink-0 rounded-full ${row.dot}`}
                          aria-hidden="true"
                        />
                        <span className="truncate text-dash-body-sm font-medium text-content-secondary">
                          {t(`servicesAnalytics.performance.${row.key}`)}
                        </span>
                      </div>
                      <span className="text-dash-body-sm font-semibold text-content-primary">
                        {format.number(row.count)}
                      </span>
                    </div>
                    <div
                      className={`h-1.5 w-full flex-1 overflow-hidden rounded-full ${row.track}`}
                      role="progressbar"
                      aria-valuenow={pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={t(`servicesAnalytics.performance.${row.key}`)}
                    >
                      <div
                        className={`h-full rounded-full ${row.fill}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="management-heading" className="space-y-4">
        <h2
          id="management-heading"
          className="text-dash-title font-bold tracking-tight text-content-primary"
        >
          {t("servicesAnalytics.hub.title")}
        </h2>

        <div className="flex flex-col gap-4 sm:gap-6">
          {cards.map((card) => (
            <div
              key={card.key}
              className="flex min-w-0 flex-col items-start justify-between gap-5 rounded-panel border border-surface-variant/50 bg-surface-secondary p-5 shadow-elevation-2 transition-all duration-300 hover:shadow-elevation-3 sm:gap-6 lg:flex-row lg:items-center"
            >
              <div className="w-full min-w-0 flex-1 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
                  <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
                    <div className="shrink-0 rounded-control bg-accent/10 p-2 text-copper-strong">
                      <card.icon className="size-6" strokeWidth={1.75} aria-hidden="true" />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-dash-heading wrap-break-word text-content-primary">
                          {card.title}
                        </h3>
                        <span className="whitespace-nowrap rounded-pill border border-accent/20 bg-accent/10 px-2 py-0.5 text-dash-caption font-bold uppercase tracking-wider text-accent">
                          {card.badge}
                        </span>
                      </div>
                      <p className="text-dash-body-sm wrap-break-word text-content-secondary">
                        {card.description}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-x-4 gap-y-2 border-t border-surface-variant/50 pt-3 sm:grid-cols-2">
                  {card.features.map((feature) => (
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
                <Link href={card.href} className={manageClass}>
                  <Settings2 className="size-4 shrink-0" aria-hidden="true" />
                  <span>{t("servicesAnalytics.manage")}</span>
                </Link>
                <Link href={card.addHref ?? card.href} className={addClass}>
                  <Plus className="size-4 shrink-0" aria-hidden="true" />
                  <span>{t("servicesAnalytics.addNew")}</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}