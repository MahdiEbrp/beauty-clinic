"use client";

import { SmsListSkeleton } from "./SmsListStates";

export function SmsListShell({
  total,
  resultsLabel,
  loading,
  loadingLabel,
  error,
  empty,
  desktop,
  mobile,
  pagination,
}: {
  total: number;
  resultsLabel: string;
  loading: boolean;
  loadingLabel: string;
  error?: React.ReactNode;
  empty?: React.ReactNode;
  desktop: React.ReactNode;
  mobile: React.ReactNode;
  pagination?: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-panel border border-border-primary bg-surface-secondary shadow-elevation-2">
      <div className="flex min-h-11 items-center justify-between gap-3 border-b border-border-primary bg-surface-secondary px-4 py-2.5 md:px-6">
        <p className="text-dash-caption text-content-tertiary">
          {total} {resultsLabel}
        </p>
        {loading && (
          <span className="sr-only" role="status">
            {loadingLabel}
          </span>
        )}
      </div>
      {loading ? (
        <SmsListSkeleton />
      ) : error ? (
        error
      ) : total === 0 ? (
        empty
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">{desktop}</div>
          <div className="md:hidden">{mobile}</div>
        </>
      )}
      {pagination}
    </section>
  );
}
