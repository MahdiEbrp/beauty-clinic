"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/lib/images/constants";

type ImageUploaderProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  label: string;
  hint?: string;
  placeholder?: string;
};

export default function ImageUploader({
  id,
  value,
  onChange,
  label,
  hint,
  placeholder,
}: ImageUploaderProps) {
  const t = useTranslations("imageUploader");
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<AbortController | null>(null);

  useEffect(() => () => uploadRef.current?.abort(), []);
  const [uploading, setUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!localPreview) return;
    return () => URL.revokeObjectURL(localPreview);
  }, [localPreview]);

  const chooseFile = async (file?: File) => {
    if (!file) return;
    setError("");
    if (!ALLOWED_IMAGE_TYPES.some((type) => type === file.type)) {
      setError(t("invalidType"));
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError(t("tooLarge"));
      return;
    }

    uploadRef.current?.abort();
    const controller = new AbortController();
    uploadRef.current = controller;
    const preview = URL.createObjectURL(file);
    setLocalPreview(preview);
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch("/api/v1/admin/images/upload", {
        method: "POST",
        credentials: "include",
        body: form,
        signal: controller.signal,
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: { code?: string };
        } | null;
        throw new Error(payload?.error?.code === "FORBIDDEN"
          ? t("forbidden")
          : t("failed"));
      }
      const payload = (await response.json()) as { data?: { url?: string } };
      if (!payload.data?.url) throw new Error(t("missingUrl"));
      if (controller.signal.aborted) return;
      onChange(payload.data.url);
      setLocalPreview("");
    } catch (uploadError) {
      if (controller.signal.aborted) return;
      setError(uploadError instanceof Error ? uploadError.message : t("failed"));
    } finally {
      if (!controller.signal.aborted) setUploading(false);
    }
  };

  const changeValue = (next: string) => {
    uploadRef.current?.abort();
    setUploading(false);
    setLocalPreview("");
    setError("");
    onChange(next);
  };

  const preview = localPreview || value.trim();

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label htmlFor={id} className="text-dash-body-sm font-semibold text-content-primary">
          {label}
        </label>
        <span className="text-dash-caption text-content-tertiary">{t("formats")}</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={ALLOWED_IMAGE_TYPES.join(",")}
          className="sr-only"
          disabled={uploading}
          onChange={(event) => {
            void chooseFile(event.target.files?.[0]);
            event.currentTarget.value = "";
          }}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-control bg-accent px-4 text-dash-body-sm font-bold text-content-contrast transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
          {uploading ? t("uploading") : t("choose")}
        </button>
        {(value || localPreview) && (
          <button
            type="button"
            onClick={() => {
              changeValue("");
            }}
            className="inline-flex min-h-11 items-center gap-2 rounded-control border border-border-primary px-3 text-dash-body-sm font-semibold text-content-secondary hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <Trash2 className="size-4" />
            {t("remove")}
          </button>
        )}
      </div>
      {hint && <p className="text-dash-caption text-content-secondary">{hint}</p>}
      {error && <p role="alert" className="text-dash-caption text-error">{error}</p>}
      {preview ? (
        <div className="relative max-w-xl overflow-hidden rounded-card border border-border-primary bg-surface-tertiary/40">
          <img src={preview} alt={t("preview")} className="max-h-64 w-full object-contain" />
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-accent-hover/80 text-content-contrast">
              <span className="inline-flex items-center gap-2 text-sm font-semibold">
                <Loader2 className="size-4 animate-spin" /> {t("saving")}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="flex min-h-28 max-w-xl items-center justify-center gap-2 rounded-card border border-dashed border-border-primary bg-surface-tertiary/30 text-dash-caption text-content-tertiary">
          <ImagePlus className="size-5" />
          <span>{t("empty")}</span>
        </div>
      )}
      <label htmlFor={`${id}-url`} className="text-dash-caption font-medium text-content-secondary">
        {t("urlLabel")}
      </label>
      <input
        id={`${id}-url`}
        dir="ltr"
        value={value}
        onChange={(event) => changeValue(event.target.value)}
        placeholder={placeholder || "https://..."}
        className="min-h-11 w-full rounded-control border border-border-primary bg-surface-primary px-3 text-dash-body-sm text-content-primary outline-none focus:border-border-interactive focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      />
    </div>
  );
}
