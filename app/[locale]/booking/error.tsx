"use client";

import ErrorState from "@/components/ErrorState";

export default function BookingError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="bg-surface-primary py-24">
      <div className="mx-auto max-w-content px-6">
        <ErrorState onRetry={reset} />
      </div>
    </section>
  );
}
