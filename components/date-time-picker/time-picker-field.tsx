"use client";

import { Clock, ChevronDown } from "lucide-react";
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
 * Solves the nested border container collision, removes OS-native select clunkiness,
 * and provides responsive touch targets with unified focus rings.
 */
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
    if (newHour) {
      onChange(`${newHour}:${currentMin}`);
    }
  };

  const handleMinuteChange = (newMin: string) => {
    const currentHour = hour || "00";
    if (newMin) {
      onChange(`${currentHour}:${newMin}`);
    }
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
      <div className="relative flex flex-1 items-center justify-between min-w-0 h-full rounded-md px-1.5 hover:bg-surface-tertiary/40 transition-colors">
        <span
          className={cn(
            "truncate text-dash-body-sm font-semibold tracking-tight pointer-events-none",
            hour ? "text-content-primary" : "text-content-tertiary font-normal",
          )}
        >
          {hour || hourLabel}
        </span>
        <ChevronDown
          className="size-3 shrink-0 text-content-tertiary pointer-events-none ml-1 rtl:mr-1 rtl:ml-0"
          aria-hidden="true"
        />
        <select
          aria-label={hourLabel}
          disabled={disabled}
          value={hour}
          onChange={(e) => handleHourChange(e.target.value)}
          className="absolute inset-0 size-full cursor-pointer appearance-none bg-transparent opacity-0 scheme-light focus:outline-none"
        >
          <option value="" disabled className="text-content-tertiary bg-surface-primary">
            {hourLabel}
          </option>
          {HOURS.map((opt) => (
            <option
              key={opt}
              value={opt}
              className="bg-surface-secondary text-content-primary py-1"
            >
              {opt}
            </option>
          ))}
        </select>
      </div>

      {/* Colon Separator */}
      <span
        className="shrink-0 text-dash-body-sm font-bold text-content-tertiary select-none px-0.5"
        aria-hidden="true"
      >
        :
      </span>

      {/* Minute Segment */}
      <div className="relative flex flex-1 items-center justify-between min-w-0 h-full rounded-md px-1.5 hover:bg-surface-tertiary/40 transition-colors">
        <span
          className={cn(
            "truncate text-dash-body-sm font-semibold tracking-tight pointer-events-none",
            minute ? "text-content-primary" : "text-content-tertiary font-normal",
          )}
        >
          {minute || minuteLabel}
        </span>
        <ChevronDown
          className="size-3 shrink-0 text-content-tertiary pointer-events-none ml-1 rtl:mr-1 rtl:ml-0"
          aria-hidden="true"
        />
        <select
          aria-label={minuteLabel}
          disabled={disabled}
          value={minute}
          onChange={(e) => handleMinuteChange(e.target.value)}
          className="absolute inset-0 size-full cursor-pointer appearance-none bg-transparent opacity-0 scheme-light focus:outline-none"
        >
          <option value="" disabled className="text-content-tertiary bg-surface-primary">
            {minuteLabel}
          </option>
          {MINUTES.map((opt) => (
            <option
              key={opt}
              value={opt}
              className="bg-surface-secondary text-content-primary py-1"
            >
              {opt}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default TimePickerField;