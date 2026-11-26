"use client";

import { toast } from "sonner";

type ExportFilters = {
  search: string;
  status: string;
  locale: "fa" | "en";
};

type ExportMessages = {
  exporting: string;
  success: string;
  error: string;
};

function parseDownloadFilename(header: string | null): string {
  if (header) {
    const match = /filename="?([^";\n]+)"?/i.exec(header);
    if (match?.[1]) return match[1].trim();
  }
  return `reservations-${new Date().toISOString().slice(0, 10)}.xlsx`;
}

export async function downloadBookingsExcel(
  filters: ExportFilters,
  messages: ExportMessages,
): Promise<void> {
  const toastId = toast.loading(messages.exporting);
  try {
    const params = new URLSearchParams({
      locale: filters.locale,
      status: filters.status || "all",
    });
    if (filters.search) params.set("search", filters.search);
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz) params.set("tz", tz);

    const res = await fetch(`/api/v1/bookings/export?${params.toString()}`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("export_failed");

    const blob = await res.blob();
    const filename = parseDownloadFilename(res.headers.get("content-disposition"));
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    toast.success(messages.success, { id: toastId });
  } catch {
    toast.error(messages.error, { id: toastId });
  }
}
