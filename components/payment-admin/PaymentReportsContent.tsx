"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { PAYMENT_API_ROUTES, PAYMENT_LIMITS } from "@/lib/payment/constants";
import { PaymentSelect } from "./PaymentSelect";

type Tx = { id: string; bookingGroupRef: string; amount: string; authority: string | null; refId: string | null; status: string; createdAt: string };

export function PaymentReportsContent() {
  const t = useTranslations("paymentReports");
  const [items, setItems] = useState<Tx[]>([]);
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), perPage: String(PAYMENT_LIMITS.transactionListPerPageDefault), status });
    const res = await fetch(`${PAYMENT_API_ROUTES.transactions}?${params}`, { credentials: "include" });
    const json = await res.json().catch(() => null);
    if (res.ok && json?.data) {
      setItems(json.data.items ?? []);
      setTotalPages(json.data.totalPages ?? 1);
    }
    setLoading(false);
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status]);

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <PaymentSelect value={status} onValueChange={(v) => { setStatus(v); setPage(1); }} options={[{ value: "all", label: "All" }, { value: "pending", label: "Pending" }, { value: "requested", label: "Requested" }, { value: "verified", label: "Verified" }, { value: "failed", label: "Failed" }]} placeholder="Status" ariaLabel="Status" />
      </div>
      {loading ? (
        <p className="text-dash-body-sm text-content-secondary">Loading...</p>
      ) : items.length === 0 ? (
        <div className="rounded-panel border border-dashed border-surface-variant/50 bg-surface-secondary p-8 text-center">
          <p className="text-dash-body text-content-secondary">{t("empty")}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-panel border border-surface-variant/50 bg-surface-secondary shadow-elevation-2">
          <div className="hidden sm:block">
            <div className="grid grid-cols-5 gap-4 bg-surface-tertiary/30 px-4 py-3 text-dash-caption font-bold uppercase tracking-wider text-content-secondary">
              <span>Group</span><span>Amount</span><span>Authority</span><span>Status</span><span>Date</span>
            </div>
            {items.map((tx) => (
              <div key={tx.id} className="grid grid-cols-5 gap-4 border-t border-surface-variant/50 px-4 py-3 text-dash-body-sm">
                <span className="font-medium text-content-primary">{tx.bookingGroupRef}</span>
                <span>{tx.amount} تومان</span>
                <span className="truncate" dir="ltr">{tx.authority ?? "-"}</span>
                <span className={`inline-flex w-fit rounded-pill px-2 py-0.5 text-dash-caption font-bold ${tx.status === "verified" ? "bg-success/10 text-success" : tx.status === "failed" ? "bg-error/10 text-error" : "bg-surface-tertiary text-content-secondary"}`}>{tx.status}</span>
                <span>{new Date(tx.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
          <div className="divide-y divide-surface-variant/50 sm:hidden">
            {items.map((tx) => (
              <div key={tx.id} className="p-4 space-y-2">
                <p className="text-dash-body font-semibold text-content-primary">{tx.bookingGroupRef} — {tx.amount} تومان</p>
                <p className="text-dash-body-sm text-content-secondary" dir="ltr">Auth: {tx.authority ?? "-"}</p>
                <p className="text-dash-caption">{tx.status} • {new Date(tx.createdAt).toLocaleDateString()}</p>
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
