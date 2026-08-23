"use client";

import { useFormatter, useTranslations } from "next-intl";
import { Plus, Settings2 } from "lucide-react";
import { Link } from "@/src/i18n/navigation";
import type { BookingsPerformance } from "@/lib/bookings/performance";
import { buildHubCards } from "./hub-cards";

export default function BookingsHub({ data }: { data: BookingsPerformance }) {
  const t = useTranslations("bookingAdmin");
  const format = useFormatter();

  const rows = [
    { key: "reservations" as const, count: data.reservations.total },
    { key: "slots" as const, count: data.slots.total },
  ];
  const cards = buildHubCards(
    data,
    (key, values) => t(key as never, values as never),
    (value) => format.number(value),
  );

  const manageClass =
    "flex-1 min-h-11 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-pill bg-accent px-4 py-2.5 text-dash-body-sm font-bold text-content-contrast transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
  const addClass =
    "flex-1 min-h-11 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-pill border border-border-interactive bg-surface-secondary px-4 py-2.5 text-dash-body-sm font-bold text-accent transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

  return (
    <div className="space-y-6">
      <header className="rounded-panel border border-border-primary bg-surface-secondary px-5 py-4 shadow-elevation-2 sm:px-6">
        <h1 className="text-dash-display font-bold tracking-tight text-accent">{t("title")}</h1>
        <p className="mt-1 text-dash-body-sm text-content-secondary">{t("description")}</p>
      </header>

      <section aria-labelledby="bookings-performance" className="space-y-3">
        <h2
          id="bookings-performance"
          className="text-dash-title font-bold tracking-tight text-content-primary"
        >
          {t("performance.title")}
        </h2>
        <div className="space-y-3 rounded-panel border border-border-primary bg-surface-secondary p-5 shadow-elevation-1">
          {rows.map((row) => (
            <div key={row.key} className="flex items-center justify-between gap-3">
              <span className="text-dash-body-sm text-content-secondary">
                {t(`performance.${row.key}`)}
              </span>
              <span className="text-dash-title font-bold text-accent">
                {format.number(row.count)}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="bookings-hub" className="space-y-4">
        <h2
          id="bookings-hub"
          className="text-dash-title font-bold tracking-tight text-content-primary"
        >
          {t("hub.title")}
        </h2>
        <div className="flex flex-col gap-4 sm:gap-6">
          {cards.map((card) => (
            <div
              key={card.key}
              className="flex min-w-0 flex-col items-start justify-between gap-5 rounded-panel border border-border-primary/50 bg-surface-secondary p-5 shadow-elevation-2 transition-all duration-300 hover:shadow-elevation-3 lg:flex-row lg:items-center"
            >
              <div className="w-full min-w-0 flex-1 space-y-3">
                <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                  <div className="shrink-0 rounded-control bg-accent/10 p-2 text-copper-strong">
                    <card.icon className="size-6" strokeWidth={1.75} aria-hidden="true" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="wrap-break-word text-dash-heading font-bold tracking-tight text-content-primary">
                        {card.title}
                      </h3>
                      <span className="whitespace-nowrap rounded-pill border border-accent/20 bg-accent/10 px-2 py-0.5 text-dash-caption font-bold uppercase tracking-wider text-accent">
                        {card.badge}
                      </span>
                    </div>
                    <p className="wrap-break-word text-dash-body-sm text-content-secondary">
                      {card.description}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-x-4 gap-y-2 border-t border-border-primary/50 pt-3 sm:grid-cols-2">
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
                  <span>{t("manage")}</span>
                </Link>
                <Link href={card.addHref} className={addClass}>
                  <Plus className="size-4 shrink-0" aria-hidden="true" />
                  <span>{t("addNew")}</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
