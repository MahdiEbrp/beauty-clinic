"use client";

import { useTranslations } from "next-intl";
import { AlertCircle, Loader2 } from "lucide-react";
import { useAdminListContext } from "./context";

export function AdminListErrorState<T extends { id: string }>() {
  const t = useTranslations();
  const ctx = useAdminListContext<T>();
  const { config, hasLoadFailed, load, debouncedSearch, status, page } = ctx;
  if (!hasLoadFailed) return null;
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <AlertCircle className="size-8 text-error" strokeWidth={2} aria-hidden="true" />
      <div>
        <p className="text-dash-body-sm font-bold text-content-secondary">
          {t(`${config.namespace}.errorTitle`)}
        </p>
        <p className="text-dash-caption text-content-tertiary">
          {t(`${config.namespace}.errorDescription`)}
        </p>
      </div>
      <button
        type="button"
        onClick={() => void load({ search: debouncedSearch, status, page })}
        className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-pill border border-border-interactive bg-surface-secondary px-4 py-2 text-dash-body-sm font-bold text-accent transition hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <Loader2 className="size-4 animate-spin" />
        {t(`${config.namespace}.retry`)}
      </button>
    </div>
  );
}
