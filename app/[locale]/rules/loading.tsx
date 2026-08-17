export default function RulesLoading() {
  return (
    <section className="py-24 bg-surface-primary">
      <div className="max-w-content mx-auto px-6">
        <div className="mb-16 max-w-prose">
          <div className="h-12 w-48 bg-surface-tertiary rounded-control animate-pulse mb-4" />
          <div className="h-6 w-72 bg-surface-tertiary rounded-control animate-pulse" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:gap-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col overflow-hidden rounded-card border border-border-primary bg-primary-deep shadow-elevation-2 lg:flex-row"
            >
              <div className="h-44 shrink-0 bg-white/10 animate-pulse lg:h-auto lg:w-2/5 xl:w-1/3" />
              <div className="flex flex-1 flex-col gap-3 px-6 pb-6 pt-5 lg:p-8">
                <div className="h-7 w-2/5 bg-white/10 animate-pulse rounded-control" />
                <div className="h-4 w-full bg-white/10 animate-pulse rounded-control" />
                <div className="h-4 w-3/4 bg-white/10 animate-pulse rounded-control" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
