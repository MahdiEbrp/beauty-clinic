"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";

import { SMS_UI } from "@/lib/sms/constants";

export type SmsSelectOption = { value: string; label: string };

export function SmsSelect({
  value,
  onValueChange,
  options,
  placeholder,
  ariaLabel,
  disabled,
}: {
  value?: string;
  onValueChange: (value: string) => void;
  options: SmsSelectOption[];
  placeholder: string;
  ariaLabel: string;
  disabled?: boolean;
}) {
  return (
    <SelectPrimitive.Root
      value={value || undefined}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectPrimitive.Trigger
        aria-label={ariaLabel}
        className="relative flex min-h-11 w-full items-center justify-between gap-2 rounded-control border border-form-input-border bg-form-input-bg px-4 text-start text-dash-body text-accent outline-none transition-colors hover:border-copper focus-visible:border-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent data-[state=open]:border-copper data-[state=open]:ring-1 data-[state=open]:ring-copper disabled:pointer-events-none disabled:opacity-60"
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon asChild>
          <ChevronDown className="size-4 shrink-0 text-content-tertiary" aria-hidden="true" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={SMS_UI.selectSideOffset}
          className="z-50 max-h-64 min-w-(--radix-select-trigger-width) overflow-hidden rounded-control border border-border-primary bg-surface-secondary text-accent shadow-elevation-3 animate-fade-in"
        >
          <SelectPrimitive.Viewport className="p-1">
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                className="relative flex min-h-10 cursor-pointer select-none items-center rounded-control px-3 pe-9 text-dash-body-sm outline-none transition-colors focus:bg-surface-tertiary data-highlighted:bg-surface-tertiary data-[state=checked]:bg-accent-subtle data-[state=checked]:font-bold data-disabled:pointer-events-none data-disabled:opacity-40"
              >
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="absolute inset-e-2.5 inline-flex items-center">
                  <Check className="size-4 text-copper-strong" aria-hidden="true" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
