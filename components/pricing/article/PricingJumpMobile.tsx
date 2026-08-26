"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Bookmark, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

type PricingJumpMobileProps = {
  groups: { slug: string; title: string; count?: number }[];
  label: string;
  sectionsLabel: string;
  scrollTopLabel: string;
  dir: "ltr" | "rtl";
  active: string;
  activeIndex: number;
  onJump: (slug: string) => void;
  onScrollTop: () => void;
};

export default function PricingJumpMobile({
  groups,
  label,
  sectionsLabel,
  scrollTopLabel,
  dir,
  activeIndex,
  active,
  onJump,
  onScrollTop,
}: PricingJumpMobileProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const activeGroup = groups[activeIndex] || groups[0];
  const visibleIndex = Math.max(activeIndex, 0);

  useEffect(() => {
    if (!isDrawerOpen) return;
    function handler(event: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        setIsDrawerOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isDrawerOpen]);

  const jump = (slug: string) => {
    setIsDrawerOpen(false);
    onJump(slug);
  };

  return (
    <div dir={dir} className="lg:hidden fixed bottom-0 inset-x-0 z-50 p-3 pointer-events-none">
      <div className="mx-auto max-w-md pointer-events-auto" ref={drawerRef}>
        <div className="flex items-center justify-between gap-2 rounded-full border border-border-interactive bg-surface-secondary/95 p-1.5 px-3 shadow-elevation-4 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setIsDrawerOpen((open) => !open)}
            aria-expanded={isDrawerOpen}
            className="flex flex-1 items-center justify-between gap-2 min-w-0 text-start focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <div className="flex items-center gap-2 truncate">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent text-on-primary text-xs font-bold shadow-sm">
                {String(visibleIndex + 1).padStart(2, "0")}
              </span>
              <div className="truncate">
                <div className="text-[10px] uppercase tracking-wider font-bold text-copper leading-tight">
                  {label}
                </div>
                <div className="text-dash-body-sm font-bold text-accent truncate leading-tight">
                  {activeGroup?.title}
                </div>
              </div>
            </div>
            <ChevronUp
              className={cn(
                "size-4 shrink-0 transition-transform duration-200 text-content-tertiary",
                isDrawerOpen && "rotate-180"
              )}
              aria-hidden="true"
            />
          </button>

          <button
            type="button"
            onClick={onScrollTop}
            aria-label={scrollTopLabel}
            className="size-9 flex items-center justify-center rounded-full bg-surface-tertiary text-content-primary transition-colors hover:bg-copper hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <ArrowUp className="size-4" aria-hidden="true" />
          </button>
        </div>

        {isDrawerOpen && (
          <div className="mb-2 overflow-hidden rounded-card border border-border-primary bg-surface-secondary shadow-elevation-4">
            <div className="flex items-center justify-between p-3 border-b border-border-primary/60 bg-surface-tertiary/40">
              <div className="flex items-center gap-2">
                <Bookmark className="size-4 text-copper" aria-hidden="true" />
                <span className="text-xs font-bold uppercase tracking-wider text-accent">
                  {label}
                </span>
              </div>
              <span className="text-xs font-semibold text-copper">
                {sectionsLabel}
              </span>
            </div>

            <div className="max-h-[55vh] overflow-y-auto p-2 space-y-1">
              {groups.map((group, idx) => {
                const isCurrent = active === group.slug;
                return (
                  <button
                    key={group.slug}
                    type="button"
                    onClick={() => jump(group.slug)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-control px-3.5 py-2.5 text-start transition-all text-dash-body-sm font-semibold",
                      isCurrent
                        ? "bg-accent text-content-contrast shadow-sm font-bold"
                        : "text-content-primary hover:bg-surface-tertiary/70"
                    )}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span
                        className={cn(
                          "flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                          isCurrent
                            ? "bg-white/20 text-content-contrast"
                            : "bg-surface-tertiary text-copper"
                        )}
                      >
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <span className="truncate">{group.title}</span>
                    </div>
                    {group.count !== undefined ? (
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-medium",
                          isCurrent
                            ? "bg-white/20 text-white"
                            : "bg-surface-tertiary text-content-tertiary"
                        )}
                      >
                        {group.count}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export { PricingJumpMobile };