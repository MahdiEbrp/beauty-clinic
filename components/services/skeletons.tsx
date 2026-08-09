export function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <span
      className={`block animate-pulse rounded-control bg-surface-tertiary/80 ${className}`}
      aria-hidden="true"
    />
  );
}

export function ServiceRowSkeleton() {
  return (
    <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4">
      <div className="flex items-center gap-3">
        <SkeletonBlock className="size-12 rounded-control" />
        <div className="grid gap-2">
          <SkeletonBlock className="h-4 w-36" />
          <SkeletonBlock className="h-3 w-24" />
        </div>
      </div>
      <SkeletonBlock className="h-6 w-24 rounded-pill" />
      <SkeletonBlock className="size-11 rounded-pill" />
    </div>
  );
}

export function ServiceCardSkeleton() {
  return (
    <article
      className="rounded-card border border-border-primary bg-surface-secondary p-3"
      aria-label="Loading service"
    >
      <div className="flex items-center gap-3">
        <SkeletonBlock className="size-10 rounded-control" />
        <div className="grid flex-1 gap-2">
          <SkeletonBlock className="h-4 w-2/3" />
          <SkeletonBlock className="h-3 w-5/6" />
          <div className="mt-0.5 flex gap-1.5">
            <SkeletonBlock className="h-4 w-20 rounded-pill" />
            <SkeletonBlock className="h-4 w-16 rounded-pill" />
          </div>
        </div>
        <SkeletonBlock className="size-11 rounded-pill" />
      </div>
    </article>
  );
}

export function GroupRowSkeleton() {
  return (
    <div className="flex items-center justify-between gap-3 py-4">
      <div className="flex items-center gap-3">
        <SkeletonBlock className="size-10 rounded-pill" />
        <div className="grid gap-2">
          <SkeletonBlock className="h-4 w-32" />
          <SkeletonBlock className="h-3 w-20" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <SkeletonBlock className="h-4 w-24" />
        <SkeletonBlock className="size-11 rounded-pill" />
      </div>
    </div>
  );
}
