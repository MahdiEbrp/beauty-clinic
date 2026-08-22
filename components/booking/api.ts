import type { ContactInfo, CreatedBooking, SlotOption } from "@/components/booking/types";

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

export function createBooking(payload: {
  fullName: string;
  phone: string;
  email?: string | null;
  serviceId: string;
  slotId: string;
  locale: "fa" | "en";
  notes?: string | null;
}): Promise<CreatedBooking> {
  return handle<CreatedBooking>(
    fetch("/api/public/bookings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }),
  );
}

export function payBooking(id: string): Promise<CreatedBooking> {
  return handle<CreatedBooking>(
    fetch(`/api/public/bookings/${id}/pay`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    }),
  );
}

export type { ContactInfo };
