export default function DashboardLoading() {
  return (
    <section className="py-24 bg-surface-primary">
      <div className="max-w-content mx-auto px-6">
        <div className="bg-surface-secondary border border-border-primary rounded-panel p-8 max-w-prose mx-auto">
          <div className="h-6 w-24 bg-surface-tertiary rounded-control animate-pulse mb-6" />
          <div className="h-12 w-64 bg-surface-tertiary rounded-control animate-pulse mb-10" />
          <div className="h-12 w-full bg-surface-tertiary rounded-pill animate-pulse" />
        </div>
      </div>
    </section>
  );
}
