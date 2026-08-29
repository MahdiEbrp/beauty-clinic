import type {
  BookingGroup,
  ContactInfo,
  CreatedBookingGroup,
  SelectedService,
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

export function fetchAvailableSlots(date: string, serviceId?: string): Promise<SlotOption[]> {
  const params = new URLSearchParams({ date });
  if (serviceId) params.set("serviceId", serviceId);
  return handle<SlotOption[]>(fetch(`/api/public/slots?${params.toString()}`));
}

/** Creates a multi-service booking group (one row per cart line). */
export function createBookingGroup(payload: {
  fullName: string;
  phone: string;
  email?: string | null;
  locale: "fa" | "en";
  notes?: string | null;
  consultationRequired: boolean;
  hasAllergies: boolean;
  isPregnant: boolean;
  items: { serviceId: string; slotId: string; quantity: number }[];
}): Promise<CreatedBookingGroup> {
  return handle<CreatedBookingGroup>(
    fetch("/api/public/bookings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }),
  );
}

/** Mock-pays the deposit for the whole group. */
export function payBookingGroup(bookingId: string): Promise<CreatedBookingGroup["items"][number]> {
  return handle(
    fetch("/api/public/bookings/batch/pay", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ bookingId }),
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

export type { ContactInfo, SelectedService };
