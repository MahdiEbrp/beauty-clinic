import { AlertTriangle, Layers, RefreshCw, SearchX } from "lucide-react";

import { EMAIL_LIMITS, EMAIL_UI } from "@/lib/email/constants";

export function EmailListSkeleton() {
  return (
    <div className="divide-y divide-border-primary" aria-hidden="true">
      {Array.from({ length: EMAIL_UI.skeletonRows }, (_, index) => (
        <div
          key={index}
          className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 px-4 py-5 md:px-6"
        >
          <div className="size-12 animate-pulse rounded-pill bg-surface-tertiary" />
          <div className="grid gap-2">
            <div className="h-4 w-40 animate-pulse rounded-control bg-surface-tertiary" />
            <div className="h-3 w-56 animate-pulse rounded-control bg-surface-tertiary/70" />
          </div>
          <div className="h-6 w-20 animate-pulse rounded-pill bg-surface-tertiary" />
          <div className="size-11 animate-pulse rounded-pill bg-surface-tertiary" />
        </div>
      ))}
    </div>
  );
}

export function EmailListError({
  message,
  retryLabel,
  onRetry,
  description,
}: {
  message: string;
  retryLabel: string;
  onRetry: () => void;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <AlertTriangle className="size-8 text-error" strokeWidth={1.75} aria-hidden="true" />
      <div>
        <p role="alert" className="text-dash-body-sm font-semibold text-content-primary">
          {message}
        </p>
        {description && (
          <p className="mt-1 text-dash-caption text-content-secondary">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex min-h-10 items-center gap-2 rounded-pill border border-border-interactive bg-surface-secondary px-4 text-dash-body-sm font-bold text-accent transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <RefreshCw className="size-4" aria-hidden="true" />
        {retryLabel}
      </button>
    </div>
  );
}

export function EmailListEmpty({
  message,
  filtering = false,
}: {
  message: string;
  filtering?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-6 flex size-16 items-center justify-center rounded-control bg-surface-tertiary">
        {filtering ? (
          <SearchX className="size-8 text-content-tertiary" strokeWidth={1.5} aria-hidden="true" />
        ) : (
          <Layers className="size-8 text-content-tertiary" strokeWidth={1.5} aria-hidden="true" />
        )}
      </div>
      <p className="text-dash-body text-content-secondary">{message}</p>
    </div>
  );
}

export function listRange(page: number, perPage: number, total: number) {
  const from = total === EMAIL_LIMITS.emptyLength
    ? EMAIL_LIMITS.emptyLength
    : (page - EMAIL_LIMITS.pageMin) * perPage + EMAIL_LIMITS.pageMin;
  const to = Math.min(page * perPage, total);
  return { from, to };
}