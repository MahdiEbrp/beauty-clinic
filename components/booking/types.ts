import type { PublicTreeService } from "@/lib/services/types";

/** A public service with its group/category context, ready for the picker. */
export type SelectedService = PublicTreeService & {
  groupSlug: string;
  groupTitle: string;
  categorySlug: string;
  categoryTitle: string;
};

/** Shape returned by `GET /api/public/slots`. */
export type SlotOption = {
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

export type ContactInfo = {
  fullName: string;
  phone: string;
  email: string;
  notes: string;
};

/** Shape returned by the public bookings endpoints. */
export type CreatedBooking = {
  id: string;
  fullName: string;
  phone: string;
  serviceTitle: string;
  currency: string;
  slotDate?: string;
  slotStart?: string;
  durationMin: number | null;
  sessionsCount: number;
  totalAmount: string;
  status: string;
  paymentReference: string | null;
};

export type WizardStep = 0 | 1 | 2 | 3;
