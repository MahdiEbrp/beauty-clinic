"use client";

import { useTranslations } from "next-intl";
import { Printer, X } from "lucide-react";
import { formatNumber } from "@/lib/services/format";

export type InvoiceItem = {
  title: string;
  slotDate: string;
  startTime: string;
  durationMin: number;
  amount: number;
};

export type InvoiceData = {
  invoiceNumber: string;
  groupRef: string;
  fullName: string;
  phone: string;
  paymentReference: string | null;
  items: InvoiceItem[];
  total: number;
  deposit: number;
  remaining: number;
  currency: string;
};

type Props = {
  data: InvoiceData;
  onClose: () => void;
  address: string;
  phoneDisplay: string;
};

/** Official printable invoice (Template parity). The on-screen shell is
 *  tokenized; the print paper keeps standard ink colours for a legible A4. */
export default function PrintInvoiceModal({ data, onClose, address, phoneDisplay }: Props) {
  const t = useTranslations("booking");
  const today = new Date().toLocaleDateString(data.currency === "تومان" ? "fa-IR" : "en-GB");

  const print = () => window.print();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("invoiceModal.title")}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-2 backdrop-blur-xs print:static print:block print:bg-white print:p-0 sm:p-4"
    >
      <div className="my-auto max-h-[96vh] w-full max-w-3xl flex-col overflow-hidden rounded-panel bg-white text-slate-900 shadow-elevation-4 print:h-auto print:w-full print:max-h-none print:rounded-none print:shadow-none print:m-0">
        {/* Top controls (hidden on print) */}
        <div className="flex shrink-0 items-center justify-between gap-3 bg-accent p-3 text-content-contrast print:hidden sm:p-4">
          <div className="flex items-center gap-2">
            <Printer className="size-5 text-copper" aria-hidden="true" />
            <h3 className="text-sm font-extrabold sm:text-base">{t("invoiceModal.title")}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={print}
              className="flex cursor-pointer items-center gap-1.5 rounded-control bg-copper px-4 py-2 text-xs font-black text-content-contrast shadow-elevation-1 transition-all hover:bg-copper-deep active:scale-95"
            >
              <Printer className="size-4" aria-hidden="true" />
              {t("invoiceModal.print")}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-control bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
              aria-label={t("invoiceModal.close")}
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Printable paper */}
        <div id="printable-invoice-content" className="space-y-6 overflow-y-auto bg-white p-6 text-slate-900 print:overflow-visible print:p-8 sm:p-10">
          {/* Invoice header */}
          <div className="flex flex-col justify-between gap-4 border-b-2 border-slate-900 pb-5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex size-14 items-center justify-center rounded-panel border border-copper bg-[#530916] text-2xl font-black text-[#fdf0e8] shadow-sm">
                ن
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-[#530916] sm:text-2xl">
                  {t("invoiceModal.clinicTitle")}
                </h1>
                <p className="mt-0.5 text-xs font-bold text-slate-600">{t("invoiceModal.license")}</p>
              </div>
            </div>

            <div className="space-y-1 rounded-control border border-slate-200 bg-slate-50 p-3 text-end text-xs">
              <div>
                <span className="font-medium text-slate-500">{t("invoiceModal.number")} </span>
                <span dir="ltr" className="font-black text-slate-900">{data.invoiceNumber}</span>
              </div>
              <div>
                <span className="font-medium text-slate-500">{t("invoiceModal.ref")} </span>
                <span dir="ltr" className="font-black text-[#530916]">{data.groupRef}</span>
              </div>
              <div>
                <span className="font-medium text-slate-500">{t("invoiceModal.issued")} </span>
                <span className="font-bold text-slate-900">{today}</span>
              </div>
            </div>
          </div>

          {/* Banner */}
          <div className="rounded-control border border-slate-300 bg-slate-100 py-2 text-center">
            <h2 className="text-base font-black text-slate-900 sm:text-lg">{t("invoiceModal.banner")}</h2>
          </div>

          {/* Client + payment */}
          <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
            <div className="space-y-2 rounded-control border border-slate-300 bg-slate-50/50 p-3.5">
              <div className="border-b border-slate-200 pb-1 font-black text-slate-900">{t("invoiceModal.client")}</div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="block text-[11px] text-slate-500">{t("invoiceModal.clientName")}</span>
                  <span className="text-sm font-black text-slate-900">{data.fullName}</span>
                </div>
                <div>
                  <span className="block text-[11px] text-slate-500">{t("invoiceModal.clientPhone")}</span>
                  <span dir="ltr" className="font-bold text-slate-900">{data.phone}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 rounded-control border border-slate-300 bg-slate-50/50 p-3.5">
              <div className="border-b border-slate-200 pb-1 font-black text-slate-900">{t("invoiceModal.payInfo")}</div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="block text-[11px] text-slate-500">{t("invoiceModal.gateway")}</span>
                  <span className="font-bold text-slate-900">{t("invoiceModal.gatewayVal")}</span>
                </div>
                <div>
                  <span className="block text-[11px] text-slate-500">{t("invoiceModal.depositStatus")}</span>
                  <span className="font-black text-[#530916]">{t("invoiceModal.depositVal")}</span>
                </div>
                <div>
                  <span className="block text-[11px] text-slate-500">{t("invoiceModal.rrn")}</span>
                  <span dir="ltr" className="font-bold text-slate-900">{data.paymentReference ?? "–"}</span>
                </div>
                <div>
                  <span className="block text-[11px] text-slate-500">{t("invoiceModal.cancelRule")}</span>
                  <span className="font-bold text-slate-700">{t("invoiceModal.cancelVal")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Services table */}
          <table className="w-full border-collapse overflow-hidden rounded-control border border-slate-300 text-xs">
            <thead>
              <tr className="bg-slate-800 font-black text-white">
                <th className="w-12 p-2.5 text-center">{t("invoiceModal.colIndex")}</th>
                <th className="p-2.5 text-right">{t("invoiceModal.colService")}</th>
                <th className="p-2.5 text-center">{t("invoiceModal.colWhen")}</th>
                <th className="p-2.5 text-center">{t("invoiceModal.colDuration")}</th>
                <th className="p-2.5 text-left">{t("invoiceModal.colAmount")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {data.items.map((item, index) => (
                <tr key={index} className="hover:bg-slate-50">
                  <td className="p-3 text-center font-bold text-slate-600">{index + 1}</td>
                  <td className="p-3 text-sm font-extrabold text-slate-900">{item.title}</td>
                  <td className="p-3 text-center font-bold text-slate-800">
                    <div>{item.slotDate}</div>
                    <div className="text-[11px] text-copper-deep">{t("invoiceModal.time", { time: item.startTime.slice(0, 5) })}</div>
                  </td>
                  <td className="p-3 text-center font-medium text-slate-600">{item.durationMin} min</td>
                  <td className="p-3 text-left text-sm font-black text-slate-900">{formatNumber(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-12">
            <div className="space-y-1.5 rounded-control border border-slate-200 bg-slate-50 p-3.5 text-[11px] leading-relaxed text-slate-700 sm:col-span-6">
              <div className="font-black text-slate-900">{t("invoiceModal.notesTitle")}</div>
              <p>• {t("invoiceModal.note1")}</p>
              <p>• {t("invoiceModal.note2")}</p>
              <p>• {t("invoiceModal.note3")}</p>
            </div>

            <div className="overflow-hidden rounded-control border-2 border-slate-300 text-xs sm:col-span-6">
              <div className="flex justify-between border-b border-slate-200 bg-slate-100 p-2.5">
                <span className="font-bold text-slate-700">{t("invoiceModal.total")}</span>
                <span className="font-black text-slate-900">{formatNumber(data.total)} {data.currency}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 bg-amber-50/70 p-2.5">
                <div>
                  <span className="block font-black text-[#530916]">{t("invoiceModal.deposit")}</span>
                  <span className="text-[10px] text-slate-500">{t("invoiceModal.depositHint")}</span>
                </div>
                <span className="text-base font-black text-[#530916]">{formatNumber(data.deposit)} {data.currency}</span>
              </div>
              <div className="flex justify-between bg-slate-900 p-3 text-white">
                <span className="text-sm font-extrabold">{t("invoiceModal.remaining")}</span>
                <span className="text-base font-black text-amber-300">{formatNumber(data.remaining)} {data.currency}</span>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-6 border-t border-slate-300 pt-4 text-center text-xs">
            <div className="flex h-28 flex-col justify-between rounded-control border border-dashed border-slate-300 p-4">
              <span className="font-bold text-slate-500">{t("invoiceModal.clientSign")}</span>
              <span className="text-[10px] text-slate-400">{t("invoiceModal.clientSignNote")}</span>
            </div>
            <div className="relative flex h-28 flex-col justify-between rounded-control border border-dashed border-slate-300 p-4">
              <span className="font-bold text-slate-500">{t("invoiceModal.clinicSign")}</span>
              <div className="mx-auto flex size-20 select-none -rotate-12 items-center justify-center rounded-full border-2 border-slate-300/80 text-[10px] text-slate-400">
                {t("invoiceModal.stamp")}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="space-y-1 border-t border-slate-200 pt-2 text-center text-[11px] text-slate-500">
            <div className="font-bold text-slate-700">
              {t("invoiceModal.addressLabel")}: {address} • {t("invoiceModal.phoneLabel")}: {phoneDisplay}
            </div>
            <div>{t("invoiceModal.footer")}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
