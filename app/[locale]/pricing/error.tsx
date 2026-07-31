"use client";

import ErrorState from "@/components/ErrorState";

export default function PricingError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="py-24 bg-surface-primary">
      <div className="max-w-content mx-auto px-6">
        <ErrorState onRetry={reset} />
      </div>
    </section>
  );
}
