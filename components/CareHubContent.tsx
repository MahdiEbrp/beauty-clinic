"use client";

import { useTranslations } from "next-intl";
import { ListChecks, Plus, Settings2, Sparkles, type LucideIcon } from "lucide-react";
import { Link } from "@/src/i18n/navigation";

function Card({
  icon: Icon,
  title,
  description,
  features,
  href,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  features: Array<{ icon: LucideIcon; label: string }>;
  href: string;
}) {
  const t = useTranslations();
  const manageClass =
    "flex-1 px-4 py-2.5 min-h-11 flex items-center justify-center gap-2 whitespace-nowrap rounded-pill bg-accent text-on-primary text-dash-body-sm font-semibold transition-colors duration-300 hover:bg-primary-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
  const addClass =
    "flex-1 px-4 py-2.5 min-h-11 flex items-center justify-center gap-2 whitespace-nowrap rounded-pill border border-accent bg-accent/5 text-accent text-dash-body-sm font-semibold transition-colors duration-300 hover:bg-accent/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

  return (
    <div className="flex min-w-0 flex-col items-start justify-between gap-5 rounded-panel border border-surface-variant/50 bg-surface-secondary p-5 shadow-elevation-2 transition-all duration-300 hover:shadow-elevation-3 sm:gap-6 lg:flex-row lg:items-center">
      <div className="w-full min-w-0 flex-1 space-y-3">
        <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
          <div className="shrink-0 rounded-control bg-accent/10 p-2 text-copper-strong">
            <Icon className="size-6" strokeWidth={1.75} aria-hidden="true" />
          </div>
          <div className="min-w-0 space-y-0.5">
            <h3 className="text-dash-heading wrap-break-word text-content-primary">
              {title}
            </h3>
            <p className="text-dash-body-sm wrap-break-word text-content-secondary">
              {description}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-x-4 gap-y-2 border-t border-surface-variant/50 pt-3 sm:grid-cols-2">
          {features.map((feature) => (
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
        <Link href={href} className={manageClass}>
          <Settings2 className="size-4 shrink-0" aria-hidden="true" />
          <span>{t("careHub.manage")}</span>
        </Link>
        <Link href={`${href}/add`} className={addClass}>
          <Plus className="size-4 shrink-0" aria-hidden="true" />
          <span>{t("careHub.addNew")}</span>
        </Link>
      </div>
    </div>
  );
}

export default function CareHubContent() {
  const t = useTranslations();

  const cards = [
    {
      key: "guides",
      title: t("careHub.guides.name"),
      description: t("careHub.guides.description"),
      href: "/dashboard/care/manage/guides",
      icon: Sparkles,
      features: [
        { icon: Sparkles, label: t("careHub.guides.featureIcon") },
        { icon: ListChecks, label: t("careHub.guides.featureItems") },
      ],
    },
    {
      key: "items",
      title: t("careHub.items.name"),
      description: t("careHub.items.description"),
      href: "/dashboard/care/manage/items",
      icon: ListChecks,
      features: [
        { icon: Sparkles, label: t("careHub.items.featureHighlight") },
        { icon: ListChecks, label: t("careHub.items.featureGuide") },
      ],
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <header className="space-y-2">
        <h1 className="text-dash-display font-bold tracking-tight text-accent">
          {t("careHub.heading")}
        </h1>
        <p className="max-w-2xl wrap-break-word text-dash-body text-content-secondary">
          {t("careHub.subtitle")}
        </p>
      </header>

      <section aria-labelledby="care-management-heading" className="space-y-4">
        <h2
          id="care-management-heading"
          className="text-dash-title font-bold tracking-tight text-content-primary"
        >
          {t("careHub.sectionTitle")}
        </h2>
        <div className="flex flex-col gap-4 sm:gap-6">
          {cards.map((card) => (
            <Card
              key={card.key}
              icon={card.icon}
              title={card.title}
              description={card.description}
              features={card.features}
              href={card.href}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
