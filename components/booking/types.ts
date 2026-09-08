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

/** One cart line: service + quantity + its chosen slot. */
export type CartItem = {
  service: SelectedService;
  quantity: number;
  slot: SlotOption | null;
};

export type ContactInfo = {
  fullName: string;
  phone: string;
  notes: string;
  agreeToTerms: boolean;
};

/** Group row returned by the public booking endpoints. */
export type CreatedBookingItem = {
  id: string;
  serviceTitle: string;
  quantity: number;
  slotDate: string | null;
  startTime: string | null;
  endTime: string | null;
  durationMin: number | null;
  totalAmount: string;
};

export type CreatedBookingGroup = {
  groupRef: string;
  deposit: number;
  items: (CreatedBookingItem & { status: string })[];
};

export type BookingGroup = {
  groupRef: string;
  fullName: string;
  phone: string;
  email: string | null;
  status: string;
  paymentReference: string | null;
  consultationRequired: boolean;
  createdAt: string;
  canCancelUntil: string | null;
  items: CreatedBookingItem[];
};

export type WizardStep = 0 | 1 | 2 | 3;

/** Step-0 health gate answers (pregnant / specific illness). */
export type HealthFlags = { pregnant: boolean; illness: boolean };

export const EMPTY_HEALTH: HealthFlags = { pregnant: false, illness: false };

export type ClinicBookingProps = {
  currency: string;
  minCancelHours: number;
  defaultDeposit: number;
};
