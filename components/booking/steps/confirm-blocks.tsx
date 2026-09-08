"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Section header with a small tonal icon box + underline rule. */
export function SectionTitle({ icon: Icon, title, className }: { icon: LucideIcon; title: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center justify-between gap-4 border-b border-border-primary pb-2", className)}>
      <div className="flex items-center gap-2">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-control bg-accent text-content-contrast">
          <Icon className="size-4 text-copper-light" aria-hidden="true" />
        </span>
        <h3 className="text-body font-black text-accent">{title}</h3>
      </div>
    </div>
  );
}

/** Label / value split row (value end-aligned, auto-bidi). */
export function Row({ label, children, className }: { label: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-border-primary/70 py-2.5 last:border-b-0", className)}>
      <span className="text-caption text-content-tertiary">{label}</span>
      <span className="ms-auto text-body-sm font-black text-content-primary" dir="auto">
        {children}
      </span>
    </div>
  );
}

/** Soft shielded hint strip. */
export function HintBlock({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-control border border-copper/25 bg-copper/5 px-3.5 py-2.5 text-caption font-medium leading-relaxed text-copper-strong">
      {children}
    </div>
  );
}