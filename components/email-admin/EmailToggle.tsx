"use client";

import { cn } from "@/lib/utils";

export function EmailToggle({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 items-center rounded-pill transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-50",
        checked ? "bg-accent" : "bg-surface-tertiary",
      )}
    >
      <span
        className={cn(
          "absolute top-1 size-5 rounded-pill bg-on-primary shadow-elevation-1 transition-[inset] duration-200",
          checked ? "inset-e-1" : "inset-s-1",
        )}
      />
    </button>
  );
}