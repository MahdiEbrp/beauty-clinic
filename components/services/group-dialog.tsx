"use client";

/* eslint-disable max-lines -- complex dialog component with multiple form sections */

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { SLUG_PATTERN } from "@/lib/validation/slug";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, SelectField, inputClass } from "./form-field";
import { slugify } from "./helpers";
import { useServices } from "./services-context";

const groupSchema = z.object({
  name: z.string().trim().min(1).max(256),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(160)
    .regex(SLUG_PATTERN, "invalid"),
  description: z.string().trim().max(1000),
  icon: z.string().trim().max(100),
  image: z.string().trim().max(2048),
  displayOrder: z
    .string()
    .refine((v) => v === "" || (/^\d+$/.test(v) && Number(v) <= 10000), "invalid"),
  isActive: z.boolean(),
  seoTitle: z.string().trim().max(256),
  seoDescription: z.string().trim().max(512),
});

type GroupForm = z.infer<typeof groupSchema>;

function toForm(group: { displayOrder: number }): GroupForm {
  return {
    name: "",
    slug: "",
    description: "",
    icon: "",
    image: "",
    displayOrder: String(group.displayOrder),
    isActive: true,
    seoTitle: "",
    seoDescription: "",
  };
}

export function GroupDialog() {
  const t = useTranslations();
  const { groupDialog, closeGroupDialog, busyId, createGroup, updateGroup } =
    useServices();
  const [discardOpen, setDiscardOpen] = useState(false);
  const editing = groupDialog?.mode === "edit" ? groupDialog.group : null;

  const form = useForm<GroupForm>({
    resolver: zodResolver(groupSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: toForm(editing ?? { displayOrder: 0 }),
  });

  useEffect(() => {
    if (editing) {
      form.reset({
        name: editing.name,
        slug: editing.slug,
        description: editing.description ?? "",
        icon: editing.icon ?? "",
        image: editing.image ?? "",
        displayOrder: String(editing.displayOrder),
        isActive: editing.isActive,
        seoTitle: editing.seoTitle ?? "",
        seoDescription: editing.seoDescription ?? "",
      });
    } else {
      form.reset(toForm({ displayOrder: 0 }));
    }
  }, [editing, form]);

  const title = useWatch({ control: form.control, name: "name" });
  const isActive = useWatch({ control: form.control, name: "isActive" });

  const close = () => {
    form.reset();
    setDiscardOpen(false);
    closeGroupDialog();
  };

  const requestClose = (nextOpen: boolean) => {
    if (nextOpen) {
      closeGroupDialog();
    } else if (form.formState.isDirty) {
      setDiscardOpen(true);
    } else {
      close();
    }
  };

  const submit = async (values: GroupForm) => {
    const payload = {
      name: values.name,
      slug: values.slug || slugify(values.name),
      description: values.description || null,
      icon: values.icon || null,
      image: values.image || null,
      displayOrder: values.displayOrder ? Number(values.displayOrder) : 0,
      isActive: values.isActive,
      seoTitle: values.seoTitle || null,
      seoDescription: values.seoDescription || null,
    };
    const result = editing
      ? await updateGroup(editing.id, payload)
      : await createGroup(payload);
    if (result.ok) close();
  };

  const errorText = (field: keyof GroupForm) => {
    // eslint-disable-next-line security/detect-object-injection -- typed react-hook-form field access
    if (!form.formState.errors[field]) return null;
    if (field === "slug") return t("servicesCatalog.groupForm.errors.slug");
    if (field === "displayOrder")
      return t("servicesCatalog.groupForm.errors.displayOrder");
    return t("servicesCatalog.groupForm.errors.name");
  };

  return (
    <>
      <Dialog open={groupDialog !== null} onOpenChange={requestClose}>
        <DialogContent
          closeLabel={t("servicesCatalog.dialog.cancel")}
          className="gap-0 overflow-y-auto p-0 max-w-none w-full max-h-[92dvh] md:max-w-xl md:rounded-lg"
        >
          <div className="border-b border-border-primary bg-surface-tertiary/35 px-6 pb-5 pt-7 sm:px-8">
            <DialogHeader className="gap-2 pe-8">
              <DialogTitle className="text-dash-heading font-bold tracking-tight text-accent">
                {editing
                  ? t("servicesCatalog.groupForm.editTitle")
                  : t("servicesCatalog.groupForm.title")}
              </DialogTitle>
              <DialogDescription className="max-w-md text-dash-body-sm leading-6">
                {editing
                  ? t("servicesCatalog.groupForm.editDescription")
                  : t("servicesCatalog.groupForm.description")}
              </DialogDescription>
            </DialogHeader>
          </div>

          <form
            onSubmit={(event) => void form.handleSubmit(submit)(event)}
            className="grid gap-5 px-6 py-6 sm:px-8"
          >
            <Field
              label={t("servicesCatalog.groupForm.name")}
              error={errorText("name")}
              required
            >
              <input
                autoFocus
                {...form.register("name")}
                placeholder={t("servicesCatalog.groupForm.namePlaceholder")}
                className={inputClass(Boolean(form.formState.errors.name))}
              />
            </Field>
            <Field
              label={t("servicesCatalog.groupForm.slug")}
              error={errorText("slug")}
              hint={t("servicesCatalog.groupForm.slugHint")}
              required
            >
              <input
                dir="ltr"
                {...form.register("slug")}
                placeholder={slugify(title) || "laser-therapy"}
                className={inputClass(Boolean(form.formState.errors.slug))}
              />
            </Field>
            <Field
              label={t("servicesCatalog.groupForm.descriptionLabel")}
              error={errorText("description")}
            >
              <textarea
                {...form.register("description")}
                rows={3}
                className={`${inputClass(Boolean(form.formState.errors.description))} resize-y`}
              />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={t("servicesCatalog.groupForm.icon")} error={errorText("icon")}>
                <input
                  dir="ltr"
                  {...form.register("icon")}
                  placeholder="laser"
                  className={inputClass(Boolean(form.formState.errors.icon))}
                />
              </Field>
              <Field label={t("servicesCatalog.groupForm.image")} error={errorText("image")}>
                <input
                  dir="ltr"
                  {...form.register("image")}
                  placeholder="https://..."
                  className={inputClass(Boolean(form.formState.errors.image))}
                />
              </Field>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label={t("servicesCatalog.groupForm.displayOrder")}
                error={errorText("displayOrder")}
              >
                <input
                  dir="ltr"
                  inputMode="numeric"
                  {...form.register("displayOrder")}
                  className={inputClass(Boolean(form.formState.errors.displayOrder))}
                />
              </Field>
              <Field label={t("servicesCatalog.groupForm.isActive")}>
                <SelectField
                  value={isActive ? "true" : "false"}
                  onValueChange={(value) =>
                    form.setValue("isActive", value === "true")
                  }
                  placeholder={t("servicesCatalog.groupForm.isActive")}
                  options={[
                    { value: "true", label: t("servicesCatalog.statuses.active") },
                    { value: "false", label: t("servicesCatalog.statuses.inactive") },
                  ]}
                  optionLabel={(value) =>
                    value === "true"
                      ? t("servicesCatalog.statuses.active")
                      : t("servicesCatalog.statuses.inactive")
                  }
                />
              </Field>
            </div>
            <Field label={t("servicesCatalog.groupForm.seoTitle")} error={errorText("seoTitle")}>
              <input
                {...form.register("seoTitle")}
                className={inputClass(Boolean(form.formState.errors.seoTitle))}
              />
            </Field>
            <Field
              label={t("servicesCatalog.groupForm.seoDescription")}
              error={errorText("seoDescription")}
            >
              <textarea
                {...form.register("seoDescription")}
                rows={2}
                className={`${inputClass(Boolean(form.formState.errors.seoDescription))} resize-y`}
              />
            </Field>

            <div className="mt-2 flex flex-col-reverse gap-3 border-t border-border-primary pt-5 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  requestClose(false);
                }}
                className="inline-flex min-h-11 items-center justify-center rounded-pill px-5 text-dash-body-sm font-bold text-content-secondary transition hover:bg-surface-tertiary hover:text-accent"
              >
                {t("servicesCatalog.dialog.cancel")}
              </button>
              <button
                type="submit"
                disabled={form.formState.isSubmitting || busyId !== null}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill bg-accent px-6 text-dash-body-sm font-bold text-content-contrast shadow-elevation-1 transition hover:bg-accent-hover disabled:pointer-events-none disabled:opacity-45"
              >
                {form.formState.isSubmitting && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                {form.formState.isSubmitting
                  ? t("servicesCatalog.toasts.saving")
                  : editing
                    ? t("servicesCatalog.groupForm.save")
                    : t("servicesCatalog.groupForm.create")}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={discardOpen} onOpenChange={setDiscardOpen}>
        <DialogContent
          closeLabel={t("servicesCatalog.dialog.cancel")}
          className="w-full max-w-sm"
        >
          <DialogHeader>
            <DialogTitle className="text-accent">
              {t("servicesCatalog.groupForm.discardTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("servicesCatalog.groupForm.discardDescription")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-3">
            <DialogClose className="inline-flex min-h-11 items-center justify-center rounded-pill bg-surface-tertiary px-5 text-dash-body-sm font-bold text-accent">
              {t("servicesCatalog.dialog.cancel")}
            </DialogClose>
            <button
              type="button"
              onClick={close}
              className="inline-flex min-h-11 items-center justify-center rounded-pill bg-error px-5 text-dash-body-sm font-bold text-content-contrast"
            >
              {t("servicesCatalog.groupForm.discardConfirm")}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
