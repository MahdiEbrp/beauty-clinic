"use client";

import { useState, type SyntheticEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/src/i18n/navigation";
import { Save } from "lucide-react";

import type { AdminRule } from "@/lib/services/rules-types";

interface Props {
  rule?: AdminRule;
}

const iconOptions = [
  "clock", "sparkles", "car", "users", "hourglass", "calendarX",
  "shield", "fileText", "mapPin", "phone", "calendar", "userCheck", "creditCard",
];

const colorOptions = [
  "peach", "gold", "copper", "rose", "sand", "accent",
];

export default function CreateRulesForm({ rule }: Props) {
  const t = useTranslations("dashboardRules");
  const router = useRouter();
  const isEdit = Boolean(rule);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [slug, setSlug] = useState(rule?.slug ?? "");
  const [icon, setIcon] = useState(rule?.icon ?? "");
  const [image, setImage] = useState(rule?.image ?? "");
  const [color, setColor] = useState(rule?.color ?? "peach");
  const [highlighted, setHighlighted] = useState(rule?.highlighted ?? false);
  const [displayOrder, setDisplayOrder] = useState(rule?.displayOrder ?? 0);
  const [isActive, setIsActive] = useState(rule?.isActive ?? true);

  const [faName, setFaName] = useState(rule?.translations?.fa?.name ?? "");
  const [faDesc, setFaDesc] = useState(rule?.translations?.fa?.description ?? "");
  const [enName, setEnName] = useState(rule?.translations?.en?.name ?? "");
  const [enDesc, setEnDesc] = useState(rule?.translations?.en?.description ?? "");

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const body: Record<string, unknown> = {
      slug,
      icon: icon || null,
      image: image || null,
      color,
      highlighted,
      displayOrder: Number(displayOrder),
      isActive,
      translations: {
        fa: { name: faName, description: faDesc || null },
        en: { name: enName, description: enDesc || null },
      },
    };

    try {
      const res = await fetch(
        isEdit && rule ? `/api/v1/rules/${rule.id}` : "/api/v1/rules",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as {
          error?: { message?: string };
        };
        throw new Error(err?.error?.message ?? "save_failed");
      }
      router.push("/dashboard/rules");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error && err.message !== "save_failed"
        ? err.message
        : t("form.saveError"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-heading-2 text-accent">
          {isEdit ? t("editRule.title") : t("addRule.title")}
        </h1>
        <p className="text-body-sm text-content-secondary mt-1">
          {isEdit ? t("editRule.subtitle") : t("addRule.subtitle")}
        </p>
      </div>

      {error && (
        <p className="text-body-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-body-sm font-medium text-content-primary mb-1">
            {t("fields.slug.label")}
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full rounded-control border border-border-primary bg-surface-secondary px-3 py-2 text-body-sm text-content-primary"
            placeholder={t("fields.slug.placeholder")}
            required
          />
        </div>

        <div>
          <label className="block text-body-sm font-medium text-content-primary mb-1">
            {t("fields.icon.label")}
          </label>
          <select
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="w-full rounded-control border border-border-primary bg-surface-secondary px-3 py-2 text-body-sm text-content-primary"
          >
            <option value="">{t("form.defaultIcon")}</option>
            {iconOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-body-sm font-medium text-content-primary mb-1">
            {t("fields.image.label")}
          </label>
          <input
            type="url"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="w-full rounded-control border border-border-primary bg-surface-secondary px-3 py-2 text-body-sm text-content-primary"
            placeholder={t("fields.image.placeholder")}
          />
        </div>

        <div>
          <label className="block text-body-sm font-medium text-content-primary mb-1">
            {t("fields.color.label")}
          </label>
          <select
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-full rounded-control border border-border-primary bg-surface-secondary px-3 py-2 text-body-sm text-content-primary"
          >
            {colorOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end gap-4">
          <label className="flex items-center gap-2 text-body-sm text-content-primary">
            <input
              type="checkbox"
              checked={highlighted}
              onChange={(e) => setHighlighted(e.target.checked)}
            />
            {t("fields.highlighted.label")}
          </label>

          <label className="flex items-center gap-2 text-body-sm text-content-primary">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            {isActive ? t("active") : t("inactive")}
          </label>
        </div>

        <div>
          <label className="block text-body-sm font-medium text-content-primary mb-1">
            {t("fields.displayOrder.label")}
          </label>
          <input
            type="number"
            min={0}
            value={displayOrder}
            onChange={(e) => setDisplayOrder(Number(e.target.value))}
            className="w-full rounded-control border border-border-primary bg-surface-secondary px-3 py-2 text-body-sm text-content-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-body-sm font-medium text-content-primary">
            {t("fields.translations.fa")}
          </label>
          <input
            type="text"
            placeholder={t("fields.name.placeholder")}
            value={faName}
            onChange={(e) => setFaName(e.target.value)}
            className="w-full rounded-control border border-border-primary bg-surface-secondary px-3 py-2 text-body-sm text-content-primary"
            required
          />
          <textarea
            placeholder={t("fields.description.placeholder")}
            value={faDesc}
            onChange={(e) => setFaDesc(e.target.value)}
            className="w-full rounded-control border border-border-primary bg-surface-secondary px-3 py-2 text-body-sm text-content-primary"
            rows={4}
          />
        </div>
        <div className="space-y-2">
          <label className="block text-body-sm font-medium text-content-primary">
            {t("fields.translations.en")}
          </label>
          <input
            type="text"
            placeholder={t("fields.name.placeholder")}
            value={enName}
            onChange={(e) => setEnName(e.target.value)}
            className="w-full rounded-control border border-border-primary bg-surface-secondary px-3 py-2 text-body-sm text-content-primary"
            required
          />
          <textarea
            placeholder={t("fields.description.placeholder")}
            value={enDesc}
            onChange={(e) => setEnDesc(e.target.value)}
            className="w-full rounded-control border border-border-primary bg-surface-secondary px-3 py-2 text-body-sm text-content-primary"
            rows={4}
          />
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-control bg-accent px-5 py-2.5 text-body-sm font-bold text-content-contrast shadow-elevation-1 transition hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-60"
        >
          <Save className="size-4" />
          {isSaving
            ? t("form.saving")
            : isEdit
              ? t("save.update")
              : t("save.create")}
        </button>
        <button
          type="button"
          onClick={() => router.push("/dashboard/rules")}
          className="inline-flex min-h-11 items-center justify-center rounded-control border border-border-primary px-5 py-2.5 text-body-sm font-bold text-content-secondary hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-accent"
        >
          {t("cancel")}
        </button>
      </div>
    </form>
  );
}
