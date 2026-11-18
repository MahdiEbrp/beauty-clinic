"use client";

import { useId } from "react";
import { useLocale } from "next-intl";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, X } from "lucide-react";
import { DatePickerField } from "@/components/date-time-picker/date-picker-field";

interface ExtraFilterProps {
  type: "select" | "date";
  label: string;
  value: string;
  allLabel: string;
  options?: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}

const ALL = "__all__";
const controlClass = "inline-flex min-h-11 items-center gap-2 rounded-control border border-form-input-border bg-form-input-bg px-3 text-dash-caption text-accent transition-colors hover:border-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export function AdminExtraFilter({
  type, label, value, allLabel, options = [], onChange,
}: ExtraFilterProps) {
  const id = useId();
  const locale = useLocale();
  return (
    <div className="inline-flex shrink-0 items-center gap-2 text-dash-caption font-bold text-accent">
      <label htmlFor={id}>{label}</label>
      {type === "date" ? (
        <div className="inline-flex min-w-0 items-center gap-1.5">
          <div className="min-w-0">
            <DatePickerField
              value={value}
              onChange={onChange}
              locale={locale === "fa" ? "fa" : "en"}
            />
          </div>
          {value ? (
            <button
              type="button"
              onClick={() => onChange("")}
              aria-label={`Clear ${label}`}
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-control border border-border-primary bg-surface-secondary text-content-secondary transition-colors hover:border-copper hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      ) : (
        <SelectPrimitive.Root value={value || ALL} onValueChange={(next) => onChange(next === ALL ? "" : next)} dir={locale === "fa" ? "rtl" : "ltr"}>
          <SelectPrimitive.Trigger id={id} className={`${controlClass} max-w-48 data-[state=open]:border-copper data-[state=open]:ring-1 data-[state=open]:ring-copper`}>
            <SelectPrimitive.Value />
            <SelectPrimitive.Icon asChild><ChevronDown className="size-4 shrink-0" aria-hidden="true" /></SelectPrimitive.Icon>
          </SelectPrimitive.Trigger>
          <SelectPrimitive.Portal>
            <SelectPrimitive.Content position="popper" sideOffset={4} className="z-50 max-h-64 overflow-hidden rounded-control border border-border-primary bg-surface-secondary text-accent shadow-elevation-3">
              <SelectPrimitive.Viewport className="p-1">
                {[{ value: ALL, label: allLabel }, ...options].map((option) => (
                  <SelectPrimitive.Item key={option.value} value={option.value} className="relative flex min-h-11 cursor-pointer select-none items-center rounded-control py-2 ps-3 pe-9 text-dash-caption outline-none focus:bg-surface-tertiary data-highlighted:bg-surface-tertiary data-[state=checked]:bg-accent-subtle data-[state=checked]:font-bold">
                    <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                    <SelectPrimitive.ItemIndicator className="absolute end-3"><Check className="size-4 text-copper-strong" aria-hidden="true" /></SelectPrimitive.ItemIndicator>
                  </SelectPrimitive.Item>
                ))}
              </SelectPrimitive.Viewport>
            </SelectPrimitive.Content>
          </SelectPrimitive.Portal>
        </SelectPrimitive.Root>
      )}
    </div>
  );
}
