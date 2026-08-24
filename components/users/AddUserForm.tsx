"use client";

import type { ReactNode } from "react";
import {
  Controller,
  type SubmitHandler,
  type UseFormReturn,
} from "react-hook-form";
import { Select as SelectPrimitive } from "radix-ui";
import {
  AlertCircle,
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  Loader2,
  X,
} from "lucide-react";
import type { TranslateFn } from "@/src/i18n/message-key";
import { msgKey } from "@/src/i18n/message-key";
import type { AddUserValues, EmailState } from "@/components/AddUserModal";

function inputClass(invalid: boolean) {
  return `min-h-11 w-full rounded-control border bg-form-input-bg px-4 text-dash-body text-accent outline-none transition-colors placeholder:text-content-tertiary hover:border-border-interactive focus-visible:border-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${invalid ? "border-error" : "border-form-input-border"}`;
}

function Field({
  label,
  error,
  hint,
  required,
  children,
}: {
  label: string;
  error: string | null;
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

export default function AddUserForm({
  form,
  roles,
  visibleEmailState,
  rules,
  strength,
  serverError,
  showPassword,
  onTogglePassword,
  errorText,
  onSubmit,
  onCancel,
  t,
}: {
  form: UseFormReturn<AddUserValues>;
  roles: readonly string[];
  visibleEmailState: EmailState;
  rules: Array<{ key: string; valid: boolean }>;
  strength: number;
  serverError?: string | null;
  showPassword: boolean;
  onTogglePassword: () => void;
  errorText: (field: keyof AddUserValues) => string | null;
  onSubmit: SubmitHandler<AddUserValues>;
  onCancel: (event: React.MouseEvent<HTMLButtonElement>) => void;
  t: TranslateFn;
}) {
  return (
    <form
      onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}
      className="grid gap-5 px-6 py-6 sm:px-8"
    >
      <Field
        label={t("users.form.fullName")}
        error={errorText("fullName")}
        required
      >
        <input
          autoFocus
          {...form.register("fullName")}
          placeholder={t("users.form.fullNamePlaceholder")}
          className={inputClass(Boolean(form.formState.errors.fullName))}
        />
      </Field>
      <Field label={t("users.form.email")} error={errorText("email")} required>
        <div className="relative">
          <input
            type="email"
            dir="ltr"
            {...form.register("email")}
            placeholder="name@example.com"
            className={`${inputClass(Boolean(form.formState.errors.email))} pe-11`}
          />
          <span
            className="pointer-events-none absolute inset-e-3 top-1/2 -translate-y-1/2 text-content-tertiary"
            aria-hidden="true"
          >
            {visibleEmailState === "checking" && (
              <Loader2 className="size-4 animate-spin" />
            )}
            {visibleEmailState === "available" && (
              <Check className="size-4 text-success" />
            )}
            {visibleEmailState === "taken" && (
              <X className="size-4 text-error" />
            )}
          </span>
        </div>
      </Field>
      <Field
        label={t("users.form.phone")}
        error={errorText("phone")}
        hint={t("users.form.phoneHint")}
      >
        <input
          inputMode="numeric"
          dir="ltr"
          {...form.register("phone")}
          onInput={(event) => {
            event.currentTarget.value = event.currentTarget.value.replace(
              /[^0-9+]/g,
              "",
            );
          }}
          placeholder="+98 912 000 0000"
          className={inputClass(Boolean(form.formState.errors.phone))}
        />
      </Field>
      <Field
        label={t("users.form.password")}
        error={errorText("password")}
        hint={t("users.form.passwordHint")}
        required
      >
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            dir="ltr"
            {...form.register("password")}
            className={`${inputClass(Boolean(form.formState.errors.password))} ps-12`}
          />
          <button
            type="button"
            onClick={onTogglePassword}
            aria-label={
              showPassword
                ? t("users.form.hidePassword")
                : t("users.form.showPassword")
            }
            className="absolute inset-s-1 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-pill text-content-tertiary transition hover:bg-surface-tertiary hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
        <div className="mt-1 grid gap-2" aria-live="polite">
          <div className="flex h-1.5 gap-1 overflow-hidden rounded-pill bg-surface-tertiary">
            {[0, 1, 2, 3].map((index) => (
              <span
                key={index}
                className={`flex-1 transition-colors ${index < strength ? (strength < 2 ? "bg-error" : strength < 4 ? "bg-copper" : "bg-success") : "bg-transparent"}`}
              />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-dash-caption text-content-tertiary">
            {rules.map((rule) => (
              <span
                key={rule.key}
                className={`inline-flex items-center gap-1.5 ${rule.valid ? "text-success" : ""}`}
              >
                <Check className="size-3" aria-hidden="true" />
                {t(msgKey(`users.form.passwordRules.${rule.key}`))}
              </span>
            ))}
          </div>
        </div>
      </Field>
      <Field label={t("users.form.role")} error={errorText("roleKey")} required>
        <Controller
          name="roleKey"
          control={form.control}
          render={({ field }) => (
            <SelectPrimitive.Root
              value={field.value || undefined}
              onValueChange={field.onChange}
            >
              <SelectPrimitive.Trigger
                ref={field.ref}
                onBlur={field.onBlur}
                className={`${inputClass(Boolean(form.formState.errors.roleKey))} inline-flex items-center justify-between gap-3 text-start`}
              >
                <SelectPrimitive.Value
                  placeholder={t("users.form.rolePlaceholder")}
                />
                <ChevronDown
                  className="size-4 shrink-0 text-content-tertiary"
                  aria-hidden="true"
                />
              </SelectPrimitive.Trigger>
              <SelectPrimitive.Portal>
                <SelectPrimitive.Content
                  position="popper"
                  sideOffset={6}
                  className="z-120 min-w-(--radix-select-trigger-width) overflow-hidden rounded-control border border-border-primary bg-surface-secondary p-1 text-accent shadow-elevation-3"
                >
                  <SelectPrimitive.Viewport>
                    {roles.map((role) => (
                      <SelectPrimitive.Item
                        key={role}
                        value={role}
                        className="flex min-h-10 cursor-pointer items-center rounded-control px-3 text-dash-body-sm outline-none data-highlighted:bg-surface-tertiary"
                      >
                        <SelectPrimitive.ItemText>
                          {t(msgKey(`users.roles.${role}`))}
                        </SelectPrimitive.ItemText>
                      </SelectPrimitive.Item>
                    ))}
                  </SelectPrimitive.Viewport>
                </SelectPrimitive.Content>
              </SelectPrimitive.Portal>
            </SelectPrimitive.Root>
          )}
        />
      </Field>
      {serverError && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-control border border-error/30 bg-error/10 p-3 text-dash-body-sm text-error"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {serverError}
        </div>
      )}
      <div className="mt-2 flex flex-col-reverse gap-3 border-t border-border-primary pt-5 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex min-h-11 items-center justify-center rounded-pill px-5 text-dash-body-sm font-bold text-content-secondary transition hover:bg-surface-tertiary hover:text-accent"
        >
          {t("users.dialog.cancel")}
        </button>
        <button
          type="submit"
          disabled={
            form.formState.isSubmitting || visibleEmailState === "checking"
          }
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill bg-accent px-6 text-dash-body-sm font-bold text-content-contrast shadow-elevation-1 transition hover:bg-accent-hover disabled:pointer-events-none disabled:opacity-45"
        >
          {form.formState.isSubmitting && (
            <Loader2 className="size-4 animate-spin" />
          )}
          {form.formState.isSubmitting
            ? t("users.form.creating")
            : t("users.addSubmit")}
        </button>
      </div>
    </form>
  );
}
