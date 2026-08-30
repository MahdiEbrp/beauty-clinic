import { RefreshCw } from "lucide-react";

import { SMS_LIMITS, SMS_UI } from "@/lib/sms/constants";

export function SmsListSkeleton() {
  return (
    <div className="divide-y divide-border-primary" aria-hidden="true">
      {Array.from({ length: SMS_UI.skeletonRows }, (_, index) => (
        <div key={index} className="grid gap-3 p-5 sm:grid-cols-4 sm:p-6">
          <div className="h-5 animate-pulse rounded-control bg-surface-tertiary" />
          <div className="h-5 animate-pulse rounded-control bg-surface-tertiary" />
          <div className="h-5 animate-pulse rounded-control bg-surface-tertiary" />
          <div className="h-5 animate-pulse rounded-control bg-surface-tertiary" />
        </div>
      ))}
    </div>
  );
}

export function SmsListError({
  message,
  retryLabel,
  onRetry,
}: {
  message: string;
  retryLabel: string;
  onRetry: () => void;
}) {
  return (
    <div className="grid place-items-center gap-3 p-8 text-center">
      <p role="alert" className="text-dash-body-sm text-error">
        {message}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex min-h-11 items-center gap-2 rounded-pill border border-border-interactive px-4 text-dash-body-sm font-bold text-accent transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <RefreshCw className="size-4" aria-hidden="true" />
        {retryLabel}
      </button>
    </div>
  );
}

export function SmsListEmpty({ message }: { message: string }) {
  return (
    <p className="p-8 text-center text-dash-body-sm text-content-secondary">
      {message}
    </p>
  );
}

export function listRange(page: number, perPage: number, total: number) {
  const from = total === SMS_LIMITS.emptyLength
    ? SMS_LIMITS.emptyLength
    : (page - SMS_LIMITS.pageMin) * perPage + SMS_LIMITS.pageMin;
  const to = Math.min(page * perPage, total);
  return { from, to };
}
