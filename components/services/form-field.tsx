import type { ReactNode } from "react";
import { Select as SelectPrimitive } from "radix-ui";
import { ChevronDown } from "lucide-react";

export function inputClass(invalid: boolean) {
  return `min-h-11 w-full rounded-control border bg-form-input-bg px-4 text-dash-body text-accent outline-none transition-colors placeholder:text-content-tertiary hover:border-border-interactive focus-visible:border-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${invalid ? "border-error" : "border-form-input-border"}`;
}

export function Field({
  label,
  error,
  hint,
  required,
  children,
}: {
  label: string;
  error?: string | null;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-1.5 text-dash-caption font-bold text-content-secondary">
      <span>
        {label}
        {required && (
          <span className="ms-1 text-copper" aria-hidden="true">
            *
          </span>
        )}
      </span>
      {children}
      {hint && !error && (
        <span className="font-normal text-content-tertiary">{hint}</span>
      )}
      {error && (
        <span role="alert" className="font-medium text-error">
          {error}
        </span>
      )}
    </label>
  );
}

export function SelectField({
  value,
  onValueChange,
  placeholder,
  invalid,
  options,
  optionLabel,
  disabled,
}: {
  value: string | undefined;
  onValueChange: (value: string) => void;
  placeholder: string;
  invalid?: boolean;
  options: ReadonlyArray<{ value: string; label: string }>;
  optionLabel: (value: string) => string;
  disabled?: boolean;
}) {
  return (
    <SelectPrimitive.Root value={value || undefined} onValueChange={onValueChange} disabled={disabled}>
      <SelectPrimitive.Trigger
        className={`${inputClass(Boolean(invalid))} inline-flex items-center justify-between gap-3 text-start disabled:opacity-50`}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <ChevronDown
          className="size-4 shrink-0 text-content-tertiary"
          aria-hidden="true"
        />
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={6}
          className="z-120 min-w-(--radix-select-trigger-width) max-h-72 overflow-y-auto rounded-control border border-border-primary bg-surface-secondary p-1 text-accent shadow-elevation-3"
        >
          <SelectPrimitive.Viewport>
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                className="flex min-h-10 cursor-pointer items-center rounded-control px-3 text-dash-body-sm outline-none data-highlighted:bg-surface-tertiary"
              >
                <SelectPrimitive.ItemText>
                  {optionLabel(option.value)}
                </SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
