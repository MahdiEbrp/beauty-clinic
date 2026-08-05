"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Controller,
  useForm,
  useWatch,
  type SubmitHandler,
} from "react-hook-form";
import { useTranslations } from "next-intl";
import { z } from "zod";
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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const roles = ["admin", "doctor", "receptionist", "customer"] as const;

const addUserSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  email: z.email().trim().toLowerCase(),
  phone: z
    .string()
    .trim()
    .refine((value) => value === "" || /^\+?[0-9]{7,15}$/.test(value)),
  password: z
    .string()
    .min(8)
    .max(128)
    .regex(/[a-z]/)
    .regex(/[A-Z]/)
    .regex(/[0-9]/)
    .regex(/[^a-zA-Z0-9]/),
  roleKey: z.string().min(1),
});

type AddUserValues = z.infer<typeof addUserSchema>;
type EmailState = "idle" | "checking" | "available" | "taken";

function passwordRules(value: string) {
  return [
    { key: "length", valid: value.length >= 8 },
    { key: "number", valid: /[0-9]/.test(value) },
    { key: "uppercase", valid: /[A-Z]/.test(value) },
    { key: "special", valid: /[^a-zA-Z0-9]/.test(value) },
  ];
}

export default function AddUserModal({
  open,
  onOpenChange,
  onSubmit,
  serverError,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: AddUserValues) => Promise<void>;
  serverError?: string | null;
}) {
  const t = useTranslations();
  const [showPassword, setShowPassword] = useState(false);
  const [emailState, setEmailState] = useState<EmailState>("idle");
  const [discardOpen, setDiscardOpen] = useState(false);
  const form = useForm<AddUserValues>({
    resolver: zodResolver(addUserSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      roleKey: "",
    },
  });
  const password = useWatch({ control: form.control, name: "password" });
  const email = useWatch({ control: form.control, name: "email" });
  const validEmail = z.email().safeParse(email.trim()).success;
  const visibleEmailState = validEmail ? emailState : "idle";
  const rules = useMemo(() => passwordRules(password), [password]);
  const strength = rules.filter((rule) => rule.valid).length;

  useEffect(() => {
    const parsed = z.email().safeParse(email.trim());
    if (!parsed.success) return;
    const timer = window.setTimeout(async () => {
      setEmailState("checking");
      try {
        const response = await fetch(
          `/api/v1/users?search=${encodeURIComponent(email.trim())}&perPage=1`,
          { credentials: "include" },
        );
        if (!response.ok) throw new Error("check_failed");
        const payload = (await response.json()) as {
          data?: { items?: Array<{ email: string }> };
        };
        const exists = payload.data?.items?.some(
          (item) => item.email.toLowerCase() === email.trim().toLowerCase(),
        );
        setEmailState(exists ? "taken" : "available");
      } catch {
        setEmailState("idle");
      }
    }, 500);
    return () => window.clearTimeout(timer);
  }, [email]);

  const close = () => {
    form.reset();
    setShowPassword(false);
    setEmailState("idle");
    setDiscardOpen(false);
    onOpenChange(false);
  };

  const requestClose = (nextOpen: boolean) => {
    if (nextOpen) {
      onOpenChange(true);
    } else if (form.formState.isDirty) {
      setDiscardOpen(true);
    } else {
      close();
    }
  };

  const submit: SubmitHandler<AddUserValues> = async (values) => {
    if (visibleEmailState === "taken") {
      form.setError("email", { type: "validate", message: "taken" });
      return;
    }
    await onSubmit({ ...values, phone: values.phone.trim() });
    close();
  };

  const errorText = (field: keyof AddUserValues) => {
    if (!form.formState.errors[field]) return null;
    if (field === "fullName") return t("users.form.errors.fullName");
    if (field === "email")
      return emailState === "taken"
        ? t("users.form.errors.emailTaken")
        : t("users.form.errors.email");
    if (field === "phone") return t("users.form.errors.phone");
    if (field === "password") return t("users.form.errors.password");
    return t("users.form.errors.role");
  };

  return (
    <>
      <Dialog open={open} onOpenChange={requestClose}>
        <DialogContent
          closeLabel={t("users.dialog.cancel")}
          className="max-w-xl gap-0 overflow-y-auto p-0 max-md:top-auto max-md:bottom-0 max-md:inset-s-0 max-md:max-w-none max-md:translate-x-0 max-md:translate-y-0 max-md:rounded-b-none max-md:rounded-t-[1.5rem] max-md:max-h-[92dvh]"
        >
          <div className="border-b border-border-primary bg-surface-tertiary/35 px-6 pb-5 pt-7 sm:px-8">
            <DialogHeader className="gap-2 pe-8">
              <DialogTitle className="text-dash-heading font-bold tracking-tight text-accent">
                {t("users.addTitle")}
              </DialogTitle>
              <DialogDescription className="max-w-md text-dash-body-sm leading-6">
                {t("users.addDescription")}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-5 flex items-center gap-2 text-dash-caption font-bold text-copper-strong">
              <span
                className="size-2 rounded-full bg-copper"
                aria-hidden="true"
              />
              <span>{t("users.form.requiredHint")}</span>
            </div>
          </div>

          <form
            onSubmit={form.handleSubmit(submit)}
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

            <Field
              label={t("users.form.email")}
              error={errorText("email")}
              required
            >
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
                  onClick={() => setShowPassword((value) => !value)}
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
                      {t(`users.form.passwordRules.${rule.key}`)}
                    </span>
                  ))}
                </div>
              </div>
            </Field>

            <Field
              label={t("users.form.role")}
              error={errorText("roleKey")}
              required
            >
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
                                {t(`users.roles.${role}`)}
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

            <DialogFooter className="mt-2 border-t border-border-primary pt-5 sm:flex-row sm:justify-between">
              <DialogClose
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  requestClose(false);
                }}
                className="inline-flex min-h-11 items-center justify-center rounded-pill px-5 text-dash-body-sm font-bold text-content-secondary transition hover:bg-surface-tertiary hover:text-accent"
              >
                {t("users.dialog.cancel")}
              </DialogClose>
              <button
                type="submit"
                disabled={
                  form.formState.isSubmitting ||
                  visibleEmailState === "checking"
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
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={discardOpen} onOpenChange={setDiscardOpen}>
        <DialogContent
          closeLabel={t("users.dialog.cancel")}
          className="max-w-sm"
        >
          <DialogHeader>
            <DialogTitle className="text-accent">
              {t("users.form.discardTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("users.form.discardDescription")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-3">
            <DialogClose className="inline-flex min-h-11 items-center justify-center rounded-pill bg-surface-tertiary px-5 text-dash-body-sm font-bold text-accent">
              {t("users.dialog.cancel")}
            </DialogClose>
            <button
              type="button"
              onClick={close}
              className="inline-flex min-h-11 items-center justify-center rounded-pill bg-error px-5 text-dash-body-sm font-bold text-content-contrast"
            >
              {t("users.form.discardConfirm")}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
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

function inputClass(invalid: boolean) {
  return `min-h-11 w-full rounded-control border bg-form-input-bg px-4 text-dash-body text-accent outline-none transition-colors placeholder:text-content-tertiary hover:border-border-interactive focus-visible:border-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${invalid ? "border-error" : "border-form-input-border"}`;
}
