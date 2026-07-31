export default function RulesLoading() {
  return (
    <section className="py-24 bg-surface-primary">
      <div className="max-w-content mx-auto px-6">
        <div className="mb-16 max-w-prose">
          <div className="h-12 w-48 bg-surface-tertiary rounded-control animate-pulse mb-4" />
          <div className="h-6 w-72 bg-surface-tertiary rounded-control animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface-secondary border border-border-primary rounded-panel p-8"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-surface-tertiary rounded-control animate-pulse shrink-0" />
                <div className="h-6 w-40 bg-surface-tertiary rounded-control animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-surface-tertiary rounded-control animate-pulse" />
                <div className="h-4 w-2/3 bg-surface-tertiary rounded-control animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
