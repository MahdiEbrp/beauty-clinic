export type SlotAdmin = {
  id: string;
  serviceId: string | null;
  slotDate: string;
  startTime: string;
  endTime: string;
  capacity: number;
  isActive: boolean;
  bookedCount: number;
  available: boolean;
};

export type BookingRow = {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  serviceTitle: string;
  currency: string;
  slotStart: string | null;
  slotEnd: string | null;
  totalAmount: string;
  status: "pending" | "confirmed" | "paid" | "cancelled";
  paymentReference: string | null;
  notes: string | null;
  createdAt: string;
};

export type BookingList = {
  items: BookingRow[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

async function handle<T>(fetchPromise: Promise<Response>): Promise<T> {
  const res = await fetchPromise;
  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = (await res.json()) as { error?: { message?: string } };
      message = body.error?.message ?? message;
    } catch {
      // keep statusText
    }
    throw new Error(message);
  }
  const body = (await res.json()) as { data: T };
  return body.data;
}

export function fetchSlots(from: string, to: string): Promise<SlotAdmin[]> {
  const params = new URLSearchParams({ from, to });
  return handle<SlotAdmin[]>(fetch(`/api/v1/bookings/slots?${params.toString()}`));
}

export function createSlots(
  slots: {
    serviceId?: string | null;
    slotDate: string;
    startTime: string;
    endTime: string;
    capacity: number;
  }[],
): Promise<SlotAdmin[]> {
  return handle<SlotAdmin[]>(
    fetch("/api/v1/bookings/slots", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slots }),
    }),
  );
}

export function updateSlot(
  id: string,
  patch: Partial<{
    slotDate: string;
    startTime: string;
    endTime: string;
    capacity: number;
    isActive: boolean;
  }>,
): Promise<SlotAdmin> {
  return handle<SlotAdmin>(
    fetch(`/api/v1/bookings/slots/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
    }),
  );
}

export function deleteSlot(id: string): Promise<void> {
  return handle<void>(fetch(`/api/v1/bookings/slots/${id}`, { method: "DELETE" }));
}

export function listBookings(params: {
  page?: number;
  perPage?: number;
  search?: string;
  status?: string;
}): Promise<BookingList> {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.perPage) q.set("perPage", String(params.perPage));
  if (params.search?.trim()) q.set("search", params.search.trim());
  if (params.status && params.status !== "all") q.set("status", params.status);
  return handle<BookingList>(fetch(`/api/v1/bookings?${q.toString()}`));
}

export function setBookingStatus(id: string, status: BookingRow["status"]): Promise<BookingRow> {
  return handle<BookingRow>(
    fetch(`/api/v1/bookings/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    }),
  );
}
