export default function RegisterLoading() {
  return (
    <section className="py-24 bg-surface-primary">
      <div className="max-w-content mx-auto px-6">
        <div className="bg-surface-secondary border border-border-primary rounded-panel p-8 sm:p-12 max-w-prose mx-auto">
          <div className="w-14 h-14 bg-surface-tertiary rounded-control animate-pulse mb-6" />
          <div className="h-12 w-48 bg-surface-tertiary rounded-control animate-pulse mb-4" />
          <div className="h-6 w-72 bg-surface-tertiary rounded-control animate-pulse mb-10" />
          <div className="space-y-6">
            <div className="h-20 bg-surface-tertiary rounded-control animate-pulse" />
            <div className="h-20 bg-surface-tertiary rounded-control animate-pulse" />
            <div className="h-20 bg-surface-tertiary rounded-control animate-pulse" />
            <div className="h-20 bg-surface-tertiary rounded-control animate-pulse" />
            <div className="h-13 w-full bg-surface-tertiary rounded-pill animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
}
