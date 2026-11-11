"use client";

import { useState, type FormEvent } from "react";
import { Check, Pencil, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import type { AdminService } from "@/lib/services/types";
import { formatPrice } from "./helpers";
import { useServices } from "./services-context";

export function QuickPriceEditor({ service }: { service: AdminService }) {
  const t = useTranslations();
  const { canWrite, currency, load, debouncedSearch, status, featured, page } = useServices();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(service.price === null ? "" : String(service.price));
  const [saving, setSaving] = useState(false);

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = value.trim();
    const price = trimmed === "" ? null : Number(trimmed);
    if (price !== null && (!Number.isFinite(price) || price < 0 || price > 1_000_000_000)) {
      toast.error(t("serviceWizard.errors.priceInvalid"));
      return;
    }

    setSaving(true);
    const pending = toast.loading(t("serviceServices.toast.syncing"));
    try {
      const response = await fetch(`/api/v1/services/${service.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ price }),
      });
      if (!response.ok) throw new Error("price_update_failed");
      await load({ search: debouncedSearch, status, featured, page });
      toast.success(t("serviceServices.toast.success"), { id: pending });
      setEditing(false);
    } catch {
      toast.error(t("serviceServices.toast.error"), { id: pending });
    } finally {
      setSaving(false);
    }
  };

  if (!canWrite) {
    return (
      <span dir="ltr" className="text-dash-body-sm text-accent">
        {service.price === null ? t("serviceServices.price_on_request") : formatPrice(service.price, currency)}
      </span>
    );
  }

  if (!editing) {
    return (
      <div className="inline-flex items-center justify-center gap-2">
        <span dir="ltr" className="text-dash-body-sm text-accent">
          {service.price === null ? t("serviceServices.price_on_request") : formatPrice(service.price, currency)}
        </span>
        <button
          type="button"
          onClick={() => {
            setValue(service.price === null ? "" : String(service.price));
            setEditing(true);
          }}
          aria-label={t("serviceServices.actions.edit")}
          title={t("serviceServices.actions.edit")}
          className="inline-flex size-8 items-center justify-center rounded-full border border-border-primary text-content-secondary transition-colors hover:bg-surface-tertiary hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <Pencil className="size-3.5" aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={save} className="inline-flex items-center justify-center gap-1.5">
      <input
        autoFocus
        type="number"
        min="0"
        max="1000000000"
        step="1"
        inputMode="numeric"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        aria-label={t("serviceServices.table.price")}
        disabled={saving}
        className="h-9 w-28 rounded-control border border-form-input-border bg-form-input-bg px-2 text-center text-dash-body-sm text-accent outline-none focus-visible:border-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={saving}
        aria-label={t("serviceServices.dialog.confirm")}
        className="inline-flex size-8 items-center justify-center rounded-full bg-accent text-content-contrast transition-colors hover:bg-accent-hover disabled:opacity-50"
      >
        <Check className="size-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => {
          setValue(service.price === null ? "" : String(service.price));
          setEditing(false);
        }}
        disabled={saving}
        aria-label={t("serviceServices.dialog.cancel")}
        className="inline-flex size-8 items-center justify-center rounded-full border border-border-primary text-content-secondary transition-colors hover:bg-surface-tertiary disabled:opacity-50"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </form>
  );
}
