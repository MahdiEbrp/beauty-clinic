export function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <span
      className={`block animate-pulse rounded-control bg-surface-tertiary/80 ${className}`}
      aria-hidden="true"
    />
  );
}

export function GroupCardSkeleton() {
  return (
    <article
      className="rounded-card border border-border-primary bg-surface-secondary p-3"
      aria-label="Loading group"
    >
      <div className="flex items-center gap-3">
        <SkeletonBlock className="size-10 rounded-pill" />
        <div className="grid flex-1 gap-2">
          <SkeletonBlock className="h-4 w-2/3" />
          <SkeletonBlock className="h-3 w-5/6" />
          <div className="mt-0.5 flex gap-1.5">
            <SkeletonBlock className="h-4 w-16" />
            <SkeletonBlock className="h-4 w-20" />
          </div>
        </div>
        <SkeletonBlock className="size-11 rounded-pill" />
      </div>
    </article>
  );
}

export function GroupRowSkeleton() {
  return (
    <div className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4">
      <div className="flex items-center gap-3">
        <SkeletonBlock className="size-12 rounded-pill" />
        <div className="grid gap-2">
          <SkeletonBlock className="h-4 w-36" />
          <SkeletonBlock className="h-3 w-48" />
        </div>
      </div>
      <SkeletonBlock className="h-4 w-24" />
      <SkeletonBlock className="h-4 w-16" />
      <SkeletonBlock className="h-6 w-20" />
      <SkeletonBlock className="size-11 rounded-pill" />
    </div>
  );
}
