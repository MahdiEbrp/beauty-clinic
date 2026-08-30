export default function SmsLoading() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <div className="h-14 rounded-panel bg-surface-secondary animate-pulse" />
      <div className="h-48 rounded-panel bg-surface-secondary animate-pulse" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="h-32 rounded-card bg-surface-secondary animate-pulse" />
        ))}
      </div>
      <div className="h-72 rounded-panel bg-surface-secondary animate-pulse" />
    </div>
  );
}
