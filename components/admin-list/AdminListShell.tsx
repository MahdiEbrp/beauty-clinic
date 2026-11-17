"use client";

import type { ReactNode } from "react";

interface AdminListShellProps {
  total: number;
  resultsLabel: string;
  loading: boolean;
  loadingLabel: string;
  loadingState: ReactNode;
  error?: ReactNode;
  empty?: ReactNode;
  desktop: ReactNode;
  mobile: ReactNode;
  pagination?: ReactNode;
}

/** Shared responsive shell for admin lists with identical loading/error/empty states. */
export function AdminListShell({
  total,
  resultsLabel,
  loading,
  loadingLabel,
  loadingState,
  error,
  empty,
  desktop,
  mobile,
  pagination,
}: AdminListShellProps) {
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
        loadingState
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
