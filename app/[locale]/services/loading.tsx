export default function ServicesLoading() {
  return (
    <section className="min-h-screen bg-surface-primary">
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6">
        <div className="mb-6">
          <div className="h-5 w-48 bg-surface-tertiary rounded-control animate-pulse" />
          <div className="mt-6 space-y-3">
            <div className="h-9 w-72 bg-surface-tertiary rounded-control animate-pulse" />
            <div className="h-5 w-full max-w-xl bg-surface-tertiary rounded-control animate-pulse" />
          </div>
        </div>
        {Array.from({ length: 3 }).map((_, groupIndex) => (
          <div key={groupIndex} className="mt-10 border-t border-border-primary/60 pt-10">
            <div className="flex items-center gap-4">
              <div className="size-11 bg-surface-tertiary rounded-control animate-pulse" />
              <div className="space-y-2">
                <div className="h-6 w-44 bg-surface-tertiary rounded-control animate-pulse" />
                <div className="h-4 w-72 bg-surface-tertiary rounded-control animate-pulse" />
              </div>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, cardIndex) => (
                <div
                  key={cardIndex}
                  className="min-h-44 rounded-panel border border-border-primary bg-surface-secondary/90 p-5"
                >
                  <div className="size-9 bg-surface-tertiary rounded-control animate-pulse" />
                  <div className="mt-3 h-5 w-32 bg-surface-tertiary rounded-control animate-pulse" />
                  <div className="mt-2 h-4 w-full bg-surface-tertiary rounded-control animate-pulse" />
                  <div className="mt-1 h-4 w-2/3 bg-surface-tertiary rounded-control animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
