export default function DashboardLoading() {
  return (
    <div className="grid gap-8">
      <div className="bg-surface-secondary border border-border-primary rounded-panel p-8 sm:p-10">
        <div className="h-14 w-14 bg-surface-tertiary rounded-control animate-pulse mb-6" />
        <div className="h-6 w-24 bg-surface-tertiary rounded-control animate-pulse mb-2" />
        <div className="h-12 w-64 bg-surface-tertiary rounded-control animate-pulse mb-2" />
        <div className="h-5 w-48 bg-surface-tertiary rounded-control animate-pulse" />
      </div>
      <div className="bg-surface-secondary border border-border-primary rounded-panel p-8 sm:p-10">
        <div className="h-8 w-48 bg-surface-tertiary rounded-control animate-pulse mb-8" />
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-11 w-11 shrink-0 bg-surface-tertiary rounded-control animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-56 bg-surface-tertiary rounded-control animate-pulse" />
                <div className="h-4 w-72 bg-surface-tertiary rounded-control animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
