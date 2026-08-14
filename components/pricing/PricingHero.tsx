"use client";

import { useTranslations } from "next-intl";
import {
  Award,
  HeartHandshake,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  X,
} from "lucide-react";

type PricingHeroProps = {
  query: string;
  onQueryChange: (value: string) => void;
};

const TRUST_ICONS = [Star, Award, ShieldCheck, HeartHandshake] as const;

/**
 * Photographic hero with a surface-tinted gradient dissolve, a floating search
 * bar and the clinic's trust indicators.
 */
export default function PricingHero({ query, onQueryChange }: PricingHeroProps) {
  const t = useTranslations();
  const trust = [
    { Icon: TRUST_ICONS[0], label: t("pricing.trust.rating") },
    { Icon: TRUST_ICONS[1], label: t("pricing.trust.experience") },
    { Icon: TRUST_ICONS[2], label: t("pricing.trust.experts") },
    { Icon: TRUST_ICONS[3], label: t("pricing.trust.clients") },
  ];

  return (
    <section className="hero-bg relative overflow-hidden">
      <div className="hero-overlay absolute inset-0 z-0" />
      <div className="grain absolute inset-0 z-1 pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-content px-6 pt-20 pb-16 md:pt-28 md:pb-24">
        <p className="mb-6 inline-flex items-center gap-2 rounded-pill border border-border-primary bg-surface-secondary/90 px-4 py-2 text-caption font-semibold text-copper-strong shadow-elevation-1">
          <Sparkles className="size-4" aria-hidden="true" />
          {t("pricing.hero.tagline")}
        </p>

        <h1 className="mb-5 text-display font-extralight leading-[1.08] tracking-tight text-accent">
          {t("pricing.hero.title")}
        </h1>
        <p className="mb-10 max-w-xl text-body-lead text-content-secondary">
          {t("pricing.hero.description")}
        </p>

        <div className="relative max-w-xl">
          <label htmlFor="pricing-search" className="sr-only">
            {t("pricing.hero.searchLabel")}
          </label>
          <Search
            className="pointer-events-none absolute start-5 top-1/2 size-5 -translate-y-1/2 text-copper"
            aria-hidden="true"
          />
          <input
            id="pricing-search"
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={t("pricing.hero.searchPlaceholder")}
            autoComplete="off"
            className="w-full rounded-pill border border-border-interactive bg-surface-secondary/95 py-4 ps-12 pe-12 text-body shadow-elevation-3 outline-none transition-colors placeholder:text-content-tertiary focus:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          />
          {query ? (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              aria-label={t("pricing.hero.clearSearch")}
              className="absolute end-3 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-pill text-content-tertiary transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          ) : null}
        </div>

        <ul className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3">
          {trust.map(({ Icon, label }) => (
            <li
              key={label}
              className="inline-flex items-center gap-2 text-body-sm font-medium text-content-secondary"
            >
              <Icon className="size-5 text-copper" aria-hidden="true" />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}