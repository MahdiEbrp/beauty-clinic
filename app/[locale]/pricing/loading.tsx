export default function PricingLoading() {
  return (
    <section className="py-24 bg-surface-primary">
      <div className="max-w-content mx-auto px-6">
        <div className="mb-16 max-w-prose">
          <div className="h-12 w-64 bg-surface-tertiary rounded-control animate-pulse mb-4" />
          <div className="h-6 w-96 bg-surface-tertiary rounded-control animate-pulse" />
        </div>
        <div className="flex gap-3 mb-8 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-11 w-24 bg-surface-tertiary rounded-md animate-pulse shrink-0"
            />
          ))}
        </div>
        <div className="bg-surface-secondary border border-border-primary rounded-panel p-8">
          <div className="h-8 w-48 bg-surface-tertiary rounded-control animate-pulse mb-4" />
          <div className="h-4 w-80 bg-surface-tertiary rounded-control animate-pulse mb-8" />
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex justify-between py-4 border-b border-border-primary"
            >
              <div className="h-5 w-40 bg-surface-tertiary rounded-control animate-pulse" />
              <div className="h-5 w-24 bg-surface-tertiary rounded-control animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
