import { forwardRef } from "react";
import { useTranslations } from "next-intl";
import { Check, Minus } from "lucide-react";
import type { AdminUser } from "@/lib/users/service";

export type UserStatus = "active" | "inactive" | "banned";

export function roleClass(role: string): string {
  if (role === "admin") return "border-accent/25 bg-accent/10 text-accent";
  if (role === "doctor")
    return "border-copper/30 bg-copper/10 text-copper-strong";
  if (role === "receptionist")
    return "border-success/25 bg-success/10 text-success";
  return "border-border-primary bg-surface-tertiary text-content-secondary";
}

export function useRoleLabel(): (role: string) => string {
  const t = useTranslations();
  return (role: string) =>
    t.has(`users.roles.${role}`) ? t(`users.roles.${role}`) : role;
}

export function statusOf(row: AdminUser): UserStatus {
  if (row.isBanned) return "banned";
  return row.isActive ? "active" : "inactive";
}

export const statusClass: Record<UserStatus, string> = {
  active: "bg-success/10 text-success border-success/30",
  inactive: "bg-surface-tertiary text-content-secondary border-border-primary",
  banned: "bg-error/10 text-error border-error/30",
};

export const statusTextClass: Record<UserStatus, string> = {
  active: "text-success",
  inactive: "text-content-secondary",
  banned: "text-error",
};

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
