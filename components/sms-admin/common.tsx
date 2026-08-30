"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/src/i18n/navigation";

import { SMS_DASHBOARD_ROUTES, SMS_UI } from "@/lib/sms/constants";
import type { SmsProviderKind } from "@/src/db/schema";
import { cn } from "@/lib/utils";

export type SmsSelectOption = { value: string; label: string };

export function SmsSubnav({
  canSend,
  canWrite,
}: {
  canSend: boolean;
  canWrite: boolean;
}) {
  const t = useTranslations("smsAdmin");
  const pathname = usePathname();
  const items = [
    { key: "overview", href: SMS_DASHBOARD_ROUTES.root, visible: true },
    { key: "send", href: SMS_DASHBOARD_ROUTES.send, visible: canSend },
    { key: "providers", href: SMS_DASHBOARD_ROUTES.providers, visible: canWrite },
    { key: "templates", href: SMS_DASHBOARD_ROUTES.templates, visible: canWrite },
    { key: "reports", href: SMS_DASHBOARD_ROUTES.messages, visible: true },
  ].filter((item) => item.visible);

  return (
    <nav
      aria-label={t("heading")}
      className="flex gap-1 overflow-x-auto rounded-panel border border-border-primary bg-surface-secondary p-1.5 shadow-elevation-1"
    >
      {items.map((item) => {
        const active =
          item.href === "/dashboard/sms"
            ? pathname === item.href
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.key}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex min-h-11 shrink-0 items-center justify-center rounded-control px-3 text-dash-body-sm font-bold no-underline transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:px-4",
              active
                ? "bg-accent text-content-contrast shadow-elevation-1"
                : "text-content-secondary hover:bg-surface-tertiary hover:text-accent",
            )}
          >
            {t(`nav.${item.key}` as never)}
          </Link>
        );
      })}
    </nav>
  );
}

export function SmsBackLink({ href = SMS_DASHBOARD_ROUTES.root }: { href?: string }) {
  const t = useTranslations("smsAdmin");
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center rounded-pill border border-border-interactive bg-surface-secondary px-4 text-dash-body-sm font-bold text-accent no-underline transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      {t("back")}
    </Link>
  );
}

export function SmsStatusBadge({
  status,
}: {
  status:
    | "unknown"
    | "healthy"
    | "unhealthy"
    | "queued"
    | "sending"
    | "sent"
    | "delivered"
    | "failed"
    | "partial";
}) {
  const t = useTranslations("smsAdmin");
  const tone =
    status === "healthy" || status === "sent" || status === "delivered"
      ? "border-success/30 bg-success/10 text-success"
      : status === "unhealthy" || status === "failed"
        ? "border-error/30 bg-error/10 text-error"
        : status === "partial"
          ? "border-warning/30 bg-warning/10 text-warning"
          : "border-border-primary bg-surface-tertiary text-content-secondary";
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center rounded-pill border px-2.5 text-dash-caption font-bold",
        tone,
      )}
    >
      {t(`statuses.${status}` as never)}
    </span>
  );
}

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
          <ChevronDown
            className="size-4 shrink-0 text-content-tertiary"
            aria-hidden="true"
          />
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

export function SmsToggle({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 items-center rounded-pill transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-50",
        checked ? "bg-accent" : "bg-surface-tertiary",
      )}
    >
      <span
        className={cn(
          "absolute top-1 size-5 rounded-pill bg-on-primary shadow-elevation-1 transition-[inset] duration-200",
          checked ? "inset-e-1" : "inset-s-1",
        )}
      />
    </button>
  );
}

export function formatSmsDate(value: Date | string | null, locale: string): string {
  if (!value) return "";
  const dateLocale = locale === "fa" ? "fa-IR-u-nu-latn" : "en-US";
  return new Intl.DateTimeFormat(dateLocale, {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function providerKindKey(kind: SmsProviderKind): string {
  return kind === "sms_ir" ? "smsIr" : kind;
}
