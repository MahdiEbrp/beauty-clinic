export default function BookingLoading() {
  return (
    <section className="bg-surface-primary py-14 md:py-20">
      <div className="mx-auto max-w-content px-4 md:px-6">
        <div className="mb-12 max-w-prose">
          <div className="mb-3 h-12 w-72 bg-surface-tertiary animate-pulse rounded-control" />
          <div className="h-6 w-96 bg-surface-tertiary animate-pulse rounded-control" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8">
          <div className="rounded-panel border border-border-primary bg-surface-secondary p-6 md:p-8">
            <div className="flex gap-4">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-11 w-full bg-surface-tertiary animate-pulse rounded-full"
                />
              ))}
            </div>
            <div className="mt-10 space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-14 w-full bg-surface-tertiary animate-pulse rounded-card"
                />
              ))}
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="sticky top-24 rounded-feature bg-primary-deep p-6 shadow-elevation-3">
              <div className="mb-4 h-5 w-28 bg-white/15 animate-pulse rounded-full" />
              <div className="mb-6 h-8 w-44 bg-white/15 animate-pulse rounded-control" />
              <div className="mb-3 h-4 w-full bg-white/10 animate-pulse rounded-control" />
              <div className="mb-3 h-4 w-3/4 bg-white/10 animate-pulse rounded-control" />
              <div className="mt-8 h-12 w-full bg-white/15 animate-pulse rounded-pill" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
