"use client";

export function MessageBulkBar({
  busy,
  onDelete,
  onSelectAll,
  labels,
}: {
  busy: boolean;
  onDelete: () => void;
  onSelectAll: () => void;
  labels: {
    selected: string;
    delete: string;
    selectAll: string;
  };
}) {
  return (
    <div className="flex items-center gap-3 rounded-card border border-accent/30 bg-accent/5 px-4 py-3">
      <span className="text-sm text-content-secondary">
        {labels.selected}
      </span>
      <button
        type="button"
        onClick={onDelete}
        disabled={busy}
        className="rounded-pill border border-error/30 bg-error/10 px-3 py-1.5 text-sm font-medium text-error transition hover:bg-error/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-40"
      >
        {labels.delete}
      </button>
      <button
        type="button"
        onClick={onSelectAll}
        className="rounded-pill border border-border-interactive bg-surface-secondary px-3 py-1.5 text-sm font-medium text-content-secondary transition hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {labels.selectAll}
      </button>
    </div>
  );
}