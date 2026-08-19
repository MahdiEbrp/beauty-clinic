"use client";

import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  LayoutTemplate,
  Images,
  Layers,
  BarChart3,
  Sparkles,
  Settings2,
} from "lucide-react";
import { Link } from "@/src/i18n/navigation";
import type { LandingAdminOverview } from "@/lib/landing/admin/types";
import type { CollectionKey } from "./types";

const COLLECTION_CARDS: Array<{
  key: CollectionKey;
  icon: typeof Sparkles;
}> = [
  { key: "marquee", icon: Layers },
  { key: "services", icon: Sparkles },
  { key: "stats", icon: BarChart3 },
  { key: "gallery", icon: Images },
];

export default function LandingHub({
  overview,
}: {
  overview: LandingAdminOverview;
}) {
  const t = useTranslations("landingAdmin");

  const collectionCount = (key: CollectionKey) =>
    key === "marquee"
      ? overview.marquee
      : key === "services"
        ? overview.services
        : key === "stats"
          ? overview.stats
          : overview.gallery;

  return (
    <div className="space-y-3">
      <Link
        href="/dashboard/services"
        className="inline-flex min-h-11 items-center gap-2 self-start rounded-pill border border-border-interactive bg-surface-secondary px-4 text-dash-body-sm font-bold text-accent transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <ArrowLeft className="size-4 rtl-mirror rtl:rotate-180" aria-hidden="true" />
        <span>{t("backToServices")}</span>
      </Link>

      <header className="flex items-center justify-between gap-3 rounded-panel border border-border-primary bg-surface-secondary px-4 py-3 shadow-elevation-2 sm:px-6 sm:py-4">
        <div className="flex min-w-0 items-baseline gap-2.5">
          <h1 className="truncate text-dash-title font-bold tracking-tight text-accent">
            {t("hub.heading")}
          </h1>
          <span className="shrink-0 text-dash-caption font-bold text-content-tertiary">
            {t("hub.subheading")}
          </span>
        </div>
        {overview.active > 0 && (
          <span className="shrink-0 rounded-pill border border-success/30 bg-success/10 px-2.5 py-1 text-dash-caption font-bold text-success">
            {t("hub.published")}
          </span>
        )}
      </header>

      <section aria-label={t("hub.sectionsLabel")} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Link
          href="/dashboard/landing/hero"
          className="group flex min-h-11 items-center gap-4 rounded-card border border-border-primary bg-surface-secondary p-5 shadow-elevation-1 transition hover:border-border-interactive hover:shadow-elevation-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-pill border border-border-primary bg-accent-subtle/60 text-accent">
            <LayoutTemplate className="size-5" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-dash-body font-semibold text-accent">
              {t("hub.hero.title")}
            </span>
            <span className="block truncate text-dash-caption text-content-secondary">
              {t("hub.hero.description")}
            </span>
          </span>
        </Link>

        <Link
          href="/dashboard/landing/settings"
          className="group flex min-h-11 items-center gap-4 rounded-card border border-border-primary bg-surface-secondary p-5 shadow-elevation-1 transition hover:border-border-interactive hover:shadow-elevation-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-pill border border-border-primary bg-accent-subtle/60 text-accent">
            <Settings2 className="size-5" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-dash-body font-semibold text-accent">
              {t("hub.settings.title")}
            </span>
            <span className="block truncate text-dash-caption text-content-secondary">
              {t("hub.settings.description")}
            </span>
          </span>
        </Link>

        {COLLECTION_CARDS.map(({ key, icon: Icon }) => (
          <Link
            key={key}
            href={`/dashboard/landing/${key}`}
            className="group flex min-h-11 items-center gap-4 rounded-card border border-border-primary bg-surface-secondary p-5 shadow-elevation-1 transition hover:border-border-interactive hover:shadow-elevation-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-pill border border-border-primary bg-accent-subtle/60 text-accent">
              <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-dash-body font-semibold text-accent">
                {t(`collections.${key}.heading`)}
              </span>
              <span className="block truncate text-dash-caption text-content-secondary">
                {t(`collections.${key}.description`)}
              </span>
            </span>
            <span className="inline-flex min-w-8 items-center justify-center rounded-pill bg-surface-tertiary px-2 py-1 text-dash-caption font-bold text-content-secondary">
              {collectionCount(key)}
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}