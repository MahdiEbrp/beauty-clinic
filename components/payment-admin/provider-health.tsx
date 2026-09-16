"use client";

import { HeartPulse } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useAdminListContext } from "@/components/admin-list/context";
import { msgKey } from "@/src/i18n/message-key";
import { PAYMENT_API_ROUTES } from "@/lib/payment/constants";
import type { PaymentProviderAdmin } from "@/lib/payment/admin-types";

const HEALTH_CLASS: Record<string, string> = {
  healthy: "bg-success/10 text-success border-success/30",
  unhealthy: "bg-error/10 text-error border-error/30",
  unknown: "bg-surface-tertiary text-content-secondary border-border-primary",
};

function formatHealthDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${y}/${m}/${day} ${hh}:${mm}`;
}

export function ProviderHealthCell({ row }: { row: PaymentProviderAdmin }) {
  const t = useTranslations();
  const ctx = useAdminListContext<PaymentProviderAdmin>();
  const { canManage, load, debouncedSearch, status, page } = ctx;

  const test = async () => {
    try {
      const res = await fetch(
        `${PAYMENT_API_ROUTES.providers}/${row.id}/test`,
        { method: "POST", credentials: "include" },
      );
      const json = (await res.json().catch(() => null)) as {
        data?: { isSuccessful: boolean; error?: string };
        error?: { message?: string };
      };
      if (res.ok) {
        toast.success(t(msgKey("paymentAdmin.toast.healthChecked")));
      } else {
        toast.error(
          json?.error?.message ??
            t(msgKey("paymentAdmin.toast.healthCheckFailed")),
        );
      }
      void load({ search: debouncedSearch, status, page });
    } catch {
      toast.error(t(msgKey("paymentAdmin.toast.healthCheckFailed")));
    }
  };

  return (
    <div className="flex min-w-0 items-center gap-2">
      <span
        className={`inline-flex items-center gap-1 rounded-pill border px-2 py-0.5 text-dash-caption font-bold ${
          HEALTH_CLASS[row.healthStatus] ?? HEALTH_CLASS.unknown
        }`}
      >
        <span className="size-2 shrink-0 rounded-full bg-current" />
        {t(msgKey(`paymentAdmin.health.${row.healthStatus}`))}
      </span>
      {row.lastHealthCheckedAt && (
        <span className="truncate text-dash-caption text-content-tertiary">
          {formatHealthDate(row.lastHealthCheckedAt)}
        </span>
      )}
      {canManage && (
        <button
          type="button"
          disabled={ctx.isSyncing(row.id)}
          onClick={(e) => {
            e.stopPropagation();
            void test();
          }}
          title={t(msgKey("paymentAdmin.actions.test"))}
          className="inline-flex min-h-9 shrink-0 items-center justify-center rounded-pill bg-accent/10 px-2.5 text-dash-caption font-bold text-accent transition hover:bg-accent/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-40"
        >
          <HeartPulse className="size-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

/**
 * Compact health status for the mobile card (no test button).
 */
export function ProviderHealthBadge({
  healthStatus,
}: {
  healthStatus: string;
}) {
  const t = useTranslations();
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-pill border px-2 py-0.5 text-dash-caption font-bold ${
        HEALTH_CLASS[healthStatus] ?? HEALTH_CLASS.unknown
      }`}
    >
      <span className="size-2 shrink-0 rounded-full bg-current" />
      {t(msgKey(`paymentAdmin.health.${healthStatus}`))}
    </span>
  );
}