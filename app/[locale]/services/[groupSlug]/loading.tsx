export default function GroupPageLoading() {
  return (
    <section className="min-h-screen bg-surface-primary">
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6">
        <div className="h-4 w-64 bg-surface-tertiary rounded-control animate-pulse" />
        <div className="mt-6 flex items-center gap-3">
          <div className="size-11 rounded-control bg-surface-tertiary animate-pulse" />
          <div className="h-5 w-56 bg-surface-tertiary rounded-control animate-pulse" />
        </div>
        <div className="mt-2 h-11 w-80 bg-surface-tertiary rounded-control animate-pulse" />
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-panel border border-border-primary bg-surface-secondary/90 p-5"
            >
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-control bg-surface-tertiary animate-pulse" />
                <div className="h-4 w-32 bg-surface-tertiary rounded-control animate-pulse" />
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-3 w-full bg-surface-tertiary rounded-control animate-pulse" />
                <div className="h-3 w-3/4 bg-surface-tertiary rounded-control animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}