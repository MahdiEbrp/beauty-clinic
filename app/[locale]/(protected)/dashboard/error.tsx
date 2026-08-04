"use client";

import ErrorState from "@/components/ErrorState";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="bg-surface-secondary border border-border-primary rounded-panel">
      <ErrorState onRetry={reset} />
    </div>
  );
}
