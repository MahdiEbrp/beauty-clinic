import type {
  BookingGroup,
  ContactInfo,
  CreatedBookingGroup,
  SelectedGroup,
  SlotOption,
} from "@/components/booking/types";

export class BookingError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "BookingError";
  }
}

async function handle<T>(fetchPromise: Promise<Response>): Promise<T> {
  const res = await fetchPromise;
  if (!res.ok) {
    let message = res.statusText;
    let code: string | undefined;
    try {
      const body = (await res.json()) as {
        error?: { message?: string; code?: string };
      };
      message = body.error?.message ?? message;
      code = body.error?.code;
    } catch {
      // keep statusText
    }
    throw new BookingError(message, code);
  }
  const body = (await res.json()) as { data: T };
  return body.data;
}

export function fetchAvailableSlots(
  date: string,
  groupId?: string,
  shared?: { groupIds: string[]; quantity: number },
): Promise<SlotOption[]> {
  const params = new URLSearchParams({ date });
  if (shared) {
    params.set("groupIds", shared.groupIds.join(","));
    params.set("quantity", String(shared.quantity));
  } else if (groupId) {
    params.set("groupId", groupId);
  }
  return handle<SlotOption[]>(fetch(`/api/public/slots?${params.toString()}`));
}

/** Loads all dates with free slots in one request for the booking calendar. */
export function fetchAvailableDates(
  from: string,
  to: string,
  groupId?: string,
  shared?: { groupIds: string[]; quantity: number },
): Promise<string[]> {
  const params = new URLSearchParams({ from, to });
  if (shared) {
    params.set("groupIds", shared.groupIds.join(","));
    params.set("quantity", String(shared.quantity));
  } else if (groupId) {
    params.set("groupId", groupId);
  }
  return handle<string[]>(
    fetch(`/api/public/availability-days?${params.toString()}`),
  );
}

/** Creates a multi-group booking order (one row per cart line). */
export function createBookingGroup(payload: {
  fullName: string;
  phone: string;
  email?: string | null;
  locale: "fa" | "en";
  notes?: string | null;
  hasAllergies: boolean;
  isPregnant: boolean;
  /** Acceptance of the clinic booking rules. */
  termsAccepted: boolean;
  items: { groupId: string; slotId: string; quantity: number }[];
}): Promise<CreatedBookingGroup> {
  return handle<CreatedBookingGroup>(
    fetch("/api/public/bookings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }),
  );
}

/** Starts an idempotent checkout for a saved booking group. */
export function checkoutBookingGroup(payload: {
  groupRef: string;
  idempotencyKey: string;
  locale: "fa" | "en";
}): Promise<{ paymentUrl: string; transactionId: string; expiresAt: string }> {
  return handle(
    fetch("/api/public/bookings/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }),
  );
}

export function fetchMyBookings(phone: string): Promise<BookingGroup[]> {
  const params = new URLSearchParams({ phone });
  return handle<BookingGroup[]>(
    fetch(`/api/public/bookings/mine?${params.toString()}`),
  );
}

export function cancelBookingGroup(groupRef: string, phone: string): Promise<{ cancelled: number }> {
  return handle(
    fetch("/api/public/bookings/cancel", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ groupRef, phone }),
    }),
  );
}

export type { ContactInfo, SelectedGroup };
