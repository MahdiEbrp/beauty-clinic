"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Link } from "@/src/i18n/navigation";
import { PAYMENT_API_ROUTES, PAYMENT_LIMITS } from "@/lib/payment/constants";
import { PaymentSelect } from "./PaymentSelect";

type Provider = { id: string; name: string; kind: string; merchantLast4: string; isActive: boolean; isDefault: boolean; healthStatus: string };

export function PaymentProvidersContent() {
  const t = useTranslations("paymentAdmin");
  const [items, setItems] = useState<Provider[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), perPage: String(PAYMENT_LIMITS.providerListPerPageDefault), search, status });
    const res = await fetch(`${PAYMENT_API_ROUTES.providers}?${params}`, { credentials: "include" });
    const json = await res.json().catch(() => null);
    if (res.ok && json?.data) {
      setItems(json.data.items ?? []);
      setTotalPages(json.data.totalPages ?? 1);
    } else {
      toast.error(t("errors.loadFailed" as never));
    }
    setLoading(false);
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status]);

  const onSearch = () => {
    setPage(1);
    void load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex gap-2">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("search.placeholder" as never)} className="h-11 rounded-control border border-form-input-border bg-surface-secondary px-3 text-dash-body-sm focus-visible:outline-accent" />
          <button onClick={onSearch} className="h-11 rounded-pill bg-accent px-4 text-on-primary text-dash-body-sm font-semibold">Search</button>
        </div>
        <PaymentSelect value={status} onValueChange={(v) => setStatus(v as any)} options={[{ value: "all", label: "All" }, { value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }]} placeholder="Status" ariaLabel="Status" />
      </div>

      {loading ? (
        <p className="text-dash-body-sm text-content-secondary">Loading...</p>
      ) : items.length === 0 ? (
        <div className="rounded-panel border border-dashed border-surface-variant/50 bg-surface-secondary p-8 text-center">
          <p className="text-dash-body text-content-secondary">{t("empty" as never)}</p>
          <Link href="/dashboard/payment/providers/add" className="mt-4 inline-flex h-11 items-center rounded-pill bg-accent px-6 text-on-primary text-dash-body-sm font-semibold">Add Provider</Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-panel border border-surface-variant/50 bg-surface-secondary shadow-elevation-2">
          <div className="divide-y divide-surface-variant/50">
            {items.map((p) => (
              <div key={p.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-dash-body font-semibold text-content-primary">{p.name}</p>
                  <p className="text-dash-body-sm text-content-secondary">{p.kind} • •••• {p.merchantLast4} {p.isDefault ? "• Default" : ""} {p.isActive ? "" : "• Inactive"}</p>
                  <p className="text-dash-caption text-content-tertiary">{p.healthStatus}</p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/dashboard/payment/providers/${p.id}/edit`} className="h-9 rounded-pill border border-surface-variant/50 px-4 text-dash-body-sm font-medium">Edit</Link>
                  <button
                    onClick={async () => {
                      const r = await fetch(`${PAYMENT_API_ROUTES.providers}/${p.id}/test`, { method: "POST", credentials: "include" });
                      const j = await r.json().catch(() => null);
                      if (r.ok) toast.success("Health check done");
                      else toast.error(j?.error?.message ?? "Check failed");
                      void load();
                    }}
                    className="h-9 rounded-pill bg-accent/10 px-4 text-dash-body-sm font-semibold text-accent"
                  >
                    Test
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between p-4">
            <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="h-9 rounded-pill border px-4 text-dash-body-sm disabled:opacity-50">Prev</button>
            <span className="text-dash-body-sm text-content-secondary">Page {page} of {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="h-9 rounded-pill border px-4 text-dash-body-sm disabled:opacity-50">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
