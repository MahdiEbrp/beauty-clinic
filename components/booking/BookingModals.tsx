"use client";

import MyBookingsModal from "./MyBookingsModal";

type BookingModalsProps = {
  showMyBookings: boolean;
  minCancelHours: number;
  onCloseMyBookings: () => void;
};

/** Renders the remaining booking overlays: my bookings. */
export default function BookingModals({
  showMyBookings,
  minCancelHours,
  onCloseMyBookings,
}: BookingModalsProps) {
  return (
    <>
      {showMyBookings ? (
        <MyBookingsModal minCancelHours={minCancelHours} onClose={onCloseMyBookings} />
      ) : null}
    </>
  );
}