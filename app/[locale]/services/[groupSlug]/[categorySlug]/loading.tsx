export default function CategoryPageLoading() {
  return (
    <section className="min-h-screen bg-surface-primary">
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6">
        <div className="h-4 w-64 bg-surface-tertiary rounded-control animate-pulse" />
        <div className="mt-6 h-5 w-56 bg-surface-tertiary rounded-control animate-pulse" />
        <div className="mt-2 h-11 w-80 bg-surface-tertiary rounded-control animate-pulse" />
        <div className="mt-6 rounded-panel border border-border-primary bg-surface-secondary/90 p-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-4 border-b border-border-primary/50 py-4 last:border-b-0"
            >
              <div className="space-y-2">
                <div className="h-4 w-56 bg-surface-tertiary rounded-control animate-pulse" />
                <div className="h-3 w-72 bg-surface-tertiary rounded-control animate-pulse" />
              </div>
              <div className="h-6 w-28 bg-surface-tertiary rounded-control animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}