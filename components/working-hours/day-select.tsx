"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export type DayOption = { value: string; label: string };

/**
 * Themed weekday picker built on Radix Select — never a native <select>,
 * so the open option list is real styled DOM, themed exactly like the
 * CalendarDropdown in components/ui/calendar.tsx (copper hover/open border
 * + ring, bg-surface-secondary content, shadow-elevation-3, RTL-safe).
 */
export function DaySelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (next: string) => void;
  options: DayOption[];
  placeholder: string;
}) {
  const selectedLabel =
    options.find((o) => o.value === value)?.label ?? "";

  return (
    <SelectPrimitive.Root value={value} onValueChange={onChange}>
      <SelectPrimitive.Trigger
        className={cn(
          "relative flex h-11 w-full items-center justify-between gap-1.5 overflow-hidden rounded-control border border-form-input-border bg-form-input-bg px-3 text-dash-body-sm text-accent outline-none transition-colors",
          "hover:border-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
          "data-[state=open]:border-copper data-[state=open]:ring-1 data-[state=open]:ring-copper",
        )}
      >
        <span className={cn("truncate", !selectedLabel && "text-content-tertiary")}>
          {selectedLabel || placeholder}
        </span>
        <SelectPrimitive.Icon asChild>
          <ChevronDown className="size-4 shrink-0 text-content-tertiary" aria-hidden="true" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={4}
          className="z-50 max-h-64 overflow-hidden rounded-control border border-border-primary bg-surface-secondary text-accent shadow-elevation-3 animate-fade-in"
        >
          <SelectPrimitive.Viewport className="p-1">
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                className={cn(
                  "relative flex h-9 cursor-pointer select-none items-center rounded-control ps-3 pe-8 text-dash-body-sm text-accent outline-none transition-colors",
                  "focus:bg-surface-tertiary data-highlighted:bg-surface-tertiary",
                  "data-[state=checked]:bg-accent-subtle data-[state=checked]:font-bold",
                )}
              >
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="absolute end-2.5 inline-flex items-center">
                  <Check className="size-3.5 text-copper-strong" aria-hidden="true" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}