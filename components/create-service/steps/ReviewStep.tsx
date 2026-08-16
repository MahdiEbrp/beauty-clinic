"use client";

import { useTranslations } from "next-intl";
import {
  CheckCircle2,
  Clock,
  Image as ImageIcon,
  Layers,
  ListChecks,
  Star,
  Tag,
  UserCheck,
  XCircle,
} from "lucide-react";

import { Panel, PriceBadge } from "@/components/create-group/ui";
import type { Locale, PriceType, ReviewExtra } from "../types";

export default function ReviewStep({
  content,
  slug,
  isActive,
  isFeatured,
  price,
  priceType,
  durationMin,
  sessionsCount,
  coverImage,
  extraSummary,
  ns,
}: {
  content: Record<Locale, { title: string; shortDesc: string; fullDesc: string }>;
  slug: string;
  isActive: boolean;
  isFeatured: boolean;
  price: string | null;
  priceType: PriceType;
  durationMin: string | null;
  sessionsCount: string;
  coverImage: string;
  extraSummary?: ReviewExtra;
  ns?: string;
}) {
  const t = useTranslations(ns ?? "serviceWizard");

  return (
    <Panel>
      <div className="grid gap-6 sm:gap-8">
        <section>
          <h3 className="text-dash-heading font-bold tracking-tight text-content-primary">
            {t("review.heading")}
          </h3>
          <p className="mt-1 text-dash-body-sm text-content-secondary">
            {t("review.subtitle")}
          </p>
        </section>

        <div className="grid gap-6 md:grid-cols-2 md:gap-8">
          <section className="grid gap-4">
            <SummaryRow
              icon={<Layers className="size-4 text-copper-strong" />}
              label={t("review.slug")}
              value={slug || t("review.notSet")}
            />
            <SummaryRow
              icon={
                isActive ? (
                  <CheckCircle2 className="size-4 text-success" />
                ) : (
                  <XCircle className="size-4 text-destructive" />
                )
              }
              label={t("review.active")}
              value={isActive ? t("review.yes") : t("review.no")}
            />
            <SummaryRow
              icon={
                isFeatured ? (
                  <Star className="size-4 text-amber-400" />
                ) : (
                  <Star className="size-4 text-content-tertiary/50" />
                )
              }
              label={t("review.featured")}
              value={isFeatured ? t("review.yes") : t("review.no")}
            />
            {extraSummary && (
              <SummaryRow
                icon={<Tag className="size-4 text-copper-strong" />}
                label={extraSummary.label}
                value={extraSummary.value || t("review.notSet")}
              />
            )}
            <SummaryRow
              icon={<UserCheck className="size-4 text-copper-strong" />}
              label={t("review.priceType")}
              value={
                <span className="inline-flex items-center gap-1.5">
                  <PriceBadge priceType={priceType} />
                  <span className="capitalize">{t(`priceType.${priceType}`)}</span>
                </span>
              }
            />
          </section>
          <section className="grid gap-4">
            <SummaryRow
              icon={<Tag className="size-4 text-copper-strong" />}
              label={t("review.price")}
              value={
                priceType === "on_request"
                  ? t("review.priceRequest")
                  : price
                    ? `$${Number(price).toLocaleString()}`
                    : t("review.notSet")
              }
            />
            <SummaryRow
              icon={<Clock className="size-4 text-copper-strong" />}
              label={t("review.duration")}
              value={
                durationMin
                  ? `${Number(durationMin)} ${t("review.min")}`
                  : t("review.notSet")
              }
            />
            <SummaryRow
              icon={<ListChecks className="size-4 text-copper-strong" />}
              label={t("review.sessions")}
              value={
                sessionsCount
                  ? Number(sessionsCount).toLocaleString()
                  : t("review.notSet")
              }
            />
          </section>
                </div>

        {coverImage.trim() && (
          <section className="grid gap-3 md:max-w-xs">
            <div className="flex items-center gap-2 text-dash-caption font-bold text-content-secondary">
              <ImageIcon className="size-4 text-copper-strong" aria-hidden="true" />
              {t("review.image")}
            </div>
            <div className="relative aspect-video w-full overflow-hidden rounded border">
              <img
                src={coverImage}
                alt={t("review.image")}
                className="h-full w-full object-cover"
              />
            </div>
          </section>
        )}

        <section className="grid gap-4 border-t border-border-primary pt-5 md:grid-cols-2 md:gap-8">
          <div>
            <h4 className="text-dash-body-sm font-bold text-content-tertiary">
              {t("language.en")}
            </h4>
            <SummaryRow
              label={t("review.title")}
              value={content.en.title || t("review.notSet")}
            />
            <SummaryRow
              label={t("review.shortDesc")}
              value={content.en.shortDesc || t("review.notSet")}
            />
          </div>
          <div>
            <h4 className="text-dash-body-sm font-bold text-content-tertiary">
              {t("language.fa")}
            </h4>
            <SummaryRow
              label={t("review.title")}
              value={content.fa.title || t("review.notSet")}
            />
            <SummaryRow
              label={t("review.shortDesc")}
              value={content.fa.shortDesc || t("review.notSet")}
            />
          </div>
        </section>
      </div>
    </Panel>
  );
}

function SummaryRow({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3.5">
      {icon && <span className="mt-0.5 shrink-0">{icon}</span>}
      <div className="min-w-0">
        <p className="text-dash-caption font-bold text-content-secondary">{label}</p>
        <div className="text-dash-body wrap-break-word text-content-secondary">{value}</div>
      </div>
    </div>
  );
}



