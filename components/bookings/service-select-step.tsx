"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, Check, Clock, LayoutGrid, Repeat, Search } from "lucide-react";
import PriceTag from "@/components/pricing/PriceTag";
import { Link } from "@/src/i18n/navigation";
import type { PriceType } from "@/lib/services/types";

export type ServiceOption = {
  id: string;
  title: string;
  price: number | null;
  priceType: PriceType;
  durationMin: number | null;
  sessionsCount: number;
  categoryName: string;
  groupName: string;
};

export function ServiceSelectStep({
  services,
  selectedId,
  onSelect,
  loading,
  currency,
}: {
  services: ServiceOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  loading?: boolean;
  currency: string;
}) {
  const t = useTranslations("reservationWizard");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return services;
    return services.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.categoryName.toLowerCase().includes(q) ||
        s.groupName.toLowerCase().includes(q),
    );
  }, [services, query]);

  const groups = useMemo(() => {
    const map = new Map<string, ServiceOption[]>();
    for (const service of filtered) {
      const key = service.groupName || service.categoryName || t("serviceStep.uncategorized");
      const arr = map.get(key) ?? [];
      arr.push(service);
      map.set(key, arr);
    }
    return Array.from(map.entries());
  }, [filtered, t]);

  if (loading) {
    return (
      <div className="space-y-3" aria-busy="true">
        {[0, 1, 2].map((row) => (
          <div key={row} className="h-20 animate-pulse rounded-control bg-surface-tertiary" />
        ))}
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div
        role="status"
        className="flex flex-col items-start gap-3 rounded-control border border-warning/30 bg-warning/10 p-4 text-dash-body-sm text-warning"
      >
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <div className="space-y-0.5">
            <p className="font-bold">{t("serviceStep.emptyTitle")}</p>
            <p className="text-warning/90">{t("serviceStep.emptyDescription")}</p>
          </div>
        </div>
        <Link
          href="/dashboard/services/manage/services/add"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill border border-border-interactive bg-surface-secondary px-4 text-dash-body-sm font-bold text-accent hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {t("serviceStep.createService")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex h-11 items-center gap-2 rounded-control border border-form-input-border bg-form-input-bg px-3 transition-colors focus-within:border-copper">
        <Search className="size-4 shrink-0 text-content-tertiary" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("serviceStep.searchPlaceholder")}
          className="h-full w-full bg-transparent text-dash-body-sm text-accent outline-none placeholder:text-content-tertiary"
        />
      </div>

      <div className="space-y-6">
        {groups.map(([groupName, items]) => (
          <fieldset key={groupName} className="space-y-2">
            <legend className="flex items-center gap-2 text-dash-caption font-bold text-content-secondary">
              <LayoutGrid className="size-4 text-copper-strong" aria-hidden="true" />
              <span>{groupName}</span>
            </legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {items.map((service) => {
                const isSelected = service.id === selectedId;
                return (
                  <button
                    key={service.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => onSelect(service.id)}
                    className={`flex min-h-12 items-center gap-3 rounded-control border p-3 text-start transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                      isSelected
                        ? "border-accent bg-accent-subtle/60 text-accent"
                        : "border-border-primary bg-surface-secondary text-content-secondary hover:border-border-interactive hover:bg-surface-tertiary/50"
                    }`}
                  >
                    <span
                      className={`flex size-5 shrink-0 items-center justify-center rounded-pill border ${
                        isSelected
                          ? "border-accent bg-accent text-content-contrast"
                          : "border-border-interactive"
                      }`}
                      aria-hidden="true"
                    >
                      {isSelected && (
                        <Check className="size-3" strokeWidth={3} />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="block truncate text-dash-body font-semibold">
                        {service.title}
                      </span>
                      <div className="mt-1 flex items-center gap-3 text-caption text-content-tertiary">
                        {service.durationMin ? (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="size-3" aria-hidden="true" />
                            {service.durationMin} {t("serviceStep.minutes")}
                          </span>
                        ) : null}
                        <span className="inline-flex items-center gap-1">
                          <Repeat className="size-3" aria-hidden="true" />
                          {service.sessionsCount}
                        </span>
                      </div>
                    </div>
                    <PriceTag
                      price={service.price}
                      priceType={service.priceType}
                      currency={currency}
                      className="shrink-0 text-dash-body-sm font-extrabold text-copper-deep"
                      labelClassName="text-caption"
                    />
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>
    </div>
  );
}
