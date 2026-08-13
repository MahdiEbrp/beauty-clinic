export function CategoryRowSkeleton() {
  return (
    <div className="flex items-center gap-3">
      <div className="size-12 shrink-0 animate-pulse rounded-pill bg-surface-tertiary" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-1/3 animate-pulse rounded-control bg-surface-tertiary" />
        <div className="h-2.5 w-1/4 animate-pulse rounded-control bg-surface-tertiary/70" />
      </div>
    </div>
  );
}

export function CategoryCardSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-card border border-border-primary bg-surface-secondary p-3">
      <div className="size-10 shrink-0 animate-pulse rounded-pill bg-surface-tertiary" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-1/2 animate-pulse rounded-control bg-surface-tertiary" />
        <div className="h-2.5 w-1/3 animate-pulse rounded-control bg-surface-tertiary/70" />
      </div>
    </div>
  );
}
