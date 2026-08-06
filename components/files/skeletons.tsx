export function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <span
      className={`block animate-pulse rounded-control bg-surface-tertiary/80 ${className}`}
      aria-hidden="true"
    />
  );
}

export function EntryCardSkeleton() {
  return (
    <article
      className="rounded-card border border-border-primary bg-surface-secondary p-3"
      aria-hidden="true"
    >
      <div className="flex items-center gap-3">
        <SkeletonBlock className="size-8 rounded-control" />
        <div className="grid flex-1 gap-2">
          <SkeletonBlock className="h-4 w-2/3" />
          <SkeletonBlock className="h-3 w-5/6" />
        </div>
        <SkeletonBlock className="size-11 rounded-pill" />
      </div>
    </article>
  );
}

export function EntryRowSkeleton() {
  return (
    <div className="flex items-center gap-3">
      <SkeletonBlock className="size-6 rounded-control" />
      <SkeletonBlock className="h-4 w-40" />
      <SkeletonBlock className="h-4 w-16" />
      <SkeletonBlock className="h-4 w-20" />
      <SkeletonBlock className="size-11 rounded-pill" />
    </div>
  );
}

export function TrashRowSkeleton() {
  return (
    <article
      className="rounded-card border border-border-primary bg-surface-secondary p-3"
      aria-hidden="true"
    >
      <div className="flex items-center gap-3">
        <SkeletonBlock className="size-8 rounded-control" />
        <div className="grid flex-1 gap-2">
          <SkeletonBlock className="h-4 w-1/2" />
          <SkeletonBlock className="h-3 w-2/3" />
        </div>
        <SkeletonBlock className="size-11 rounded-pill" />
        <SkeletonBlock className="size-11 rounded-pill" />
      </div>
    </article>
  );
}
