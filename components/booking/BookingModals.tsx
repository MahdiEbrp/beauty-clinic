"use client";

import BookingSuccessModal from "./BookingSuccessModal";
import MyBookingsModal from "./MyBookingsModal";
import ClinicInfoModal from "./modals/ClinicInfoModal";
import PrintInvoiceModal, { type InvoiceData } from "./modals/PrintInvoiceModal";
import type { CartItem, ContactInfo, CreatedBookingGroup } from "./types";

export type ClinicBookingInfo = {
  clinicName: string;
  addressTitle: string;
  address: string;
  telephone: string | null;
  phoneDisplay: string;
  neshanMap: string;
  googleMap: string;
};

type BookingModalsProps = {
  showSuccess: boolean;
  group: CreatedBookingGroup | null;
  cart: CartItem[];
  contact: ContactInfo | null;
  currency: string;
  deposit: number;
  clinic: ClinicBookingInfo;
  openingHours: readonly {
    readonly days: readonly string[];
    readonly opens: string;
    readonly closes: string;
  }[];
  showMyBookings: boolean;
  minCancelHours: number;
  showClinicInfo: boolean;
  invoice: InvoiceData | null;
  onCloseSuccess: () => void;
  onNew: () => void;
  onPrintInvoice: () => void;
  onCloseMyBookings: () => void;
  onCloseClinic: () => void;
  onCloseInvoice: () => void;
};

/** Renders all booking overlay modals from their control state. */
export default function BookingModals({
  showSuccess,
  group,
  cart,
  contact,
  currency,
  deposit,
  clinic,
  openingHours,
  showMyBookings,
  minCancelHours,
  showClinicInfo,
  invoice,
  onCloseSuccess,
  onNew,
  onPrintInvoice,
  onCloseMyBookings,
  onCloseClinic,
  onCloseInvoice,
}: BookingModalsProps) {
  return (
    <>
      {showSuccess && group ? (
        <BookingSuccessModal
          group={group}
          cart={cart}
          contact={contact}
          currency={currency}
          deposit={deposit}
          addressTitle={clinic.addressTitle}
          address={clinic.address}
          onPrint={onPrintInvoice}
          onNew={onNew}
          onClose={onCloseSuccess}
        />
      ) : null}

      {showMyBookings ? (
        <MyBookingsModal minCancelHours={minCancelHours} onClose={onCloseMyBookings} />
      ) : null}

      {showClinicInfo ? (
        <ClinicInfoModal
          onClose={onCloseClinic}
          clinicName={clinic.clinicName}
          addressTitle={clinic.addressTitle}
          address={clinic.address}
          openingHours={openingHours}
          telephone={clinic.telephone}
          phoneDisplay={clinic.phoneDisplay}
          neshanMap={clinic.neshanMap}
          googleMap={clinic.googleMap}
        />
      ) : null}

      {invoice ? (
        <PrintInvoiceModal data={invoice} onClose={onCloseInvoice} address={clinic.address} phoneDisplay={clinic.phoneDisplay} />
      ) : null}
    </>
  );
}
