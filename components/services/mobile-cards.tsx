"use client";

import { useTranslations } from "next-intl";
import { Star, Stethoscope } from "lucide-react";
import type { AdminService } from "@/lib/services/types";
import { statusOf, statusClass } from "./helpers";
import { ServiceCardSkeleton } from "./skeletons";
import { ServiceRowActions } from "./row-actions";
import { ServicesEmptyState } from "./empty-state";
import { useServices } from "./services-context";
import { QuickPriceEditor } from "./quick-price-editor";

function ServiceCardIcon({ service }: { service: AdminService }) {
  return (
    <span className="relative inline-flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border-primary bg-accent-subtle/60 text-accent">
      {service.coverImage ? (
        <img
          src={service.coverImage}
          alt={service.title}
          sizes="48px"
          className="h-full w-full object-cover"
        />
      ) : (
        <Stethoscope className="size-6" strokeWidth={1.75} aria-hidden="true" />
      )}
    </span>
  );
}

function ServiceCard({ service }: { service: AdminService }) {
  const t = useTranslations();
  const { canWrite, isSyncing } = useServices();
  const state = statusOf(service);
  return (
    <article className={`flex items-start gap-3 rounded-card border border-border-primary bg-surface-secondary p-3.5 ${isSyncing(service.id) ? "opacity-60" : ""}`}>
      <ServiceCardIcon service={service} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate text-dash-body font-semibold text-accent">{service.title}</h3>
          <span className={`shrink-0 rounded-pill border px-2 py-0.5 text-dash-caption font-bold ${statusClass[state]}` }>
            {t(`serviceServices.statuses.${state}`)}
          </span>
        </div>
        <p dir="ltr" className="mt-0.5 truncate text-end text-dash-caption text-content-tertiary">{service.slug}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-dash-caption text-content-secondary">
          {service.categoryName && <span>{service.categoryName}</span>}
          <QuickPriceEditor service={service} />
          {service.isFeatured && (
            <span className="inline-flex items-center gap-1 text-amber-400">
              <Star className="size-3" />
              {t("serviceServices.featuredYes")}
            </span>
          )}
        </div>
      </div>
      {canWrite && (
        <div className="shrink-0">
          <ServiceRowActions row={service} />
        </div>
      )}
    </article>
  );
}

export function ServicesMobileCards() {
  const t = useTranslations();
  const { data, isLoading, hasLoadFailed } = useServices();
  return (
    <div className="space-y-3 p-3">
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <ServiceCardSkeleton key={index} />
          ))}
        </div>
      ) : hasLoadFailed ? (
        <div className="py-10 text-center text-dash-body text-content-secondary">{t("serviceServices.errorTitle")}</div>
      ) : data.items.length === 0 ? (
        <ServicesEmptyState />
      ) : (
        data.items.map((service) => <ServiceCard key={service.id} service={service} />)
      )}
    </div>
  );
}
