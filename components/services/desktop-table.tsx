"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle, RefreshCw, Star, Stethoscope } from "lucide-react";
import type { AdminService } from "@/lib/services/types";
import { SelectionCheckbox, statusOf, statusClass, formatPrice } from "./helpers";
import { ServiceRowSkeleton } from "./skeletons";
import { ServiceRowActions } from "./row-actions";
import { ServicesEmptyState } from "./empty-state";
import { useServices } from "./services-context";

function StatusBadge({ service }: { service: AdminService }) {
  const t = useTranslations();
  const state = statusOf(service);
  return (
    <span className={`inline-flex items-center rounded-pill border px-2.5 py-1 text-dash-caption font-bold ${statusClass[state]}` }>
      {t(`serviceServices.statuses.${state}`)}
    </span>
  );
}

function ServiceIcon({ service }: { service: AdminService }) {
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
        <Stethoscope className="size-5" strokeWidth={1.75} aria-hidden="true" />
      )}
    </span>
  );
}

function ServicesErrorState() {
  const t = useTranslations();
  const { load, debouncedSearch, status, featured, page } = useServices();
  return (
    <tr>
      <td colSpan={7} className="px-6 py-14">
        <div className="flex flex-col items-center text-center">
          <AlertTriangle className="size-8 text-error" strokeWidth={1.75} aria-hidden="true" />
          <p className="mt-4 text-dash-body font-semibold text-content-primary">{t("serviceServices.errorTitle")}</p>
          <p className="mt-1 text-dash-caption text-content-secondary">{t("serviceServices.errorDescription")}</p>
          <button
            type="button"
            onClick={() => void load({ search: debouncedSearch, status, featured, page })}
            className="mt-5 inline-flex items-center gap-2 rounded-pill border border-border-interactive bg-surface-secondary px-4 py-2 min-h-10 text-dash-body-sm font-bold text-accent hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <RefreshCw className="size-4" strokeWidth={2} aria-hidden="true" />
            {t("serviceServices.retry")}
          </button>
        </div>
      </td>
    </tr>
  );
}

export function ServicesDesktopTable() {
  const t = useTranslations();
  const { data, isLoading, hasLoadFailed, canWrite, selectedIds, allVisibleSelected, selectAllRef, toggleServiceSelection, togglePageSelection, currency } = useServices();

  if (hasLoadFailed) {
    return (
      <table className="w-full text-start">
        <tbody>
          <ServicesErrorState />
        </tbody>
      </table>
    );
  }

  return (
    <table className="w-full text-start">
      <thead>
        <tr>
          <th className="px-6 py-4 text-start w-12">
            <SelectionCheckbox ref={selectAllRef} checked={allVisibleSelected} indeterminate={!allVisibleSelected && selectedIds.length > 0} onChange={togglePageSelection} label={t("serviceServices.selectPage")} />
          </th>
          <th className="px-3 py-4 text-start">{t("serviceServices.table.name")}</th>
          <th className="px-3 py-4 text-start">{t("serviceServices.table.category")}</th>
          <th className="px-3 py-4 text-center">{t("serviceServices.table.price")}</th>
          <th className="px-3 py-4 text-center">{t("serviceServices.table.duration")}</th>
          <th className="px-3 py-4 text-center">{t("serviceServices.table.featured")}</th>
          <th className="px-3 py-4 text-center">{t("serviceServices.table.status")}</th>
          <th className="w-16 px-6 py-4 text-end">
            <span className="sr-only">{t("serviceServices.actions.menu")}</span>
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border-main">
        {isLoading
          ? Array.from({ length: 5 }).map((_, index) => (
              <tr key={index}>
                <td className="px-6 py-4"><ServiceRowSkeleton /></td>
              </tr>
            ))
          : data.items.length === 0
            ? (
              <tr>
                <td colSpan={8}>
                  <ServicesEmptyState />
                </td>
              </tr>
            )
            : data.items.map((service) => {
              const isSelected = selectedIds.includes(service.id);
              return (
                <tr key={service.id} className={`transition-colors ${isSelected ? "bg-accent-subtle/40" : "hover:bg-surface-tertiary/40"}`}>
                  <td className="px-6 py-4 text-center">
                    <SelectionCheckbox checked={isSelected} onChange={() => toggleServiceSelection(service.id)} label={t("serviceServices.selectRow")} />
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-3">
                      <ServiceIcon service={service} />
                      <div className="min-w-0">
                        <p className="truncate text-dash-body font-semibold text-accent">{service.title}</p>
                        <p dir="ltr" className="truncate text-dash-caption text-content-tertiary">{service.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <span className="text-dash-body-sm text-content-secondary">{service.categoryName ?? "—"}</span>
                  </td>
<td className="px-3 py-4 text-center">
                      <span dir="ltr" className="text-dash-body-sm text-accent">
                        {service.price ? formatPrice(service.price, currency) : t("serviceServices.price_on_request")}
                      </span>
                    </td>
                  <td className="px-3 py-4 text-center">
                    <span className="text-dash-body-sm text-content-secondary">
                      {service.durationMin ? `${Number(service.durationMin)} ${t("serviceServices.durationUnit")}` : "—"}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-center">
                    {service.isFeatured ? <Star className="size-4 text-amber-400 mx-auto" /> : <span className="text-content-tertiary">—</span>}
                  </td>
                  <td className="px-3 py-4 text-center"><StatusBadge service={service} /></td>
                  <td className="px-6 py-4 text-end">{canWrite && <ServiceRowActions row={service} />}</td>
                </tr>
              );
            })}
      </tbody>
    </table>
  );
}
