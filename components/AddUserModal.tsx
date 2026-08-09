"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch, type SubmitHandler } from "react-hook-form";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AddUserForm from "@/components/users/AddUserForm";

const roles = ["admin", "doctor", "receptionist", "customer"] as const;
const addUserSchema = z.object({ fullName: z.string().trim().min(2).max(100), email: z.email().trim().toLowerCase(), phone: z.string().trim().refine((value) => value === "" || /^\+?[0-9]{7,15}$/.test(value)), password: z.string().min(8).max(128).regex(/[a-z]/).regex(/[A-Z]/).regex(/[0-9]/).regex(/[^a-zA-Z0-9]/), roleKey: z.string().min(1) });
export type AddUserValues = z.infer<typeof addUserSchema>;
export type EmailState = "idle" | "checking" | "available" | "taken";
function passwordRules(value: string) { return [{ key: "length", valid: value.length >= 8 }, { key: "number", valid: /[0-9]/.test(value) }, { key: "uppercase", valid: /[A-Z]/.test(value) }, { key: "special", valid: /[^a-zA-Z0-9]/.test(value) }]; }

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
    const timer = window.setTimeout(() => {
      void (async () => {
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
      })();
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
    // eslint-disable-next-line security/detect-object-injection -- typed react-hook-form field access
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
          className="max-w-xl gap-0 overflow-y-auto p-0 max-md:top-auto max-md:bottom-0 max-md:max-w-none max-md:translate-y-0 max-md:rounded-b-none max-md:rounded-t-[1.5rem] max-md:max-h-[92dvh]"
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

          <AddUserForm
            form={form}
            roles={roles}
            visibleEmailState={visibleEmailState}
            rules={rules}
            strength={strength}
            serverError={serverError}
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword((value) => !value)}
            errorText={errorText}
            onSubmit={submit}
            onCancel={(event) => { event.preventDefault(); requestClose(false); }}
            t={t}
          />
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
