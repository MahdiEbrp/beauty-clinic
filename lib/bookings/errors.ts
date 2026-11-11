/**
 * Booking domain error catalog.
 *
 * Each entry maps an internal `code` (returned by the API in
 * `{ error: { code, message } }`) to a category number and the i18n key used
 * to localise it on the client. Two lists hang off it:
 *   - `HTTP_BY_CODE` – for resolving status from a thrown ApiError code.
 *   - client components read `booking.errors.<key>` for a friendly message.
 *
 * Not every scenario in a generic reservation spec is reachable here (e.g. no
 * promo codes, no approval workflow); only reachable, meaningful cases are
 * catalogued. Codes are stable so a future real payment gateway can surface
 * them verbatim to the user without changing the client contract.
 */

import type { ApiError } from "@/lib/api/errors";

export type BookingErrorMeta = {
  no: number;
  status: number;
  key: string;
};

export const BOOKING_ERRORS = {
  // 01 – the slot was just taken by someone else (capacity hit in the race).
  SLOT_FULL: { no: 1, status: 409, key: "slotFull" },
  // 02 – the slot is no longer active/selectable.
  SLOT_UNAVAILABLE: { no: 2, status: 409, key: "slotUnavailable" },
  // 03 – the customer already holds an overlapping booking (07).
  CUSTOMER_CONFLICT: { no: 3, status: 409, key: "customerConflict" },
  // 13 – the service itself is deactivated.
  SERVICE_UNAVAILABLE: { no: 13, status: 409, key: "serviceUnavailable" },
  // 14 – the chosen time has already passed.
  PAST_SLOT: { no: 14, status: 400, key: "pastSlot" },
  // 25 – the clinic is closed at the selected time.
  BUSINESS_CLOSED: { no: 25, status: 409, key: "businessClosed" },
  // 28 – malformed ids in the URL.
  INVALID_ID: { no: 28, status: 400, key: "invalidId" },
  // 30 – a cancelled booking was acted on.
  BOOKING_CANCELLED: { no: 30, status: 409, key: "cancelled" },
  BOOKING_NOT_FOUND: { no: 16, status: 404, key: "notFound" },
  // 45 – outside the open booking window.
  OUTSIDE_WINDOW: { no: 45, status: 400, key: "outsideWindow" },
  // 46 – booked too far in advance.
  TOO_FAR_AHEAD: { no: 46, status: 400, key: "tooFarAhead" },
} as const satisfies Record<string, BookingErrorMeta>;

export type BookingErrorCode = keyof typeof BOOKING_ERRORS;

const CODE_TO_NO = Object.fromEntries(
  Object.entries(BOOKING_ERRORS).map(([code, meta]) => [code, meta.no]),
) as Record<BookingErrorCode, number>;

/** Room to book out; beyond this the slot is "too far in advance". */
export const MAX_ADVANCE_DAYS = 180;

/** The default fallback for any unexpected booking failure. */
export const UNKNOWN_BOOKING_ERROR_KEY = "systemError";

/**
 * Translate an `ApiError` (or any object shaped like one) thrown by the
 * booking services into a client-facing message key. Returns the catalog key
 * when the code is known, otherwise the default system-error key.
 */
export function bookingErrorKey(error: unknown): string {
  if (
    error &&
    typeof error === "object" &&
    "code" in (error as ApiError) &&
    typeof (error as ApiError).code === "string"
  ) {
    const code = (error as ApiError).code;
    if (code in BOOKING_ERRORS) return BOOKING_ERRORS[code as BookingErrorCode].key;
  }
  return UNKNOWN_BOOKING_ERROR_KEY;
}

export { CODE_TO_NO };
