"use client";

import { useAdminListContext } from "./context";

export function AdminListSkeleton<T extends { id: string }>() {
  const ctx = useAdminListContext<T>();
  const { config } = ctx;
  const columns = config.columns.filter((c) => c.responsive !== "mobile").length;

  return (
    <div className="animate-pulse divide-y divide-border-primary">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-4 py-3 sm:px-6"
        >
          <div className="size-5 shrink-0 rounded bg-surface-tertiary" />
          {Array.from({ length: columns }).map((_, c) => (
            <div
              key={c}
              className="h-4 w-32 max-w-[140px] rounded bg-surface-tertiary"
            />
          ))}
          <div className="ml-auto size-4 shrink-0 rounded bg-surface-tertiary" />
        </div>
      ))}
    </div>
  );
}
