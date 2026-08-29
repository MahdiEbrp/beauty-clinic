"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type SwitchProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  size?: "sm" | "md";
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
};

const SIZES = {
  sm: { track: "h-[18px] w-8 p-0.5", thumb: "size-3.5", distance: 14 },
  md: { track: "h-6 w-11 p-0.5", thumb: "size-5", distance: 20 },
} as const;

/** Themed switch toggle (Template parity), tokenized. Reacts to RTL. */
export function Switch({
  checked,
  onCheckedChange,
  size = "md",
  disabled,
  className,
  "aria-label": ariaLabel,
}: SwitchProps) {
  const [rtl, setRtl] = useState(false);

  useEffect(() => {
    const update = () => setRtl(document.documentElement.dir === "rtl");
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["dir"] });
    return () => observer.disconnect();
  }, []);

  const cfg = SIZES[size];
  const transform = checked ? `translateX(${rtl ? -cfg.distance : cfg.distance}px)` : "translateX(0px)";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      aria-label={ariaLabel}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onCheckedChange(!checked);
      }}
      className={cn(
        "relative inline-flex shrink-0 cursor-pointer select-none items-center rounded-full transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper focus-visible:ring-offset-2 focus-visible:ring-offset-surface-primary disabled:cursor-not-allowed disabled:opacity-50",
        checked
          ? "border-2 border-copper-deep bg-copper shadow-inner ring-1 ring-copper/40"
          : "border-2 border-border-interactive bg-surface-tertiary hover:border-copper",
        cfg.track,
        className,
      )}
    >
      <span
        style={{ transform }}
        className={cn(
          "pointer-events-none flex shrink-0 items-center justify-center rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out",
          cfg.thumb,
          checked ? "text-copper-deep" : "text-transparent",
        )}
      >
        {checked && size === "md" ? <Check className="size-3" strokeWidth={3} /> : null}
      </span>
    </button>
  );
}
