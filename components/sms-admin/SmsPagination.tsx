"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";

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
  if (total === SMS_LIMITS.emptyLength) return null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-primary px-5 py-4 text-dash-caption text-content-secondary sm:px-6">
      <span>{labels.showing}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= SMS_LIMITS.pageMin}
          onClick={() => onPageChange(page - SMS_LIMITS.pageMin)}
          className="inline-flex min-h-11 items-center gap-2 rounded-pill border border-border-interactive px-3 font-bold text-accent transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-40"
        >
          <ArrowRight className="size-4 rtl-mirror" aria-hidden="true" />
          <span>{labels.previous}</span>
        </button>
        <span className="min-w-24 text-center font-bold text-accent">{labels.page}</span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + SMS_LIMITS.pageMin)}
          className="inline-flex min-h-11 items-center gap-2 rounded-pill border border-border-interactive px-3 font-bold text-accent transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-40"
        >
          <span>{labels.next}</span>
          <ArrowLeft className="size-4 rtl-mirror" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
