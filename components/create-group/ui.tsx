import type { ReactNode } from "react";

export function inputClass(invalid: boolean) {
  return `min-h-11 w-full rounded-control border bg-form-input-bg px-4 text-dash-body text-accent outline-none transition-colors placeholder:text-content-tertiary hover:border-border-interactive focus-visible:border-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${invalid ? "border-error" : "border-form-input-border"}`;
}

export function Field({
  label,
  error,
  hint,
  required,
  id,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  id?: string;
  children: ReactNode;
}) {
  return (
    <label
      htmlFor={id}
      className="grid gap-1.5 text-dash-caption font-bold text-content-secondary"
    >
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

export function Panel({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-panel border border-surface-variant/50 bg-surface-secondary p-5 shadow-elevation-2 sm:p-6 md:p-8">
      {children}
    </div>
  );
}

export function PriceBadge({ priceType }: { priceType: "fixed" | "from" | "on_request" }) {
  return (
    <span
      className={`inline-flex items-center rounded-pill border px-2 py-0.5 text-dash-caption font-bold ${
        priceType === "on_request"
          ? "border-border-primary bg-surface-tertiary text-content-tertiary"
          : "border-copper/20 bg-copper/10 text-copper-strong"
      }`}
    >
      {priceType === "from" ? "from" : priceType === "on_request" ? "—" : "$"}
    </span>
  );
}

export function ReviewCard({
  title,
  badge,
  children,
}: {
  title: string;
  badge?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-card border border-surface-variant/60 bg-surface-secondary shadow-elevation-1">
      <div className="flex items-center justify-between gap-2 border-b border-surface-variant/60 bg-surface-tertiary/30 px-5 py-3">
        <span className="text-dash-caption font-bold uppercase tracking-wider text-content-primary">
          {title}
        </span>
        {badge}
      </div>
      {children}
    </div>
  );
}

export function ReviewLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-dash-caption font-semibold uppercase tracking-tight text-content-tertiary">
      {children}
    </p>
  );
}
