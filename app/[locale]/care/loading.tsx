export default function CareLoading() {
  return (
    <section className="py-24 bg-surface-primary">
      <div className="max-w-content mx-auto px-6">
        <div className="mb-16 max-w-prose">
          <div className="h-12 w-56 bg-surface-tertiary rounded-control animate-pulse mb-4" />
          <div className="h-6 w-80 bg-surface-tertiary rounded-control animate-pulse" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface-secondary border border-border-primary rounded-panel p-6"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-surface-tertiary rounded-control animate-pulse shrink-0" />
                <div className="h-5 w-48 bg-surface-tertiary rounded-control animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
