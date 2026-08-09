"use client";

/* eslint-disable security/detect-object-injection -- typed react-hook-form state/field access, keys are a closed union */

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, useWatch } from "react-hook-form";

import { SLUG_PATTERN } from "@/lib/validation/slug";
import {
  ImagePlus,
  Loader2,
  MessageSquareText,
  Plus,
  Trash2,
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
import { Field, SelectField, inputClass } from "./form-field";
import { slugify } from "./helpers";
import { useServices } from "./services-context";

const serviceSchema = z.object({
  groupId: z.uuid("invalid"),
  categoryId: z.uuid("invalid"),
  title: z.string().trim().min(1).max(256),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(160)
    .regex(SLUG_PATTERN, "invalid"),
  shortDesc: z.string().trim().max(512),
  fullDesc: z.string().trim().max(4000),
  price: z
    .string()
    .refine((v) => v === "" || (!Number.isNaN(Number(v)) && Number(v) >= 0 && Number(v) <= 1_000_000_000), "invalid"),
  priceType: z.enum(["fixed", "from", "on_request"]),
  durationMin: z
    .string()
    .refine(
      (v) =>
        v === "" ||
        (/^\d+$/.test(v) && Number(v) >= 1 && Number(v) <= 1440),
      "invalid",
    ),
  sessionsCount: z
    .string()
    .refine((v) => /^\d+$/.test(v) && Number(v) >= 1 && Number(v) <= 100, "invalid"),
  coverImage: z.string().trim().max(2048),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  displayOrder: z
    .string()
    .refine((v) => v === "" || (/^\d+$/.test(v) && Number(v) <= 10000), "invalid"),
  images: z.array(
    z.object({
      imageUrl: z.string().trim().min(1).max(2048),
      type: z.enum(["before", "after", "gallery"]),
    }),
  ),
  faqs: z.array(
    z.object({
      question: z.string().trim().min(1).max(512),
      answer: z.string().trim().min(1).max(4000),
    }),
  ),
});

type ServiceForm = z.infer<typeof serviceSchema>;

const IMAGE_TYPES = ["before", "after", "gallery"] as const;
const PRICE_TYPES = ["fixed", "from", "on_request"] as const;

export function ServiceDialog() {
  const t = useTranslations();
  const {
    serviceDialog,
    closeServiceDialog,
    busyId,
    createService,
    updateService,
    summary,
  } = useServices();
  const [discardOpen, setDiscardOpen] = useState(false);
  const editing = serviceDialog?.mode === "edit" ? serviceDialog.service : null;

  const form = useForm<ServiceForm>({
    resolver: zodResolver(serviceSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      groupId: "",
      categoryId: "",
      title: "",
      slug: "",
      shortDesc: "",
      fullDesc: "",
      price: "",
      priceType: "fixed",
      durationMin: "",
      sessionsCount: "1",
      coverImage: "",
      isActive: true,
      isFeatured: false,
      displayOrder: "0",
      images: [],
      faqs: [],
    },
  });

  const images = useFieldArray({ control: form.control, name: "images" });
  const faqs = useFieldArray({ control: form.control, name: "faqs" });

  useEffect(() => {
    if (editing) {
      form.reset({
        groupId: editing.groupId,
        categoryId: editing.categoryId,
        title: editing.title,
        slug: editing.slug,
        shortDesc: editing.shortDesc ?? "",
        fullDesc: editing.fullDesc ?? "",
        price: editing.price === null ? "" : String(editing.price),
        priceType: editing.priceType,
        durationMin:
          editing.durationMin === null ? "" : String(editing.durationMin),
        sessionsCount: String(editing.sessionsCount),
        coverImage: editing.coverImage ?? "",
        isActive: editing.isActive,
        isFeatured: editing.isFeatured,
        displayOrder: String(editing.displayOrder),
        images: editing.images.map((image) => ({
          imageUrl: image.imageUrl,
          type: image.type,
        })),
        faqs: editing.faqs.map((faq) => ({
          question: faq.question,
          answer: faq.answer,
        })),
      });
    } else {
      form.reset({
        groupId: "",
        categoryId: "",
        title: "",
        slug: "",
        shortDesc: "",
        fullDesc: "",
        price: "",
        priceType: "fixed",
        durationMin: "",
        sessionsCount: "1",
        coverImage: "",
        isActive: true,
        isFeatured: false,
        displayOrder: "0",
        images: [],
        faqs: [],
      });
    }
  }, [editing, form]);

  const title = useWatch({ control: form.control, name: "title" });
  const groupId = useWatch({ control: form.control, name: "groupId" });
  const priceType = useWatch({ control: form.control, name: "priceType" });
  const categoryId = useWatch({ control: form.control, name: "categoryId" });
  const isActive = useWatch({ control: form.control, name: "isActive" });
  const isFeatured = useWatch({ control: form.control, name: "isFeatured" });
  const watchedImages = useWatch({ control: form.control, name: "images" });

  const groupOptions = summary.groups.map((group) => ({
    value: group.id,
    label: group.name,
  }));
  const categoryOptions = summary.categories
    .filter((category) => category.groupId === groupId)
    .map((category) => ({ value: category.id, label: category.name }));

  const close = () => {
    form.reset();
    setDiscardOpen(false);
    closeServiceDialog();
  };

  const requestClose = (nextOpen: boolean) => {
    if (nextOpen) {
      closeServiceDialog();
    } else if (form.formState.isDirty) {
      setDiscardOpen(true);
    } else {
      close();
    }
  };

  const submit = async (values: ServiceForm) => {
    const payload = {
      categoryId: values.categoryId,
      title: values.title,
      slug: values.slug || slugify(values.title),
      shortDesc: values.shortDesc || null,
      fullDesc: values.fullDesc || null,
      price:
        values.priceType === "on_request" || values.price === ""
          ? null
          : Number(values.price),
      priceType: values.priceType,
      durationMin:
        values.durationMin === "" ? null : Number(values.durationMin),
      sessionsCount: Number(values.sessionsCount),
      coverImage: values.coverImage || null,
      isActive: values.isActive,
      isFeatured: values.isFeatured,
      displayOrder: values.displayOrder ? Number(values.displayOrder) : 0,
      images: values.images.map((image, index) => ({
        imageUrl: image.imageUrl,
        type: image.type,
        displayOrder: index,
      })),
      faqs: values.faqs.map((faq, index) => ({
        question: faq.question,
        answer: faq.answer,
        displayOrder: index,
      })),
    };
    const result = editing
      ? await updateService(editing.id, payload)
      : await createService(payload);
    if (result.ok) close();
  };

  const errorText = (field: keyof ServiceForm) => {
    if (!form.formState.errors[field]) return null;
    if (field === "slug") return t("servicesCatalog.serviceForm.errors.slug");
    if (field === "price") return t("servicesCatalog.serviceForm.errors.price");
    if (field === "durationMin")
      return t("servicesCatalog.serviceForm.errors.duration");
    if (field === "sessionsCount")
      return t("servicesCatalog.serviceForm.errors.sessions");
    if (field === "displayOrder")
      return t("servicesCatalog.serviceForm.errors.displayOrder");
    if (field === "categoryId")
      return t("servicesCatalog.serviceForm.errors.category");
    if (field === "groupId")
      return t("servicesCatalog.serviceForm.errors.group");
    return t("servicesCatalog.serviceForm.errors.title");
  };

  return (
    <>
      <Dialog open={serviceDialog !== null} onOpenChange={requestClose}>
        <DialogContent
          closeLabel={t("servicesCatalog.dialog.cancel")}
          className="gap-0 overflow-y-auto p-0 max-w-none w-full max-h-[92dvh] md:max-w-3xl md:rounded-lg"
        >
          <div className="border-b border-border-primary bg-surface-tertiary/35 px-6 pb-5 pt-7 sm:px-8">
            <DialogHeader className="gap-2 pe-8">
              <DialogTitle className="text-dash-heading font-bold tracking-tight text-accent">
                {editing
                  ? t("servicesCatalog.serviceForm.editTitle")
                  : t("servicesCatalog.serviceForm.title")}
              </DialogTitle>
              <DialogDescription className="max-w-md text-dash-body-sm leading-6">
                {editing
                  ? t("servicesCatalog.serviceForm.editDescription")
                  : t("servicesCatalog.serviceForm.description")}
              </DialogDescription>
            </DialogHeader>
          </div>

          <form
            onSubmit={(event) => void form.handleSubmit(submit)(event)}
            className="grid gap-5 px-6 py-6 sm:px-8"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label={t("servicesCatalog.serviceForm.group")}
                error={form.formState.errors.groupId ? errorText("groupId") : null}
                required
              >
                <SelectField
                  value={groupId}
                  onValueChange={(value) => {
                    form.setValue("groupId", value);
                    form.setValue("categoryId", "");
                  }}
                  placeholder={t("servicesCatalog.serviceForm.groupPlaceholder")}
                  invalid={Boolean(form.formState.errors.groupId)}
                  options={groupOptions}
                  optionLabel={(value) =>
                    summary.groups.find((g) => g.id === value)?.name ?? value
                  }
                />
              </Field>
              <Field
                label={t("servicesCatalog.serviceForm.category")}
                error={form.formState.errors.categoryId ? errorText("categoryId") : null}
                required
              >
                <SelectField
                  value={categoryId}
                  onValueChange={(value) => form.setValue("categoryId", value)}
                  placeholder={t("servicesCatalog.serviceForm.categoryPlaceholder")}
                  invalid={Boolean(form.formState.errors.categoryId)}
                  disabled={!groupId}
                  options={categoryOptions}
                  optionLabel={(value) =>
                    summary.categories.find((c) => c.id === value)?.name ?? value
                  }
                />
              </Field>
            </div>

            <Field
              label={t("servicesCatalog.serviceForm.titleLabel")}
              error={form.formState.errors.title ? errorText("title") : null}
              required
            >
              <input
                autoFocus
                {...form.register("title")}
                placeholder={t("servicesCatalog.serviceForm.titlePlaceholder")}
                className={inputClass(Boolean(form.formState.errors.title))}
              />
            </Field>

            <Field
              label={t("servicesCatalog.serviceForm.slug")}
              error={form.formState.errors.slug ? errorText("slug") : null}
              hint={t("servicesCatalog.serviceForm.slugHint")}
              required
            >
              <input
                dir="ltr"
                {...form.register("slug")}
                placeholder={slugify(title) || "microdermabrasion"}
                className={inputClass(Boolean(form.formState.errors.slug))}
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label={t("servicesCatalog.serviceForm.priceType")}
                required
              >
                <SelectField
                  value={priceType}
                  onValueChange={(value) =>
                    form.setValue(
                      "priceType",
                      value as ServiceForm["priceType"],
                    )
                  }
                  placeholder={t("servicesCatalog.serviceForm.priceType")}
                  options={PRICE_TYPES.map((type) => ({
                    value: type,
                    label: t(`servicesCatalog.priceTypes.${type}`),
                  }))}
                  optionLabel={(value) =>
                    t(`servicesCatalog.priceTypes.${value}`)
                  }
                />
              </Field>
              <Field
                label={t("servicesCatalog.serviceForm.price")}
                error={form.formState.errors.price ? errorText("price") : null}
                hint={
                  priceType === "on_request"
                    ? t("servicesCatalog.serviceForm.priceOnRequestHint")
                    : undefined
                }
              >
                <input
                  dir="ltr"
                  inputMode="numeric"
                  disabled={priceType === "on_request"}
                  {...form.register("price")}
                  placeholder="0"
                  className={`${inputClass(Boolean(form.formState.errors.price))} disabled:opacity-50`}
                />
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              <Field
                label={t("servicesCatalog.serviceForm.duration")}
                error={
                  form.formState.errors.durationMin
                    ? errorText("durationMin")
                    : null
                }
              >
                <input
                  dir="ltr"
                  inputMode="numeric"
                  {...form.register("durationMin")}
                  placeholder="30"
                  className={inputClass(Boolean(form.formState.errors.durationMin))}
                />
              </Field>
              <Field
                label={t("servicesCatalog.serviceForm.sessions")}
                error={
                  form.formState.errors.sessionsCount
                    ? errorText("sessionsCount")
                    : null
                }
              >
                <input
                  dir="ltr"
                  inputMode="numeric"
                  {...form.register("sessionsCount")}
                  className={inputClass(Boolean(form.formState.errors.sessionsCount))}
                />
              </Field>
              <Field
                label={t("servicesCatalog.serviceForm.displayOrder")}
                error={
                  form.formState.errors.displayOrder
                    ? errorText("displayOrder")
                    : null
                }
              >
                <input
                  dir="ltr"
                  inputMode="numeric"
                  {...form.register("displayOrder")}
                  className={inputClass(Boolean(form.formState.errors.displayOrder))}
                />
              </Field>
            </div>

            <Field label={t("servicesCatalog.serviceForm.shortDesc")}>
              <textarea
                {...form.register("shortDesc")}
                rows={2}
                className={`${inputClass(Boolean(form.formState.errors.shortDesc))} resize-y`}
              />
            </Field>

            <Field label={t("servicesCatalog.serviceForm.fullDesc")}>
              <textarea
                {...form.register("fullDesc")}
                rows={4}
                className={`${inputClass(Boolean(form.formState.errors.fullDesc))} resize-y`}
              />
            </Field>

            <Field label={t("servicesCatalog.serviceForm.coverImage")}>
              <input
                dir="ltr"
                {...form.register("coverImage")}
                placeholder="https://..."
                className={inputClass(Boolean(form.formState.errors.coverImage))}
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={t("servicesCatalog.serviceForm.isActive")}>
                <SelectField
                  value={isActive ? "true" : "false"}
                  onValueChange={(value) =>
                    form.setValue("isActive", value === "true")
                  }
                  placeholder={t("servicesCatalog.serviceForm.isActive")}
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
              <Field label={t("servicesCatalog.serviceForm.isFeatured")}>
                <SelectField
                  value={isFeatured ? "true" : "false"}
                  onValueChange={(value) =>
                    form.setValue("isFeatured", value === "true")
                  }
                  placeholder={t("servicesCatalog.serviceForm.isFeatured")}
                  options={[
                    { value: "true", label: t("servicesCatalog.featured.yes") },
                    { value: "false", label: t("servicesCatalog.featured.no") },
                  ]}
                  optionLabel={(value) =>
                    value === "true"
                      ? t("servicesCatalog.featured.yes")
                      : t("servicesCatalog.featured.no")
                  }
                />
              </Field>
            </div>

            <div className="rounded-control border border-border-primary bg-surface-tertiary/30 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="flex items-center gap-2 text-dash-body-sm font-bold text-accent">
                  <ImagePlus className="size-4 text-copper-strong" aria-hidden="true" />
                  {t("servicesCatalog.serviceForm.imagesTitle")}
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    images.append({ imageUrl: "", type: "gallery" })
                  }
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-pill border border-border-interactive px-3 text-dash-caption font-bold text-accent transition hover:bg-surface-tertiary"
                >
                  <Plus className="size-3.5" aria-hidden="true" />
                  {t("servicesCatalog.serviceForm.addImage")}
                </button>
              </div>
              {images.fields.length === 0 ? (
                <p className="mt-3 text-dash-caption text-content-tertiary">
                  {t("servicesCatalog.serviceForm.imagesEmpty")}
                </p>
              ) : (
                <div className="mt-3 grid gap-2.5">
                  {images.fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid gap-2 rounded-control border border-border-primary bg-surface-secondary p-2 sm:grid-cols-[1fr_9rem_auto] sm:items-center"
                    >
                      <input
                        dir="ltr"
                        placeholder={t("servicesCatalog.serviceForm.imageUrlPlaceholder")}
                        {...form.register(`images.${index}.imageUrl`)}
                        className={inputClass(
                          Boolean(form.formState.errors.images?.[index]?.imageUrl),
                        )}
                      />
                      <SelectField
                        value={watchedImages?.[index]?.type}
                        onValueChange={(value) =>
                          form.setValue(
                            `images.${index}.type`,
                            value as ServiceForm["images"][number]["type"],
                          )
                        }
                        placeholder={t("servicesCatalog.serviceForm.imageType")}
                        options={IMAGE_TYPES.map((type) => ({
                          value: type,
                          label: t(`servicesCatalog.imageTypes.${type}`),
                        }))}
                        optionLabel={(value) =>
                          t(`servicesCatalog.imageTypes.${value}`)
                        }
                      />
                      <button
                        type="button"
                        onClick={() => images.remove(index)}
                        aria-label={t("servicesCatalog.serviceForm.removeImage")}
                        className="inline-flex size-9 items-center justify-center justify-self-end rounded-pill text-error transition hover:bg-error/10"
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-control border border-border-primary bg-surface-tertiary/30 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="flex items-center gap-2 text-dash-body-sm font-bold text-accent">
                  <MessageSquareText className="size-4 text-copper-strong" aria-hidden="true" />
                  {t("servicesCatalog.serviceForm.faqsTitle")}
                </h3>
                <button
                  type="button"
                  onClick={() => faqs.append({ question: "", answer: "" })}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-pill border border-border-interactive px-3 text-dash-caption font-bold text-accent transition hover:bg-surface-tertiary"
                >
                  <Plus className="size-3.5" aria-hidden="true" />
                  {t("servicesCatalog.serviceForm.addFaq")}
                </button>
              </div>
              {faqs.fields.length === 0 ? (
                <p className="mt-3 text-dash-caption text-content-tertiary">
                  {t("servicesCatalog.serviceForm.faqsEmpty")}
                </p>
              ) : (
                <div className="mt-3 grid gap-2.5">
                  {faqs.fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid gap-2 rounded-control border border-border-primary bg-surface-secondary p-2"
                    >
                      <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
                        <input
                          placeholder={t("servicesCatalog.serviceForm.faqQuestionPlaceholder")}
                          {...form.register(`faqs.${index}.question`)}
                          className={inputClass(
                            Boolean(form.formState.errors.faqs?.[index]?.question),
                          )}
                        />
                        <button
                          type="button"
                          onClick={() => faqs.remove(index)}
                          aria-label={t("servicesCatalog.serviceForm.removeFaq")}
                          className="inline-flex size-9 items-center justify-center justify-self-end rounded-pill text-error transition hover:bg-error/10"
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        placeholder={t("servicesCatalog.serviceForm.faqAnswerPlaceholder")}
                        {...form.register(`faqs.${index}.answer`)}
                        className={`${inputClass(Boolean(form.formState.errors.faqs?.[index]?.answer))} resize-y`}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

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
                    ? t("servicesCatalog.serviceForm.save")
                    : t("servicesCatalog.serviceForm.create")}
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
              {t("servicesCatalog.serviceForm.discardTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("servicesCatalog.serviceForm.discardDescription")}
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
              {t("servicesCatalog.serviceForm.discardConfirm")}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
