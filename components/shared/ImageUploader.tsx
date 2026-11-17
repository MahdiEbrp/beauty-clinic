"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";

type ImageUploaderProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  label: string;
  hint?: string;
  placeholder?: string;
};

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export default function ImageUploader({
  id,
  value,
  onChange,
  label,
  hint,
  placeholder,
}: ImageUploaderProps) {
  const locale = useLocale();
  const fa = locale === "fa";
  const inputRef = useRef<HTMLInputElement>(null);
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
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      setError(fa ? "فرمت فایل باید تصویر باشد." : "Please choose an image file.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError(fa ? "حجم تصویر باید کمتر از ۱۰ مگابایت باشد." : "Image size must be 10 MB or less.");
      return;
    }

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
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: { code?: string };
        } | null;
        throw new Error(payload?.error?.code === "FORBIDDEN"
          ? (fa ? "دسترسی آپلود تصویر برای حساب شما فعال نیست." : "Your account cannot upload images.")
          : (fa ? "آپلود تصویر انجام نشد. دوباره تلاش کنید." : "Image upload failed. Please try again."));
      }
      const payload = (await response.json()) as { data?: { url?: string } };
      if (!payload.data?.url) throw new Error(fa ? "آدرس تصویر دریافت نشد." : "The uploaded image URL was not returned.");
      onChange(payload.data.url);
      setLocalPreview("");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : (fa ? "آپلود تصویر انجام نشد." : "Image upload failed."));
    } finally {
      setUploading(false);
    }
  };

  const preview = localPreview || value.trim();

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label htmlFor={id} className="text-dash-body-sm font-semibold text-content-primary">
          {label}
        </label>
        <span className="text-dash-caption text-content-tertiary">{fa ? "PNG، JPG، WEBP، GIF · حداکثر ۱۰ مگابایت" : "PNG, JPG, WEBP, GIF · Max 10 MB"}</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
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
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-control bg-accent px-4 text-dash-body-sm font-bold text-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
          {uploading ? (fa ? "در حال آپلود..." : "Uploading...") : (fa ? "انتخاب و آپلود تصویر" : "Choose and upload image")}
        </button>
        {(value || localPreview) && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setLocalPreview("");
              setError("");
            }}
            className="inline-flex min-h-11 items-center gap-2 rounded-control border border-border-primary px-3 text-dash-body-sm font-semibold text-content-secondary hover:bg-surface-tertiary"
          >
            <Trash2 className="size-4" />
            {fa ? "حذف تصویر" : "Remove image"}
          </button>
        )}
      </div>
      {hint && <p className="text-dash-caption text-content-secondary">{hint}</p>}
      {error && <p role="alert" className="text-dash-caption text-error">{error}</p>}
      {preview ? (
        <div className="relative max-w-xl overflow-hidden rounded-card border border-border-primary bg-surface-tertiary/40">
          <img src={preview} alt={fa ? "پیش‌نمایش تصویر انتخاب‌شده" : "Selected image preview"} className="max-h-64 w-full object-contain" />
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/45 text-white">
              <span className="inline-flex items-center gap-2 text-sm font-semibold">
                <Loader2 className="size-4 animate-spin" /> {fa ? "در حال ذخیره تصویر" : "Saving image"}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="flex min-h-28 max-w-xl items-center justify-center gap-2 rounded-card border border-dashed border-border-primary bg-surface-tertiary/30 text-dash-caption text-content-tertiary">
          <ImagePlus className="size-5" />
          <span>{fa ? "هنوز تصویری انتخاب نشده است" : "No image selected yet"}</span>
        </div>
      )}
      <label htmlFor={`${id}-url`} className="text-dash-caption font-medium text-content-secondary">
        {fa ? "یا آدرس تصویر را وارد کنید" : "Or enter an image URL"}
      </label>
      <input
        id={`${id}-url`}
        dir="ltr"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder || "https://..."}
        className="min-h-11 w-full rounded-control border border-border-primary bg-surface-primary px-3 text-dash-body-sm text-content-primary outline-none focus:border-border-interactive"
      />
    </div>
  );
}
