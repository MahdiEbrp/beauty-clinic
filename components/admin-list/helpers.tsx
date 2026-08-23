import { forwardRef } from "react";
import { Check, Minus } from "lucide-react";

export function formatPrice(value: string | number | null, currency?: string): string {
  if (value === null || value === undefined || value === "") return "—";
    const n = Number(value);
  if (Number.isNaN(n)) return String(value);
  const symbol = currency ?? "تومان";
  return `${n.toLocaleString()} ${symbol}`;
}

export const SelectionCheckbox = forwardRef<
  HTMLInputElement,
  {
    checked: boolean;
    indeterminate?: boolean;
    disabled?: boolean;
    onChange: () => void;
    label: string;
  }
>(function SelectionCheckbox(
  { checked, indeterminate = false, disabled = false, onChange, label },
  ref,
) {
  return (
    <label
      className={`relative inline-flex size-5 shrink-0 items-center justify-center rounded-control focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent ${disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
      title={disabled ? label : undefined}
    >
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        aria-label={label}
        className="peer absolute inset-0 z-10 cursor-pointer opacity-0 disabled:cursor-not-allowed"
      />
      <span
        className={`inline-flex size-4 items-center justify-center rounded-[0.3rem] border transition-colors ${checked || indeterminate ? "border-accent bg-accent text-content-contrast" : "border-border-interactive bg-surface-secondary text-transparent"}`}
        aria-hidden="true"
      >
        {checked ? (
          <Check className="size-3" strokeWidth={3} />
        ) : indeterminate ? (
          <Minus className="size-3" strokeWidth={3} />
        ) : null}
      </span>
    </label>
  );
});
