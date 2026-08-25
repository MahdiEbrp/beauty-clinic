"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Clock, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

export interface TimePickerFieldProps {
  /** "HH:mm" or empty string */
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
  hourLabel?: string;
  minuteLabel?: string;
  id?: string;
}

/**
 * Clean, accessible localized HH:mm time picker built with design system tokens.
 * Solves the nested border container collision and removes OS-native select
 * clunkiness. Hours and minutes use Radix SelectPrimitive so the OPEN option
 * list is real themed DOM (not an OS popup), matching the calendar dropdown.
 */
function Segment({
  value,
  options,
  label,
  disabled,
  onChange,
}: {
  value: string;
  options: readonly string[];
  label: string;
  disabled: boolean;
  onChange: (next: string) => void;
}) {
  return (
    <SelectPrimitive.Root
      value={value || undefined}
      onValueChange={(next) => {
        if (next) onChange(next);
      }}
      disabled={disabled}
    >
      <SelectPrimitive.Trigger
        aria-label={label}
        className="relative flex h-full min-w-0 flex-1 items-center justify-between rounded-md px-1.5 outline-none transition-colors hover:bg-surface-tertiary/40 data-[state=open]:bg-surface-tertiary/40 focus-visible:ring-2 focus-visible:ring-copper/40"
      >
        <SelectPrimitive.Value
          placeholder={label}
          className="pointer-events-none truncate text-dash-body-sm font-semibold tracking-tight data-placeholder:font-normal data-placeholder:text-content-tertiary"
        />
        <SelectPrimitive.Icon className="shrink-0">
          <ChevronDown
            className="size-3 text-content-tertiary"
            aria-hidden="true"
          />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={4}
          className="z-50 max-h-64 overflow-y-auto rounded-control border border-border-primary bg-surface-secondary text-accent shadow-elevation-3 animate-fade-in"
        >
          <SelectPrimitive.Viewport className="p-1">
            {options.map((opt) => (
              <SelectPrimitive.Item
                key={opt}
                value={opt}
                className={cn(
                  "relative flex h-9 cursor-pointer select-none items-center rounded-control px-3 pe-8 text-dash-body-sm text-accent outline-none transition-colors",
                  "focus:bg-surface-tertiary data-highlighted:bg-surface-tertiary",
                  "data-[state=checked]:bg-accent-subtle data-[state=checked]:font-bold",
                )}
              >
                <SelectPrimitive.ItemText>{opt}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="absolute inset-e-2.5 inline-flex items-center">
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

export function TimePickerField({
  value = "",
  onChange,
  disabled = false,
  invalid = false,
  className,
  hourLabel = "Hour",
  minuteLabel = "Minute",
  id,
}: TimePickerFieldProps) {
  const [hour = "", minute = ""] = (value || "").split(":");

  const handleHourChange = (newHour: string) => {
    const currentMin = minute || "00";
    onChange(`${newHour}:${currentMin}`);
  };

  const handleMinuteChange = (newMin: string) => {
    const currentHour = hour || "00";
    onChange(`${currentHour}:${newMin}`);
  };

  return (
    <div
      id={id}
      className={cn(
        // Outer unified container
        "relative flex h-11 w-full items-center gap-1.5 rounded-control border bg-form-input-bg px-3 text-dash-body-sm transition-all duration-150 select-none",
        // Interactive border & focus ring
        invalid
          ? "border-error focus-within:border-error focus-within:ring-2 focus-within:ring-error/20"
          : "border-form-input-border hover:border-border-interactive focus-within:border-copper focus-within:ring-2 focus-within:ring-copper/20",
        disabled && "pointer-events-none opacity-50 bg-surface-tertiary/30 border-border-primary/50",
        className,
      )}
    >
      {/* Leading Clock Icon */}
      <Clock
        className={cn(
          "size-4 shrink-0 transition-colors",
          invalid
            ? "text-error"
            : "text-content-tertiary group-focus-within:text-copper",
        )}
        aria-hidden="true"
      />

      {/* Hour Segment */}
      <Segment
        value={hour}
        options={HOURS}
        label={hourLabel}
        disabled={disabled}
        onChange={handleHourChange}
      />

      {/* Colon Separator */}
      <span
        className="shrink-0 select-none px-0.5 text-dash-body-sm font-bold text-content-tertiary"
        aria-hidden="true"
      >
        :
      </span>

      {/* Minute Segment */}
      <Segment
        value={minute}
        options={MINUTES}
        label={minuteLabel}
        disabled={disabled}
        onChange={handleMinuteChange}
      />
    </div>
  );
}

export default TimePickerField;