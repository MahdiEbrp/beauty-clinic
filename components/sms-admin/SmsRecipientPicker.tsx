"use client";

import { Check, ChevronLeft, ChevronRight, Search, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { inputClass, Panel } from "@/components/create-group/ui";
import { SMS_API_ROUTES, SMS_LIMITS } from "@/lib/sms/constants";
import type {
  ListSmsRecipientsResult,
  SmsRecipient,
} from "@/lib/sms/report-service";

export function SmsRecipientPicker({
  selected,
  onChange,
}: {
  selected: SmsRecipient[];
  onChange: (recipients: SmsRecipient[]) => void;
}) {
  const t = useTranslations("smsSend");
  const [data, setData] = useState<ListSmsRecipientsResult | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [audience, setAudience] = useState<"all" | "with_bookings">("all");
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const query = new URLSearchParams({
        page: String(page),
        perPage: String(SMS_LIMITS.recipientListPerPageDefault),
        audience,
      });
      if (search.trim()) query.set("search", search.trim());
      setLoading(true);
      setFailed(false);
      void fetch(`${SMS_API_ROUTES.recipients}?${query.toString()}`, {
        credentials: "include",
      })
        .then(async (response) => {
          if (!response.ok) throw new Error("request_failed");
          const payload = (await response.json()) as { data?: ListSmsRecipientsResult };
          if (!payload.data) throw new Error("invalid_response");
          setData(payload.data);
        })
        .catch(() => setFailed(true))
        .finally(() => setLoading(false));
    }, SMS_LIMITS.searchDebounceMs);
    return () => clearTimeout(timer);
  }, [page, search, audience]);

  const selectedIds = useMemo(() => new Set(selected.map((item) => item.id)), [selected]);
  const visible = data?.items ?? [];
  const allVisibleSelected = visible.length > 0 && visible.every((item) => selectedIds.has(item.id));

  function toggle(recipient: SmsRecipient) {
    if (selectedIds.has(recipient.id)) {
      onChange(selected.filter((item) => item.id !== recipient.id));
    } else {
      onChange([...selected, recipient]);
    }
  }

  function toggleVisible() {
    if (allVisibleSelected) {
      const visibleIds = new Set(visible.map((item) => item.id));
      onChange(selected.filter((item) => !visibleIds.has(item.id)));
    } else {
      const additions = visible.filter((item) => !selectedIds.has(item.id));
      onChange([...selected, ...additions]);
    }
  }

  return (
    <Panel>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="rounded-control bg-accent-subtle p-2 text-accent">
            <Users className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-dash-heading font-bold text-content-primary">{t("recipients.title")}</h3>
            <p className="mt-1 text-dash-body-sm text-content-secondary">{t("recipients.description")}</p>
          </div>
        </div>
        <span className="rounded-pill bg-accent-subtle px-3 py-1 text-dash-caption font-bold text-accent">
          {t("recipients.selected", { count: selected.length })}
        </span>
      </div>

      <div className="mt-5 flex flex-wrap gap-2" role="group">
        {(["all", "with_bookings"] as const).map((id) => {
          const active = audience === id;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={active}
              onClick={() => {
                setAudience(id);
                setPage(1);
              }}
              className={`inline-flex min-h-10 items-center rounded-pill border px-3 text-dash-caption font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                active
                  ? "border-accent bg-accent text-content-contrast"
                  : "border-border-interactive text-content-secondary hover:bg-surface-tertiary hover:text-accent"
              }`}
            >
              {id === "all"
                ? t("recipients.audienceAll")
                : t("recipients.audienceWithBookings")}
            </button>
          );
        })}
      </div>

      <div className="mt-5 relative">
        <Search className="pointer-events-none absolute inset-s-3 top-1/2 size-4 -translate-y-1/2 text-content-tertiary" aria-hidden="true" />
        <input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder={t("recipients.searchPlaceholder")}
          aria-label={t("recipients.search")}
          className={`${inputClass(false)} ps-10`}
        />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-b border-border-primary pb-3">
        <span className="text-dash-caption text-content-tertiary">{t("recipients.activeOnly")}</span>
        <button
          type="button"
          onClick={toggleVisible}
          disabled={loading || visible.length === 0}
          className="inline-flex min-h-10 items-center gap-2 rounded-pill border border-border-interactive px-3 text-dash-caption font-bold text-accent hover:bg-surface-tertiary disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <Check className="size-4" aria-hidden="true" />
          {allVisibleSelected ? t("recipients.clearPage") : t("recipients.selectPage")}
        </button>
      </div>

      {loading ? (
        <div className="space-y-3 py-5" aria-hidden="true">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-14 animate-pulse rounded-control bg-surface-tertiary" />
          ))}
        </div>
      ) : failed ? (
        <div role="alert" className="py-8 text-center text-dash-body-sm text-error">{t("recipients.error")}</div>
      ) : visible.length === 0 ? (
        <div className="py-8 text-center text-dash-body-sm text-content-secondary">{t("recipients.empty")}</div>
      ) : (
        <div className="divide-y divide-border-primary">
          {visible.map((recipient) => {
            const checked = selectedIds.has(recipient.id);
            return (
              <button
                key={recipient.id}
                type="button"
                aria-pressed={checked}
                onClick={() => toggle(recipient)}
                className="flex min-h-14 w-full items-center gap-3 py-3 text-start transition-colors hover:bg-surface-tertiary/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <span className={`flex size-5 shrink-0 items-center justify-center rounded-control border ${checked ? "border-accent bg-accent text-content-contrast" : "border-border-interactive"}`}>
                  {checked && <Check className="size-3.5" aria-hidden="true" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-dash-body-sm font-semibold text-content-primary">{recipient.fullName}</span>
                  <span dir="ltr" className="block truncate text-start text-dash-caption text-content-tertiary">{recipient.phone}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between gap-3 border-t border-border-primary pt-4">
          <button type="button" disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)} className="inline-flex min-h-10 items-center gap-1 rounded-pill border border-border-interactive px-3 text-dash-caption font-bold text-accent disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
            <ChevronLeft className="size-4 rtl-mirror" aria-hidden="true" /> {t("recipients.previous")}
          </button>
          <span className="text-dash-caption text-content-tertiary">{t("recipients.page", { page, totalPages: data.totalPages })}</span>
          <button type="button" disabled={page >= data.totalPages || loading} onClick={() => setPage((current) => current + 1)} className="inline-flex min-h-10 items-center gap-1 rounded-pill border border-border-interactive px-3 text-dash-caption font-bold text-accent disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
            {t("recipients.next")} <ChevronRight className="size-4 rtl-mirror" aria-hidden="true" />
          </button>
        </div>
      )}
    </Panel>
  );
}
