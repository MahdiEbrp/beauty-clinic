export function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <span
      className={`block animate-pulse rounded-control bg-surface-tertiary/80 ${className}`}
      aria-hidden="true"
    />
  );
}

export function UserCardSkeleton() {
  return (
    <article
      className="rounded-card border border-border-primary bg-surface-secondary p-4"
      aria-label="Loading user"
    >
      <div className="flex items-center gap-3">
        <SkeletonBlock className="size-11 rounded-pill" />
        <div className="grid flex-1 gap-2">
          <SkeletonBlock className="h-4 w-2/3" />
          <SkeletonBlock className="h-3 w-5/6" />
        </div>
        <SkeletonBlock className="size-11 rounded-pill" />
      </div>
      <div className="mt-4 flex gap-2">
        <SkeletonBlock className="h-6 w-16" />
        <SkeletonBlock className="h-6 w-20" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border-primary pt-4">
        <SkeletonBlock className="h-3 w-20" />
        <SkeletonBlock className="h-3 w-24" />
      </div>
    </article>
  );
}

export function UserRowSkeleton() {
  return (
    <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4">
      <div className="flex items-center gap-3">
        <SkeletonBlock className="size-12 rounded-pill" />
        <div className="grid gap-2">
          <SkeletonBlock className="h-4 w-36" />
          <SkeletonBlock className="h-3 w-48" />
        </div>
      </div>
      <SkeletonBlock className="h-6 w-20" />
      <SkeletonBlock className="h-4 w-16" />
      <SkeletonBlock className="size-11 rounded-pill" />
    </div>
  );
}
