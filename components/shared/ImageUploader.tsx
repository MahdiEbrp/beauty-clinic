"use client";

import { useEffect, useRef, useState } from "react";
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
    if (!file.type.startsWith("image/")) {
      setError("فرمت فایل باید تصویر باشد.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("حجم تصویر باید کمتر از ۱۰ مگابایت باشد.");
      return;
    }

    const preview = URL.createObjectURL(file);
    setLocalPreview(preview);
    setUploading(true);
    try {
      const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      const filename = `image-${crypto.randomUUID()}.${extension}`;
      const form = new FormData();
      form.append("folder", "uploads/images");
      form.append("file", new File([file], filename, { type: file.type }));
      const response = await fetch("/api/v1/files/upload", {
        method: "POST",
        credentials: "include",
        body: form,
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: { code?: string };
        } | null;
        throw new Error(payload?.error?.code === "FORBIDDEN"
          ? "دسترسی آپلود فایل برای حساب شما فعال نیست."
          : "آپلود تصویر انجام نشد. دوباره تلاش کنید.");
      }
      onChange(`/uploads/images/${filename}`);
      setLocalPreview("");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "آپلود تصویر انجام نشد.");
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
        <span className="text-dash-caption text-content-tertiary">PNG، JPG، WEBP · حداکثر ۱۰ مگابایت</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept="image/*"
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
          {uploading ? "در حال آپلود..." : "انتخاب و آپلود تصویر"}
        </button>
        {value && (
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
            حذف تصویر
          </button>
        )}
      </div>
      {hint && <p className="text-dash-caption text-content-secondary">{hint}</p>}
      {error && <p role="alert" className="text-dash-caption text-error">{error}</p>}
      {preview ? (
        <div className="relative max-w-xl overflow-hidden rounded-card border border-border-primary bg-surface-tertiary/40">
          <img src={preview} alt="پیش‌نمایش تصویر انتخاب‌شده" className="max-h-64 w-full object-contain" />
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/45 text-white">
              <span className="inline-flex items-center gap-2 text-sm font-semibold">
                <Loader2 className="size-4 animate-spin" /> در حال ذخیره تصویر
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="flex min-h-28 max-w-xl items-center justify-center gap-2 rounded-card border border-dashed border-border-primary bg-surface-tertiary/30 text-dash-caption text-content-tertiary">
          <ImagePlus className="size-5" />
          <span>هنوز تصویری انتخاب نشده است</span>
        </div>
      )}
      <label htmlFor={`${id}-url`} className="text-dash-caption font-medium text-content-secondary">
        یا آدرس تصویر را وارد کنید
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
