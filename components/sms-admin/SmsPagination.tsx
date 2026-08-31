"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { SMS_LIMITS } from "@/lib/sms/constants";

export function SmsPagination({
  page,
  totalPages,
  total,
  labels,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  labels: {
    showing: string;
    previous: string;
    next: string;
    page: string;
  };
  onPageChange: (page: number) => void;
}) {
  if (total === SMS_LIMITS.emptyLength || totalPages <= 1) return null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-primary px-6 py-4">
      <span className="text-dash-body-sm text-content-tertiary">{labels.showing}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= SMS_LIMITS.pageMin}
          onClick={() => onPageChange(page - SMS_LIMITS.pageMin)}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-pill border border-border-interactive bg-transparent px-4 text-dash-body-sm font-semibold text-accent transition-colors hover:bg-surface-tertiary disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <ChevronLeft className="size-4 rtl-mirror" aria-hidden="true" />
          <span>{labels.previous}</span>
        </button>
        <span className="px-2 text-dash-body-sm whitespace-nowrap text-content-secondary">{labels.page}</span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + SMS_LIMITS.pageMin)}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-pill border border-border-interactive bg-transparent px-4 text-dash-body-sm font-semibold text-accent transition-colors hover:bg-surface-tertiary disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <span>{labels.next}</span>
          <ChevronRight className="size-4 rtl-mirror" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
