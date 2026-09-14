import type { InvoiceData } from "./modals/PrintInvoiceModal";
import type { CartItem, ContactInfo, CreatedBookingGroup } from "./types";

/** Builds a printable-invoice snapshot from a confirmed order + cart. */
export function buildInvoice(
  group: CreatedBookingGroup,
  cart: CartItem[],
  contact: ContactInfo | null,
  currency: string,
  deposit: number,
  paymentReference?: string | null,
): InvoiceData {
  return {
    invoiceNumber: `INV-${group.groupRef}`,
    groupRef: group.groupRef,
    fullName: contact?.fullName ?? "",
    phone: contact?.phone ?? "",
    paymentReference: paymentReference ?? null,
    items: cart.map((line) => ({
      title: line.group.title,
      slotDate: line.slot?.slotDate ?? "",
      startTime: line.slot?.startTime ?? "",
    })),
    deposit,
    currency,
  };
}
