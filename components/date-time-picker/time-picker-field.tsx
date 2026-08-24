"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Clock } from "lucide-react";

import { cn } from "@/lib/utils";

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

const selectClass =
  "h-11 rounded-control border border-form-input-border bg-form-input-bg px-2 text-dash-body-sm text-accent outline-none transition-colors hover:border-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

/**
 * Localized HH:mm time picker built on two native selects (RTL-safe, keyboard
 * friendly, ≥44px targets). Values are always Latin digits; ss01 shapes them
 * in fa.
 */
export function TimePickerField({
  value,
  onChange,
  disabled,
  invalid,
}: {
  /** "HH:mm" or empty. */
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  invalid?: boolean;
}) {
  const t = useTranslations("dateTimePicker");
  const [hour = "", minute = ""] = value.split(":");

  const emit = (h: string, m: string) => {
    if (!h || !m) return;
    onChange(`${h}:${m}`);
  };

  return (
    <div
      className={cn(
        "flex h-11 w-full items-center gap-1.5 rounded-control border bg-form-input-bg px-2 transition-colors",
        invalid ? "border-error/60" : "border-form-input-border",
      )}
    >
      <Clock className="size-4 shrink-0 text-content-tertiary" aria-hidden="true" />
      <select
        aria-label={t("hour")}
        disabled={disabled}
        value={hour}
        onChange={(event) => emit(event.target.value, minute)}
        className={cn(selectClass, "w-full min-w-0 flex-1", !hour && "text-content-tertiary")}
      >
        <option value="" disabled>
          {t("hour")}
        </option>
        {HOURS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <span className="text-dash-body-sm text-content-tertiary">:</span>
      <select
        aria-label={t("minute")}
        disabled={disabled}
        value={minute}
        onChange={(event) => emit(hour, event.target.value)}
        className={cn(selectClass, "w-full min-w-0 flex-1", !minute && "text-content-tertiary")}
      >
        <option value="" disabled>
          {t("minute")}
        </option>
        {MINUTES.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
