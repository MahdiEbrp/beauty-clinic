"use client";

import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

type PricingJumpSidebarProps = {
  groups: { slug: string; title: string; count?: number }[];
  label: string;
  sectionsLabel: string;
  scrollTopLabel: string;
  itemLabel: string;
  dir: "ltr" | "rtl";
  active: string;
  onJump: (slug: string) => void;
  onScrollTop: () => void;
  className?: string;
};

/** Large-screen sticky sidebar table of contents for the pricing article. */
export default function PricingJumpSidebar({
  groups,
  label,
  sectionsLabel,
  scrollTopLabel,
  itemLabel,
  dir,
  active,
  onJump,
  onScrollTop,
  className,
}: PricingJumpSidebarProps) {
  return (
    <aside
      aria-label={label}
      dir={dir}
      className={cn(
        "hidden lg:block w-72 shrink-0 self-start sticky top-24 z-30 transition-all",
        className
      )}
    >
      <div className="rounded-card border border-border-primary bg-surface-secondary/95 p-4 shadow-elevation-1 backdrop-blur-md">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-border-primary/60">
          <div className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-md bg-accent text-on-primary font-bold text-xs">
              {"\u00a7"}
            </span>
            <div>
              <h3 className="text-dash-heading font-bold text-accent tracking-tight">
                {label}
              </h3>
              <p className="text-[11px] text-content-tertiary">
                {sectionsLabel}
              </p>
            </div>
          </div>
        </div>

        <nav className="space-y-1">
          {groups.map((group, idx) => {
            const isCurrent = active === group.slug;
            return (
              <a
                key={group.slug}
                href={`#pricing-${group.slug}`}
                onClick={() => onJump(group.slug)}
                className={cn(
                  "group relative flex items-center justify-between rounded-control px-3 py-2.5 text-dash-body-sm font-semibold transition-all duration-150 border",
                  isCurrent
                    ? "border-accent bg-accent text-content-contrast shadow-sm font-bold translate-x-1 rtl:-translate-x-1"
                    : "border-transparent text-content-primary hover:border-border-primary hover:bg-surface-tertiary/70"
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={cn(
                      "inline-flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-colors",
                      isCurrent
                        ? "bg-white/20 text-content-contrast"
                        : "bg-surface-tertiary text-copper font-medium group-hover:text-accent"
                    )}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="truncate">{group.title}</span>
                </div>
                {group.count !== undefined ? (
                  <span
                    className={cn(
                      "text-[11px] px-1.5 py-0.5 rounded font-normal transition-colors",
                      isCurrent
                        ? "bg-white/20 text-white"
                        : "bg-surface-tertiary text-content-tertiary"
                    )}
                  >
                    {group.count}
                  </span>
                ) : null}
              </a>
            );
          })}
        </nav>

        <div className="pt-3 mt-3 border-t border-border-primary/50 flex items-center justify-between text-xs text-content-tertiary">
          <span className="text-[11px]">{itemLabel}</span>
          <button
            type="button"
            onClick={onScrollTop}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-content-primary hover:text-copper transition-colors focus-visible:outline-2 focus-visible:outline-accent"
          >
            <ArrowUp className="size-3" aria-hidden="true" /> {scrollTopLabel}
          </button>
        </div>
      </div>
    </aside>
  );
}
