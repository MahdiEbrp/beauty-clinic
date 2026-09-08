"use client";

import MyBookingsModal from "./MyBookingsModal";
import PrintInvoiceModal, { type InvoiceData } from "./modals/PrintInvoiceModal";

export type { InvoiceData };

type BookingModalsProps = {
  showMyBookings: boolean;
  minCancelHours: number;
  invoice: InvoiceData | null;
  clinic: { address: string; phoneDisplay: string };
  onCloseMyBookings: () => void;
  onCloseInvoice: () => void;
};

/** Renders the remaining booking overlays (Template parity): my bookings + print-invoice. */
export default function BookingModals({
  showMyBookings,
  minCancelHours,
  invoice,
  clinic,
  onCloseMyBookings,
  onCloseInvoice,
}: BookingModalsProps) {
  return (
    <>
      {showMyBookings ? (
        <MyBookingsModal minCancelHours={minCancelHours} onClose={onCloseMyBookings} />
      ) : null}
      {invoice ? (
        <PrintInvoiceModal
          data={invoice}
          onClose={onCloseInvoice}
          address={clinic.address}
          phoneDisplay={clinic.phoneDisplay}
        />
      ) : null}
    </>
  );
}