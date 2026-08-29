import type { InvoiceData } from "./modals/PrintInvoiceModal";
import type { CartItem, ContactInfo, CreatedBookingGroup } from "./types";

type Totals = { total: number; deposit: number; remaining: number };

/** Builds a printable-invoice snapshot from a confirmed group + cart. */
export function buildInvoice(
  group: CreatedBookingGroup,
  cart: CartItem[],
  contact: ContactInfo | null,
  currency: string,
  totals: Totals,
): InvoiceData {
  return {
    invoiceNumber: `INV-${group.groupRef}`,
    groupRef: group.groupRef,
    fullName: contact?.fullName ?? "",
    phone: contact?.phone ?? "",
    consultationRequired: contact?.consultationRequired ?? false,
    paymentReference: `SHP-${Math.floor(10000000 + Math.random() * 90000000)}`,
    items: cart.map((line) => ({
      title: line.service.title,
      slotDate: line.slot?.slotDate ?? "",
      startTime: line.slot?.startTime ?? "",
      durationMin: line.service.durationMin ?? 0,
      amount: Number(line.service.price),
    })),
    total: totals.total,
    deposit: totals.deposit,
    remaining: totals.remaining,
    currency,
  };
}
