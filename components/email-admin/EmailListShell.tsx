"use client";

import { AdminListShell } from "@/components/admin-list/AdminListShell";
import { EmailListSkeleton } from "./EmailListStates";

export function EmailListShell({
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
    <AdminListShell
      total={total}
      resultsLabel={resultsLabel}
      loading={loading}
      loadingLabel={loadingLabel}
      loadingState={<EmailListSkeleton />}
      error={error}
      empty={empty}
      desktop={desktop}
      mobile={mobile}
      pagination={pagination}
    />
  );
}
