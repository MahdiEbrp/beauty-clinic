"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, Check, LayoutGrid, Search } from "lucide-react";
import { Link } from "@/src/i18n/navigation";

export type GroupOption = {
  id: string;
  name: string;
};

/**
 * Group picker for the admin reservation wizard. Only the group is shown —
 * service prices are never part of a booking.
 */
export function GroupSelectStep({
  groups,
  selectedId,
  onSelect,
  loading,
}: {
  groups: GroupOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  loading?: boolean;
}) {
  const t = useTranslations("reservationWizard");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter((group) => group.name.toLowerCase().includes(q));
  }, [groups, query]);

  if (loading) {
    return (
      <div className="space-y-3" aria-busy="true">
        {[0, 1, 2].map((row) => (
          <div key={row} className="h-20 animate-pulse rounded-control bg-surface-tertiary" />
        ))}
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div
        role="status"
        className="flex flex-col items-start gap-3 rounded-control border border-warning/30 bg-warning/10 p-4 text-dash-body-sm text-warning"
      >
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <div className="space-y-0.5">
            <p className="font-bold">{t("groupStep.emptyTitle")}</p>
            <p className="text-warning/90">{t("groupStep.emptyDescription")}</p>
          </div>
        </div>
        <Link
          href="/dashboard/services/manage/groups/add"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill border border-border-interactive bg-surface-secondary px-4 text-dash-body-sm font-bold text-accent hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {t("groupStep.createGroup")}
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
          placeholder={t("groupStep.searchPlaceholder")}
          className="h-full w-full bg-transparent text-dash-body-sm text-accent outline-none placeholder:text-content-tertiary"
        />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {filtered.map((group) => {
          const isSelected = group.id === selectedId;
          return (
            <button
              key={group.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelect(group.id)}
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
                {isSelected && <Check className="size-3" strokeWidth={3} />}
              </span>
              <div className="min-w-0 flex-1">
                <span className="block truncate text-dash-body font-semibold">{group.name}</span>
              </div>
              <LayoutGrid className="size-4 shrink-0 text-content-tertiary" aria-hidden="true" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
